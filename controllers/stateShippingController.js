import StateShippingRate from "../models/StateShippingRate.js";

export const bulkUpdateStateRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!rates || rates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rates provided",
      });
    }

    // Loop and update each state
    for (let item of rates) {
      await StateShippingRate.findOneAndUpdate(
        { state: item.state },
        {
          shippingCharge: item.shippingCharge,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: "State shipping rates updated successfully",
    });
  } catch (error) {
    console.log("Bulk update error:", error);

    res.status(500).json({
      success: false,
      message: "Bulk update failed",
    });
  }
};




/**
 * ✅ GET ALL STATE SHIPPING RATES
 * Route: GET /api/states/state-rate
 */
export const getAllStateRates = async (req, res) => {
  try {
    const rates = await StateShippingRate.find().sort({ state: 1 });

    res.status(200).json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error("Get State Rates Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch state shipping rates",
    });
  }
};

/**
 * ✅ ADD OR UPDATE STATE SHIPPING RATE
 * Route: POST /api/states/state-rate
 */
export const addOrUpdateStateRate = async (req, res) => {
  try {
    const { state, shippingCharge } = req.body;

    if (!state || shippingCharge === undefined) {
      return res.status(400).json({
        success: false,
        message: "State and shippingCharge are required",
      });
    }

    // Check if already exists
    let existing = await StateShippingRate.findOne({ state });

    if (existing) {
      // ✅ Update existing
      existing.shippingCharge = shippingCharge;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "State shipping rate updated successfully",
        rate: existing,
      });
    }

    // ✅ Create new
    const newRate = await StateShippingRate.create({
      state,
      shippingCharge,
    });

    res.status(201).json({
      success: true,
      message: "State shipping rate added successfully",
      rate: newRate,
    });
  } catch (error) {
    console.error("Add/Update State Rate Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add/update state shipping rate",
    });
  }
};

/**
 * ✅ DELETE STATE SHIPPING RATE
 * Route: DELETE /api/states/state-rate/:state
 */
export const deleteStateRate = async (req, res) => {
  try {
    const { state } = req.params;

    const deleted = await StateShippingRate.findOneAndDelete({ state });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "State rate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "State shipping rate deleted successfully",
    });
  } catch (error) {
    console.error("Delete State Rate Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete state shipping rate",
    });
  }
};


export const getRateByState = async (req, res) => {
  try {
    const { state } = req.params;

    const rate = await StateShippingRate.findOne({ state });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "State shipping rate not found",
      });
    }

    res.status(200).json({
      success: true,
      rate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch state shipping rate",
    });
  }
};
