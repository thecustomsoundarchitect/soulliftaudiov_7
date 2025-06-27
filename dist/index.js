// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  sessions;
  currentUserId;
  currentSessionId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.sessions = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createSession(insertSession) {
    const id = this.currentSessionId++;
    const now = /* @__PURE__ */ new Date();
    const session = {
      ...insertSession,
      id,
      occasion: insertSession.occasion || null,
      tone: insertSession.tone || null,
      aiGeneratedPrompts: insertSession.aiGeneratedPrompts ? [...insertSession.aiGeneratedPrompts] : null,
      ingredients: insertSession.ingredients ? [...insertSession.ingredients] : null,
      descriptors: Array.isArray(insertSession.descriptors) ? insertSession.descriptors : [],
      finalMessage: insertSession.finalMessage || null,
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(insertSession.sessionId, session);
    return session;
  }
  async getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`Session not found: ${sessionId}. Available sessions:`, Array.from(this.sessions.keys()));
    }
    return session;
  }
  async updateSession(sessionId, updates) {
    const existingSession = this.sessions.get(sessionId);
    if (!existingSession) {
      return void 0;
    }
    const updatedSession = {
      ...existingSession,
      ...updates,
      occasion: updates.occasion !== void 0 ? updates.occasion : existingSession.occasion,
      tone: updates.tone !== void 0 ? updates.tone : existingSession.tone,
      aiGeneratedPrompts: updates.aiGeneratedPrompts !== void 0 ? updates.aiGeneratedPrompts ? [...updates.aiGeneratedPrompts] : null : existingSession.aiGeneratedPrompts,
      ingredients: updates.ingredients !== void 0 ? updates.ingredients ? [...updates.ingredients] : null : existingSession.ingredients,
      finalMessage: updates.finalMessage !== void 0 ? updates.finalMessage : existingSession.finalMessage,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  async deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var creativeFlowSessions = pgTable("creative_flow_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  anchor: text("anchor").notNull(),
  occasion: text("occasion"),
  tone: text("tone"),
  aiGeneratedPrompts: jsonb("ai_generated_prompts").$type().default([]),
  ingredients: jsonb("ingredients").$type().default([]),
  descriptors: jsonb("descriptors").$type().default([]),
  finalMessage: text("final_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertCreativeFlowSessionSchema = createInsertSchema(creativeFlowSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateCreativeFlowSessionSchema = createInsertSchema(creativeFlowSessions).omit({
  id: true,
  sessionId: true,
  createdAt: true,
  updatedAt: true
}).partial().extend({
  descriptors: z.array(z.string()).optional()
});

// server/services/openai.ts
import OpenAI from "openai";

// shared/promptBrain.ts
var PromptBrain = class {
  relationshipPrompts = {
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
  toneModifiers = {
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
  occasionContexts = {
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
  emotionGuidance = {
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
  lengthGuidelines = {
    brief: "Keep the message concise and impactful, around 30-50 words. Focus on one key sentiment.",
    medium: "Develop 2-3 main points with moderate detail, around 75-125 words.",
    extended: "Include multiple themes with good detail and examples, around 150-200 words.",
    detailed: "Create a comprehensive message with rich detail and multiple elements, 250+ words."
  };
  generatePrompt(context) {
    const relationship = this.relationshipPrompts[context.relationshipType];
    const toneModifier = this.toneModifiers[context.tone];
    const emotionGuidance = this.emotionGuidance[context.emotion];
    const lengthGuideline = this.lengthGuidelines[context.messageLength || "medium"];
    let occasionContext = "";
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
  buildSystemPrompt(relationship, toneModifier, emotionGuidance, occasionContext, lengthGuideline, context) {
    let systemPrompt = `You are an expert at crafting heartfelt, personalized messages that deeply resonate with recipients.

RELATIONSHIP CONTEXT: ${relationship.systemContext}

TONE GUIDANCE: ${toneModifier}

EMOTIONAL CORE: ${emotionGuidance}

${occasionContext ? `OCCASION CONTEXT: ${occasionContext}` : ""}

MESSAGE LENGTH: ${lengthGuideline}

PERSONALIZATION GUIDELINES: ${relationship.personalityHints}

${context.customContext ? `ADDITIONAL CONTEXT: ${context.customContext}` : ""}

IMPORTANT: Create a message that feels authentic, personal, and deeply meaningful. Avoid generic phrases and instead focus on specific, heartfelt sentiments that would genuinely touch the recipient.`;
    return systemPrompt;
  }
  buildUserPrompt(context) {
    let userPrompt = `Please write a ${context.tone} message `;
    if (context.recipientName) {
      userPrompt += `to ${context.recipientName} `;
    }
    userPrompt += `expressing ${context.emotion}`;
    if (context.occasion) {
      userPrompt += ` for their ${context.occasion}`;
    }
    userPrompt += `. The relationship is ${context.relationshipType.replace("_", " ")}`;
    if (context.messageLength) {
      userPrompt += ` and the message should be ${context.messageLength} length`;
    }
    userPrompt += ".";
    return userPrompt;
  }
  generateSuggestedElements(context) {
    const elements = [];
    switch (context.relationshipType) {
      case "romantic_partner":
      case "spouse":
        elements.push("shared memories", "future dreams", "daily moments", "inside jokes");
        break;
      case "family_parent":
        elements.push("childhood memories", "life lessons learned", "gratitude for guidance");
        break;
      case "family_child":
        elements.push("pride in growth", "unconditional love", "hopes for future");
        break;
      case "close_friend":
        elements.push("friendship milestones", "shared adventures", "mutual support");
        break;
      case "colleague":
        elements.push("professional achievements", "teamwork", "mutual respect");
        break;
    }
    if (context.occasion) {
      switch (context.occasion) {
        case "birthday":
          elements.push("year in review", "birthday wishes", "celebration of life");
          break;
        case "graduation":
          elements.push("academic journey", "future possibilities", "achievement recognition");
          break;
        case "wedding":
          elements.push("love celebration", "future together", "commitment honor");
          break;
      }
    }
    switch (context.emotion) {
      case "gratitude":
        elements.push("specific examples", "impact on life", "appreciation details");
        break;
      case "love":
        elements.push("reasons why", "emotional connection", "deep feelings");
        break;
      case "pride":
        elements.push("specific accomplishments", "character growth", "admiration");
        break;
    }
    return [...new Set(elements)];
  }
  // Helper method to get all available options
  getAvailableOptions() {
    return {
      relationshipTypes: Object.keys(this.relationshipPrompts),
      tones: Object.keys(this.toneModifiers),
      occasions: Object.keys(this.occasionContexts),
      emotions: Object.keys(this.emotionGuidance),
      messageLengths: Object.keys(this.lengthGuidelines)
    };
  }
  // Generate multiple prompt variations
  generateVariations(context, count = 3) {
    const variations = [];
    const basePrompt = this.generatePrompt(context);
    variations.push(basePrompt);
    for (let i = 1; i < count; i++) {
      const variantContext = { ...context };
      const variant = this.generatePrompt(variantContext);
      variant.systemPrompt += `

VARIATION ${i + 1}: Focus on a slightly different emotional angle or use alternative phrasing while maintaining the same core sentiment.`;
      variations.push(variant);
    }
    return variations;
  }
};
var promptBrain = new PromptBrain();
function createPromptContext(relationshipType, emotion, tone = "heartfelt", options = {}) {
  return {
    relationshipType,
    emotion,
    tone,
    ...options
  };
}

// server/services/openai.ts
var openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn("OPENAI_API_KEY not found - using dummy data for development");
  }
} catch (error) {
  console.warn("Failed to initialize OpenAI client - using dummy data for development:", error);
}
var DUMMY_PROMPTS = [
  "When they showed incredible kindness to a stranger",
  "How their smile lights up every room",
  "Their gift of making everyone feel heard",
  "The natural way they bring people together",
  "What you see growing stronger in them",
  "That time they stood up for what's right",
  "The small ways they make big differences",
  "Why they deserve to know how valued they are",
  "The real them that shines through everything"
];
var DUMMY_WEAVE_MESSAGE = `Dear [Name],

I hope this message finds you surrounded by the same warmth and joy you bring to everyone around you. There's something truly special about the way you move through the world, and I wanted to take a moment to celebrate that.

Your kindness isn't just something you do - it's who you are. Whether it's the way you listen when someone needs to be heard, or how you find the perfect words to lift someone's spirits, you have this incredible gift of making people feel seen and valued.

I think about all the small moments that reveal your beautiful heart - the way you remember the little things that matter to people, how you celebrate others' victories as if they were your own, and the genuine care you show even when you think no one is watching.

You bring light to spaces simply by being in them. Your laughter is contagious, your compassion is healing, and your presence is a gift that so many of us treasure more than you probably realize.

Thank you for being exactly who you are. The world is brighter because you're in it.

With love and gratitude,
[Your name]`;
var DUMMY_STITCH_MESSAGE = `Dear [Name],

I hope this message wraps around you like the warmest hug and reminds you of something beautiful: you are deeply loved and valued.

Your presence in this world creates ripples of goodness that reach further than you know. The way you show up for others - with your whole heart, your genuine care, and your incredible ability to see the best in people - is a rare and precious gift.

I've watched you navigate challenges with such grace, celebrate others with pure joy, and offer support without ever expecting anything in return. Your strength isn't just in what you overcome, but in how you help others believe they can overcome too.

You have this amazing way of making ordinary moments feel special, of finding hope in difficult times, and of reminding everyone around you what really matters. Your kindness, your wisdom, your beautiful spirit - these aren't just qualities you have, they're lights you shine into the world.

Please know that you are seen, you are appreciated, and you are loved more deeply than words can express. Thank you for being the incredible person you are.

With all my love,
[Your name]`;
var USE_DUMMY_DATA = !openai;
async function generatePersonalizedPrompts(recipientName, anchor, occasion, tone) {
  const recipient = recipientName || "someone special";
  if (USE_DUMMY_DATA || !openai) {
    console.log("Using dummy data for development (OpenAI not available)");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const personalizedPrompts = DUMMY_PROMPTS.map(
      (prompt) => prompt.replace(/they/g, recipient.toLowerCase()).replace(/them/g, recipient.toLowerCase())
    );
    return personalizedPrompts.map((text2, index) => ({
      id: (index + 1).toString(),
      text: text2,
      icon: ""
    }));
  }
  try {
    console.log(`Generating prompts for ${recipient} with anchor "${anchor}"`);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are generating prompts for someone who wants their recipient to feel "${anchor}" when they read the message. Generate exactly 9 prompts (5-6 words each) that inspire stories proving the recipient deserves to feel this way.

KEY INSIGHT: The writer wants ${recipient} to feel "${anchor}" when they receive this message. Create prompts that inspire stories about times when ${recipient} demonstrated qualities, actions, or character that prove they deserve to feel "${anchor}".

REFRAME THE APPROACH:
Instead of "What do you feel about them?" ask "What stories show they deserve to feel ${anchor}?"

PROMPT CATEGORIES:
1. Times they showed the quality: "When ${recipient} demonstrated their strength" / "That time they proved their worth"
2. Impact on others: "How ${recipient} makes people feel" / "The way they brightens everyone's day"
3. Unrecognized contributions: "What ${recipient} doesn't realize about themselves" / "Their gift they takes for granted"
4. Character evidence: "The natural way ${recipient} helps others" / "How they instinctively knows when someone"
5. Future potential: "What you see growing in ${recipient}" / "How they will continue inspiring people"
6. Moments of courage: "That time ${recipient} stood up for" / "When they chose kindness over easy"
7. Daily proof: "The small ways ${recipient} makes" / "Their habit of putting others first"
8. Recognition they deserve: "Why ${recipient} deserves to know they" / "What people say about ${recipient} when"
9. Their authentic self: "The real ${recipient} that shines through" / "What makes ${recipient} irreplaceable to people"

RULES:
- 5-6 words exactly
- Focus on evidence that supports them feeling ${anchor}
- No smell/scent references
- Create curiosity about specific moments
- Include ${recipient}'s name naturally when it fits

Return JSON only:
{"prompts": [{"id": "1", "text": "prompt text here", "icon": ""}]}`
        },
        {
          role: "user",
          content: `Generate 9 personalized prompts (5-6 words each) for someone expressing "${anchor}" to ${recipient}${occasion ? ` for ${occasion}` : ""}${tone ? ` with a ${tone} tone` : ""}. 

Context: This is for a heartfelt message about feeling "${anchor}". Create prompts that will inspire authentic, specific stories rather than generic responses. Focus on unlocking memories and moments that demonstrate this feeling. Leave icon field empty.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500
    });
    console.log("OpenAI response received");
    const result = JSON.parse(response.choices[0].message.content || '{"prompts": []}');
    console.log("Generated prompts:", result.prompts?.map((p) => p.text));
    const validPrompts = (result.prompts || []).map((prompt, index) => {
      let text2 = prompt.text || "";
      text2 = text2.replace(/[^\w\s]/g, "").trim();
      const unwantedTerms = ["smell", "scent", "odor", "fragrance", "aroma"];
      const hasUnwantedTerm = unwantedTerms.some(
        (term) => text2.toLowerCase().includes(term.toLowerCase())
      );
      const words = text2.split(" ");
      if (words.length < 5 || words.length > 6 || hasUnwantedTerm) {
        const fallbacks = [
          "When they showed incredible strength and courage",
          "That time they proved their worth clearly",
          "How they naturally makes others feel better",
          "Their gift they doesn't fully recognize yet",
          "When they chose kindness over easy path",
          "The way they brightens everyone's whole day",
          "What people say about them when absent",
          "That moment they stood up for someone",
          "Why they deserves to know their impact"
        ];
        text2 = fallbacks[index] || "A moment that shows their worth";
        console.log(`Used fallback prompt: ${text2}`);
      }
      const icon = "";
      return {
        id: prompt.id || `${index + 1}`,
        text: text2,
        icon
      };
    });
    console.log("Final validated prompts:", validPrompts.map((p) => p.text));
    return validPrompts.slice(0, 9);
  } catch (error) {
    console.error("Error generating personalized prompts, using fallback prompts:", error);
    const fallbackPrompts = [
      { id: "1", text: "When they showed incredible strength and courage", icon: "" },
      { id: "2", text: "That time they proved their worth clearly", icon: "" },
      { id: "3", text: "How they naturally makes others feel better", icon: "" },
      { id: "4", text: "Their gift they doesn't fully recognize yet", icon: "" },
      { id: "5", text: "When they chose kindness over easy path", icon: "" },
      { id: "6", text: "The way they brightens everyone's whole day", icon: "" },
      { id: "7", text: "What people say about them when absent", icon: "" },
      { id: "8", text: "That time you both couldn't stop", icon: "" },
      { id: "9", text: "What you hope for their future", icon: "" }
    ];
    return fallbackPrompts;
  }
}
async function aiWeaveMessage(request) {
  const recipient = request.recipientName || "someone special";
  if (USE_DUMMY_DATA || !openai) {
    console.log("Using dummy weave message for development (OpenAI not available)");
    await new Promise((resolve) => setTimeout(resolve, 800));
    let dummyMessage = DUMMY_WEAVE_MESSAGE;
    if (request.messageLength === "30sec") {
      dummyMessage = `Dear ${recipient},

I hope this message finds you well and brings a smile to your face. Your ability to spread joy in the small moments of life is truly remarkable and worth celebrating.

Your kindness isn't just something you do - it's who you are. Whether it's the way you listen when someone needs to be heard, or how you find the perfect words to lift someone's spirits, you have this incredible gift of making people feel seen and valued.

Thank you for being exactly who you are. The world is brighter because you're in it.

With love and gratitude,
Someone who cares`;
    } else if (request.messageLength === "1.5min") {
      dummyMessage = DUMMY_WEAVE_MESSAGE + `

I remember watching you navigate challenges with such grace and determination. The way you handle difficult situations while still maintaining your positive outlook is truly inspiring. You don't just overcome obstacles - you help others see that they can overcome theirs too.

Your thoughtfulness extends to the smallest details that most people would overlook. The way you remember someone's favorite coffee order, check in during tough times, or celebrate the little victories shows just how much you care about the people in your life.

What strikes me most is your authenticity. In a world where it's easy to put on masks, you remain genuinely yourself. Your laughter is real, your compassion is deep, and your friendship is a treasure that enriches everyone fortunate enough to know you.

Keep shining your light, ${recipient}. The world needs more hearts like yours.`;
    } else if (request.messageLength === "2min") {
      dummyMessage = DUMMY_WEAVE_MESSAGE + `

I remember watching you navigate challenges with such grace and determination. The way you handle difficult situations while still maintaining your positive outlook is truly inspiring. You don't just overcome obstacles - you help others see that they can overcome theirs too.

Your thoughtfulness extends to the smallest details that most people would overlook. The way you remember someone's favorite coffee order, check in during tough times, or celebrate the little victories shows just how much you care about the people in your life.

What strikes me most is your authenticity. In a world where it's easy to put on masks, you remain genuinely yourself. Your laughter is real, your compassion is deep, and your friendship is a treasure that enriches everyone fortunate enough to know you.

I think about the times you've gone out of your way to help others, often without them even knowing it was you. The anonymous acts of kindness, the behind-the-scenes support, the way you lift others up without seeking recognition - these speak to the depth of your character.

Your presence brings a sense of peace and joy that's rare to find. You have this wonderful ability to make people feel comfortable being themselves around you. In your company, walls come down, laughter comes easier, and hope feels more tangible.

Keep shining your light, ${recipient}. The world needs more hearts like yours, more spirits like yours, and more people who understand the true meaning of love and friendship the way you do.`;
    }
    return dummyMessage.replace(/\[Name\]/g, recipient).replace(/\[Your name\]/g, "Someone who cares");
  }
  try {
    if (!request.ingredients || request.ingredients.length === 0) {
      throw new Error("No ingredients provided to weave into message");
    }
    const ingredientsText = request.ingredients.map((ing, index) => `INGREDIENT ${index + 1}:
Prompt: "${ing.prompt}"
Story/Content: ${ing.content}
---`).join("\n\n");
    let targetWords = 150;
    let lengthGuidance = "approximately 150 words (1 minute reading time)";
    if (request.messageLength === "30sec") {
      targetWords = 75;
      lengthGuidance = "approximately 75 words (30 seconds reading time)";
    } else if (request.messageLength === "1.5min") {
      targetWords = 225;
      lengthGuidance = "approximately 225 words (1.5 minutes reading time)";
    } else if (request.messageLength === "2min") {
      targetWords = 300;
      lengthGuidance = "approximately 300 words (2 minutes reading time)";
    }
    const relationshipType = mapToRelationshipType(request.anchor);
    const emotion = mapToEmotion(request.anchor);
    const tone = mapToTone(request.tone);
    const occasion = mapToOccasion(request.occasion);
    const promptContext = createPromptContext(
      relationshipType,
      emotion,
      tone,
      {
        occasion,
        recipientName: recipient,
        messageLength: mapToMessageLength(request.messageLength),
        customContext: `Weave these specific ingredients into the message: ${request.ingredients.map((i) => `"${i.content}"`).join(", ")}`
      }
    );
    const generatedPrompt = promptBrain.generatePrompt(promptContext);
    const systemPrompt = `${generatedPrompt.systemPrompt}

CRITICAL WEAVING REQUIREMENTS:
1. You MUST incorporate content from ALL ${request.ingredients.length} ingredients provided
2. Use the EXACT stories, details, and specific content from each ingredient
3. The core emotional anchor to convey is: "${request.anchor}"
4. Write directly to ${recipient} in second person
5. TARGET LENGTH: ${lengthGuidance}
6. Reference specific details, moments, actions, and examples from the ingredients
7. Create smooth transitions between different stories/ingredients
8. Make it feel authentic - like you personally witnessed these moments
9. End with a meaningful conclusion that ties everything together

FORBIDDEN:
- Do NOT write generic statements about ${recipient}
- Do NOT skip any ingredients - use them ALL
- Do NOT create content not mentioned in the ingredients
- Do NOT write vague platitudes

Your goal is to create a flowing, cohesive message that makes ${recipient} feel "${request.anchor}" by incorporating every single ingredient's content.`;
    const userPrompt = `Create a personal message for ${recipient} using ALL these ingredients. Each ingredient contains specific content that MUST be incorporated into the final message:

${ingredientsText}

REQUIREMENTS:
- Use content from ALL ${request.ingredients.length} ingredients above
- Make ${recipient} feel "${request.anchor}"
- Include specific details, stories, and examples from each ingredient
- Create a flowing narrative that connects all the stories naturally
- Write directly to ${recipient}

Create the complete message now:`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error weaving message:", error);
    const recipient2 = request.recipientName || "someone special";
    const ingredientsList = request.ingredients.map((ing) => ing.content).join("\n\n");
    const fallbackMessage = `Dear ${recipient2},

I wanted to take a moment to share something with you.

${ingredientsList}

These thoughts have been on my mind, and I felt it was important to express them. I hope this message conveys how much you mean to me and helps you feel ${request.anchor}.

With love and appreciation.`;
    return fallbackMessage;
  }
}
async function aiStitchMessage(request) {
  const recipient = request.recipientName || "someone special";
  if (USE_DUMMY_DATA || !openai) {
    console.log("Using dummy stitch message for development (OpenAI not available)");
    await new Promise((resolve) => setTimeout(resolve, 600));
    return DUMMY_STITCH_MESSAGE.replace(/\[Name\]/g, recipient).replace(/\[Your name\]/g, "Someone who cares");
  }
  try {
    const relationshipType = mapToRelationshipType(request.anchor);
    const emotion = mapToEmotion(request.anchor);
    const promptContext = createPromptContext(
      relationshipType,
      emotion,
      "heartfelt",
      {
        recipientName: recipient,
        customContext: `This is a refinement task. Polish and improve the existing message while maintaining its core sentiment and personal elements.`
      }
    );
    const generatedPrompt = promptBrain.generatePrompt(promptContext);
    const systemPrompt = `${generatedPrompt.systemPrompt}

REFINEMENT GUIDELINES:
1. Maintain the core feeling: "${request.anchor}"
2. Keep the personal voice and authentic tone
3. Improve flow, clarity, and emotional impact
4. Fix any awkward phrasing or transitions
5. Ensure the message effectively conveys "${request.anchor}" to ${recipient}
6. Preserve all specific personal details and memories
7. Make minimal changes - enhance, don't rewrite
8. ${request.improvements ? `Focus on: ${request.improvements}` : "Focus on overall flow and impact"}

Return only the improved message, no explanations.`;
    const userPrompt = `Please refine and improve this message to ${recipient}, ensuring it effectively conveys "${request.anchor}":

${request.currentMessage}

Enhance the message while preserving its authentic voice and personal elements.`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error stitching message:", error);
    const lines = request.currentMessage.split("\n");
    const improvedLines = lines.map((line) => line.trim()).filter((line) => line.length > 0);
    return improvedLines.join("\n\n");
  }
}
function mapToRelationshipType(anchor) {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes("love") || anchorLower.includes("romantic")) return "romantic_partner";
  if (anchorLower.includes("family") || anchorLower.includes("parent") || anchorLower.includes("mom") || anchorLower.includes("dad")) return "family_parent";
  if (anchorLower.includes("child") || anchorLower.includes("son") || anchorLower.includes("daughter")) return "family_child";
  if (anchorLower.includes("sibling") || anchorLower.includes("brother") || anchorLower.includes("sister")) return "family_sibling";
  if (anchorLower.includes("friend")) return "close_friend";
  if (anchorLower.includes("work") || anchorLower.includes("colleague")) return "colleague";
  return "close_friend";
}
function mapToEmotion(anchor) {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes("love")) return "love";
  if (anchorLower.includes("grateful") || anchorLower.includes("thank")) return "gratitude";
  if (anchorLower.includes("proud")) return "pride";
  if (anchorLower.includes("happy") || anchorLower.includes("joy")) return "joy";
  if (anchorLower.includes("excited")) return "excitement";
  if (anchorLower.includes("hope")) return "hope";
  if (anchorLower.includes("admire")) return "admiration";
  if (anchorLower.includes("encourage")) return "encouragement";
  return "gratitude";
}
function mapToTone(tone) {
  if (!tone) return "heartfelt";
  const toneLower = tone.toLowerCase();
  if (toneLower.includes("warm")) return "warm";
  if (toneLower.includes("playful")) return "playful";
  if (toneLower.includes("sincere")) return "sincere";
  if (toneLower.includes("professional")) return "professional";
  if (toneLower.includes("casual")) return "casual";
  if (toneLower.includes("encouraging")) return "encouraging";
  if (toneLower.includes("celebratory")) return "celebratory";
  if (toneLower.includes("comforting")) return "comforting";
  if (toneLower.includes("grateful")) return "grateful";
  return "heartfelt";
}
function mapToOccasion(occasion) {
  if (!occasion) return void 0;
  const occasionLower = occasion.toLowerCase();
  if (occasionLower.includes("birthday")) return "birthday";
  if (occasionLower.includes("anniversary")) return "anniversary";
  if (occasionLower.includes("graduation")) return "graduation";
  if (occasionLower.includes("promotion")) return "promotion";
  if (occasionLower.includes("wedding")) return "wedding";
  if (occasionLower.includes("holiday")) return "holiday";
  if (occasionLower.includes("congratulations")) return "congratulations";
  if (occasionLower.includes("thinking")) return "thinking_of_you";
  return "just_because";
}
function mapToMessageLength(length) {
  if (!length) return "medium";
  if (length.includes("30s")) return "brief";
  if (length.includes("1min")) return "medium";
  if (length.includes("1.5min")) return "extended";
  if (length.includes("2min")) return "detailed";
  return "medium";
}

// server/routes.ts
import { randomUUID } from "crypto";
async function registerRoutes(app2) {
  app2.post("/api/sessions", async (req, res) => {
    try {
      const data = insertCreativeFlowSessionSchema.parse({
        ...req.body,
        sessionId: randomUUID()
      });
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/sessions", async (req, res) => {
    try {
      const sessions = Array.from(storage.sessions.entries()).map(([id, session]) => ({ id, session }));
      res.json({ sessions, count: sessions.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to list sessions" });
    }
  });
  app2.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      if (!session) {
        console.log(`Session ${sessionId} not found. Creating new session...`);
        const newSession = await storage.createSession({
          sessionId,
          recipientName: "Unknown",
          anchor: "GRATEFUL"
        });
        return res.json(newSession);
      }
      res.json(session);
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = updateCreativeFlowSessionSchema.parse(req.body);
      const session = await storage.updateSession(sessionId, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(400).json({
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/generate-prompts", async (req, res) => {
    try {
      const { recipientName, anchor, occasion, tone } = req.body;
      if (!anchor) {
        return res.status(400).json({
          error: "Missing required field: anchor is required"
        });
      }
      const prompts = await generatePersonalizedPrompts(recipientName, anchor, occasion, tone);
      res.json({ prompts });
    } catch (error) {
      console.error("Error generating prompts:", error);
      res.status(500).json({
        error: "Failed to generate personalized prompts",
        details: error instanceof Error ? error.message : "AI service unavailable"
      });
    }
  });
  app2.post("/api/generate-tts", async (req, res) => {
    try {
      const { text: text2, voice = "nova" } = req.body;
      if (!text2 || typeof text2 !== "string") {
        return res.status(400).json({
          error: "Missing required field: text is required"
        });
      }
      if (text2.length > 4e3) {
        return res.status(400).json({
          error: "Text too long: maximum 4000 characters allowed"
        });
      }
      const validVoices = ["nova", "shimmer", "echo", "alloy", "onyx", "fable"];
      if (!validVoices.includes(voice)) {
        return res.status(400).json({
          error: `Invalid voice: must be one of ${validVoices.join(", ")}`
        });
      }
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text2,
          voice,
          response_format: "mp3"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI TTS error:", errorText);
        return res.status(500).json({
          error: "Failed to generate audio",
          details: `OpenAI API error: ${response.statusText}`
        });
      }
      const audioBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(audioBuffer);
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600"
      });
      res.send(buffer);
    } catch (error) {
      console.error("TTS generation error:", error);
      res.status(500).json({
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });
  app2.post("/api/ai-weave", async (req, res) => {
    try {
      const { recipientName, anchor, ingredients, occasion, tone } = req.body;
      if (!anchor || !ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({
          error: "Missing required fields: anchor and ingredients array are required"
        });
      }
      const message = await aiWeaveMessage({
        recipientName,
        anchor,
        ingredients,
        occasion,
        tone
      });
      res.json({ message });
    } catch (error) {
      console.error("Error weaving message:", error);
      res.status(500).json({
        error: "Failed to generate message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });
  app2.post("/api/ai-stitch", async (req, res) => {
    try {
      const { currentMessage, recipientName, anchor, improvements } = req.body;
      if (!currentMessage || !anchor) {
        return res.status(400).json({
          error: "Missing required fields: currentMessage and anchor are required"
        });
      }
      const improvedMessage = await aiStitchMessage({
        currentMessage,
        recipientName,
        anchor,
        improvements
      });
      res.json({ message: improvedMessage });
    } catch (error) {
      console.error("Error polishing message:", error);
      res.status(500).json({
        error: "Failed to improve message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });
  app2.post("/api/generate-voice", async (req, res) => {
    try {
      const { text: text2, trackUrl, hugId } = req.body;
      if (!text2) {
        return res.status(400).json({ error: "Text is required" });
      }
      const placeholder = `/api/placeholder-voice/${hugId}`;
      res.json({
        mergedUrl: placeholder,
        message: "AI voice generation would be implemented here with your chosen TTS service"
      });
    } catch (error) {
      console.error("Voice generation error:", error);
      res.status(500).json({ error: "Failed to generate voice" });
    }
  });
  app2.get("/api/placeholder-voice/:hugId", (req, res) => {
    const { hugId } = req.params;
    const sampleRate = 44100;
    const duration = 10;
    const samples = sampleRate * duration;
    const amplitude = 0.1;
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + samples * 2, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(samples * 2, 40);
    const audioData = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const frequency = 220 + i % 1e3 * 0.1;
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * 32767;
      audioData.writeInt16LE(Math.round(sample), i * 2);
    }
    const audioBuffer = Buffer.concat([header, audioData]);
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Accept-Ranges", "bytes");
    res.send(audioBuffer);
  });
  app2.get("/api/music/:trackId", (req, res) => {
    const { trackId } = req.params;
    const trackConfigs = {
      "calm-morning": { frequency: 440, name: "Calm Morning" },
      // A4
      "gentle-waves": { frequency: 523, name: "Gentle Waves" },
      // C5
      "soft-piano": { frequency: 349, name: "Soft Piano" }
      // F4
    };
    const config = trackConfigs[trackId];
    if (!config) {
      return res.status(404).json({ error: "Track not found" });
    }
    const frequency = config.frequency;
    const sampleRate = 44100;
    const duration = 30;
    const samples = sampleRate * duration;
    const amplitude = 0.1;
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + samples * 2, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(samples * 2, 40);
    const audioData = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const fifth = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.5;
      const octave = Math.sin(2 * Math.PI * (frequency * 2) * t) * 0.25;
      const envelope = Math.exp(-t * 0.1) * 0.5 + 0.5;
      const sample = (fundamental + fifth + octave) * amplitude * envelope * 32767;
      audioData.writeInt16LE(Math.round(sample), i * 2);
    }
    const audioBuffer = Buffer.concat([header, audioData]);
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(audioBuffer);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
