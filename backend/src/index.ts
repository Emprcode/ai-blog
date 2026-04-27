import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const client = new BedrockRuntimeClient({
    region: "us-east-1"
});
const db = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event: any) => {
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

        const command = new InvokeModelCommand({
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

        const responseBody = JSON.parse(
            new TextDecoder().decode(response.body)
        );

        const blog =
            responseBody.outputText ||
            responseBody.choices?.[0]?.message?.content ||
            responseBody.generated_text ||
            responseBody.results?.[0]?.outputText;

        await db.send(
            new PutItemCommand({
                TableName: "blog-topics",
                Item: {
                    id: { S: randomUUID() },
                    topic: { S: topic }
                }
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                topic,
                blog
            })
        };

    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};