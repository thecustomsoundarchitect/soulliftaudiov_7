// OpenAI regeneration service
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RegenerateRequest {
  recipientName: string;
  anchor: string;
  ingredients: Array<{
    prompt: string;
    content: string;
  }>;
  occasion?: string;
  tone?: string;
  messageLength?: string;
  currentMessage: string;
}

export async function regeneratePrompt(request: RegenerateRequest): Promise<string> {
  try {
    const systemMessage = `You are an AI assistant specialized in creating heartfelt, personalized messages called "Soul Hugs." Your role is to regenerate an existing message with fresh language while maintaining the same emotional core and personal touches.

Key guidelines:
- Keep the same emotional anchor and personal ingredients
- Use different phrasing and structure than the original
- Maintain the warmth and authenticity
- Target length: ${request.messageLength || 'medium'} (brief=30-50 words, medium=75-125 words, extended=150-200 words)
- Tone: ${request.tone || 'heartfelt'}
- Occasion: ${request.occasion || 'general connection'}`;

    const userMessage = `Please regenerate this Soul Hug message with fresh language while keeping the same emotional essence:

Recipient: ${request.recipientName}
Emotional Anchor: ${request.anchor}
Occasion: ${request.occasion || 'Just because'}
Tone: ${request.tone || 'Heartfelt'}

Personal Ingredients:
${request.ingredients.map(ing => `- ${ing.prompt}: ${ing.content}`).join('\n')}

Current Message:
"${request.currentMessage}"

Please create a new version that feels fresh but maintains the same emotional impact and personal touches.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const reply = response.choices[0].message?.content;
    if (!reply) throw new Error("No content in OpenAI response");
    return reply.trim();
  } catch (error: any) {
    console.error("Error regenerating prompt:", error);
    throw error;
  }
}