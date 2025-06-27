/**
 * AI Prompt Brain - Reusable prompt generation system
 * Generates contextually appropriate AI prompts based on relationship dynamics,
 * emotional context, and communication parameters.
 */

export interface PromptContext {
  relationshipType: RelationshipType;
  tone: ToneType;
  occasion?: OccasionType;
  emotion: EmotionType;
  recipientName?: string;
  senderName?: string;
  messageLength?: MessageLength;
  customContext?: string;
}

export type RelationshipType = 
  | 'romantic_partner' 
  | 'spouse'
  | 'family_parent'
  | 'family_child'
  | 'family_sibling'
  | 'close_friend'
  | 'colleague'
  | 'mentor'
  | 'student'
  | 'acquaintance';

export type ToneType = 
  | 'warm'
  | 'playful'
  | 'sincere'
  | 'professional'
  | 'casual'
  | 'heartfelt'
  | 'encouraging'
  | 'celebratory'
  | 'comforting'
  | 'grateful';

export type OccasionType = 
  | 'birthday'
  | 'anniversary'
  | 'graduation'
  | 'promotion'
  | 'wedding'
  | 'holiday'
  | 'apology'
  | 'congratulations'
  | 'sympathy'
  | 'thinking_of_you'
  | 'just_because';

export type EmotionType = 
  | 'love'
  | 'gratitude'
  | 'pride'
  | 'joy'
  | 'excitement'
  | 'hope'
  | 'compassion'
  | 'admiration'
  | 'nostalgia'
  | 'encouragement';

export type MessageLength = 
  | 'brief' // 30-50 words
  | 'medium' // 75-125 words
  | 'extended' // 150-200 words
  | 'detailed'; // 250+ words

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: PromptContext;
  suggestedElements: string[];
}

class PromptBrain {
  private relationshipPrompts = {
    romantic_partner: {
      systemContext: "You are crafting a message between romantic partners who share deep intimacy and affection.",
      personalityHints: "Include references to shared experiences, inside jokes, future dreams together, and expressions of deep love and appreciation."
    },
    spouse: {
      systemContext: "You are writing to a life partner with whom there is a committed, enduring bond.",
      personalityHints: "Reference the journey you've shared, mutual support through challenges, and the depth of partnership beyond romance."
    },
    family_parent: {
      systemContext: "You are communicating with a parent figure who has provided guidance and care.",
      personalityHints: "Express gratitude for their guidance, acknowledge their sacrifices, and show respect for their wisdom and experience."
    },
    family_child: {
      systemContext: "You are writing to your child with parental love and pride.",
      personalityHints: "Express unconditional love, pride in their growth, hopes for their future, and supportive encouragement."
    },
    family_sibling: {
      systemContext: "You are communicating with a sibling who shares your family history and experiences.",
      personalityHints: "Reference shared childhood memories, family traditions, mutual understanding, and sibling bond."
    },
    close_friend: {
      systemContext: "You are writing to a dear friend who knows you deeply and shares significant life experiences.",
      personalityHints: "Include shared memories, inside references, mutual support, and the comfort of true friendship."
    },
    colleague: {
      systemContext: "You are communicating with a professional colleague in a work context.",
      personalityHints: "Maintain professional tone while showing appreciation, acknowledge their contributions, and express respect."
    },
    mentor: {
      systemContext: "You are writing to someone who has guided your growth and development.",
      personalityHints: "Express gratitude for their guidance, acknowledge how they've influenced your path, show respect for their expertise."
    },
    student: {
      systemContext: "You are communicating with someone you have guided or taught.",
      personalityHints: "Express pride in their progress, offer continued support, and acknowledge their efforts and achievements."
    },
    acquaintance: {
      systemContext: "You are writing to someone you know but don't have a deeply personal relationship with.",
      personalityHints: "Keep tone appropriate for the level of familiarity, be warm but not overly intimate."
    }
  };

