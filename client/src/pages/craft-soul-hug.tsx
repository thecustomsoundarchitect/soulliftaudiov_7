import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Edit3, Sparkles, Copy, Trash2, FileText } from "lucide-react";

interface Ingredient {
  id: number;
  prompt: string;
  content: string;
  timestamp: string;
}

export default function CraftSoulHug() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // Load session data from localStorage or session storage
  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('creativeFlowSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.finalMessage) {
          setMessage(session.finalMessage);
        }
        if (session.ingredients) {
          setIngredients(session.ingredients);
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  }, []);

  // Update word count when message changes
  useEffect(() => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [message]);

  // Save message to session storage
  const saveMessage = () => {
    try {
      const sessionData = localStorage.getItem('creativeFlowSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.finalMessage = message;
        localStorage.setItem('creativeFlowSession', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleNext = () => {
    saveMessage();
    setLocation("/audio-hug");
  };

  const handleBack = () => {
    saveMessage();
    setLocation("/creative-flow");
  };

  const copyMessage = () => {
    if (message.trim()) {
      navigator.clipboard.writeText(message);
      alert('Message copied to clipboard!');
    }
  };

  const clearMessage = () => {
    if (confirm('Are you sure you want to clear the message?')) {
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Craft Your Soul Hug
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Refine your message with heart. Use your collected ingredients to create something truly meaningful.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Ingredients Panel */}
          <div className="xl:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  Your Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ingredients.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="group p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 cursor-pointer hover:from-purple-100 hover:to-blue-100 hover:border-purple-200 transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          const newText = message + (message ? '\n\n' : '') + ingredient.content;
                          setMessage(newText);
                        }}
                      >
                        <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                          {ingredient.prompt}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {ingredient.content}
                        </p>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-purple-500 font-medium">Click to add</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="font-medium mb-1">No ingredients available</p>
                    <p className="text-sm">Go back to Creative Flow to gather some!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Editor */}
          <div className="xl:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-3 text-slate-700">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                    Your Soul Hug Message
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1">
                      {wordCount} words
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        onClick={copyMessage}
                        disabled={!message.trim()}
                        size="sm"
                        variant="outline"
                        className="text-slate-600 border-slate-300 hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        onClick={clearMessage}
                        disabled={!message.trim()}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Begin crafting your Soul Hug here... Click on ingredients from the left panel to add them, or start typing your heart's message."
                  className="min-h-[500px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl p-6 text-slate-800 leading-relaxed text-lg shadow-inner bg-white/50"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                />
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700 text-center">
                    <span className="font-medium">Pro tip:</span> Click on ingredients from the left panel to add them to your message
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 max-w-7xl mx-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 text-slate-600 border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creative Flow
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!message.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg"
          >
            Continue to Audio Features
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}