import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, User, Settings } from "lucide-react";

interface AnchorStageProps {
  onSubmit: (data: {
    recipientName: string;
    anchor: string;
    occasion?: string;
    tone?: string;
  }) => void;
  isLoading: boolean;
}

export default function AnchorStage({ onSubmit, isLoading }: AnchorStageProps) {
  const [recipientName, setRecipientName] = useState("");
  const [anchor, setAnchor] = useState("");
  const [occasion, setOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [tone, setTone] = useState("");

  const handleSubmit = () => {
    if (!anchor.trim()) {
      alert('Please describe the feeling you want to convey');
      return;
    }

    onSubmit({
      recipientName: recipientName.trim() || "Someone special",
      anchor: anchor.trim(),
      occasion: occasion === "other" ? customOccasion.trim() : (occasion || undefined),
      tone: tone || undefined
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4">
          Define Your Soul Hug
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Think of this like a recipe from the heart. We'll gather a few ingredients, then create something honest and real. 
          There's no wrong way to say what matters.
        </p>
      </div>
      
      <div className="space-y-8">
        
        {/* Recipient Name */}
        <div className="space-y-3">
          <Label htmlFor="recipient-name" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Who is this for? (Optional)
          </Label>
          <p className="text-sm text-slate-600 mb-3">
            You can write a name, like 'Dad' or 'My neighbor' — or leave it blank.
          </p>
          <Input
            id="recipient-name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="p-4 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl text-slate-800 placeholder-slate-400 bg-white/70"
            placeholder="Enter their name or leave blank..."
          />
        </div>
        
        {/* Core Feeling */}
        <div className="space-y-3">
          <Label htmlFor="anchor" className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            How do you want them to feel when they receive this?
          </Label>
          <Input
            id="anchor"
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            className="p-4 border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl text-slate-800 placeholder-slate-400 bg-white/70"
            placeholder="e.g., deeply appreciated, truly valued, completely loved, genuinely supported..."
          />
        </div>
        
        {/* Optional Context */}
        <details className="group">
          <summary className="cursor-pointer text-lg font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
            <Settings className="w-5 h-5" />
            Optional Context
            <span className="ml-auto text-sm text-slate-400 group-open:hidden">Click to expand</span>
          </summary>
          <div className="mt-6 space-y-6 p-6 bg-slate-50 rounded-xl">
            
            {/* Occasion */}
            <div>
              <Label className="block text-sm font-semibold text-slate-600 mb-3">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select occasion..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="thank-you">Thank you</SelectItem>
                  <SelectItem value="apology">Apology</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                  <SelectItem value="just-because">Just because</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {occasion === "other" && (
                <Input
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  className="mt-3 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                  placeholder="Please specify the occasion..."
                />
              )}
            </div>
            
            {/* Tone */}
            <div>
              <Label className="block text-sm font-semibold text-slate-600 mb-3">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select tone..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heartfelt">Heartfelt</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </details>
      </div>

      <div className="text-center mt-12">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !anchor.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            'Begin Gathering Ingredients'
          )}
        </Button>
      </div>
    </div>
  );
}