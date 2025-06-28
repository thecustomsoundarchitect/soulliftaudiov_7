import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Sparkles, RefreshCw } from "lucide-react";
import { getRandomPromptTemplate, TemplateFilters } from "@/services/promptTemplateService";
import type { PromptTemplate } from "@/services/promptTemplateService";

interface VibeShuffleProps {
  currentTemplate?: PromptTemplate | null;
  onVibeChange: (template: PromptTemplate) => void;
  filters?: TemplateFilters;
  disabled?: boolean;
}

export default function VibeShuffle({ 
  currentTemplate, 
  onVibeChange, 
  filters = {},
  disabled = false 
}: VibeShuffleProps) {
  const [shuffling, setShuffling] = useState(false);
  const [lastShuffled, setLastShuffled] = useState<PromptTemplate[]>([]);

  const handleShuffleVibe = async () => {
    if (disabled) return;
    
    setShuffling(true);
    try {
      // Get a random template with optional filters
      const newTemplate = await getRandomPromptTemplate(filters);
      
      if (newTemplate && newTemplate.id !== currentTemplate?.id) {
        setLastShuffled(prev => [newTemplate, ...prev.slice(0, 2)]); // Keep last 3
        onVibeChange(newTemplate);
      }
    } catch (error) {
      console.error('Error shuffling vibe:', error);
    } finally {
      setShuffling(false);
    }
  };

  const handleRevertToPrevious = (template: PromptTemplate) => {
    onVibeChange(template);
    setLastShuffled(prev => prev.filter(t => t.id !== template.id));
  };

  return (
    <Card className="bg-purple-600/20 border-purple-400/50 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Sparkles className="w-5 h-5" />
          Try Different Vibes
        </CardTitle>
        <p className="text-purple-300/80 text-sm">
          Shuffle through emotional styles to find the perfect tone
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Template Display */}
        {currentTemplate && (
          <div className="p-3 bg-purple-700/30 rounded-lg border border-purple-400/30">
            <div className="text-sm font-medium text-purple-200 mb-2">Current Vibe:</div>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="bg-purple-600/40 text-purple-200">
                {currentTemplate.tone}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/40 text-purple-200">
                {currentTemplate.relationship}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/40 text-purple-200">
                {currentTemplate.occasion}
              </Badge>
            </div>
            <p className="text-xs text-purple-300/70 line-clamp-2">
              {currentTemplate.template}
            </p>
          </div>
        )}

        {/* Shuffle Button */}
        <Button
          onClick={handleShuffleVibe}
          disabled={disabled || shuffling}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {shuffling ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Finding New Vibe...
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Emotional Vibe
            </>
          )}
        </Button>

        {/* Recent Shuffles - Allow reverting */}
        {lastShuffled.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-200">Recent Vibes:</div>
            {lastShuffled.map((template, index) => (
              <div
                key={`${template.id}-${index}`}
                onClick={() => handleRevertToPrevious(template)}
                className="p-2 bg-purple-800/20 rounded border border-purple-400/20 cursor-pointer hover:bg-purple-700/30 transition-colors"
              >
                <div className="flex gap-1 mb-1">
                  <Badge variant="secondary" className="bg-purple-600/30 text-purple-300 text-xs">
                    {template.tone}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-600/30 text-purple-300 text-xs">
                    {template.relationship}
                  </Badge>
                </div>
                <p className="text-xs text-purple-300/60 line-clamp-1">
                  {template.template}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tip */}
        <div className="text-xs text-purple-300/60 bg-purple-800/20 p-2 rounded">
          💡 Pro tip: Each shuffle gives you a different emotional approach to help you find the perfect vibe for your message
        </div>
      </CardContent>
    </Card>
  );
}