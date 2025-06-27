// FILE: AudioHugPage.tsx
import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

/* -------------------------------------------------
   Progress Stepper
-------------------------------------------------- */
const ProgressStepper = ({ current }: { current: string }) => {
  const steps = ['Define', 'Gather', 'Craft', 'Audio Hug'];
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex items-center justify-center mb-8">
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
   Voice Recorder (state-of-the-art design)
-------------------------------------------------- */
const SoulHugRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordDuration((d) => d + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const handleRecord = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordDuration(0);
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Audio analysis for visual feedback
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        updateAudioLevel();

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);
          chunks.current = [];
          stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access is required for recording. Please allow microphone access and try again.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Recording Interface */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
        <div className="flex flex-col items-center space-y-6">

          {/* Recording Button with Audio Visualization */}
          <div className="relative">
            {/* Outer pulse rings when recording */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-30" style={{ 
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  transition: 'transform 0.1s ease-out'
                }}></div>
              </>
            )}

            {/* Main button */}
            <button
              onClick={handleRecord}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              {isRecording ? (
                <Square className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          {/* Status and Timer */}
          <div className="text-center space-y-2">
            <div className={`text-lg font-semibold ${isRecording ? 'text-red-600' : 'text-gray-700'}`}>
              {isRecording ? 'Recording in progress...' : 'Ready to record'}
            </div>

            {isRecording && (
              <div className="space-y-2">
                <div className="text-2xl font-mono font-bold text-red-600">
                  {formatTime(recordDuration)}
                </div>

                {/* Audio level indicator */}
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-100 ${
                        audioLevel * 10 > i 
                          ? 'bg-red-500 h-8' 
                          : 'bg-gray-300 h-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isRecording && !recordedAudio && (
              <p className="text-gray-500 max-w-sm mx-auto">
                Tap the microphone to start recording your heartfelt message. Speak naturally and let your emotions flow.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recorded Audio Player */}
      {recordedAudio && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-semibold text-gray-800">Recording Complete</span>
          </div>

          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={recordedAudio}
              controls
              className="w-full h-12 rounded-lg"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setRecordedAudio(null)}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Record Again
                </button>
              </div>

              <a
                href={recordedAudio}
                download="soulhug-recording.webm"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   AI Voice Generator (with Nova auto-preview)
-------------------------------------------------- */
interface VoiceMeta {
  id: string;
  name: string;
  premium: boolean;
}

const AIVoiceGenerator = ({ text }: { text: string }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isPremium] = useState(false); // set true for paid users later
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const voices: VoiceMeta[] = [
    { id: 'nova', name: 'Nova (Free)', premium: false },
    { id: 'shimmer', name: 'Shimmer', premium: true },
    { id: 'echo', name: 'Echo', premium: true },
    { id: 'sage', name: 'Sage', premium: true },
    { id: 'radiant', name: 'Radiant', premium: true },
    { id: 'gentle', name: 'Gentle', premium: true },
  ];

  // Generate first ten non-empty lines for preview
  const previewSnippet = React.useMemo(() => {
    const lines = text.split('\n').filter((l) => l.trim());
    return lines.slice(0, 10).join(' ');
  }, [text]);

  // Fetch and play or replay preview
  const playPreview = async (voiceId: string) => {
    try {
      let url = previewUrls[voiceId];
      if (!url) {
        const res = await fetch('/api/generate-tts?preview=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: previewSnippet, voice: voiceId }),
        });
        if (!res.ok) throw new Error('Preview fetch failed');
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        setPreviewUrls((prev) => ({ ...prev, [voiceId]: url }));
      }
      const audio = new Audio(url);
      setPlayingPreview(voiceId);
      audio.play();
      audio.onended = () => setPlayingPreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });
      if (!res.ok) throw new Error('TTS generation failed');
      const blob = await res.blob();
      setGeneratedAudio(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert('Failed to generate voice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {voices.map((voice) => {
          const isLocked = voice.premium && !isPremium;
          const isSelected = selectedVoice === voice.id;
          const isCurrentlyPlaying = playingPreview === voice.id;

          return (
            <div
              key={voice.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-lg ${
                isSelected
                  ? 'bg-purple-100 border-purple-400 shadow-md'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isLocked) return;
                setSelectedVoice(voice.id);
                if (voice.id === 'nova') playPreview('nova'); // auto-preview for Nova
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
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLocked) playPreview(voice.id);
                  }}
                  disabled={isLocked}
                >
                  {playingPreview === voice.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                {isSelected && (
                  <span className="text-sm text-purple-700 font-semibold animate-pulse">Selected</span>
                )}
              </div>

              {isLocked && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-xs text-gray-600 font-medium">Upgrade Required</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Generate Your AI Voice</h3>
            <p className="text-sm text-gray-600">Selected: {voices.find(v => v.id === selectedVoice)?.name}</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            isGenerating 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Voice...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Generate AI Voice</span>
            </>
          )}
        </button>
      </div>

      {generatedAudio && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Voice Generated Successfully!</h3>
              <p className="text-sm text-green-600">Your Soul Hug is ready to be heard</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">AI Voice Recording</span>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Voice: {voices.find(v => v.id === selectedVoice)?.name} • Duration: ~{Math.ceil(text.split(' ').length / 150)} min
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   Audio Hug Mixer (enhanced design)
-------------------------------------------------- */
const AudioHugMixer = () => {
  const [selectedTrack, setSelectedTrack] = useState('calm-breeze');
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const tracks = [
    { id: 'calm-breeze', title: 'Calm Breeze', description: 'Gentle wind and nature sounds', isPremium: false },
    { id: 'soothing-rain', title: 'Soothing Rain', description: 'Light rainfall ambience', isPremium: false },
    { id: 'premium-dreams', title: 'Premium Dreams', description: 'Ethereal dreamscape', isPremium: true },
    { id: 'ocean-waves', title: 'Ocean Waves', description: 'Peaceful seaside atmosphere', isPremium: true },
    { id: 'forest-peace', title: 'Forest Peace', description: 'Woodland tranquility', isPremium: true },
    { id: 'meditation-bells', title: 'Meditation Bells', description: 'Soft chimes and harmony', isPremium: true },
  ];

  const handlePreview = () => setIsPlaying((p) => !p);

  return (
    <div className="space-y-6">
      {/* Track Selection */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Choose Background Music</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md ${
                selectedTrack === track.id
                  ? 'bg-indigo-50 border-indigo-300 shadow-md'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{track.title}</span>
                {track.isPremium && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{track.description}</p>
              {selectedTrack === track.id && (
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  <span className="text-xs text-indigo-600 font-medium">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Controls */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h4 className="font-semibold text-gray-800 mb-4">Audio Balance</h4>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <Volume2 className="w-4 h-4 mr-2" />
                Voice
              </label>
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                {voiceVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${voiceVolume}%, #e5e7eb ${voiceVolume}%, #e5e7eb 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-gray-700 font-medium">
                <Music className="w-4 h-4 mr-2" />
                Background Music
              </label>
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                {musicVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${musicVolume}%, #e5e7eb ${musicVolume}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePreview}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? 'Stop Preview' : 'Preview Mix'}</span>
        </button>

        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl">
          <Download className="w-5 h-5" />
          <span>Export Audio</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   Image Picker (enhanced design)
-------------------------------------------------- */
const ImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const presetImages = [
    { id: 'sunset', title: 'Peaceful Sunset', description: 'Warm, calming sunset', color: 'from-orange-200 to-pink-300' },
    { id: 'flowers', title: 'Gentle Flowers', description: 'Soft floral beauty', color: 'from-pink-200 to-purple-300' },
    { id: 'mountains', title: 'Serene Mountains', description: 'Majestic peaks', color: 'from-blue-200 to-gray-300' },
    { id: 'ocean', title: 'Calming Ocean', description: 'Tranquil waters', color: 'from-blue-300 to-teal-300' },
    { id: 'forest', title: 'Peaceful Forest', description: 'Nature\'s embrace', color: 'from-green-200 to-emerald-300' },
    { id: 'starry-night', title: 'Starry Night', description: 'Celestial wonder', color: 'from-indigo-400 to-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Choose Cover Image</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {presetImages.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image.id)}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                selectedImage === image.id 
                  ? 'border-purple-400 shadow-md ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className={`w-full h-28 bg-gradient-to-br ${image.color} flex items-center justify-center relative overflow-hidden`}>
                <Image className="w-8 h-8 text-white opacity-80 z-10" />
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>

                {/* Selection indicator */}
                {selectedImage === image.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white text-left">
                <div className="font-medium text-gray-800 text-sm">{image.title}</div>
                <div className="text-xs text-gray-500">{image.description}</div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-purple-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-100 transition-colors">
            <Image className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
          </div>
          <div>
            <p className="text-gray-600 font-medium">Upload Custom Image</p>
            <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Image className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-800">Cover image selected!</p>
              <p className="text-sm text-purple-600">
                {presetImages.find(img => img.id === selectedImage)?.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   Delivery Options (enhanced design)
-------------------------------------------------- */
const DeliveryOptions = () => {
  const [shareUrl, setShareUrl] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  const generateShareUrl = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    setShareUrl(`https://soullift.app/hug/${randomId}`);
  };

  const generateQrCode = () => {
    setQrGenerated(true);
    // In a real app, this would generate an actual QR code
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Sharing Options */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Share Your Soul Hug</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generateShareUrl}
            className="group flex items-center justify-center space-x-3 p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Generate Share Link</div>
              <div className="text-sm text-gray-500">Create a shareable URL</div>
            </div>
          </button>

          <button
            onClick={generateQrCode}
            className="group flex items-center justify-center space-x-3 p-6 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <QrCode className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Create QR Code</div>
              <div className="text-sm text-gray-500">Easy phone sharing</div>
            </div>
          </button>
        </div>
      </div>

      {/* Generated Share URL */}
      {shareUrl && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Share2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Share URL Generated</h4>
              <p className="text-sm text-blue-600">Anyone with this link can experience your Soul Hug</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="flex-1 p-3 bg-white border border-blue-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Generated QR Code */}
      {qrGenerated && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <QrCode className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">QR Code Ready</h4>
              <p className="text-sm text-green-600">Perfect for in-person sharing</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-40 h-40 bg-white rounded-lg border-2 border-green-200 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">QR Code Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Send Button */}
      <div className="border-t pt-6">
        <button className="w-full py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl font-semibold text-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
          <div className="flex items-center justify-center space-x-3">
            <Headphones className="w-6 h-6" />
            <span>Send Your Soul Hug</span>
            <div className="text-lg">💜</div>
          </div>
        </button>

        <p className="text-center text-gray-500 text-sm mt-3">
          Your heartfelt message will be delivered with love
        </p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ProgressStepper current="Audio Hug" />

        {/* Message Card */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">
            Your Soul Hug Message
          </h1>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed font-medium">{soulHugMessage}</p>
          </div>
        </section>

        <div className="space-y-8">
          {/* Voice Recording */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Voice Recording</h2>
                <p className="text-gray-600">Record your message in your own voice to add a personal touch</p>
              </div>
            </div>
            <SoulHugRecorder />
          </section>

          {/* AI Voice Generation */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI Voice Generation</h2>
                <p className="text-gray-600">Let AI narrate your message with natural, expressive voices</p>
              </div>
            </div>
            <AIVoiceGenerator text={soulHugMessage} />
          </section>

          {/* Background Music */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Background Music</h2>
                <p className="text-gray-600">Add ambient music to enhance the emotional impact</p>
              </div>
            </div>
            <AudioHugMixer />
          </section>

          {/* Cover Image */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Cover Image</h2>
                <p className="text-gray-600">Choose a beautiful image to accompany your Soul Hug</p>
              </div>
            </div>
            <ImagePicker />
          </section>

          {/* Share Your Hug */}
          <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Share Your Hug</h2>
                <p className="text-gray-600">Send your Soul Hug to the world and spread love</p>
              </div>
            </div>
            <DeliveryOptions />
          </section>
        </div>
      </div>
    </div>
  );
}