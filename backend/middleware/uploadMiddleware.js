import multer from "multer";

const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 21
    },
    fileFilter: (_request, file, callback) => {
        if (!supportedMimeTypes.has(file.mimetype)) {
            callback(new Error("Only JPG, JPEG, PNG, and WEBP images are supported."));
            return;
        }
        callback(null, true);
    }
});

export default upload;
