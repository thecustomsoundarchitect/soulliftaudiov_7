import { useState, useEffect } from 'react';
import { getUserCredits } from '@/services/creditService';
import { useAuth } from '@/hooks/useAuth';

interface CreditDisplayProps {
  className?: string;
  showLabel?: boolean;
}

export default function CreditDisplay({ className = "", showLabel = true }: CreditDisplayProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        const userCredits = await getUserCredits();
        setCredits(userCredits);
      } else {
        setCredits(0);
      }
      setLoading(false);
    };

    fetchCredits();
    
    // Refresh credits every 30 seconds when user is active
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || loading) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-300">Credits:</span>
      )}
      <div className="flex items-center gap-1">
        <span className="text-lg font-semibold text-white">{credits}</span>
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>
    </div>
  );
}