import { indianStates } from "../data/indianStates.js";

export const getAllStates = async (req, res) => {
  res.json({
    success: true,
    states: indianStates,
  });
};
