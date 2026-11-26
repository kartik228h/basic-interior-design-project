import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

// Local development: allow the frontend from localhost / 127.0.0.1 on any port
// (Live Server uses 5500 by default, others use 3002, 5173, 8080, ...).
function isLocalOrigin(origin) {
    try {
        const { protocol, hostname } = new URL(origin);
        return (protocol === "http:" || protocol === "https:") &&
            (hostname === "localhost" || hostname === "127.0.0.1");
    } catch {
        return false;
    }
}

app.use(cors({
    origin(origin, callback) {
        if (!origin || isLocalOrigin(origin)) {
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