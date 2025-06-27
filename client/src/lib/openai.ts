import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function generateTTS(text: string, voice: "nova" | "shimmer" | "echo") {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice,
    input: text
  })

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  return url
}