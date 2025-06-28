import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Zap, Target } from "lucide-react";

interface EmotionalContext {
  coreFeeling: string;
  tone: string;
  relationship: string;
  occasion: string;
  recipient: string;
  sender: string;
  ingredients: string[];
  descriptors: string[];
  intimacyLevel: 'casual' | 'close' | 'intimate';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late-night';
}

interface EmotionalPromptResult {
  system: string;
  user: string;
  estimatedCost: number;
  emotionalDepth: number;
}

interface EmotionalPromptGeneratorProps {
  context: Partial<EmotionalContext>;
  onPromptGenerated: (result: EmotionalPromptResult) => void;
  disabled?: boolean;
}

export default function EmotionalPromptGenerator({ 
  context, 
  onPromptGenerated, 
  disabled = false 
}: EmotionalPromptGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<EmotionalPromptResult | null>(null);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // Initialize emotional engine
    initializeEngine();
  }, []);

  const initializeEngine = async () => {
    try {
      // In a real implementation, this would initialize the SoulLift Emotional Engine
      // For now, we'll simulate engine readiness
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEngineReady(true);
    } catch (error) {
      console.error('Failed to initialize emotional engine:', error);
    }
  };

  const generateEmotionalPrompt = async () => {
    if (!engineReady || generating) return;

    setGenerating(true);
    try {
      // Build complete emotional context
      const fullContext: EmotionalContext = {
        coreFeeling: mapAnchorToFeeling(context.relationship || 'friend'),
        tone: context.tone || 'warm',
        relationship: context.relationship || 'friend',
        occasion: context.occasion || 'just-because',
        recipient: context.recipient || 'Someone special',
        sender: context.sender || 'Someone who cares',
        ingredients: context.ingredients || [],
        descriptors: context.descriptors || [],
        intimacyLevel: mapRelationshipToIntimacy(context.relationship || 'friend'),
        timeOfDay: 'evening'
      };

      // Calculate emotional depth
      const emotionalDepth = calculateEmotionalDepth(fullContext);
      
      // Generate system prompt
      const system = generateSystemPrompt(fullContext, emotionalDepth);
      
      // Generate user prompt
      const user = generateUserPrompt(fullContext);
      
      // Estimate cost based on complexity
      const estimatedCost = estimateCost(emotionalDepth, fullContext.ingredients.length);

      const result: EmotionalPromptResult = {
        system,
        user,
        estimatedCost,
        emotionalDepth
      };

      setLastResult(result);
      onPromptGenerated(result);

    } catch (error) {
      console.error('Error generating emotional prompt:', error);
    } finally {
      setGenerating(false);
    }
  };

  const mapAnchorToFeeling = (anchor: string): string => {
    const feelingMap: Record<string, string> = {
      'happy': 'joy and celebration',
      'grateful': 'deep appreciation',
      'proud': 'pride and admiration',
      'supportive': 'unwavering support',
      'encouraging': 'motivation and belief',
      'loving': 'unconditional love',
      'friend': 'valued and cherished',
      'partner': 'deeply loved',
      'family': 'unconditionally supported'
    };
    
    return feelingMap[anchor?.toLowerCase()] || 'appreciated and valued';
  };

  const mapRelationshipToIntimacy = (relationship: string): 'casual' | 'close' | 'intimate' => {
    const intimacyMap: Record<string, 'casual' | 'close' | 'intimate'> = {
      'partner': 'intimate',
      'spouse': 'intimate',
      'family': 'close',
      'parent': 'close',
      'child': 'close',
      'close friend': 'close',
      'friend': 'casual',
      'colleague': 'casual'
    };
    
    return intimacyMap[relationship?.toLowerCase()] || 'casual';
  };

  const calculateEmotionalDepth = (ctx: EmotionalContext): number => {
    let depth = 5;
    
    if (ctx.ingredients.length > 3) depth += 2;
    if (ctx.intimacyLevel === 'intimate') depth += 3;
    if (ctx.intimacyLevel === 'close') depth += 2;
    if (ctx.descriptors.length > 2) depth += 1;
    
    return Math.min(10, depth);
  };

  const generateSystemPrompt = (ctx: EmotionalContext, depth: number): string => {
    return [
      `You are SoulLift's Emotional Intelligence Engine.`,
      ``,
      `EMOTIONAL FRAMEWORK:`,
      `Create authentic emotional resonance around "${ctx.coreFeeling}".`,
      `Use ${ctx.tone.toLowerCase()} tone that feels genuine and heartfelt.`,
      ``,
      `RELATIONSHIP DYNAMICS:`,
      getRelationshipGuidance(ctx.relationship),
      ``,
      `CONTEXTUAL AWARENESS:`,
      `Acknowledge the significance of ${ctx.occasion}.`,
      `Craft message appropriate for ${ctx.timeOfDay} reflection.`,
      ``,
      `CRAFT GUIDELINES:`,
      `- Use the user's specific ingredients as emotional anchors`,
      `- Emotional depth level: ${depth}/10`,
      `- Intimacy level: ${ctx.intimacyLevel}`,
      `- Never be generic - every message must feel uniquely personal`,
    ].join("\n");
  };

  const generateUserPrompt = (ctx: EmotionalContext): string => {
    return [
      `Create a heartfelt message that makes ${ctx.recipient} feel "${ctx.coreFeeling}".`,
      ``,
      `EMOTIONAL INGREDIENTS TO WEAVE IN:`,
      ...ctx.ingredients.map((ing, idx) => `${idx + 1}. ${ing}`),
      ``,
      `RECIPIENT QUALITIES TO CELEBRATE:`,
      ...ctx.descriptors.map((desc, idx) => `${idx + 1}. ${desc}`),
      ``,
      `EMOTIONAL DIRECTION:`,
      `Help them deeply feel: ${ctx.coreFeeling}`,
    ].join("\n");
  };

  const getRelationshipGuidance = (relationship: string): string => {
    const guidance: Record<string, string> = {
      'friend': 'Emphasize chosen family, shared experiences, and mutual support.',
      'partner': 'Use intimate, romantic language that celebrates the unique bond.',
      'family': 'Honor blood bonds, shared history, and unconditional familial love.',
      'colleague': 'Maintain professional warmth while acknowledging mutual respect.'
    };
    
    return guidance[relationship.toLowerCase()] || 'Adapt language to create appropriate emotional connection.';
  };

  const estimateCost = (depth: number, ingredientCount: number): number => {
    const baseTokens = 200;
    const depthMultiplier = depth / 10;
    const ingredientBonus = ingredientCount * 20;
    
    return Math.round(baseTokens * (1 + depthMultiplier) + ingredientBonus);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-400/50 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-200">
          <Brain className="w-5 h-5" />
          Emotional Intelligence Engine
        </CardTitle>
        <p className="text-indigo-300/80 text-sm">
          Advanced AI prompting with contextual emotional awareness
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Engine Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${engineReady ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-indigo-200">
            {engineReady ? 'Engine Ready' : 'Initializing...'}
          </span>
        </div>

        {/* Context Preview */}
        {context.relationship && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-indigo-200">Current Context:</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-indigo-600/40 text-indigo-200">
                {context.tone || 'Warm'}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/40 text-purple-200">
                {context.relationship}
              </Badge>
              <Badge variant="secondary" className="bg-blue-600/40 text-blue-200">
                {context.occasion || 'Just because'}
              </Badge>
            </div>
          </div>
        )}

        {/* Last Result Preview */}
        {lastResult && (
          <div className="p-3 bg-indigo-700/30 rounded-lg border border-indigo-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-200">Last Generation:</span>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-indigo-300" />
                <span className="text-xs text-indigo-300">
                  Depth: {lastResult.emotionalDepth}/10
                </span>
              </div>
            </div>
            <div className="text-xs text-indigo-300/70">
              Estimated tokens: {lastResult.estimatedCost}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateEmotionalPrompt}
          disabled={disabled || !engineReady || generating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {generating ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing Context...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Emotional Prompt
            </>
          )}
        </Button>

        {/* Pro Features Note */}
        <div className="text-xs text-indigo-300/60 bg-indigo-800/20 p-2 rounded">
          💡 Enhanced prompting uses advanced emotional intelligence to create deeply personalized messages
        </div>
      </CardContent>
    </Card>
  );
}