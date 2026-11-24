import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = new Set([
    "http://localhost:3002",
    "http://127.0.0.1:3002"
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("This frontend origin is not allowed."));
    }
}));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many design requests. Please wait a few minutes and try again." }
}));

app.get("/api/health", (_request, response) => {
    response.json({ success: true, message: "AI Decor backend is running." });
});
app.use("/api/ai", aiRoutes);

app.use((error, _request, response, _next) => {
    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Each image must be 10 MB or smaller."
            : "The uploaded files could not be processed.";
        response.status(400).json({ success: false, message });
        return;
    }
    response.status(400).json({ success: false, message: error.message || "Request could not be processed." });
});

app.listen(port, () => {
    console.log(`AI Decor backend listening on http://localhost:${port}`);
});