  private toneModifiers = {
    warm: "Use gentle, caring language that conveys comfort and affection.",
    playful: "Include light humor, playful language, and a sense of fun and joy.",
    sincere: "Use earnest, genuine language that conveys deep authenticity.",
    professional: "Maintain appropriate boundaries while being personable and respectful.",
    casual: "Use relaxed, conversational language as if speaking naturally.",
    heartfelt: "Express deep emotions with vulnerability and openness.",
    encouraging: "Focus on uplifting language that inspires and motivates.",
    celebratory: "Use joyful, enthusiastic language that marks a special moment.",
    comforting: "Provide solace and support with gentle, understanding language.",
    grateful: "Express appreciation and thankfulness throughout the message."
  };

  private occasionContexts = {
    birthday: "This is a celebration of their life and another year of growth and experiences.",
    anniversary: "This marks a significant milestone in your relationship or their life journey.",
    graduation: "This celebrates an important achievement and transition to a new chapter.",
    promotion: "This acknowledges their professional growth and hard work paying off.",
    wedding: "This celebrates love, commitment, and the beginning of a new life chapter.",
    holiday: "This connects to the spirit and traditions of the holiday season.",
    apology: "This seeks to make amends and repair any harm done to the relationship.",
    congratulations: "This celebrates their success, achievement, or good news.",
    sympathy: "This offers comfort and support during a difficult time.",
    thinking_of_you: "This reaches out to let them know they're in your thoughts and heart.",
    just_because: "This expresses feelings without needing a special occasion as the reason."
  };

  private emotionGuidance = {
    love: "Express deep affection, care, and the importance of this person in your life.",
    gratitude: "Focus on specific things you appreciate about them and their impact on your life.",
    pride: "Celebrate their accomplishments and express how proud you are of who they are.",
    joy: "Share in their happiness and express the delight you feel about their good fortune.",
    excitement: "Convey enthusiasm about their news, plans, or shared experiences.",
    hope: "Express optimism about their future and confidence in their abilities.",
    compassion: "Show understanding, empathy, and support for what they're going through.",
    admiration: "Express respect for their qualities, actions, or character.",
    nostalgia: "Reference shared memories and the meaningful history you've built together.",
    encouragement: "Provide motivation, support, and belief in their capabilities."
  };

  private lengthGuidelines = {
    brief: "Keep the message concise and impactful, around 30-50 words. Focus on one key sentiment.",
    medium: "Develop 2-3 main points with moderate detail, around 75-125 words.",
    extended: "Include multiple themes with good detail and examples, around 150-200 words.",
    detailed: "Create a comprehensive message with rich detail and multiple elements, 250+ words."
  };

  generatePrompt(context: PromptContext): GeneratedPrompt {
    const relationship = this.relationshipPrompts[context.relationshipType];
    const toneModifier = this.toneModifiers[context.tone];
    const emotionGuidance = this.emotionGuidance[context.emotion];
    const lengthGuideline = this.lengthGuidelines[context.messageLength || 'medium'];
    
    let occasionContext = '';
    if (context.occasion) {
      occasionContext = this.occasionContexts[context.occasion];
    }

    const systemPrompt = this.buildSystemPrompt(
      relationship,
      toneModifier,
      emotionGuidance,
      occasionContext,
      lengthGuideline,
      context
    );

    const userPrompt = this.buildUserPrompt(context);

    const suggestedElements = this.generateSuggestedElements(context);

    return {
      systemPrompt,
      userPrompt,
      context,
      suggestedElements
    };
  }

  private buildSystemPrompt(
    relationship: any,
    toneModifier: string,
    emotionGuidance: string,
    occasionContext: string,
    lengthGuideline: string,
    context: PromptContext
  ): string {
    let systemPrompt = `You are an expert at crafting heartfelt, personalized messages that deeply resonate with recipients.

RELATIONSHIP CONTEXT: ${relationship.systemContext}

TONE GUIDANCE: ${toneModifier}

EMOTIONAL CORE: ${emotionGuidance}

${occasionContext ? `OCCASION CONTEXT: ${occasionContext}` : ''}

MESSAGE LENGTH: ${lengthGuideline}

PERSONALIZATION GUIDELINES: ${relationship.personalityHints}

${context.customContext ? `ADDITIONAL CONTEXT: ${context.customContext}` : ''}

IMPORTANT: Create a message that feels authentic, personal, and deeply meaningful. Avoid generic phrases and instead focus on specific, heartfelt sentiments that would genuinely touch the recipient.`;

    return systemPrompt;
  }

