import { Router } from "express";
import upload from "../middleware/uploadMiddleware.js";
import { designRoom } from "../controllers/aiController.js";

const router = Router();

router.post(
    "/design",
    upload.fields([
        { name: "roomImage", maxCount: 1 },
        { name: "furnitureImages", maxCount: 20 }
    ]),
    designRoom
);

export default router;
