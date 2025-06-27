import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCreativeFlowSessionSchema, updateCreativeFlowSessionSchema } from "@shared/schema";
import { generatePersonalizedPrompts, aiWeaveMessage, aiStitchMessage } from "./services/openai";
import { regeneratePrompt } from "./services/regenerate";
import path from "path";
import fs from "fs";

import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new creative flow session
  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertCreativeFlowSessionSchema.parse({
        ...req.body,
        sessionId: randomUUID(),
      });
      
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(400).json({ 
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // List all sessions (for debugging)
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = Array.from((storage as any).sessions.entries() as Iterable<[string, any]>).map(([id, session]) => ({ id, session }));
      res.json({ sessions, count: sessions.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to list sessions" });
    }
  });

  // Get session by ID
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        console.log(`Session ${sessionId} not found. Creating new session...`);
        // Try to create a minimal session if it doesn't exist
        const newSession = await storage.createSession({
          sessionId,
          recipientName: 'Unknown',
          anchor: 'GRATEFUL'
        });
        return res.json(newSession);
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ 
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update session
  app.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = updateCreativeFlowSessionSchema.parse(req.body);
      
      const session = await storage.updateSession(sessionId, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(400).json({ 
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate personalized prompts
  app.post("/api/generate-prompts", async (req, res) => {
    try {
      const { recipientName, anchor, occasion, tone } = req.body;
      
      if (!anchor) {
        return res.status(400).json({ 
          error: "Missing required field: anchor is required" 
        });
      }
      
      const prompts = await generatePersonalizedPrompts(recipientName, anchor, occasion, tone);
      res.json({ prompts });
    } catch (error) {
      console.error('Error generating prompts:', error);
      res.status(500).json({ 
        error: "Failed to generate personalized prompts",
        details: error instanceof Error ? error.message : "AI service unavailable"
      });
    }
  });

  // Generate TTS audio
  app.post("/api/generate-tts", async (req, res) => {
    try {
      const { text, voice = 'nova' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          error: "Missing required field: text is required" 
        });
      }

      if (text.length > 4000) {
        return res.status(400).json({ 
          error: "Text too long: maximum 4000 characters allowed" 
        });
      }

      const validVoices = ['nova', 'shimmer', 'echo', 'alloy', 'onyx', 'fable'];
      if (!validVoices.includes(voice)) {
        return res.status(400).json({ 
          error: `Invalid voice: must be one of ${validVoices.join(', ')}` 
        });
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI TTS error:', errorText);
        return res.status(500).json({ 
          error: "Failed to generate audio",
          details: `OpenAI API error: ${response.statusText}`
        });
      }

      const audioBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(audioBuffer);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });

      res.send(buffer);
    } catch (error) {
      console.error('TTS generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });

  // AI Weaver - Generate complete message
  app.post("/api/ai-weave", async (req, res) => {
    try {
      const { recipientName, anchor, ingredients, occasion, tone } = req.body;
      
      if (!anchor || !ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ 
          error: "Missing required fields: anchor and ingredients array are required" 
        });
      }
      
      const message = await aiWeaveMessage({
        recipientName,
        anchor,
        ingredients,
        occasion,
        tone
      });
      
      res.json({ message });
    } catch (error) {
      console.error('Error weaving message:', error);
      res.status(500).json({ 
        error: "Failed to generate message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });

  // Polish & Refine - Improve existing message
  app.post("/api/ai-stitch", async (req, res) => {
    try {
      const { currentMessage, recipientName, anchor, improvements } = req.body;
      
      if (!currentMessage || !anchor) {
        return res.status(400).json({ 
          error: "Missing required fields: currentMessage and anchor are required" 
        });
      }
      
      const improvedMessage = await aiStitchMessage({
        currentMessage,
        recipientName,
        anchor,
        improvements
      });
      
      res.json({ message: improvedMessage });
    } catch (error) {
      console.error('Error polishing message:', error);
      res.status(500).json({ 
        error: "Failed to improve message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });

  // Voice generation API endpoint
  app.post("/api/generate-voice", async (req, res) => {
    try {
      const { text, trackUrl, hugId } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      // For now, return a placeholder URL
      // In production, this would integrate with a TTS service like:
      // - OpenAI Text-to-Speech API
      // - Google Cloud Text-to-Speech
      // - Amazon Polly
      // - ElevenLabs API
      
      const placeholder = `/api/placeholder-voice/${hugId}`;
      
      res.json({ 
        mergedUrl: placeholder,
        message: "AI voice generation would be implemented here with your chosen TTS service"
      });
    } catch (error) {
      console.error("Voice generation error:", error);
      res.status(500).json({ error: "Failed to generate voice" });
    }
  });
  
  // Placeholder voice endpoint for development
  app.get("/api/placeholder-voice/:hugId", (req, res) => {
    const { hugId } = req.params;
    
    // Generate a simple audio file header for WAV
    const sampleRate = 44100;
    const duration = 10; // 10 seconds
    const samples = sampleRate * duration;
    const amplitude = 0.1;
    
    // WAV file header
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + samples * 2, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(samples * 2, 40);
    
    // Generate simple tone (placeholder for actual TTS)
    const audioData = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const frequency = 220 + (i % 1000) * 0.1; // Varying frequency
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * 32767;
      audioData.writeInt16LE(Math.round(sample), i * 2);
    }
    
    const audioBuffer = Buffer.concat([header, audioData]);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(audioBuffer);
  });

  // Music API endpoints - generate placeholder audio since files were removed
  app.get("/api/music/:trackId", (req, res) => {
    const { trackId } = req.params;
    
    // Generate different musical tones for each track
    const trackConfigs: { [key: string]: { frequency: number; name: string } } = {
      'calm-morning': { frequency: 440, name: 'Calm Morning' }, // A4
      'gentle-waves': { frequency: 523, name: 'Gentle Waves' }, // C5
      'soft-piano': { frequency: 349, name: 'Soft Piano' } // F4
    };
    
    const config = trackConfigs[trackId];
    if (!config) {
      return res.status(404).json({ error: "Track not found" });
    }
    
    const frequency = config.frequency;
    const sampleRate = 44100;
    const duration = 30; // 30 seconds
    const samples = sampleRate * duration;
    const amplitude = 0.1;
    
    // Create WAV header
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + samples * 2, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(samples * 2, 40);
    
    // Generate audio data with musical progression
    const audioData = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Create a simple chord progression with harmonics
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const fifth = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.5;
      const octave = Math.sin(2 * Math.PI * (frequency * 2) * t) * 0.25;
      
      // Add some envelope to make it more musical
      const envelope = Math.exp(-t * 0.1) * 0.5 + 0.5;
      const sample = (fundamental + fifth + octave) * amplitude * envelope * 32767;
      audioData.writeInt16LE(Math.round(sample), i * 2);
    }
    
    const audioBuffer = Buffer.concat([header, audioData]);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(audioBuffer);
  });

  const httpServer = createServer(app);
  return httpServer;
}