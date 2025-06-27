import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Volume2 } from "lucide-react";

const mockUser = {
  tier: "free" // change to "premium" to unlock premium tracks
};

const musicList = [
  {
    id: "1",
    title: "Calm Morning",
    url: "/api/music/calm-morning",
    isPremium: false
  },
  {
    id: "2",
    title: "Gentle Waves",
    url: "/api/music/gentle-waves",
    isPremium: false
  },
  {
    id: "3",
    title: "Soft Piano",
    url: "/api/music/soft-piano",
    isPremium: false
  }
];

interface AudioHugMixerProps {
  voiceUrl?: string;
  onMixComplete?: (mixedAudioUrl: string) => void;
}

export default function AudioHugMixer({ voiceUrl, onMixComplete }: AudioHugMixerProps) {
  const [selectedMusic, setSelectedMusic] = useState<typeof musicList[0] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.3);
  
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);

  const isPremiumUser = mockUser.tier === "premium";

  useEffect(() => {
    if (voiceRef.current) {
      voiceRef.current.volume = voiceVolume;
    }
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [voiceVolume, musicVolume]);

  const handlePlayPreview = () => {
    if (!selectedMusic) {
      setErrorMsg("Please select a background track.");
      return;
    }

    if (!voiceUrl) {
      setErrorMsg("No voice recording available.");
      return;
    }

    if (selectedMusic.isPremium && !isPremiumUser) {
      setErrorMsg("Upgrade required to play this premium track.");
      return;
    }

    setErrorMsg("");
    if (voiceRef.current && musicRef.current) {
      voiceRef.current.currentTime = 0;
      musicRef.current.currentTime = 0;
      voiceRef.current.play();
      musicRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (voiceRef.current && musicRef.current) {
      voiceRef.current.pause();
      musicRef.current.pause();
      voiceRef.current.currentTime = 0;
      musicRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (voiceRef.current && musicRef.current) {
      voiceRef.current.pause();
      musicRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMusicSelect = (music: typeof musicList[0]) => {
    if (music.isPremium && !isPremiumUser) {
      setErrorMsg("Upgrade to premium to use this track.");
      return;
    }
    setSelectedMusic(music);
    setErrorMsg("");
  };

  const handleMixAndSave = () => {
    if (!selectedMusic || !voiceUrl) {
      setErrorMsg("Please select music and ensure voice recording is available.");
      return;
    }
    
    // In a real implementation, this would mix the audio files
    // For now, we'll simulate the process
    const mixedUrl = `mixed-audio-${Date.now()}.mp3`;
    onMixComplete?.(mixedUrl);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-semibold mb-4">Audio Mixer</h2>
      
      {/* Background Music Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3">Background Music</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {musicList.map((music) => (
            <div
              key={music.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedMusic?.id === music.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                music.isPremium && !isPremiumUser
                  ? "opacity-50"
                  : ""
              }`}
              onClick={() => handleMusicSelect(music)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{music.title}</span>
                {music.isPremium && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Premium
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volume Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Voice Volume: {Math.round(voiceVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Music Volume: {Math.round(musicVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        <Button onClick={handlePlayPreview} disabled={!selectedMusic || !voiceUrl}>
          <Play className="w-4 h-4 mr-2" />
          Preview Mix
        </Button>
        <Button onClick={handlePause} disabled={!isPlaying} variant="outline">
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
        <Button onClick={stopPlayback} disabled={!isPlaying} variant="outline">
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
      </div>

      {/* Save Mixed Audio */}
      <Button 
        onClick={handleMixAndSave} 
        className="w-full"
        disabled={!selectedMusic || !voiceUrl}
      >
        <Volume2 className="w-4 h-4 mr-2" />
        Save Mixed Audio
      </Button>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Hidden audio elements */}
      {voiceUrl && (
        <audio
          ref={voiceRef}
          src={voiceUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      {selectedMusic && (
        <audio
          ref={musicRef}
          src={selectedMusic.url}
          loop
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}