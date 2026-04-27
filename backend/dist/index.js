"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const crypto_1 = require("crypto");
const client = new client_bedrock_runtime_1.BedrockRuntimeClient({
    region: "us-east-1"
});
const db = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" });
const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const topic = body.topic;
        if (!topic) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Topic is required" })
            };
        }
        const prompt = `
Write a 200–300 word blog.

Topic: ${topic}

Include:
- Title
- Introduction
- Body (2–3 paragraphs)
- Conclusion
`;
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: "qwen.qwen3-coder-next",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 500
            })
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const blog = responseBody.outputText ||
            responseBody.choices?.[0]?.message?.content ||
            responseBody.generated_text ||
            responseBody.results?.[0]?.outputText;
        await db.send(new client_dynamodb_1.PutItemCommand({
            TableName: "blog-topics",
            Item: {
                id: { S: (0, crypto_1.randomUUID)() },
                topic: { S: topic }
            }
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({
                topic,
                blog
            })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
exports.handler = handler;
