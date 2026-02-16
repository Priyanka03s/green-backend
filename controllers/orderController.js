// controllers/orderController.js
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { createDelhiveryShipment } from '../utils/delhiveryService.js';
import { cancelDelhiveryShipment } from '../utils/delhiveryCancelService.js';

/**
 * Place a new order
 * @route POST /api/orders/place
 * @access Private
 */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      deliveryPin,
      distance,
      shippingCost,
      deliveryAddress,
      paymentMethod,
      isDelhiveryServiceable, // ✅ IMPORTANT FLAG
    } = req.body;

    // ✅ Validate required fields
    if (!deliveryPin || distance === undefined || shippingCost === undefined || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Delivery PIN, distance, shipping cost, and delivery address are required",
      });
    }

    // ✅ Find Cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ✅ Build Order Items
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) continue;

      const quantity = Number(item.quantity) || 1;
      const weight = Number(product.weight) || 1;
      const price = Number(product.price) || 0;

      subtotal += price * quantity;
      totalWeight += weight * quantity;

      orderItems.push({
        productId: product._id,
        title: product.name,
        price,
        quantity,
        weight,
        image: product.image || product.images?.[0] || "",
      });
    }

    // ✅ Totals
    const finalShippingCost = Number(shippingCost);
    const totalAmount = subtotal + finalShippingCost;

    // ✅ Clean Address
    const cleanAddress = {
      fullName: deliveryAddress.fullName,
      phone: deliveryAddress.phone,
      addressLine1: deliveryAddress.addressLine1,
      addressLine2: deliveryAddress.addressLine2,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pincode: deliveryPin,
      addressType: deliveryAddress.addressType || "home",
    };

    // ✅ Prepare Order Data
    const orderData = {
      userId,
      items: orderItems,
      pickupPin: "600001",
      deliveryPin,
      distance,
      shippingCost: finalShippingCost,
      subtotal,
      totalAmount,
      totalWeight,
      deliveryAddress: cleanAddress,

      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",

      deliveryPartner: "ADMIN", // default
      shipmentStatus: "Not Created",
      orderStatus: "Confirmed", // default confirmed
    };

    // ✅ Delhivery Shipment Only If Serviceable
    if (isDelhiveryServiceable === true) {
      console.log("🚚 Delhivery Serviceable → Creating Shipment");

      orderData.deliveryPartner = "DELHIVERY";

      const delhiveryResponse = await createDelhiveryShipment(orderData);

      if (!delhiveryResponse.success) {
        return res.status(400).json({
          success: false,
          message: "Delhivery shipment creation failed",
          error: delhiveryResponse.rmk,
        });
      }

      orderData.waybill = delhiveryResponse.packages?.[0]?.waybill;
      orderData.shipmentStatus = "Manifested";
      orderData.shipmentResponse = delhiveryResponse;
      orderData.delhiveryCreatedAt = new Date();
    }

    // ✅ Save Order Always
    const order = await Order.create(orderData);

    // ✅ Clear Cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalAmount: 0 } }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during order placement",
      error: error.message,
    });
  }
};


/**
 * Get all orders for logged-in user
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name images');

    const totalOrders = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Get single order details
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate('items.productId', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({ success: true, data: order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // First get the existing order
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prepare update data
    const updateData = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;

      // 🔥 Auto update payment for COD
      if (
        existingOrder.paymentMethod === "COD" &&
        orderStatus === "Delivered"
      ) {
        updateData.paymentStatus = "Paid";
      }
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};



export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now"
      });
    }

    // ✅ Cancel shipment in Delhivery
    if (order.waybill) {
      const cancelResponse = await cancelDelhiveryShipment(order.waybill);

      if (!cancelResponse.success) {
        return res.status(400).json({
          success: false,
          message: "Delhivery cancellation failed",
          error: cancelResponse.message
        });
      }
    }

    // ✅ Cancel in DB
    order.orderStatus = "Cancelled";
    order.cancellationDate = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully in Delhivery + DB"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cancel order failed",
      error: error.message
    });
  }
};


/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('items.productId', 'name images category weight dimensions');

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Bulk update order status (Admin only)
 */
export const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, orderStatus, paymentStatus } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'At least one status field required'
      });
    }

    const invalidIds = orderIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid order IDs found`
      });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} order(s)`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update orders',
      error: error.message
    });
  }
};
