import React, { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generatePersonalizedPrompts, aiWeaveMessage, aiStitchMessage, AIWeaveRequest, AIStitchRequest } from "@/lib/creative-flow";
import { CreativeFlowSession, InsertCreativeFlowSession, UpdateCreativeFlowSession } from "@shared/schema";

export type Stage = 'intention' | 'reflection' | 'expression' | 'audio';

interface CreativeFlowState {
  sessionId: string | null;
  session: CreativeFlowSession | null;
}

// Global session state to persist across pages
let globalSession: CreativeFlowSession | null = null;
let globalSessionId: string | null = null;

export function useCreativeFlow() {
  const [state, setState] = useState<CreativeFlowState>(() => {
    // Initialize with global state if available
    if (globalSession && globalSessionId) {
      return { sessionId: globalSessionId, session: globalSession };
    }
    // Otherwise try localStorage
    const savedSessionId = localStorage.getItem('creativeFlowSessionId');
    return {
      sessionId: savedSessionId,
      session: null
    };
  });
  const [currentStage, setCurrentStage] = useState<Stage>('intention');
  const queryClient = useQueryClient();

  // Load session if we have sessionId but no session data
  React.useEffect(() => {
    if (state.sessionId && !state.session) {
      apiRequest('GET', `/api/sessions/${state.sessionId}`)
        .then(response => response.json())
        .then((session: CreativeFlowSession) => {
          setState(prev => ({ ...prev, session }));
          globalSession = session;
          globalSessionId = state.sessionId;
        })
        .catch(() => {
          localStorage.removeItem('creativeFlowSessionId');
          setState(prev => ({ ...prev, sessionId: null }));
          globalSession = null;
          globalSessionId = null;
        });
    }
  }, [state.sessionId]);

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: Omit<InsertCreativeFlowSession, 'sessionId'>) => {
      const sessionId = crypto.randomUUID();
      const response = await apiRequest('POST', '/api/sessions', {
        ...data,
        sessionId
      });
      return await response.json() as CreativeFlowSession;
    },
    onSuccess: (session) => {
      setState(prev => ({ ...prev, sessionId: session.sessionId, session }));
      localStorage.setItem('creativeFlowSessionId', session.sessionId);
      globalSession = session;
      globalSessionId = session.sessionId;
      queryClient.setQueryData(['sessions', session.sessionId], session);
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: UpdateCreativeFlowSession) => {
      if (!state.sessionId) throw new Error('No active session');
      
      const response = await apiRequest('PATCH', `/api/sessions/${state.sessionId}`, data);
      return await response.json() as CreativeFlowSession;
    },
    onSuccess: (session) => {
      setState(prev => ({ ...prev, session }));
      globalSession = session;
      queryClient.setQueryData(['sessions', session.sessionId], session);
    }
  });

  // Generate prompts mutation
  const generatePromptsMutation = useMutation({
    mutationFn: (params: {
      recipientName: string;
      anchor: string;
      occasion?: string;
      tone?: string;
    }) => generatePersonalizedPrompts(params.recipientName, params.anchor, params.occasion, params.tone),
    onSuccess: (prompts) => {
      if (state.session) {
        updateSessionMutation.mutate({ aiGeneratedPrompts: prompts });
      }
    }
  });

  // AI Weave mutation
  const aiWeaveMutation = useMutation({
    mutationFn: aiWeaveMessage
  });

  // AI Stitch mutation
  const aiStitchMutation = useMutation({
    mutationFn: aiStitchMessage
  });

  const updateSession = useCallback(async (data: Partial<{
    recipientName: string;
    anchor: string;
    occasion?: string;
    tone?: string;
    finalMessage?: string;
  }>) => {
    if (!state.sessionId) {
      // Create new session
      await createSessionMutation.mutateAsync({
        recipientName: data.recipientName!,
        anchor: data.anchor!,
        occasion: data.occasion,
        tone: data.tone,
        finalMessage: data.finalMessage,
        aiGeneratedPrompts: [],
        ingredients: []
      });
    } else {
      // Update existing session
      await updateSessionMutation.mutateAsync(data);
    }
  }, [state.sessionId, createSessionMutation, updateSessionMutation]);

  const addIngredient = useCallback(async (ingredient: { prompt: string; content: string }) => {
    if (!state.session) return;

    const newIngredient = {
      id: Date.now(),
      prompt: ingredient.prompt,
      content: ingredient.content,
      timestamp: new Date().toISOString()
    };

    const updatedIngredients = [...(state.session.ingredients || []), newIngredient];
    await updateSessionMutation.mutateAsync({ ingredients: updatedIngredients });
  }, [state.session, updateSessionMutation]);

  const removeIngredient = useCallback(async (ingredientId: number) => {
    if (!state.session) return;

    const updatedIngredients = (state.session.ingredients || []).filter(ing => ing.id !== ingredientId);
    await updateSessionMutation.mutateAsync({ ingredients: updatedIngredients });
  }, [state.session, updateSessionMutation]);

  const generatePrompts = useCallback(async (
    recipientName: string,
    anchor: string,
    occasion?: string,
    tone?: string
  ) => {
    await generatePromptsMutation.mutateAsync({
      recipientName,
      anchor,
      occasion,
      tone
    });
  }, [generatePromptsMutation]);

  const aiWeave = useCallback(async (request: AIWeaveRequest) => {
    const message = await aiWeaveMutation.mutateAsync(request);
    return message;
  }, [aiWeaveMutation]);

  const aiStitch = useCallback(async (request: AIStitchRequest) => {
    const message = await aiStitchMutation.mutateAsync(request);
    return message;
  }, [aiStitchMutation]);

  const isLoading = 
    createSessionMutation.isPending ||
    updateSessionMutation.isPending ||
    generatePromptsMutation.isPending ||
    aiWeaveMutation.isPending ||
    aiStitchMutation.isPending;

  return {
    state,
    session: state.session, // Export session directly for easier access
    currentStage,
    setCurrentStage,
    updateSession,
    addIngredient,
    removeIngredient,
    generatePrompts,
    aiWeave,
    aiStitch,
    isLoading
  };
}
