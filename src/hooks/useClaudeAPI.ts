import { useState, useCallback, useRef, useEffect } from 'react';
import ClaudeService from '../services/claudeService';
import { Message, ClientPersona } from '../types';
import { generateSystemPrompt } from '../utils/config';

interface UseClaudeAPIReturn {
  isProcessing: boolean;
  error: string | null;
  messages: Message[];
  sendMessage: (content: string) => Promise<string>;
  resetSession: (persona: ClientPersona) => void;
  clearMessages: () => void;
}

export const useClaudeAPI = (
  apiKey: string,
  initialPersona: ClientPersona
): UseClaudeAPIReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const serviceRef = useRef<ClaudeService | null>(null);

  useEffect(() => {
    // Initialize Claude service
    serviceRef.current = new ClaudeService(apiKey);
    const systemPrompt = generateSystemPrompt(initialPersona);
    serviceRef.current.setSystemPrompt(systemPrompt);
  }, [apiKey, initialPersona]);

  const sendMessage = useCallback(async (content: string): Promise<string> => {
    if (!serviceRef.current) {
      throw new Error('Claude service not initialized');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Add counselor message to local state
      const counselorMessage: Message = {
        id: `msg-${Date.now()}-counselor`,
        role: 'counselor',
        content: content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, counselorMessage]);

      // Get Claude response (as client)
      const response = await serviceRef.current.sendMessage(content);

      // Add client response to local state
      const clientMessage: Message = {
        id: `msg-${Date.now()}-client`,
        role: 'client',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, clientMessage]);

      setIsProcessing(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const resetSession = useCallback((persona: ClientPersona) => {
    if (!serviceRef.current) {
      return;
    }

    const systemPrompt = generateSystemPrompt(persona);
    serviceRef.current.resetSession(systemPrompt);
    setMessages([]);
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (serviceRef.current) {
      serviceRef.current.clearHistory();
    }
  }, []);

  return {
    isProcessing,
    error,
    messages,
    sendMessage,
    resetSession,
    clearMessages,
  };
};

export default useClaudeAPI;
