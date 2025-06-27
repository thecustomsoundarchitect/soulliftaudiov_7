// Advanced SoulLift Emotional Engine - Production-ready AI message generation
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

// Core interfaces
interface EmotionalPattern {
  id: string;
  template: string;
  cost: number;
  tone: string;
  relationship: string;
  occasion: string;
}

interface EmotionalContext {
  coreFeeling: string;
  tone: string;
  relationship?: string;
  occasion?: string;
  recipient?: string;
  sender?: string;
  ingredients: string[];
  descriptors: string[];
  intimacyLevel?: "casual" | "close" | "intimate";
  timeOfDay?: "morning" | "afternoon" | "evening" | "late-night";
}

interface EmotionalAnalysis {
  emotionalDepth: number;
  intimacyLevel: "casual" | "close" | "intimate";
}

interface PromptStrategy {
  targetLength: "concise" | "medium" | "rich";
  wordRange: string;
  estimatedTokens: number;
}

// Load emotional patterns from Firestore
async function loadPatterns(): Promise<EmotionalPattern[]> {
  try {
    const snapshot = await getDocs(collection(db, "promptPresets"));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        template: data.template,
        cost: data.tokenCost || 200,
        tone: data.tone,
        relationship: data.relationship,
        occasion: data.occasion,
      };
    });
  } catch (error) {
    console.error('Error loading patterns:', error);
    return [];
  }
}

class ContextAnalyzer {
  async analyze(ctx: EmotionalContext): Promise<EmotionalAnalysis> {
    let depth = 5;
    
    // Ingredient complexity boost
    if (ctx.ingredients.length > 3) depth += 2;
    
    // Relationship intimacy boost
    const intimacyBonus: Record<string, number> = {
      partner: 3, 
      family: 2, 
      "close friend": 2, 
      friend: 1, 
      colleague: 0,
    };
    depth += intimacyBonus[ctx.relationship?.toLowerCase() || ''] || 0;
    
    return {
      emotionalDepth: Math.min(10, depth),
      intimacyLevel: ctx.relationship === "partner"
        ? "intimate"
        : ["family", "close friend"].includes(ctx.relationship?.toLowerCase() || "")
          ? "close"
          : "casual",
    };
  }
}

class CostOptimizer {
  selectStrategy(analysis: EmotionalAnalysis): PromptStrategy {
    if (analysis.emotionalDepth >= 8) {
      return { 
        targetLength: "rich", 
        wordRange: "200-300", 
        estimatedTokens: 400 
      };
    }
    if (analysis.emotionalDepth >= 6) {
      return { 
        targetLength: "medium", 
        wordRange: "150-200", 
        estimatedTokens: 300 
      };
    }
    return { 
      targetLength: "concise", 
      wordRange: "100-150", 
      estimatedTokens: 200 
    };
  }
}

export class SoulLiftEmotionalEngine {
  private patterns = new Map<string, EmotionalPattern>();
  private analyzer = new ContextAnalyzer();
  private optimizer = new CostOptimizer();

  async init() {
    const list = await loadPatterns();
    list.forEach(p => this.patterns.set(p.id, p));
  }

  private getEmotionalFramework(core: string, tone: string): string {
    const frameworks: Record<string, string> = {
      completely_supported:
        "Create a sense of unwavering backing and belief. Use strong, steady language that conveys reliability and trust.",
      deeply_appreciated: 
        "Express profound gratitude and recognition. Highlight specific qualities and actions that matter.",
      unconditionally_loved:
        "Convey boundless affection and acceptance. Use warm, embracing language that feels like a hug.",
    };
    
    const base = frameworks[core.toLowerCase().replace(/\s+/g, "_")]
      || `Create authentic emotional resonance around "${core}".`;
    return base;
  }

  private getRelationshipDynamics(rel?: string): string {
    const map: Record<string, string> = {
      friend: "Emphasize chosen family, shared experiences, and mutual support.",
      partner: "Use intimate, romantic language that celebrates the unique bond and deep connection.",
      family: "Honor blood bonds, shared history, and unconditional familial love.",
      colleague: "Maintain professional warmth while acknowledging mutual respect and collaboration.",
    };
    return map[rel?.toLowerCase() || ""] ||
      "Adapt language to create appropriate emotional connection.";
  }

  private getContextualAwareness(ctx: EmotionalContext): string {
    const parts: string[] = [];
    if (ctx.occasion) {
      parts.push(`Acknowledge the significance of ${ctx.occasion}.`);
    }
    if (ctx.timeOfDay) {
      const times: Record<string, string> = {
        "late-night": "Use intimate, contemplative tones for quiet moments.",
        "morning": "Infuse with fresh energy and optimistic hope for the day ahead.",
        "evening": "Create a warm, reflective atmosphere for winding down.",
      };
      if (times[ctx.timeOfDay]) parts.push(times[ctx.timeOfDay]);
    }
    return parts.join("\n") ||
      "Craft message appropriate for the moment and context.";
  }

