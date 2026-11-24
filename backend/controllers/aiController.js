import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

const CLOUDFLARE_MODEL = "@cf/black-forest-labs/flux-2-klein-9b";
const CLOUDFLARE_FIELDS = {
    prompt: "prompt",
    roomImage: "input_image_0",
    referencePrefix: "input_image",
    width: "width",
    height: "height"
};
const CLOUDFLARE_MAX_INPUT_PX = 512;
const CLOUDFLARE_MAX_OUTPUT_PX = 1024;
const MAX_REFERENCES = 3;
const ORDINALS = ["second", "third", "fourth"];
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const supportedCategories = new Set(["sofa", "chair", "table", "bed", "fan", "chandelier", "vase"]);
const supportedStyles = new Set(["Modern", "Minimal", "Warm"]);

function toImagePart(file) {
    return {
        inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64")
        }
    };
}

function parseFurniture(value) {
    let furniture;
    try {
        furniture = JSON.parse(value || "[]");
    } catch {
        throw new Error("Furniture selection must be valid JSON.");
    }

    if (!Array.isArray(furniture) || furniture.length === 0 || furniture.length > 20) {
        throw new Error("Select between 1 and 20 furniture products.");
    }

    furniture.forEach((product) => {
        if (!product || typeof product.id !== "string" ||
            typeof product.name !== "string" ||
            !supportedCategories.has(product.category) ||
            typeof product.material !== "string" ||
            !Number.isFinite(Number(product.price))) {
            throw new Error("One or more selected furniture products are invalid.");
        }
    });
    return furniture;
}

function buildPrompt(style, furniture, referencedProducts) {
    const furnitureList = furniture
        .map((product) => `${product.name} (${product.category}, ${product.material})`)
        .join("; ");
    const referenceText = referencedProducts
        .map((product, index) => ` The ${ORDINALS[index]} image is the catalog reference for the ${product.name}; match its shape, color and material.`)
        .join("");

    return `Edit the first image, which is a photo of a room. Keep the room's walls, windows, doors, floor, ceiling, camera angle and layout exactly unchanged. Add the following furniture naturally, with correct scale, perspective, lighting and shadows: ${furnitureList}.${referenceText} Interior style: ${style}. Do not add any other furniture.`;
}

function getErrorDetails(error, provider) {
    const status = Number(error?.status || error?.providerStatus || error?.code);
    const text = String(error?.message || "").toLowerCase();

    if (text.includes("furniture selection") ||
        text.includes("select between") ||
        text.includes("selected furniture") ||
        text.includes("supported design style")) {
        return { status: 400, message: error.message };
    }

    if (provider === "gemini") {
        if (text.includes("limit: 0") || text.includes("free_tier")) {
            return {
                status: 402,
                message: "Gemini image generation is paid-only; enable billing in Google AI Studio."
            };
        }
        if (status === 401 || status === 403 || text.includes("api key") || text.includes("unauthorized")) {
            return { status: 502, message: "Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env." };
        }
        if (status === 429 || text.includes("quota") || text.includes("rate limit")) {
            return { status: 429, message: "Gemini is rate-limiting this request or the API quota is exhausted. Try again later." };
        }
        if (status === 404 || (text.includes("model") && (text.includes("not found") || text.includes("unsupported")))) {
            return { status: 404, message: `The Gemini image model (${GEMINI_IMAGE_MODEL}) was not found or is unsupported for this API key.` };
        }
        if (text.includes("invalid") && text.includes("image")) {
            return { status: 400, message: "Gemini could not process one of the supplied images." };
        }
        return { status: 502, message: "Gemini could not generate an image right now. Please try again." };
    }

    if (status === 401 || status === 403) {
        return { status: 502, message: "Cloudflare rejected the credentials. Check CF_ACCOUNT_ID and CF_API_TOKEN in backend/.env." };
    }
    if (status === 429 || text.includes("neurons") || text.includes("quota")) {
        return { status: 429, message: "Daily free image limit reached. Try again tomorrow." };
    }
    if (status === 504 || text.includes("timed out")) {
        return { status: 504, message: "Image generation took too long. Please try again." };
    }
    if (status === 400 || status === 413 || status === 415 || text.includes("invalid image") || text.includes("could not be read")) {
        return { status: 400, message: "One of the supplied images could not be processed. Try a different JPG, PNG or WEBP image." };
    }
    return { status: 502, message: "Cloudflare could not generate an image right now. Please try again." };
}

