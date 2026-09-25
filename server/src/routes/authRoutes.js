import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Authentication route is working",
  });
});

export default router;