  private processIngredients(ingredients: string[]): string {
    if (!ingredients.length) return "No specific memories provided.";
    return ingredients
      .map((ingredient, idx) => {
        if (ingredient.includes(":")) {
          const [prompt, story] = ingredient.split(":", 2);
          return `${idx + 1}. ${prompt.trim()}\n   Memory: ${story.trim()}`;
        }
        return `${idx + 1}. ${ingredient}`;
      })
      .join("\n");
  }

  private weaveDescriptors(descriptors: string[]): string {
    const categories: Record<string, string[]> = {
      "Strength Qualities": ["Resilient", "Strong", "Determined"],
      "Heart Qualities": ["Kind", "Compassionate", "Loving"],
      "Mind Qualities": ["Wise", "Thoughtful", "Creative"],
    };
    
    const grouped: Record<string, string[]> = {};
    for (const [category, words] of Object.entries(categories)) {
      const matches = descriptors.filter(d => words.includes(d));
      if (matches.length) grouped[category] = matches;
    }
    
    return Object.entries(grouped)
      .map(([cat, words]) => `${cat}: ${words.join(", ")}`)
      .join("\n");
  }

  private getEmotionalDirection(core: string): string {
    const map: Record<string, string> = {
      support: "Create a sense of backing, belief, and unwavering presence",
      gratitude: "Express deep appreciation and recognition of their value",
      love: "Convey boundless affection and emotional connection",
    };
    const key = Object.keys(map).find(k => core.toLowerCase().includes(k));
    return key ? map[key] : `Help them deeply feel: ${core}`;
  }

  async generateEmotionalPrompt(
    ctx: EmotionalContext
  ): Promise<{
    system: string;
    user: string;
    estimatedCost: number;
    emotionalDepth: number;
  }> {
    // 1. Analyze context
    const analysis = await this.analyzer.analyze(ctx);
    
    // 2. Pick strategy
    const strategy = this.optimizer.selectStrategy(analysis);
    
    // 3. Build system prompt
    const system = [
      `You are SoulLift's Emotional Intelligence Engine.`,
      ``,
      `EMOTIONAL FRAMEWORK:`,
      this.getEmotionalFramework(ctx.coreFeeling, ctx.tone),
      ``,
      `RELATIONSHIP DYNAMICS:`,
      this.getRelationshipDynamics(ctx.relationship),
      ``,
      `CONTEXTUAL AWARENESS:`,
      this.getContextualAwareness(ctx),
      ``,
      `CRAFT GUIDELINES:`,
      `- Use the user's specific ingredients as emotional anchors`,
      `- Write for ${strategy.targetLength} (${strategy.wordRange} words)`,
      `- Emotional depth level: ${analysis.emotionalDepth}/10`,
      `- Never be generic - every message must feel uniquely personal`,
    ].join("\n");

    // 4. Build user prompt
    const user = [
      `Create a heartfelt message that makes ${ctx.recipient || "the recipient"} feel "${ctx.coreFeeling}".`,
      ``,
      `EMOTIONAL INGREDIENTS TO WEAVE IN:`,
      this.processIngredients(ctx.ingredients),
      ``,
      `RECIPIENT QUALITIES TO CELEBRATE:`,
      this.weaveDescriptors(ctx.descriptors),
      ``,
      `EMOTIONAL DIRECTION:`,
      this.getEmotionalDirection(ctx.coreFeeling),
    ].join("\n");

    return {
      system,
      user,
      estimatedCost: strategy.estimatedTokens,
      emotionalDepth: analysis.emotionalDepth,
    };
  }

  // Find the best matching pattern for context
  async findBestPattern(ctx: EmotionalContext): Promise<EmotionalPattern | null> {
    const patterns = Array.from(this.patterns.values());
    
    // Score patterns based on context match
    const scored = patterns.map(pattern => {
      let score = 0;
      
      if (pattern.tone.toLowerCase() === ctx.tone.toLowerCase()) score += 3;
      if (pattern.relationship.toLowerCase() === ctx.relationship?.toLowerCase()) score += 3;
      if (pattern.occasion.toLowerCase() === ctx.occasion?.toLowerCase()) score += 2;
      
      return { pattern, score };
    });
    
    // Return best match or null if no good match
    const best = scored.sort((a, b) => b.score - a.score)[0];
    return best && best.score >= 3 ? best.pattern : null;
  }
}

// Export singleton instance
export const emotionalEngine = new SoulLiftEmotionalEngine();