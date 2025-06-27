import { Button } from "@/components/ui/button";
import type { CreativeFlowSession } from "@shared/schema";
import { Lightbulb, Layers, Heart, Plus } from "lucide-react";

interface PaletteStageProps {
  session: CreativeFlowSession;
  onOpenModal: (promptText: string) => void;
  onRemoveIngredient: (ingredientId: number) => void;
  onUpdateDescriptors: (descriptors: string[]) => void;
  onAddIngredient: (ingredient: { prompt: string; content: string }) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PaletteStage({ 
  session, 
  onOpenModal, 
  onRemoveIngredient, 
  onUpdateDescriptors,
  onAddIngredient,
  onBack, 
  onContinue 
}: PaletteStageProps) {
  const aiPrompts = session.aiGeneratedPrompts || [];
  const ingredients = session.ingredients || [];
  const descriptors = session.descriptors || [];

  return (
    <div className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent mb-4">
          Gather Your Ingredients
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Click to write a story • Drag to add as ingredient
        </p>
      </div>
      
      <div className="space-y-12">

        {/* AI Generated Prompts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-3">
            <Lightbulb className="w-6 h-6 text-purple-500" />
            Story Prompts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiPrompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => onOpenModal(prompt.text)}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', prompt.text);
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'prompt',
                    prompt: prompt.text,
                    content: ''
                  }));
                }}
                className="group bg-white/90 hover:bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">{prompt.text}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to write • Drag to add
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ingredients Collection */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-500" />
              Your Ingredients
            </h2>
            <div 
              className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 min-h-80 transition-colors"
              onDrop={(e) => {
                e.preventDefault();
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData) {
                  try {
                    const data = JSON.parse(jsonData);
                    if (data.type === 'prompt') {
                      onAddIngredient({
                        prompt: data.prompt,
                        content: data.content
                      });
                    }
                  } catch (error) {
                    console.error('Error parsing dropped data:', error);
                  }
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
              }}
            >
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {ingredients.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Your stories will appear here</p>
                    <p className="text-slate-400 text-sm">Drag prompts or write your own stories</p>
                  </div>
                ) : (
                  ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 mb-2">{ingredient.prompt}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{ingredient.content}</p>
                        </div>
                        <button
                          className="text-red-400 hover:text-red-600 ml-4 p-1"
                          onClick={() => onRemoveIngredient(ingredient.id)}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {descriptors.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-2">Selected descriptors</h4>
                        <div className="flex flex-wrap gap-2">
                          {descriptors.map((descriptor, index) => (
                            <span
                              key={index}
                              className="inline-flex px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {descriptor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">
                  {ingredients.length + (descriptors.length > 0 ? 1 : 0)} ingredients collected
                </span>
              </div>
            </div>
          </div>

          {/* Descriptors */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-500" />
              Descriptors
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 min-h-80">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Smart', 'Caring', 'Loyal', 'Funny',
                  'Patient', 'Brave', 'Creative', 'Thoughtful',
                  'Strong', 'Loving', 'Honest', 'Supportive',
                  'Kind', 'Wise', 'Generous', 'Inspiring',
                  'Reliable', 'Adventurous', 'Compassionate', 'Witty',
                  'Determined', 'Gentle', 'Optimistic', 'Genuine',
                  'Resilient', 'Playful'
                ].map((descriptor) => {
                  const isSelected = descriptors.includes(descriptor);
                  return (
                    <button
                      key={descriptor}
                      onClick={() => {
                        const newDescriptors = isSelected
                          ? descriptors.filter(d => d !== descriptor)
                          : [...descriptors, descriptor];
                        onUpdateDescriptors(newDescriptors);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {descriptor}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8 py-3 text-slate-600 border-slate-300 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={ingredients.length === 0}
          className="px-12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          Continue to Craft
        </Button>
      </div>
    </div>
  );
}