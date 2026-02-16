import mongoose from "mongoose";

const stateShippingRateSchema = new mongoose.Schema(
  {
    // ✅ State Name (Tamil Nadu, Kerala, etc.)
    state: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ✅ Shipping Charge for that State
    shippingCharge: {
      type: Number,
      required: true,
      default: 0,
    },

    // ✅ Active or Not
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

// ✅ Export Model
const StateShippingRate = mongoose.model(
  "StateShippingRate",
  stateShippingRateSchema
);

export default StateShippingRate;
