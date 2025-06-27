import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Play, Pause, Volume2 } from "lucide-react";

interface AIVoiceGeneratorProps {
  text: string;
  onVoiceGenerated: (url: string) => void;
  disabled?: boolean;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  description: string;
  premium: boolean;
}

const voices: Voice[] = [
  { id: "nova", name: "Nova", gender: "Female", description: "Warm and friendly", premium: false },
  { id: "alloy", name: "Alloy", gender: "Neutral", description: "Smooth and professional", premium: false },
  { id: "echo", name: "Echo", gender: "Male", description: "Clear and confident", premium: false },
  { id: "fable", name: "Fable", gender: "Male", description: "Expressive storyteller", premium: true },
  { id: "onyx", name: "Onyx", gender: "Male", description: "Deep and resonant", premium: true },
  { id: "shimmer", name: "Shimmer", gender: "Female", description: "Gentle and soothing", premium: true }
];

export default function AIVoiceGenerator({ text, onVoiceGenerated, disabled = false }: AIVoiceGeneratorProps) {
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("nova");
  const [playing, setPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!text || disabled) return;
    
    setLoading(true);
    setVoiceUrl(null);
    
    try {
      // For production, this would call OpenAI TTS API or ElevenLabs
      // For development, we'll create a placeholder
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          hugId: Date.now().toString()
        })
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();
      const generatedUrl = data.mergedUrl || data.voiceUrl;
      
      setVoiceUrl(generatedUrl);
      onVoiceGenerated(generatedUrl);
      
    } catch (error) {
      console.error('AI voice generation error:', error);
      alert('Failed to generate AI voice. This feature requires TTS service integration.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!voiceUrl) return;
    
    const audio = document.querySelector(`audio[src="${voiceUrl}"]`) as HTMLAudioElement;
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-900 dark:text-blue-100">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Voice Generation
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
          Transform your Soul Hug into professional AI narration
        </p>
      </div>
      <div className="space-y-4">
        
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Choose Voice:</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={disabled}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id} className="text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">({voice.gender})</span>
                    </div>
                    {voice.premium && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-600/40 text-orange-700 dark:text-orange-200 ml-2">
                        Premium
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedVoiceData && (
            <p className="text-xs text-indigo-300/70">
              {selectedVoiceData.description}
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={disabled || loading || !text}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3"
        >
          {loading ? (
            <>
              <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
              Generating Voice...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Voice
            </>
          )}
        </Button>

        {/* Generated Voice Preview */}
        {voiceUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Generated Voice:</span>
              <div className="flex gap-2">
                <Button
                  onClick={togglePlayback}
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={() => window.open(voiceUrl, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <audio
              src={voiceUrl}
              controls
              className="w-full"
              onEnded={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          </div>
        )}

      </div>
    </div>
  );
}