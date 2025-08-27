import express from "express";
import fs from "fs";
import path from "path";
import { marked } from "marked";

const router = express.Router();
const staticPath = path.join(__dirname, "../../public");
router.use("/public", express.static(staticPath));

router.get("/", (req, res) => {
  // Return health check message as documented in README2.md
  res.status(200).json({
    message: "Backend Challenge Server is running!"
  });
});

export default router;
