import express from "express";
import { getAllStates } from "../controllers/locationController.js";

const router = express.Router();

router.get("/states", getAllStates);

export default router;
