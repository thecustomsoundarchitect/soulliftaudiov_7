import { apiRequest } from "./queryClient";
import { promptBrain, createPromptContext, RelationshipType, ToneType, EmotionType } from "@shared/promptBrain";

export interface GeneratedPrompt {
  id: string;
  text: string;
  icon: string;
}

export interface Ingredient {
  prompt: string;
  content: string;
}

export interface AIWeaveRequest {
  recipientName: string;
  anchor: string;
  ingredients: Array<{
    prompt: string;
    content: string;
  }>;
  occasion?: string;
  tone?: string;
  messageLength?: string;
}

export interface AIStitchRequest {
  currentMessage: string;
  recipientName: string;
  anchor: string;
}

export async function generatePersonalizedPrompts(
  recipientName: string,
  anchor: string,
  occasion?: string,
  tone?: string
): Promise<GeneratedPrompt[]> {
  // Use prompt brain for enhanced prompt generation
  const relationshipType = mapAnchorToRelationship(anchor);
  const emotion = mapAnchorToEmotion(anchor);
  const promptTone = mapStringToTone(tone);
  
  const promptContext = createPromptContext(
    relationshipType,
    emotion,
    promptTone,
    {
      recipientName,
      occasion: occasion as any,
      customContext: `Generate story prompts that will help create ingredients for a personalized message about ${anchor}`
    }
  );
  
  const generatedPrompt = promptBrain.generatePrompt(promptContext);
  
  // Call backend with enhanced context
  const response = await apiRequest('POST', '/api/generate-prompts', {
    recipientName,
    anchor,
    occasion,
    tone,
    enhancedContext: {
      systemPrompt: generatedPrompt.systemPrompt,
      suggestedElements: generatedPrompt.suggestedElements
    }
  });
  
  const data = await response.json();
  return data.prompts;
}

// Helper functions for mapping
function mapAnchorToRelationship(anchor: string): RelationshipType {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes('love') || anchorLower.includes('romantic')) return 'romantic_partner';
  if (anchorLower.includes('family') || anchorLower.includes('parent')) return 'family_parent';
  if (anchorLower.includes('friend')) return 'close_friend';
  return 'close_friend';
}

function mapAnchorToEmotion(anchor: string): EmotionType {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes('love')) return 'love';
  if (anchorLower.includes('grateful')) return 'gratitude';
  if (anchorLower.includes('proud')) return 'pride';
  if (anchorLower.includes('happy')) return 'joy';
  return 'gratitude';
}

function mapStringToTone(tone?: string): ToneType {
  if (!tone) return 'heartfelt';
  const toneLower = tone.toLowerCase();
  if (toneLower.includes('warm')) return 'warm';
  if (toneLower.includes('playful')) return 'playful';
  if (toneLower.includes('sincere')) return 'sincere';
  return 'heartfelt';
}

export async function aiWeaveMessage(request: AIWeaveRequest): Promise<string> {
  const response = await apiRequest('POST', '/api/ai-weave', request);
  const data = await response.json();
  return data.message;
}

export async function aiStitchMessage(request: AIStitchRequest): Promise<string> {
  const response = await apiRequest('POST', '/api/ai-stitch', request);
  const data = await response.json();
  return data.message;
}
