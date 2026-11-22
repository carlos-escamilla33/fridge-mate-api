const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({apiKey: process.env.CLAUDE_API_KEY});
const MODEL = "claude-opus-5-5";

const scanSchema = {
    type: "object",
    properties: {
        items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    foodName: {type: "string"},
                    quantity: {type: "integer"},
                    estimatedExpirationDate: {type: "string"},
                    ripenessLevel: {type: "string"},
                    confidence: {type: "string", enum: ["high", "medium", "low"]},
                },
                required: ["foodName", "quantity", "estimatedExpirationDate", "ripenessLevel", "confidence"],
                additionalProperties: false,
            },
        },
    },
    required: ["items"],
    additionalProperties: false,
};

const buildPrompt = (today) => {
    return `Today's date is ${today}. This photo shows groceries or the inside of a fridge.

List every food or drink item you can actually see. For each item:
- foodName: a short, plain name a person would write on a list ("Whole milk", "Strawberries", "Cheddar cheese"). For packaged goods, name the product type, not just the brand.
- quantity: how many of that item are visible (at least 1).
- estimatedExpirationDate: YYYY-MM-DD, your best estimate from typical refrigerated shelf life counted from today, adjusted for any visible ripeness or spoilage.
- ripenessLevel: one or two words, at most 30 characters: "fresh", "ripe", "overripe", "wilting", or "n/a" for packaged goods.
- confidence: how sure you are about what the item is.

Only include items you can see. If there is no food in the photo, return an empty list.`;
}

const scanError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

const scanFoodImage = async (imageBase64, mediaType) => {
    if (!process.env.CLAUDE_API_KEY) {
        console.error("[foodScanner] CLAUDE_API_KEY is not set");
        throw scanError(503, "AI scanning is unavailable right now.");
    }

    const today = new Date().toISOString().slice(0, 10);
    let response;

    try {
        response = await client.beta.messages.create({
            model: MODEL,
            max_tokens: 8000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: {
                effort: "low",
                format: {type: "json_schema", schema: scanSchema},
            },
            messages: [
                {
                    role: "user",
                    content: [
                        {type: "image", source: {type: "base64", media_type: mediaType, data: imageBase64}},
                        {type: "text", text: buildPrompt(today)},
                    ],
                },
            ],
        });
    } catch (err) {
        // Log the real cause here; the app only gets a friendly message.
        console.error("[foodScanner]", err.status, err.type ?? err.name, err.message);

        if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError || err.status === 402) {
            throw scanError(503, "AI scanning is unavailable right now.");
        }
        if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
            throw scanError(503, "AI scanning is busy, try again in a moment.");
        }
        if (err instanceof Anthropic.BadRequestError) {
            throw scanError(422, "Couldn't read that photo. Try another one.");
        }
        if (err instanceof Anthropic.APIConnectionError) {
            throw scanError(503, "Couldn't reach the AI service. Try again in a moment.");
        }
        throw err;
    }

    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
        console.error("[foodScanner] stop_reason:", response.stop_reason);
        throw scanError(422, "Couldn't read that photo. Try another angle.");
    }

    try {
        const text = response.content.find((block) => block.type === "text").text;
        const {items} = JSON.parse(text);

        return items;
    } catch (err) {
        console.error("[foodScanner] unparseable output");
        throw scanError(422, "Couldn't read that photo. Try another angle.");
    }
}

module.exports = {
    scanFoodImage,
}
