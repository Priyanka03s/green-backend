import express from "express";
import { bulkUpdateStateRates ,addOrUpdateStateRate,deleteStateRate,getAllStateRates,getRateByState} from "../controllers/stateShippingController.js";

const router = express.Router();

router.post("/state-rate/bulk", bulkUpdateStateRates);
// ✅ Get all saved rates
router.get("/state-rate", getAllStateRates);

// ✅ Add or Update one rate
router.post("/state-rate", addOrUpdateStateRate);

// ✅ Delete one rate
router.delete("/state-rate/:state", deleteStateRate);

router.get("/state-rate/:state", getRateByState);


export default router;
