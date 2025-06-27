import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  Mic,
  Download,
  QrCode,
  Share2,
  Volume2,
  Music,
  Image,
  Headphones,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Link } from "wouter";

/* -------------------------------------------------
   Progress Stepper
-------------------------------------------------- */
const ProgressStepper = ({ current }: { current: string }) => {
  const steps = ['Define', 'Gather', 'Craft', 'Audio Hug'];
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex items-center justify-center mb-8" id="progress-stepper">
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const isActive = step === current;
            const isCompleted = index < currentIndex;

            return (
              <div key={step} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-2 transition-colors duration-300 ${
                      isActive
                        ? 'bg-purple-500'
                        : isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {step.toUpperCase()}
                  </span>
                </div>
                {index < steps.length - 1 && <div className="w-6 h-px bg-gray-300 ml-4" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   Voice Recorder (enhanced)
-------------------------------------------------- */
const SoulHugRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Effect to manage recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordDuration((d) => d + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Cleanup function for the timer
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle start/stop recording
  const handleRecord = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordDuration(0); // Reset duration on stop
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);
          chunks.current = []; // Clear chunks for next recording
          // Stop all tracks in the stream to release microphone
          stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordedAudio(null); // Clear previous recording when starting a new one
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access denied. Please allow microphone access to record your voice.');
      }
    }
  };

  // Handle playback of recorded audio
  const handlePlayback = () => {
    if (!audioRef.current || !recordedAudio) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Listen for audio ended event to reset playing state
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [recordedAudio]);


  return (
    <div id="voice-recorder" className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-inner border border-gray-100 relative">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border-4 ${
            isRecording ? 'border-red-500 animate-pulse-border' : 'border-purple-300'
          } transition-all duration-300`}
        ></div>
        <button
          onClick={handleRecord}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 scale-105'
              : 'bg-purple-500 hover:bg-purple-600'
          } shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-75`}
        >
          {isRecording ? (
            <Square className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      <p className={`mt-4 text-lg font-semibold ${isRecording ? 'text-red-600' : 'text-gray-700'}`}>
        {isRecording ? `Recording: ${recordDuration}s` : 'Tap to Record Your Voice'}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        {isRecording ? 'Click again to stop recording.' : 'Capture your authentic message.'}
      </p>

      {recordedAudio && (
        <div className="w-full max-w-md bg-purple-50 rounded-xl p-4 shadow-md flex flex-col items-center space-y-3 mt-4">
          <audio
            ref={audioRef}
            src={recordedAudio}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden" // Hide default controls
          />
          <div className="flex items-center space-x-4 w-full">
            <button
              onClick={handlePlayback}
              className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div className="flex-1 bg-purple-200 rounded-full h-2 overflow-hidden">
                {/* Visualizer placeholder could go here */}
                <div className="h-full bg-purple-400 animate-pulse" style={{width: isPlaying ? '100%' : '0%'}}></div>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-3">
            <a
              href={recordedAudio}
              download="soulhug-recording.webm"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors font-medium"
              title="Download Recorded Audio"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes pulse-border {
          0% { border-color: #ef4444; transform: scale(1); }
          50% { border-color: #dc2626; transform: scale(1.05); }
          100% { border-color: #ef4444; transform: scale(1); }
        }
        .animate-pulse-border {
          animation: pulse-border 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

/* -------------------------------------------------
   AI Voice Generator (fixed preview looping)
-------------------------------------------------- */
interface VoiceMeta { id: string; name: string; premium: boolean; }
const AIVoiceGenerator = ({ text }: { text: string }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isPremium] = useState(false); // Assuming this comes from user's subscription status
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const previewAudioRef = useRef<Record<string, HTMLAudioElement>>({});

  const voices: VoiceMeta[] = [
    { id: 'nova', name: 'Nova (Free)', premium: false },
    { id: 'shimmer', name: 'Shimmer', premium: true },
    { id: 'echo', name: 'Echo', premium: true },
    { id: 'sage', name: 'Sage', premium: true },
    { id: 'radiant', name: 'Radiant', premium: true },
    { id: 'gentle', name: 'Gentle', premium: true },
  ];

  // Extract the first 10 words for the preview snippet
  const previewSnippet = useMemo(() => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.slice(0, 10).join(' ');
  }, [text]);

  // Function to play or pause preview audio
  const playPreview = async (voiceId: string) => {
    // If another preview is playing, stop it first
    if (playingPreview && playingPreview !== voiceId) {
      previewAudioRef.current[playingPreview]?.pause();
      previewAudioRef.current[playingPreview] = null; // Clear old audio object
      setPlayingPreview(null);
    }

    if (previewAudioRef.current[voiceId]) {
      const audio = previewAudioRef.current[voiceId];
      if (playingPreview === voiceId) {
        audio.pause();
        setPlayingPreview(null);
      } else {
        audio.play();
        setPlayingPreview(voiceId);
      }
      return;
    }

    // If audio not loaded, fetch and play
    try {
      const res = await fetch('/api/generate-tts?preview=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewSnippet, voice: voiceId }),
      });
      if (!res.ok) throw new Error('Preview fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Store audio reference and set up event listener
      previewAudioRef.current[voiceId] = audio;
      audio.onended = () => {
        setPlayingPreview(null);
      };

      audio.play();
      setPlayingPreview(voiceId);

    } catch (err) {
      console.error('Error playing preview:', err);
      alert('Failed to play preview. Please try again or check your API setup.');
    }
  };

  // Function to generate the full AI voice audio
  const handleGenerate = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate audio.');
      return;
    }
    if (isGenerating) return; // Prevent multiple clicks while generating

    setIsGenerating(true);
    setGeneratedAudio(null); // Clear previous generated audio

    try {
      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'TTS generation failed');
      }
      const blob = await res.blob();
      setGeneratedAudio(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error('Error generating voice:', err);
      alert(`Failed to generate voice: ${err.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clean up object URLs when component unmounts or text changes
  useEffect(() => {
    return () => {
      Object.values(previewAudioRef.current).forEach(audio => {
        audio.pause(); // Stop any playing audio
      });
      Object.values(previewAudioRef.current).forEach(audio => {
        if (audio.src) {
            URL.revokeObjectURL(audio.src);
        }
      });
      if (generatedAudio) {
        URL.revokeObjectURL(generatedAudio);
      }
    };
  }, [text, generatedAudio]); // Re-run cleanup if text or generatedAudio changes


  return (
    <div id="ai-voice-generator" className="space-y-6 relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {voices.map((voice) => {
          const isLocked = voice.premium && !isPremium;
          const isSelected = selectedVoice === voice.id;
          return (
            <div
              key={voice.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md ${
                isSelected
                  ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300' // Added ring for better selection indication
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isLocked) return;
                setSelectedVoice(voice.id);
                // Automatically play preview when selected, or if already selected, toggle pause.
                playPreview(voice.id); 
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">{voice.name}</h4>
                {voice.premium && (
                  <span className="text-xs text-yellow-600 group-hover:underline">
                    {isLocked ? '🔒 Premium' : 'Premium'}
                  </span>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button
                  className="text-purple-600 hover:text-purple-800 transition-colors p-1 rounded-full hover:bg-purple-100" // Added padding and background for click target
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card selection when clicking play button
                    if (!isLocked) playPreview(voice.id);
                  }}
                  disabled={isLocked}
                >
                  {playingPreview === voice.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                {isSelected && <span className="text-sm text-purple-700 font-semibold animate-pulse">Selected</span>}
              </div>

              {isLocked && (
                <div className="absolute inset-0 bg-white bg-opacity-70 rounded-xl flex items-center justify-center text-center text-xs text-gray-600 font-medium p-4">
                  Upgrade to use this voice
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !text.trim()} // Disable if text is empty or only whitespace
        className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2 text-lg shadow-md hover:shadow-lg transition-all"
      >
        <Volume2 className="w-5 h-5" />
        <span>{isGenerating ? 'Generating Voice...' : 'Generate AI Voice'}</span>
      </button>

      {generatedAudio && (
        <div className="bg-green-50 rounded-lg p-4 mt-4 border border-green-200 shadow-sm">
          <span className="text-green-700 font-medium block mb-3">AI voice ready!</span>
          <audio src={generatedAudio} controls className="w-full" />
          <div className="flex justify-center mt-3">
            <a
              href={generatedAudio}
              download="soulhug-ai-voice.mp3" // Suggest a common audio format for download
              className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors font-medium"
              title="Download AI Generated Audio"
            >
              <Download className="w-5 h-5" />
              <span>Download AI Voice</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   Audio Hug Mixer
-------------------------------------------------- */
const AudioHugMixer = () => {
  const [selectedTrack, setSelectedTrack] = useState('calm-breeze');
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const tracks = [
    { id: 'calm-breeze', title: 'Calm Breeze', isPremium: false },
    { id: 'soothing-rain', title: 'Soothing Rain', isPremium: false },
    { id: 'premium-dreams', title: 'Premium Dreams', isPremium: true },
    { id: 'ocean-waves', title: 'Ocean Waves', isPremium: true },
  ];

  const handlePreview = () => setIsPlaying((p) => !p);

  return (
    <div id="audio-mixer" className="space-y-6 relative">
      <div className="grid grid-cols-2 gap-3">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setSelectedTrack(track.id)}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              selectedTrack === track.id
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{track.title}</span>
              {track.isPremium && <span className="text-xs text-yellow-600">Premium</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-2">Voice Volume: {voiceVolume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500" // Added accent color
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2">Music Volume: {musicVolume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" // Added accent color
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handlePreview}
          className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Stop Preview' : 'Preview Mix'}</span>
        </button>
        <button className="flex items-center space-x-2 px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors shadow">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   Image Picker
-------------------------------------------------- */
const ImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const presetImages = [
    { id: 'sunset', title: 'Peaceful Sunset', url: '/api/placeholder/150/150' },
    { id: 'flowers', title: 'Gentle Flowers', url: '/api/placeholder/150/150' },
    { id: 'mountains', title: 'Serene Mountains', url: '/api/placeholder/150/150' },
    { id: 'ocean', title: 'Calming Ocean', url: '/api/placeholder/150/150' },
  ];

  return (
    <div id="image-picker" className="space-y-4 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presetImages.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image.id)}
            className={`relative rounded-lg overflow-hidden border-2 transition-colors transform hover:scale-105 ${
              selectedImage === image.id ? 'border-purple-400 ring-2 ring-purple-300' : 'border-gray-200'
            } shadow-sm hover:shadow-md`}
          >
            {/* Using a real placeholder image service for better visual */}
            <img src={`https://via.placeholder.com/150?text=${image.title.replace(/\s/g, '+')}`} alt={image.title} className="w-full h-24 object-cover" />
            <div className="p-2 text-xs font-medium text-center text-gray-700">{image.title}</div>
            {selectedImage === image.id && (
              <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Upload Custom Image</span>
      </button>

      {selectedImage && (
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
          <span className="text-purple-700 font-medium">Cover image selected!</span>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   Delivery Options
-------------------------------------------------- */
const DeliveryOptions = () => {
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateShareUrl = () => {
    setShareUrl('https://soullift.app/hug/abc123def456');
    setCopySuccess(false); // Reset copy success state
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy URL. Please copy manually.');
    }
  };

  return (
    <div id="delivery-options" className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={generateShareUrl}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
        >
          <Share2 className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-800">Generate Share Link</span>
        </button>

        <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
          <QrCode className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-800">Create QR Code</span>
        </button>
      </div>

      {shareUrl && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <label className="block text-blue-700 font-medium mb-2">Share URL:</label>
          <div className="flex space-x-2">
            <input type="text" value={shareUrl} readOnly className="flex-1 p-2 bg-white border border-blue-300 rounded text-sm font-mono focus:ring-blue-400 focus:border-blue-400" />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors relative"
            >
              {copySuccess ? (
                <span className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </span>
              ) : (
                <span>Copy</span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="border-t pt-6 mt-6"> {/* Increased padding and margin for separation */}
        <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
          Send Your Soul Hug
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   Main Component
-------------------------------------------------- */
export default function AudioHugPage() {
  const soulHugMessage = `Dear Sarah,

I've been thinking about you today and wanted to reach out with a message from my heart to yours. Your kindness has been such a light in my life, and I wanted you to know how deeply appreciated you are.

The way you listen with such genuine care, how you always seem to know exactly what to say when someone is struggling, and your ability to make anyone feel welcomed and valued - these are gifts that touch everyone around you.

You deserve all the love and happiness in the world, and I hope this message serves as a gentle reminder of how wonderful you are.

With love and gratitude`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 font-sans"> {/* Added font-sans */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ProgressStepper current="Audio Hug" />

        {/* Message Card */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10 border border-gray-100 relative"> {/* Added border */}
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 drop-shadow-sm"> {/* Increased font weight, added drop-shadow */}
            Your Soul Hug Message
          </h1>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-inner"> {/* Added shadow-inner */}
            <p className="text-gray-700 whitespace-pre-line leading-relaxed font-medium text-lg">{soulHugMessage}</p> {/* Increased text size */}
          </div>
        </section>

        <div className="space-y-10"> {/* Increased space between sections */}
          {/* Voice Recording */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Mic className="w-7 h-7 text-purple-600" /> {/* Increased icon size */}
              <h2 className="text-3xl font-bold text-gray-800">Voice Recording</h2> {/* Increased heading size */}
            </div>
            <p className="text-gray-600 mb-6 text-lg">Record your message in your own voice to add a personal touch and authentic emotion.</p> {/* Enhanced description */}
            <SoulHugRecorder />
          </section>

          {/* AI Voice Generation */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="w-7 h-7 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">AI Voice Generation</h2>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Let AI narrate your message with natural, expressive voices. Preview options available!</p>
            <AIVoiceGenerator text={soulHugMessage} />
          </section>

          {/* Background Music */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Music className="w-7 h-7 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Background Music</h2>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Add ambient music to enhance the emotional impact and set the perfect mood.</p>
            <AudioHugMixer />
          </section>

          {/* Cover Image */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Image className="w-7 h-7 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Cover Image</h2>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Choose a beautiful image to accompany your Soul Hug, making it visually appealing.</p>
            <ImagePicker />
          </section>

          {/* Share Your Hug */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Share2 className="w-7 h-7 text-pink-600" />
              <h2 className="text-3xl font-bold text-gray-800">Share Your Hug</h2>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Send your Soul Hug to your loved ones easily via a shareable link or QR code.</p>
            <DeliveryOptions />
          </section>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/craft-soul-hug" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Link href="/my-hugs" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            Next <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}