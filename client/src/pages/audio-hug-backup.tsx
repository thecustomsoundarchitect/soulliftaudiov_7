import React, { useState, useEffect, useRef } from "react"
import StageNavigation from "../components/creative-flow/stage-navigation"
import SoulHugRecorder from "../components/soul-hug-recorder"
import AIVoiceGenerator from "../components/ai-voice-generator"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "../firebaseConfig"
import { QRCodeSVG } from "qrcode.react"

const storage = getStorage(app)

export default function AudioHugPage() {
  const [soulHugMessage, setSoulHugMessage] = useState("")

  useEffect(() => {
    async function loadHug() {
      const msg = localStorage.getItem("currentSoulHug") || ""
      setSoulHugMessage(msg)
    }
    loadHug()
  }, [])

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f3f4f6'}}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress */}
        <StageNavigation currentStage="audio" onStageClick={() => {}} />

        {/* Message Card */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Your Soul Hug Message
          </h1>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {soulHugMessage || "No message found. Please return to Craft."}
          </p>
        </section>

        <div className="space-y-10">
          {/* Recorder */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-3">
              Voice Recording
            </h2>
            <SoulHugRecorder onAudioSaved={() => {}} />
          </section>

          {/* AI Voice */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-3">
              AI Voice Generation
            </h2>
            <AIVoiceGenerator text={soulHugMessage} onVoiceGenerated={() => {}} />
          </section>

          {/* Music Mixer */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              Background Music
            </h2>
            <div className="p-4 bg-blue-100 border border-blue-300 rounded mb-4">
              <p className="text-blue-800">NEW: AudioHugMixer Component Loading...</p>
            </div>
            <AudioHugMixer />
          </section>

          {/* Image Picker */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              Add a Cover Image
            </h2>
            <ImagePicker />
          </section>

          {/* Delivery Options */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              Share Your Hug
            </h2>
            <DeliveryOptions />
          </section>
        </div>
      </div>
    </div>
  )
}

// AudioHugMixer Component
function AudioHugMixer() {
  const mockUser = { tier: "free" } // replace with real auth
  const isPremiumUser = mockUser.tier === "premium"

  const tracks = [
    { id: 'calm-breeze', title: 'Calm Breeze', url: '/music/free1.mp3', isPremium: false },
    { id: 'soothing-rain', title: 'Soothing Rain', url: '/music/free2.mp3', isPremium: false },
    { id: 'premium-dreams', title: 'Premium Dreams', url: '/music/premium1.mp3', isPremium: true },
  ]

  const [selected, setSelected] = useState(tracks[0])
  const [voiceVol, setVoiceVol] = useState(0.8)
  const [musicVol, setMusicVol] = useState(0.3)
  const voiceRef = useRef<HTMLAudioElement>(null)
  const musicRef = useRef<HTMLAudioElement>(null)

  const handlePreview = () => {
    if (selected.isPremium && !isPremiumUser) return
    if (voiceRef.current && musicRef.current) {
      voiceRef.current.currentTime = 0
      musicRef.current.currentTime = 0
      voiceRef.current.volume = voiceVol
      musicRef.current.volume = musicVol
      voiceRef.current.play()
      musicRef.current.play()
    }
  }

  const handleStop = () => {
    voiceRef.current?.pause()
    musicRef.current?.pause()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            disabled={t.isPremium && !isPremiumUser}
            className={`px-4 py-2 rounded-lg border transition-colors 
              ${selected.id === t.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'} 
              ${t.isPremium && !isPremiumUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50'}`}
          >
            {t.title} {t.isPremium && <span className="ml-1 text-sm text-yellow-600">Premium</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <label className="block text-gray-600 mb-1">Voice Volume: {Math.round(voiceVol * 100)}%</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={voiceVol}
            onChange={(e) => setVoiceVol(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-600 mb-1">Music Volume: {Math.round(musicVol * 100)}%</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVol}
            onChange={(e) => setMusicVol(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-x-3">
        <button
          onClick={handlePreview}
          disabled={selected.isPremium && !isPremiumUser}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Preview Mix
        </button>
        <button
          onClick={handleStop}
          className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Stop
        </button>
      </div>

      {/* hidden audio elements */}
      <audio ref={voiceRef} src="/audio/voice.mp3" />
      <audio ref={musicRef} src={selected.url} />
    </div>
  )
}

function ImagePicker() {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    const fileRef = ref(storage, `hug-images/${Date.now()}-${file.name}`)
    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)
    setUploadUrl(url)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Add a Cover Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="block mb-2"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-auto rounded mb-2 border"
        />
      )}
      {uploadUrl && (
        <p>
          Uploaded image: <a href={uploadUrl} target="_blank" className="text-blue-600 underline">{uploadUrl}</a>
        </p>
      )}
    </div>
  )
}

function DeliveryOptions() {
  const [copied, setCopied] = useState(false)
  const hugLink = window.location.href
  const mailto = `mailto:?subject=Your Soul Hug&body=${encodeURIComponent(hugLink)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(hugLink).then(() => setCopied(true))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Share Your Hug</h2>
      <a
        href={mailto}
        className="block px-4 py-2 bg-green-600 text-white rounded text-center"
      >
        Send via Email
      </a>
      <button
        onClick={handleCopy}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <div>
        <h3 className="font-medium mb-1">QR Code</h3>
        <QRCodeSVG value={hugLink} size={128} />
      </div>
    </div>
  )
}

