import { checkDelhiveryPincode } from "../utils/delhiveryPincodeService.js";

export const checkPincodeController = async (req, res) => {
  try {
    const { pincode } = req.params;

    const result = await checkDelhiveryPincode(pincode);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Pincode check failed",
    });
  }
};
