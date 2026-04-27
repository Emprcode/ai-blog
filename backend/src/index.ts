import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
    region: "us-east-1"
});

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
You are a professional blog writer.

Generate a blog post in JSON format only.

Topic: ${topic}

Return format:
{
  "title": "string",
  "blog": "200-300 word blog",
  "summary": "2-3 sentence summary",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Rules:
- No extra text outside JSON
- Professional tone
- SEO optimized
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
        let parsed;

        try {
            parsed = JSON.parse(blog);
        } catch {
            parsed = {
                title: "Generated Blog",
                blog,
                summary: "",
                keywords: []
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(
                parsed)
        };

    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};