  private buildUserPrompt(context: PromptContext): string {
    let userPrompt = `Please write a ${context.tone} message `;
    
    if (context.recipientName) {
      userPrompt += `to ${context.recipientName} `;
    }
    
    userPrompt += `expressing ${context.emotion}`;
    
    if (context.occasion) {
      userPrompt += ` for their ${context.occasion}`;
    }
    
    userPrompt += `. The relationship is ${context.relationshipType.replace('_', ' ')}`;
    
    if (context.messageLength) {
      userPrompt += ` and the message should be ${context.messageLength} length`;
    }
    
    userPrompt += '.';

    return userPrompt;
  }

  private generateSuggestedElements(context: PromptContext): string[] {
    const elements: string[] = [];
    
    // Relationship-specific suggestions
    switch (context.relationshipType) {
      case 'romantic_partner':
      case 'spouse':
        elements.push('shared memories', 'future dreams', 'daily moments', 'inside jokes');
        break;
      case 'family_parent':
        elements.push('childhood memories', 'life lessons learned', 'gratitude for guidance');
        break;
      case 'family_child':
        elements.push('pride in growth', 'unconditional love', 'hopes for future');
        break;
      case 'close_friend':
        elements.push('friendship milestones', 'shared adventures', 'mutual support');
        break;
      case 'colleague':
        elements.push('professional achievements', 'teamwork', 'mutual respect');
        break;
    }
    
    // Occasion-specific suggestions
    if (context.occasion) {
      switch (context.occasion) {
        case 'birthday':
          elements.push('year in review', 'birthday wishes', 'celebration of life');
          break;
        case 'graduation':
          elements.push('academic journey', 'future possibilities', 'achievement recognition');
          break;
        case 'wedding':
          elements.push('love celebration', 'future together', 'commitment honor');
          break;
      }
    }
    
    // Emotion-specific suggestions
    switch (context.emotion) {
      case 'gratitude':
        elements.push('specific examples', 'impact on life', 'appreciation details');
        break;
      case 'love':
        elements.push('reasons why', 'emotional connection', 'deep feelings');
        break;
      case 'pride':
        elements.push('specific accomplishments', 'character growth', 'admiration');
        break;
    }
    
    return [...new Set(elements)]; // Remove duplicates
  }

  // Helper method to get all available options
  getAvailableOptions() {
    return {
      relationshipTypes: Object.keys(this.relationshipPrompts) as RelationshipType[],
      tones: Object.keys(this.toneModifiers) as ToneType[],
      occasions: Object.keys(this.occasionContexts) as OccasionType[],
      emotions: Object.keys(this.emotionGuidance) as EmotionType[],
      messageLengths: Object.keys(this.lengthGuidelines) as MessageLength[]
    };
  }

  // Generate multiple prompt variations
  generateVariations(context: PromptContext, count: number = 3): GeneratedPrompt[] {
    const variations: GeneratedPrompt[] = [];
    const basePrompt = this.generatePrompt(context);
    
    variations.push(basePrompt);
    
    // Generate variations by slightly modifying the approach
    for (let i = 1; i < count; i++) {
      const variantContext = { ...context };
      const variant = this.generatePrompt(variantContext);
      
      // Modify the system prompt slightly for variation
      variant.systemPrompt += `\n\nVARIATION ${i + 1}: Focus on a slightly different emotional angle or use alternative phrasing while maintaining the same core sentiment.`;
      
      variations.push(variant);
    }
    
    return variations;
  }
}

// Export singleton instance
export const promptBrain = new PromptBrain();

// Export utility functions
export function createPromptContext(
  relationshipType: RelationshipType,
  emotion: EmotionType,
  tone: ToneType = 'heartfelt',
  options: Partial<PromptContext> = {}
): PromptContext {
  return {
    relationshipType,
    emotion,
    tone,
    ...options
  };
}

export function generateAIPrompt(context: PromptContext): GeneratedPrompt {
  return promptBrain.generatePrompt(context);
}

export function getPromptOptions() {
  return promptBrain.getAvailableOptions();
}