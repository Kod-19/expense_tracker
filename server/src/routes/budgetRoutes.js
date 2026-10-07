import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getBudgets);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