async function toCloudflareInput(file) {
    try {
        const buffer = await sharp(file.buffer)
            .rotate()
            .flatten({ background: "#ffffff" })
            .resize(CLOUDFLARE_MAX_INPUT_PX, CLOUDFLARE_MAX_INPUT_PX, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer({ resolveWithObject: true });
        return { buffer: buffer.data, width: buffer.info.width, height: buffer.info.height };
    } catch {
        throw Object.assign(new Error("One of the supplied images could not be read."), { providerStatus: 400 });
    }
}

function getOutputSize(width, height) {
    const scale = CLOUDFLARE_MAX_OUTPUT_PX / Math.max(width, height);
    const snap = (value) => Math.max(256, Math.round((value * scale) / 16) * 16);
    return { width: snap(width), height: snap(height) };
}

async function generateWithCloudflare({ roomImage, references, prompt, accountId, apiToken }) {
    const room = await toCloudflareInput(roomImage);
    const preparedReferences = await Promise.all(references.slice(0, MAX_REFERENCES).map(toCloudflareInput));
    const outputSize = getOutputSize(room.width, room.height);

    const formData = new FormData();
    formData.append(CLOUDFLARE_FIELDS.prompt, prompt);
    formData.append(CLOUDFLARE_FIELDS.roomImage, new Blob([room.buffer], { type: "image/jpeg" }), "room.jpg");
    preparedReferences.forEach((reference, index) => {
        const fieldName = `${CLOUDFLARE_FIELDS.referencePrefix}_${index + 1}`;
        formData.append(fieldName, new Blob([reference.buffer], { type: "image/jpeg" }), `reference-${index + 1}.jpg`);
    });
    formData.append(CLOUDFLARE_FIELDS.width, String(outputSize.width));
    formData.append(CLOUDFLARE_FIELDS.height, String(outputSize.height));

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 90000);

    try {
        const providerResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_MODEL}`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${apiToken}` },
                body: formData,
                signal: abortController.signal
            }
        );
        const providerStatus = providerResponse.status;
        let result;
        try {
            result = await providerResponse.json();
        } catch {
            throw Object.assign(new Error("Cloudflare returned an invalid response."), { providerStatus });
        }

        if (!providerResponse.ok || !result.success) {
            const providerMessage = result.errors?.map((error) => error.message).filter(Boolean).join("; ")
                || result.messages?.join("; ")
                || "Cloudflare request failed.";
            throw Object.assign(new Error(providerMessage), { providerStatus });
        }

        const base64 = result.result?.image;
        if (!base64) {
            throw Object.assign(new Error("Cloudflare completed without returning an image."), { providerStatus });
        }

        const mimeType = base64.startsWith("/9j/")
            ? "image/jpeg"
            : base64.startsWith("UklGR")
                ? "image/webp"
                : "image/png";
        return { mimeType, base64 };
    } catch (error) {
        if (error.name === "AbortError") {
            throw Object.assign(new Error("Cloudflare image generation timed out."), { providerStatus: 504 });
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

async function generateWithGemini({ roomImage, references, prompt }) {
    const parts = [
        { text: prompt },
        { text: "The next image is the original room photograph." },
        toImagePart(roomImage)
    ];
    references.forEach((reference) => {
        parts.push(
            { text: "The next image is a catalog reference for the selected furniture." },
            toImagePart(reference)
        );
    });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents: [{ role: "user", parts }],
        config: { responseModalities: ["TEXT", "IMAGE"] }
    });
    const generatedPart = result?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    const generatedImage = generatedPart?.inlineData;
    if (!generatedImage?.data) {
        throw new Error("Gemini completed without returning an image.");
    }
    return {
        mimeType: generatedImage.mimeType || generatedImage.mime_type || "image/png",
        base64: generatedImage.data
    };
}

export async function designRoom(request, response) {
    const imageProvider = (process.env.IMAGE_PROVIDER || "cloudflare").toLowerCase();

    if (imageProvider === "gemini" && !process.env.GEMINI_API_KEY) {
        response.status(500).json({ success: false, message: "GEMINI_API_KEY is missing. Add it to backend/.env and restart the server." });
        return;
    }
    if (imageProvider === "cloudflare" && !process.env.CF_ACCOUNT_ID) {
        response.status(500).json({ success: false, message: "CF_ACCOUNT_ID is missing. Add it to backend/.env and restart the server." });
        return;
    }
    if (imageProvider === "cloudflare" && !process.env.CF_API_TOKEN) {
        response.status(500).json({ success: false, message: "CF_API_TOKEN is missing. Add it to backend/.env and restart the server." });
        return;
    }

    if (!request.files?.roomImage?.[0]) {
        response.status(400).json({ success: false, message: "A roomImage file is required." });
        return;
    }

    try {
        const style = request.body.style;
        if (!supportedStyles.has(style)) throw new Error("Choose a supported design style.");
        const furniture = parseFurniture(request.body.furniture);
        const roomImage = request.files.roomImage[0];
        const referencesByName = new Map((request.files.furnitureImages || []).map((file) => [file.originalname, file]));
        const referenced = furniture
            .map((product) => ({ product, file: product.referenceImageName ? referencesByName.get(product.referenceImageName) : undefined }))
            .filter((entry) => entry.file)
            .slice(0, MAX_REFERENCES);
        const prompt = buildPrompt(style, furniture, referenced.map((entry) => entry.product));
        const references = referenced.map((entry) => entry.file);

        let generated;
        if (imageProvider === "gemini") {
            generated = await generateWithGemini({
                roomImage,
                references,
                prompt
            });
        } else if (imageProvider === "cloudflare") {
            generated = await generateWithCloudflare({
                roomImage,
                references,
                prompt,
                accountId: process.env.CF_ACCOUNT_ID,
                apiToken: process.env.CF_API_TOKEN
            });
        } else {
            throw Object.assign(new Error("Unsupported image provider."), { providerStatus: 500 });
        }

        response.json({
            success: true,
            generatedImage: `data:${generated.mimeType};base64,${generated.base64}`,
            message: "Your room design was generated successfully."
        });
    } catch (error) {
        const providerStatus = error?.providerStatus || error?.status || error?.code || null;
        const providerMessage = String(error?.message || "").slice(0, 300);
        console.error(`Image provider request failed: provider=${imageProvider} status=${providerStatus || "unknown"} message=${providerMessage}`);
        const details = getErrorDetails({ message: error?.message, status: error?.status, code: error?.code, providerStatus }, imageProvider);
        response.status(details.status).json({
            success: false,
            message: details.message,
            providerStatus,
            providerCategory: imageProvider
        });
    }
}
