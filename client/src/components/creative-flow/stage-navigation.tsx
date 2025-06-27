interface StageNavigationProps {
  currentStage: 'intention' | 'reflection' | 'expression' | 'audio';
  onStageClick: (stage: 'intention' | 'reflection' | 'expression' | 'audio') => void;
}

export default function StageNavigation({ currentStage, onStageClick }: StageNavigationProps) {
  const stages = [
    { id: 'intention', name: 'DEFINE' },
    { id: 'reflection', name: 'GATHER' },
    { id: 'expression', name: 'CRAFT' },
    { id: 'audio', name: 'AUDIO HUG' }
  ] as const;

  const getStageStatus = (stageId: string) => {
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    const stageIndex = stages.findIndex(s => s.id === stageId);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="glass-morphism rounded-full px-8 py-4 flex items-center space-x-6">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          
          return (
            <div key={stage.id} className="flex items-center space-x-4">
              <div 
                className={`flex items-center space-x-3 cursor-pointer transition-all duration-300 ${
                  status === 'upcoming' ? 'opacity-50' : ''
                }`}
                onClick={() => status !== 'upcoming' && onStageClick(stage.id)}
              >
                <div className={`w-4 h-4 rounded-full ${
                  status === 'completed' ? 'bg-green-500' :
                  status === 'current' ? 'bg-indigo-500' :
                  'bg-slate-300'
                }`}></div>
                <span className={`text-lg font-bold ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current' ? 'text-slate-700' :
                  'text-slate-500'
                }`}>
                  {stage.name}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className="w-px h-6 bg-slate-300"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
