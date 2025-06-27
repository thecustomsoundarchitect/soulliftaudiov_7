import React, { useState, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Download, RotateCcw, Upload } from "lucide-react";
import { app } from "@/lib/firebase";

const storage = getStorage(app);

interface SoulHugRecorderProps {
  onAudioSaved: (url: string) => void;
  disabled?: boolean;
}

export default function SoulHugRecorder({ onAudioSaved, disabled = false }: SoulHugRecorderProps) {
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSave = async (blob: Blob) => {
    if (disabled) return;
    
    setUploading(true);
    try {
      const fileName = `soul-hugs/recordings/${Date.now()}.webm`;
      const fileRef = ref(storage, fileName);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      setSavedUrl(url);
      onAudioSaved(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to save recording. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-900 dark:text-blue-100">
          <Mic className="w-5 h-5 text-blue-600" />
          Voice Recording
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
          Add your personal touch with your own voice
        </p>
      </div>
      <ReactMediaRecorder
        audio
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div className="space-y-4">
            
            {/* Recording Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === "recording" ? "bg-red-400 animate-pulse" : 
                status === "stopped" ? "bg-green-400" : "bg-gray-400"
              }`} />
              <span className="text-sm text-blue-700 dark:text-blue-300 capitalize">
                {status === "recording" ? "Recording..." : 
                 status === "stopped" ? "Ready" : 
                 status}
              </span>
            </div>

              {/* Recording Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={startRecording}
                  disabled={disabled || status === "recording"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {status === "recording" ? "Recording..." : "Record"}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  disabled={disabled || status !== "recording"}
                  variant="outline"
                  className="border-blue-400 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>

              {/* Playback and Save */}
              {mediaBlobUrl && (
                <div className="space-y-3 p-4 bg-pink-700/30 rounded-lg border border-pink-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-pink-200">Preview Recording:</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={togglePlayback}
                        size="sm"
                        variant="outline"
                        className="border-pink-400 text-pink-400 hover:bg-pink-600/20"
                      >
                        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={startRecording}
                        size="sm"
                        variant="outline"
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-600/20"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src={mediaBlobUrl}
                    onEnded={() => setPlaying(false)}
                    className="w-full"
                  />
                  
                  <Button
                    onClick={async () => {
                      const blob = await fetch(mediaBlobUrl).then(r => r.blob());
                      handleSave(blob);
                    }}
                    disabled={disabled || uploading}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Save Recording
                      </>
                    )}
                  </Button>
                </div>
              )}
          </div>
          )}
        />

        {/* Saved Recording */}
        {savedUrl && (
          <div className="p-4 bg-green-700/30 rounded-lg border border-green-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-200">Saved Recording:</span>
              <Button
                size="sm"
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-600/20"
                onClick={() => window.open(savedUrl, '_blank')}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
            <audio src={savedUrl} controls className="w-full" />
          </div>
        )}

      {/* Recording Tips */}
      <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/20 p-3 rounded">
        Tips: Find a quiet space, speak clearly, and keep your message heartfelt and personal
      </div>
    </div>
  );
}