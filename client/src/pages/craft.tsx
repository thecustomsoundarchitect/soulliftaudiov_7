import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Edit3, Sparkles, Copy, Trash2, FileText } from "lucide-react";
import { useCreativeFlow } from "@/hooks/use-creative-flow";
import { auth } from "@/lib/firebase";
import { saveSoulHug } from "@shared/soulHugs";
import { getUserCredits, deductUserCredits } from "@/services/creditService";
import { useAuth } from "@/hooks/useAuth";

export default function CraftPage() {
  const [, setLocation] = useLocation();
  const { user, openAuthModal } = useAuth();
  const { 
    session, 
    updateSession, 
    aiWeave, 
    aiStitch, 
    isLoading 
  } = useCreativeFlow();
  
  const [message, setMessage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [selectedLength, setSelectedLength] = useState("1min");
  const [credits, setCredits] = useState<number>(0);

  // Redirect to define if no session
  useEffect(() => {
    if (!session) {
      setLocation('/define');
      return;
    }

    // Load existing message if available
    if (session.finalMessage) {
      setMessage(session.finalMessage);
    }
  }, [session, setLocation]);

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (auth.currentUser) {
        const userCredits = await getUserCredits();
        setCredits(userCredits);
      }
    };
    fetchCredits();
  }, []);

  // Update word count when message changes
  useEffect(() => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadTime(Math.ceil(words.length / 200));
  }, [message]);

  if (!session) {
    return null; // Will redirect
  }

  const ingredients = session.ingredients || [];

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    updateSession({ finalMessage: newMessage });
  };

  const handleAIWeave = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (credits < 1) {
      alert("Insufficient credits to use AI Weave. Create more Soul Hugs to earn credits!");
      return;
    }

    if (!ingredients || ingredients.length === 0) {
      alert('Please add some ingredients before weaving a message.');
      return;
    }

    try {
      // Deduct credit first
      const success = await deductUserCredits(1);
      if (!success) {
        alert("Failed to deduct credits. Please try again.");
        return;
      }

      // Update local credits display
      setCredits(prev => prev - 1);

      const weavedMessage = await aiWeave({
        recipientName: session.recipientName,
        anchor: session.anchor,
        ingredients: ingredients.map(ing => ({
          prompt: ing.prompt,
          content: ing.content
        })),
        occasion: session.occasion ?? undefined,
        tone: session.tone ?? undefined,
        messageLength: selectedLength
      });
      
      if (weavedMessage) {
        handleMessageChange(weavedMessage);
      }
    } catch (error: any) {
      console.error("Error weaving message:", error);
      alert("Failed to weave message. Please try again.");
    }
  };

  const handleAIStitch = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (credits < 1) {
      alert("Insufficient credits to use AI Stitch. Create more Soul Hugs to earn credits!");
      return;
    }

    if (!message.trim()) {
      alert('Please write a message before trying to polish it.');
      return;
    }

    try {
      // Deduct credit first
      const success = await deductUserCredits(1);
      if (!success) {
        alert("Failed to deduct credits. Please try again.");
        return;
      }

      // Update local credits display
      setCredits(prev => prev - 1);

      const stitchedMessage = await aiStitch({
        currentMessage: message,
        recipientName: session.recipientName,
        anchor: session.anchor
      });
      
      if (stitchedMessage) {
        handleMessageChange(stitchedMessage);
      }
    } catch (error: any) {
      console.error("Error stitching message:", error);
      alert("Failed to polish message. Please try again.");
    }
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
      updateSession({ finalMessage: '' });
    }
  };

  const sendAsMessage = async () => {

    if (!user) {
      openAuthModal();
      return;
    }

    if (message.trim()) {
      try {
        await saveSoulHug({
          tone: session.tone || 'heartfelt',
          relationship: session.anchor || 'loved one',
          occasion: session.occasion || 'just because',
          message: message,
          audioUrl: '',
          imageUrl: '',
          createdAt: new Date(),
          userId: user.uid,
          creditsUsed: 1
        });
        alert('Soul Hug sent and saved successfully!');
        setLocation('/');
      } catch (error) {
        console.error('Failed to save Soul Hug:', error);
        alert('Soul Hug sent but failed to save. Please try again.');
      }
    } else {
      alert('Please create a message first.');
    }
  };

  const handleNext = () => {
    if (message.trim()) {
      setLocation("/audio-hug");
    } else {
      alert('Please create a message before continuing.');
    }
  };

  const handleBack = () => {
    setLocation("/gather");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-6">
        
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
                          handleMessageChange(newText);
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
                    <p className="text-sm">Go back to Gather to collect some!</p>
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
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Begin crafting your Soul Hug here... Click on ingredients from the left panel to add them, or start typing your heart's message."
                  className="min-h-[500px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl p-6 text-slate-800 leading-relaxed text-lg shadow-inner bg-white/50"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                />
                
                {/* AI Controls */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  {/* Selected Descriptors Display */}
                  {session.descriptors && session.descriptors.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Selected Descriptors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.descriptors.map((descriptor, index) => (
                          <span
                            key={index}
                            className="inline-flex bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200"
                          >
                            {descriptor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-600 mb-1 font-medium">Target Length</label>
                        <Select value={selectedLength} onValueChange={setSelectedLength}>
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30sec">30s - Short</SelectItem>
                            <SelectItem value="1min">1m - Heartfelt</SelectItem>
                            <SelectItem value="1.5min">1.5m - Detailed</SelectItem>
                            <SelectItem value="2min">2m - Deep</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-slate-500">
                        Credits: {credits}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAIWeave}
                        disabled={isLoading || !ingredients || ingredients.length === 0}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-3 py-2 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Weaving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Weave (1 credit)
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleAIStitch}
                        disabled={isLoading || !message.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium px-3 py-2 rounded-lg shadow hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Polish (1 credit)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-blue-700 text-center">
                    <span className="font-medium">Pro tip:</span> Click on ingredients from the left panel to add them to your message. Use AI Weave to create from ingredients, or AI Polish to refine existing text.
                  </div>
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
            Back to Gather
          </Button>
          
          <div className="flex gap-4">
            <Button
              onClick={sendAsMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              Send as Message
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
    </div>
  );
}