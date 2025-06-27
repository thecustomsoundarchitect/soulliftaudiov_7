import OpenAI from "openai";
import { promptBrain, createPromptContext, RelationshipType, ToneType, EmotionType, OccasionType } from "@shared/promptBrain";

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn('OPENAI_API_KEY not found - using dummy data for development');
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client - using dummy data for development:', error);
}

// Dummy data for development to save API costs
const DUMMY_PROMPTS = [
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

const DUMMY_WEAVE_MESSAGE = `Dear [Name],

I hope this message finds you surrounded by the same warmth and joy you bring to everyone around you. There's something truly special about the way you move through the world, and I wanted to take a moment to celebrate that.

Your kindness isn't just something you do - it's who you are. Whether it's the way you listen when someone needs to be heard, or how you find the perfect words to lift someone's spirits, you have this incredible gift of making people feel seen and valued.

I think about all the small moments that reveal your beautiful heart - the way you remember the little things that matter to people, how you celebrate others' victories as if they were your own, and the genuine care you show even when you think no one is watching.

You bring light to spaces simply by being in them. Your laughter is contagious, your compassion is healing, and your presence is a gift that so many of us treasure more than you probably realize.

Thank you for being exactly who you are. The world is brighter because you're in it.

With love and gratitude,
[Your name]`;

const DUMMY_STITCH_MESSAGE = `Dear [Name],

I hope this message wraps around you like the warmest hug and reminds you of something beautiful: you are deeply loved and valued.

Your presence in this world creates ripples of goodness that reach further than you know. The way you show up for others - with your whole heart, your genuine care, and your incredible ability to see the best in people - is a rare and precious gift.

I've watched you navigate challenges with such grace, celebrate others with pure joy, and offer support without ever expecting anything in return. Your strength isn't just in what you overcome, but in how you help others believe they can overcome too.

You have this amazing way of making ordinary moments feel special, of finding hope in difficult times, and of reminding everyone around you what really matters. Your kindness, your wisdom, your beautiful spirit - these aren't just qualities you have, they're lights you shine into the world.

Please know that you are seen, you are appreciated, and you are loved more deeply than words can express. Thank you for being the incredible person you are.

With all my love,
[Your name]`;

// Set to false to use real OpenAI when API key is available
const USE_DUMMY_DATA = !openai;

export interface GeneratedPrompt {
  id: string;
  text: string;
  icon: string;
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
  improvements?: string;
}

export async function generatePersonalizedPrompts(
  recipientName: string,
  anchor: string,
  occasion?: string,
  tone?: string
): Promise<GeneratedPrompt[]> {
  const recipient = recipientName || "someone special";
  
  if (USE_DUMMY_DATA || !openai) {
    console.log('Using dummy data for development (OpenAI not available)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Personalize dummy prompts with recipient name
    const personalizedPrompts = DUMMY_PROMPTS.map(prompt => 
      prompt.replace(/they/g, recipient.toLowerCase()).replace(/them/g, recipient.toLowerCase())
    );
    
    return personalizedPrompts.map((text, index) => ({
      id: (index + 1).toString(),
      text,
      icon: ''
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
          content: `Generate 9 personalized prompts (5-6 words each) for someone expressing "${anchor}" to ${recipient}${occasion ? ` for ${occasion}` : ''}${tone ? ` with a ${tone} tone` : ''}. 

Context: This is for a heartfelt message about feeling "${anchor}". Create prompts that will inspire authentic, specific stories rather than generic responses. Focus on unlocking memories and moments that demonstrate this feeling. Leave icon field empty.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500,
    });

    console.log('OpenAI response received');
    const result = JSON.parse(response.choices[0].message.content || '{"prompts": []}');
    console.log('Generated prompts:', result.prompts?.map((p: any) => p.text));
    
    // Enforce length limit by checking word count and filter unwanted terms
    const validPrompts = (result.prompts || []).map((prompt: any, index: number) => {
      let text = prompt.text || "";
      
      // Remove any emojis from the text - simple approach
      text = text.replace(/[^\w\s]/g, '').trim();
      
      // Filter out prompts with unwanted terms
      const unwantedTerms = ['smell', 'scent', 'odor', 'fragrance', 'aroma'];
      const hasUnwantedTerm = unwantedTerms.some(term => 
        text.toLowerCase().includes(term.toLowerCase())
      );
      
      // Split by words and ensure 5-6 words
      const words = text.split(' ');
      
      // If not correct length or has unwanted terms, use fallback prompts focused on recipient feeling valued
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
        text = fallbacks[index] || "A moment that shows their worth";
        console.log(`Used fallback prompt: ${text}`);
      }
      
      // No icons - use empty string
      const icon = "";

      return {
        id: prompt.id || `${index + 1}`,
        text: text,
        icon: icon
      };
    });
    
    console.log('Final validated prompts:', validPrompts.map((p: any) => p.text));
    return validPrompts.slice(0, 9);
  } catch (error) {
    console.error('Error generating personalized prompts, using fallback prompts:', error);
    
    // Fallback prompts focused on recipient feeling valued when OpenAI is unavailable
    const fallbackPrompts: GeneratedPrompt[] = [
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

export async function aiWeaveMessage(request: AIWeaveRequest): Promise<string> {
  const recipient = request.recipientName || "someone special";
  
  if (USE_DUMMY_DATA || !openai) {
    console.log('Using dummy weave message for development (OpenAI not available)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Adjust dummy message length based on selection
    let dummyMessage = DUMMY_WEAVE_MESSAGE;
    
    if (request.messageLength === '30sec') {
      // Shorten to ~75 words
      dummyMessage = `Dear ${recipient},

I hope this message finds you well and brings a smile to your face. Your ability to spread joy in the small moments of life is truly remarkable and worth celebrating.

Your kindness isn't just something you do - it's who you are. Whether it's the way you listen when someone needs to be heard, or how you find the perfect words to lift someone's spirits, you have this incredible gift of making people feel seen and valued.

Thank you for being exactly who you are. The world is brighter because you're in it.

With love and gratitude,
Someone who cares`;
    } else if (request.messageLength === '1.5min') {
      // Extend to ~225 words
      dummyMessage = DUMMY_WEAVE_MESSAGE + `

I remember watching you navigate challenges with such grace and determination. The way you handle difficult situations while still maintaining your positive outlook is truly inspiring. You don't just overcome obstacles - you help others see that they can overcome theirs too.

Your thoughtfulness extends to the smallest details that most people would overlook. The way you remember someone's favorite coffee order, check in during tough times, or celebrate the little victories shows just how much you care about the people in your life.

What strikes me most is your authenticity. In a world where it's easy to put on masks, you remain genuinely yourself. Your laughter is real, your compassion is deep, and your friendship is a treasure that enriches everyone fortunate enough to know you.

Keep shining your light, ${recipient}. The world needs more hearts like yours.`;
    } else if (request.messageLength === '2min') {
      // Extend to ~300 words
      dummyMessage = DUMMY_WEAVE_MESSAGE + `

I remember watching you navigate challenges with such grace and determination. The way you handle difficult situations while still maintaining your positive outlook is truly inspiring. You don't just overcome obstacles - you help others see that they can overcome theirs too.

Your thoughtfulness extends to the smallest details that most people would overlook. The way you remember someone's favorite coffee order, check in during tough times, or celebrate the little victories shows just how much you care about the people in your life.

What strikes me most is your authenticity. In a world where it's easy to put on masks, you remain genuinely yourself. Your laughter is real, your compassion is deep, and your friendship is a treasure that enriches everyone fortunate enough to know you.

I think about the times you've gone out of your way to help others, often without them even knowing it was you. The anonymous acts of kindness, the behind-the-scenes support, the way you lift others up without seeking recognition - these speak to the depth of your character.

Your presence brings a sense of peace and joy that's rare to find. You have this wonderful ability to make people feel comfortable being themselves around you. In your company, walls come down, laughter comes easier, and hope feels more tangible.

Keep shining your light, ${recipient}. The world needs more hearts like yours, more spirits like yours, and more people who understand the true meaning of love and friendship the way you do.`;
    }
    
    // Personalize message with recipient name
    return dummyMessage
      .replace(/\[Name\]/g, recipient)
      .replace(/\[Your name\]/g, 'Someone who cares');
  }
  
  try {
    // Ensure we have ingredients to work with
    if (!request.ingredients || request.ingredients.length === 0) {
      throw new Error("No ingredients provided to weave into message");
    }
    
    // Format ingredients with clear structure and emphasis on using ALL content
    const ingredientsText = request.ingredients
      .map((ing, index) => `INGREDIENT ${index + 1}:\nPrompt: "${ing.prompt}"\nStory/Content: ${ing.content}\n---`)
      .join('\n\n');

    // Determine target word count based on message length
    let targetWords = 150; // Default 1 minute
    let lengthGuidance = 'approximately 150 words (1 minute reading time)';
    
    if (request.messageLength === '30sec') {
      targetWords = 75;
      lengthGuidance = 'approximately 75 words (30 seconds reading time)';
    } else if (request.messageLength === '1.5min') {
      targetWords = 225;
      lengthGuidance = 'approximately 225 words (1.5 minutes reading time)';
    } else if (request.messageLength === '2min') {
      targetWords = 300;
      lengthGuidance = 'approximately 300 words (2 minutes reading time)';
    }

    // Enhanced with PromptBrain context
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
        customContext: `Weave these specific ingredients into the message: ${request.ingredients.map(i => `"${i.content}"`).join(', ')}`
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
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error weaving message:', error);
    
    // Fallback message composition when OpenAI is unavailable
    const recipient = request.recipientName || "someone special";
    const ingredientsList = request.ingredients.map(ing => ing.content).join('\n\n');
    
    const fallbackMessage = `Dear ${recipient},

I wanted to take a moment to share something with you.

${ingredientsList}

These thoughts have been on my mind, and I felt it was important to express them. I hope this message conveys how much you mean to me and helps you feel ${request.anchor}.

With love and appreciation.`;

    return fallbackMessage;
  }
}

export async function aiStitchMessage(request: AIStitchRequest): Promise<string> {
  const recipient = request.recipientName || "someone special";
  
  if (USE_DUMMY_DATA || !openai) {
    console.log('Using dummy stitch message for development (OpenAI not available)');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return enhanced dummy message with recipient name
    return DUMMY_STITCH_MESSAGE
      .replace(/\[Name\]/g, recipient)
      .replace(/\[Your name\]/g, 'Someone who cares');
  }
  
  try {
    // Enhanced with PromptBrain context for refinement
    const relationshipType = mapToRelationshipType(request.anchor);
    const emotion = mapToEmotion(request.anchor);
    
    const promptContext = createPromptContext(
      relationshipType,
      emotion,
      'heartfelt',
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
8. ${request.improvements ? `Focus on: ${request.improvements}` : 'Focus on overall flow and impact'}

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
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error stitching message:', error);
    
    // Fallback: return the original message with minor formatting improvements
    const lines = request.currentMessage.split('\n');
    const improvedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
    return improvedLines.join('\n\n');
  }
}

// Helper functions to map Creative Flow data to Prompt Brain types
function mapToRelationshipType(anchor: string): RelationshipType {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes('love') || anchorLower.includes('romantic')) return 'romantic_partner';
  if (anchorLower.includes('family') || anchorLower.includes('parent') || anchorLower.includes('mom') || anchorLower.includes('dad')) return 'family_parent';
  if (anchorLower.includes('child') || anchorLower.includes('son') || anchorLower.includes('daughter')) return 'family_child';
  if (anchorLower.includes('sibling') || anchorLower.includes('brother') || anchorLower.includes('sister')) return 'family_sibling';
  if (anchorLower.includes('friend')) return 'close_friend';
  if (anchorLower.includes('work') || anchorLower.includes('colleague')) return 'colleague';
  return 'close_friend'; // default fallback
}

function mapToEmotion(anchor: string): EmotionType {
  const anchorLower = anchor.toLowerCase();
  if (anchorLower.includes('love')) return 'love';
  if (anchorLower.includes('grateful') || anchorLower.includes('thank')) return 'gratitude';
  if (anchorLower.includes('proud')) return 'pride';
  if (anchorLower.includes('happy') || anchorLower.includes('joy')) return 'joy';
  if (anchorLower.includes('excited')) return 'excitement';
  if (anchorLower.includes('hope')) return 'hope';
  if (anchorLower.includes('admire')) return 'admiration';
  if (anchorLower.includes('encourage')) return 'encouragement';
  return 'gratitude'; // default fallback
}

function mapToTone(tone?: string): ToneType {
  if (!tone) return 'heartfelt';
  const toneLower = tone.toLowerCase();
  if (toneLower.includes('warm')) return 'warm';
  if (toneLower.includes('playful')) return 'playful';
  if (toneLower.includes('sincere')) return 'sincere';
  if (toneLower.includes('professional')) return 'professional';
  if (toneLower.includes('casual')) return 'casual';
  if (toneLower.includes('encouraging')) return 'encouraging';
  if (toneLower.includes('celebratory')) return 'celebratory';
  if (toneLower.includes('comforting')) return 'comforting';
  if (toneLower.includes('grateful')) return 'grateful';
  return 'heartfelt'; // default fallback
}

function mapToOccasion(occasion?: string): OccasionType | undefined {
  if (!occasion) return undefined;
  const occasionLower = occasion.toLowerCase();
  if (occasionLower.includes('birthday')) return 'birthday';
  if (occasionLower.includes('anniversary')) return 'anniversary';
  if (occasionLower.includes('graduation')) return 'graduation';
  if (occasionLower.includes('promotion')) return 'promotion';
  if (occasionLower.includes('wedding')) return 'wedding';
  if (occasionLower.includes('holiday')) return 'holiday';
  if (occasionLower.includes('congratulations')) return 'congratulations';
  if (occasionLower.includes('thinking')) return 'thinking_of_you';
  return 'just_because'; // default fallback
}

function mapToMessageLength(length?: string): 'brief' | 'medium' | 'extended' | 'detailed' {
  if (!length) return 'medium';
  if (length.includes('30s')) return 'brief';
  if (length.includes('1min')) return 'medium';
  if (length.includes('1.5min')) return 'extended';
  if (length.includes('2min')) return 'detailed';
  return 'medium'; // default fallback
}