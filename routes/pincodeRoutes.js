import express from "express";
import { checkPincodeController } from "../controllers/pincodecheckingController.js";

const router = express.Router();

router.get("/pincode/check-pincode/:pincode", checkPincodeController);

export default router;
