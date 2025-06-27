// SoulLift Prompt Engine - Comprehensive template-driven message generation
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyAy_j8eY964GwySbwz8Ixhqr4Uwq-2ijhI",
  authDomain: "emotional-978ec.firebaseapp.com",
  projectId: "emotional-978ec",
  storageBucket: "emotional-978ec.appspot.com",
  messagingSenderId: "310774535075",
  appId: "1:310774535075:web:1e6fd614d3dfde11e1c016",
  measurementId: "G-LF4GE0RZT9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Interface definitions
export interface PromptTemplate {
  id: string;
  tone: string;
  relationship: string;
  occasion: string;
  template: string;
}

export interface SoulHugInput {
  tone: string;
  relationship: string;
  occasion: string;
  descriptors?: string[];
  userName?: string;
  recipientName?: string;
  length?: "30 sec" | "1 min" | "1.5–2 min";
  variations?: number;
  ingredients?: Array<{ prompt: string; content: string }>;
}

// Fetch the matching prompt template from Firestore
export async function getPromptTemplate(
  tone: string,
  relationship: string,
  occasion: string
): Promise<PromptTemplate | null> {
  try {
    const q = query(
      collection(db, "promptPresets"),
      where("tone", "==", tone),
      where("relationship", "==", relationship),
      where("occasion", "==", occasion)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    return {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    } as PromptTemplate;
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    return null;
  }
}

// Build the system + user prompt using template or defaults
export function generatePromptFromUserData(params: SoulHugInput) {
  const {
    tone,
    relationship,
    occasion,
    descriptors = [],
    userName = "Unknown",
    recipientName = "Unknown",
    length = "30 sec",
    ingredients = []
  } = params;

  const extras = descriptors.length
    ? `Use elements of: ${descriptors.join(", ")}.`
    : "";
    
  const ingredientText = ingredients.length
    ? `Incorporate these personal elements: ${ingredients.map(ing => ing.content || ing.prompt).join(", ")}.`
    : "";
    
  const timing = {
    "30 sec": "Keep it under 100 words.",
    "1 min": "Aim for 150–200 words.",
    "1.5–2 min": "Allow up to 300 words.",
  }[length];

  const systemPrompt = "You are an expert in crafting short, emotionally rich audio messages. Focus on clarity, vivid language, and emotional resonance.";

  const userPrompt = [
    `Write a ${tone.toLowerCase()} message for a ${relationship.toLowerCase()} about ${occasion.toLowerCase()}.`,
    extras,
    ingredientText,
    timing,
    `Sender: ${userName}. Recipient: ${recipientName}.`,
    "Avoid robotic tone. Suitable for spoken audio.",
  ]
    .filter(Boolean)
    .join(" ");

  return { system: systemPrompt, user: userPrompt };
}

// Core generate function using dummy data for development
export async function handleGenerateSoulHug(input: SoulHugInput): Promise<string[]> {
  try {
    // Fetch template
    const preset = await getPromptTemplate(
      input.tone,
      input.relationship,
      input.occasion
    );

    // Build prompt messages
    let { system, user } = generatePromptFromUserData(input);

    if (preset) {
      system = `Follow this template guidance:\n\n${preset.template}\n\nAlways create emotionally resonant messages.`;
    }

    // For development, return template-guided dummy message
    const templateGuidedMessage = generateTemplateGuidedMessage(input, preset);
    
    return [templateGuidedMessage];
  } catch (error) {
    console.error('Error generating Soul Hug:', error);
    throw error;
  }
}

// Generate template-guided message for development
function generateTemplateGuidedMessage(input: SoulHugInput, template: PromptTemplate | null): string {
  const { recipientName = "Someone special", tone, relationship, occasion, ingredients = [] } = input;
  
  if (template) {
    // Use template-specific generation
    if (template.tone === "Warm") {
      return `Dear ${recipientName},

I hope this message wraps around you like the warmest embrace. There's something so deeply beautiful about who you are, and I wanted you to feel that truth today.

${ingredients.length > 0 ? 
  ingredients.map(ing => `I think about ${ing.content || ing.prompt}`).join('. ') + '. ' : 
  ''
}Your presence brings such comfort and joy to everyone around you. The way you care, the way you listen, the way you make people feel seen and valued - it's a gift that touches hearts in ways you might not even realize.

Thank you for being exactly who you are. You make this world brighter just by being in it.

With so much love and warmth,
Your grateful friend`;
    } else if (template.tone === "Playful") {
      return `Hey ${recipientName}!

Time for some appreciation, whether you like it or not! (Just kidding... but seriously, you're pretty amazing.)

${ingredients.length > 0 ? 
  ingredients.map(ing => `Remember ${ing.content || ing.prompt}`).join('? ') + '? ' : 
  ''
}You have this incredible way of making everything more fun and lighthearted. Your sense of humor, your energy, the way you can turn any ordinary moment into something memorable - it's like having sunshine in human form.

And yes, I know you're probably rolling your eyes at all this mushy stuff, but deal with it - you deserve every word!

Keep being your awesome self,
Your biggest fan`;
    } else if (template.tone === "Reassuring") {
      return `My dear ${recipientName},

I hope this message finds you in a moment of peace. I know things have been challenging, and I wanted you to know that you're not alone in this.

${ingredients.length > 0 ? 
  ingredients.map(ing => `I see your strength in ${ing.content || ing.prompt}`).join('. ') + '. ' : 
  ''
}You have weathered storms before, and each time you've emerged not broken, but somehow more beautiful, more wise, more compassionate. That strength lives within you always, even when you can't feel it.

You are loved, you are valued, and you are enough - exactly as you are.

Sending you comfort and hope,
Someone who believes in you`;
    }
  }
  
  // Fallback message
  return `Dear ${recipientName},

I hope this message finds you well. There's something special I wanted you to know today.

${ingredients.length > 0 ? 
  ingredients.map(ing => `I appreciate ${ing.content || ing.prompt}`).join('. ') + '. ' : 
  ''
}Your ${tone.toLowerCase()} spirit and the way you approach life as a ${relationship.toLowerCase()} means so much. Especially during times like ${occasion.toLowerCase()}, your presence makes all the difference.

Thank you for being such an important part of life's journey.

With heartfelt appreciation,
Your friend`;
}

// Regeneration helpers

// Regenerate same style
export async function regenerateSame(input: SoulHugInput): Promise<string[]> {
  return handleGenerateSoulHug({ ...input, variations: 1 });
}

// Shuffle to next tone
export async function shuffleTone(input: SoulHugInput): Promise<string[]> {
  const tones = [
    "Warm",
    "Playful",
    "Reassuring", 
    "Reflective",
    "Encouraging",
    "Hopeful",
    "Calm",
    "Humorous",
    "Loving",
    "Spiritual",
  ];
  const idx = tones.indexOf(input.tone);
  const nextTone = tones[(idx + 1) % tones.length];
  return handleGenerateSoulHug({ ...input, tone: nextTone });
}

// Generate multiple variations
export async function generateVariations(
  input: SoulHugInput,
  count: number = 3
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    const messages = await handleGenerateSoulHug({ ...input, variations: 1 });
    results.push(...messages);
  }
  return results;
}

// Get available tones for shuffling
export function getAvailableTones(): string[] {
  return [
    "Warm",
    "Playful", 
    "Reassuring",
    "Reflective",
    "Encouraging",
    "Hopeful",
    "Calm",
    "Humorous",
    "Loving",
    "Spiritual",
  ];
}