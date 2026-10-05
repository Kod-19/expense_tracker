import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", authMiddleware, getCategories);
router.post("/", authMiddleware, createCategory);

export default router;
