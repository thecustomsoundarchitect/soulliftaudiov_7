import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreativeFlowSession } from "@shared/schema";
import { auth } from "@/lib/firebase";
import { saveSoulHug } from "@shared/soulHugs";
import { getUserCredits, deductUserCredits } from "@/services/creditService";

interface LoomStageProps {
  session: CreativeFlowSession;
  onBack: () => void;
  onStartOver: () => void;
  onAIWeave: (messageLength?: string) => void;
  onAIStitch: (currentMessage: string) => void;
  onUpdateMessage: (message: string) => void;
  onContinueToAudio: () => void;
  isLoading: boolean;
}

export default function LoomStage({
  session,
  onBack,
  onStartOver,
  onAIWeave,
  onAIStitch,
  onUpdateMessage,
  onContinueToAudio,
  isLoading
}: LoomStageProps) {
  const [message, setMessage] = useState(session.finalMessage || "");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [selectedLength, setSelectedLength] = useState("1min");
  const [credits, setCredits] = useState<number>(0);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchCredits = async () => {
      if (auth.currentUser) {
        const userCredits = await getUserCredits();
        setCredits(userCredits);
      }
    };
    fetchCredits();
  }, []);

  useEffect(() => {
    const words = message.trim().split(/\s+/).length;
    setWordCount(message.trim() ? words : 0);
    setReadTime(Math.ceil(words / 200));
  }, [message]);

  useEffect(() => {
    if (session.finalMessage) {
      setMessage(session.finalMessage);
    }
  }, [session.finalMessage]);

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    onUpdateMessage(newMessage);
  };

  const copyMessage = () => {
    if (message.trim()) {
      navigator.clipboard.writeText(message);
      alert('Message copied to clipboard!');
    }
  };

  const exportMessage = () => {
    if (message.trim()) {
      const blob = new Blob([message], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soul-hug-${session.recipientName.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearMessage = () => {
    if (confirm('Are you sure you want to clear the message?')) {
      setMessage('');
      onUpdateMessage('');
    }
  };

  const handleRegenerate = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to regenerate prompts.");
      return;
    }
    
    if (credits < 1) {
      alert("Insufficient credits to regenerate. Create more Soul Hugs to earn credits!");
      return;
    }

    setRegenerating(true);
    try {
      // Deduct credit first
      const success = await deductUserCredits(1);
      if (!success) {
        alert("Failed to deduct credits. Please try again.");
        return;
      }

      // Update local credits display
      setCredits(prev => prev - 1);

      // Call regenerate API with current context
      const ingredients = session.ingredients || [];
      const regenerateRequest = {
        recipientName: session.recipientName,
        anchor: session.anchor,
        ingredients: ingredients,
        occasion: session.occasion,
        tone: session.tone,
        messageLength: selectedLength,
        currentMessage: session.finalMessage || ""
      };

      const response = await fetch('/api/ai/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regenerateRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate message');
      }

      const result = await response.json();
      handleMessageChange(result.message);
      
    } catch (error: any) {
      console.error("Error regenerating prompt:", error);
      alert("Failed to regenerate prompt. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const sendAsMessage = async () => {
    // Check authentication first
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in to send a Soul Hug.");
      return;
    }

    if (message.trim()) {
      // Save text-only Soul Hug to Firestore
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
        onStartOver();
      } catch (error) {
        console.error('Failed to save Soul Hug:', error);
        alert('Soul Hug sent but failed to save. Please try again.');
      }
    } else {
      alert('Please create a message first.');
    }
  };

  const handleContinueToAudio = () => {
    // Save session data to localStorage for the craft page
    localStorage.setItem('creativeFlowSession', JSON.stringify({
      ...session,
      finalMessage: message
    }));
    onContinueToAudio();
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass-morphism rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">
      <div className="text-center mb-8">
        <div className="mb-6">
          <i className="fas fa-pen-fancy text-4xl text-teal-500 mb-4"></i>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            CRAFT YOUR SOUL HUG
          </h1>
        </div>
        <p className="text-slate-600 mt-2 text-lg max-w-2xl mx-auto leading-relaxed">
          Craft your message with heart. You are the director of this process.
        </p>
      </div>

      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Descriptors & Ingredients */}
          <div className="space-y-4">
            {/* Selected Descriptors */}
            {session.descriptors && session.descriptors.length > 0 && (
              <div className="bg-white/90 p-4 rounded-lg border border-slate-200 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-800 flex items-center">
                    <i className="fas fa-tags text-indigo-500 mr-2"></i>
                    Selected Descriptors
                  </h4>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-grab hover:cursor-grabbing active:cursor-grabbing"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', session.descriptors?.join(', ') || '');
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <i className="fas fa-grip-vertical mr-1"></i>Drag to message
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.descriptors.map((descriptor, index) => (
                    <span
                      key={index}
                      className="inline-flex bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-2 rounded-full border border-indigo-200 whitespace-nowrap min-w-fit cursor-grab hover:bg-indigo-200 hover:shadow-sm transition-all active:cursor-grabbing"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', descriptor);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      {descriptor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                <i className="fas fa-puzzle-piece text-teal-500 mr-2"></i>
                Your Ingredients
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {session.ingredients?.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="bg-white/95 p-4 rounded-lg border border-slate-200/50 shadow-sm cursor-grab hover:shadow-md hover:border-teal-300 hover:bg-teal-50/30 transition-all transform hover:scale-[1.02] active:cursor-grabbing"
                    draggable="true"
                    onDragStart={(e) => {
                      const contentToDrag = ingredient.content && ingredient.content.trim() && ingredient.content.trim() !== ingredient.prompt.trim() 
                        ? ingredient.content 
                        : ingredient.prompt;
                      e.dataTransfer.setData('text/plain', contentToDrag);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <p className="text-xs text-slate-500 mb-1 italic font-medium">{ingredient.prompt}</p>
                    {ingredient.content && ingredient.content.trim() && ingredient.content.trim() !== ingredient.prompt.trim() && (
                      <p className="text-sm text-slate-800 leading-relaxed">{ingredient.content}</p>
                    )}
                  </div>
                )) || (
                  <p className="text-slate-500 italic text-sm">No ingredients added yet. Go back to gather some!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Message Editor */}
          <div className="space-y-4">
            <div className="bg-white/90 p-6 rounded-lg border border-slate-200 shadow-sm h-full min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <i className="fas fa-pen text-teal-500 mr-2"></i>
                  Your Soul Hug Message
                </h3>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-500">Current:</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{wordCount} words</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{readTime} min read</span>
                  </div>
                  {selectedLength && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-purple-600">AI Target:</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {selectedLength.replace('sec', 's').replace('min', 'm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <Textarea
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Begin crafting your Soul Hug here... You can drag ingredients from the left, or start typing your heart's message."
                  className="flex-1 min-h-[350px] resize-none border-slate-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg p-4 text-slate-800 leading-relaxed text-base font-serif"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const content = e.dataTransfer.getData('text/plain');
                    if (content) {
                      const textarea = e.target as HTMLTextAreaElement;
                      const cursorPosition = textarea.selectionStart || message.length;
                      const spacing = message.trim() ? '\n\n' : '';
                      const newMessage = message.slice(0, cursorPosition) + spacing + content + spacing + message.slice(cursorPosition);
                      handleMessageChange(newMessage);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).classList.add('border-teal-400', 'bg-teal-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).classList.remove('border-teal-400', 'bg-teal-50');
                  }}
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                  <div className="flex flex-wrap gap-2 items-center">
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
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Weave Message button clicked');
                        onAIWeave(selectedLength);
                      }}
                      disabled={isLoading || !session.ingredients || session.ingredients.length === 0}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-3 py-2 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Weaving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-2"></i>Weave
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('AI Stitch button clicked');
                        onAIStitch(message);
                      }}
                      disabled={isLoading || !message.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium px-3 py-2 rounded-lg shadow hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Polishing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sparkles mr-2"></i>Polish and Refine
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Clear button clicked');
                        clearMessage();
                      }}
                      disabled={!message.trim()}
                      size="sm"
                      variant="outline"
                      className="text-slate-600 border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                      <i className="fas fa-times mr-1"></i>Clear
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Export button clicked');
                        exportMessage();
                      }}
                      disabled={!message.trim()}
                      className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 text-sm transition-colors"
                    >
                      <i className="fas fa-download mr-1"></i>Export
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Copy button clicked');
                        copyMessage();
                      }}
                      disabled={!message.trim()}
                      className="text-teal-600 hover:text-teal-800 font-medium disabled:opacity-50 text-sm transition-colors"
                    >
                      <i className="fas fa-copy mr-1"></i>Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked');
            onBack();
          }}
          variant="secondary"
          className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-700 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Start Over button clicked');
            onStartOver();
          }}
          variant="outline"
          className="border-slate-600 text-slate-600 hover:bg-slate-50 font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          <i className="fas fa-refresh mr-2"></i>Start Over
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Send as Message button clicked');
            sendAsMessage();
          }}
          disabled={!message.trim()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          <i className="fas fa-paper-plane mr-2"></i>Send as Message
        </Button>
        <Button
          onClick={() => {
            console.log('Continue to Craft Soul Hug button clicked');
            if (message.trim()) {
              handleContinueToAudio();
            } else {
              alert('Please create a message before continuing.');
            }
          }}
          disabled={!message.trim()}
          className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-teal-700 hover:to-indigo-700 transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          <i className="fas fa-arrow-right mr-2"></i>Continue to Craft
        </Button>
      </div>
    </div>
  );
}