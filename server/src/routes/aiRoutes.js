import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  handleFinancialInsights,
  handleQuickLog,
  handleReceiptScan,
} from "../controllers/aiController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/quick-log", authMiddleware, handleQuickLog);
router.post("/scan-receipt", authMiddleware, upload.single("receipt"), handleReceiptScan);
router.get("/insights", authMiddleware, handleFinancialInsights);

export default router;
