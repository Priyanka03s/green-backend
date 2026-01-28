// controllers/shippingController.js

/**
 * Calculate shipping cost based on pickup/delivery PIN and weight
 * @route POST /api/shipping/calculate
 */
export const calculateShipping = async (req, res) => {
  try {
    const { pickupPin, deliveryPin, totalWeight } = req.body;

    // Validation
    if (!pickupPin || !deliveryPin || !totalWeight) {
      return res.status(400).json({
        message: 'Pickup PIN, delivery PIN, and total weight are required'
      });
    }

    // Validate PIN format (6 digits)
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pickupPin) || !pinRegex.test(deliveryPin)) {
      return res.status(400).json({
        message: 'Please enter valid 6-digit PIN codes'
      });
    }

    // Validate weight
    if (totalWeight <= 0) {
      return res.status(400).json({
        message: 'Total weight must be greater than 0'
      });
    }

    // Calculate distance (mock calculation for now)
    // In production, integrate with Google Maps Distance Matrix API
    const distance = calculateDistance(pickupPin, deliveryPin);

    // Shipping cost formula
    const baseCost = 50;
    const weightCost = totalWeight * 10;
    const distanceCost = distance * 0.5;
    const totalShippingCost = Math.round(baseCost + weightCost + distanceCost);

    res.status(200).json({
      distance,
      shippingCost: totalShippingCost,
      breakdown: {
        baseCost,
        weightCost,
        distanceCost
      }
    });

  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({
      message: 'Failed to calculate shipping cost',
      error: error.message
    });
  }
};

/**
 * Mock distance calculation
 * In production, replace with Google Maps API or similar service
 */
const calculateDistance = (pickupPin, deliveryPin) => {
  // If same PIN, minimal distance
  if (pickupPin === deliveryPin) {
    return 10;
  }

  // Mock calculation based on PIN difference
  const pickup = parseInt(pickupPin);
  const delivery = parseInt(deliveryPin);
  const diff = Math.abs(pickup - delivery);

  // Generate realistic distance (50-500 km)
  let distance = 50 + (diff % 450);
  
  // Add some randomness for realism
  distance += Math.floor(Math.random() * 50);

  return Math.round(distance);
};

/**
 * Validate PIN code serviceability
 * @route POST /api/shipping/check-serviceability
 */
export const checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({
        message: 'PIN code is required'
      });
    }

    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pincode)) {
      return res.status(400).json({
        message: 'Please enter a valid 6-digit PIN code'
      });
    }

    // Mock serviceability check
    // In production, integrate with courier API
    const isServiceable = true;
    const estimatedDays = Math.floor(Math.random() * 5) + 3;

    res.status(200).json({
      pincode,
      serviceable: isServiceable,
      estimatedDeliveryDays: estimatedDays,
      message: isServiceable 
        ? `Delivery available in ${estimatedDays} days`
        : 'Sorry, we do not deliver to this location yet'
    });

  } catch (error) {
    console.error('Serviceability check error:', error);
    res.status(500).json({
      message: 'Failed to check serviceability',
      error: error.message
    });
  }
};