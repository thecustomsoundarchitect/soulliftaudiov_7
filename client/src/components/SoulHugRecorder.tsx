// src/components/SoulHugRecorder.tsx
import { useState, useRef } from "react"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../lib/firebase"

export default function SoulHugRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunks.current = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })
      const audioFile = new File([audioBlob], `soulhug-${Date.now()}.webm`)

      const audioRef = ref(storage, `recordings/${audioFile.name}`)
      await uploadBytes(audioRef, audioFile)

      const downloadURL = await getDownloadURL(audioRef)
      setAudioUrl(downloadURL)
    }

    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="bg-blue-50 p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">Voice Recording</h3>

      {!recording ? (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={startRecording}
        >
          Start Recording
        </button>
      ) : (
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={stopRecording}
        >
          Stop Recording
        </button>
      )}

      {audioUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-2">Recording saved</p>
          <audio controls src={audioUrl} className="w-full" />
          <p className="text-xs break-all mt-2 text-gray-500">{audioUrl}</p>
        </div>
      )}
    </div>
  )
}