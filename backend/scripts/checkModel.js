import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. Add it to backend/.env.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
    const pager = await ai.models.list();
    const imageModels = [];

    for await (const model of pager) {
        const name = model.name || "";
        if (name.toLowerCase().includes("image")) {
            imageModels.push(name);
        }
    }

    if (imageModels.length === 0) {
        console.log("No image models were returned for this API key.");
    } else {
        imageModels.forEach((name) => console.log(name));
    }
} catch (error) {
    const status = error?.status || error?.code || "unknown";
    console.error(`Unable to list models. Status: ${status}`);
    process.exit(1);
}
