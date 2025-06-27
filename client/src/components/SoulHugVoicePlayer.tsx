import { useState } from "react"
import { generateTTS } from "../lib/openai"

function SoulHugVoicePlayer({ text }: { text: string }) {
  const [audioUrl, setAudioUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<"nova" | "shimmer" | "echo">("nova")

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const url = await generateTTS(text, selectedVoice)
      setAudioUrl(url)
    } catch (error) {
      console.error("Error generating TTS:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-50 p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">AI Voice Generation</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Voice:</label>
        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value as "nova" | "shimmer" | "echo")}
          className="border rounded px-3 py-2 mr-3"
        >
          <option value="nova">Nova (Warm & Clear)</option>
          <option value="shimmer">Shimmer (Gentle & Soft)</option>
          <option value="echo">Echo (Professional)</option>
        </select>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading || !text}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate AI Voice"}
      </button>

      {audioUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-2">AI voice ready!</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}

export default SoulHugVoicePlayer