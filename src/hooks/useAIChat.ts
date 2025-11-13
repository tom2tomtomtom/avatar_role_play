import { useState, useCallback, useRef, useEffect } from 'react';
import GroqService from '../services/groqService';
import ClaudeService from '../services/claudeService';
import { Message, ClientPersona } from '../types';
import { generateSystemPrompt } from '../utils/config';

interface UseAIChatReturn {
  isProcessing: boolean;
  error: string | null;
  messages: Message[];
  aiProvider: 'groq' | 'claude';
  sendMessage: (content: string) => Promise<string>;
  resetSession: (persona: ClientPersona) => void;
  clearMessages: () => void;
}

export const useAIChat = (
  groqApiKey: string,
  claudeApiKey: string,
  initialPersona: ClientPersona
): UseAIChatReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiProvider, setAiProvider] = useState<'groq' | 'claude'>('groq');

  const groqServiceRef = useRef<GroqService | null>(null);
  const claudeServiceRef = useRef<ClaudeService | null>(null);

  useEffect(() => {
    // Initialize services based on available keys
    if (groqApiKey) {
      console.log('🟢 Initializing Groq (ultra-fast mode)');
      groqServiceRef.current = new GroqService(groqApiKey);
      const systemPrompt = generateSystemPrompt(initialPersona);
      groqServiceRef.current.setSystemPrompt(systemPrompt);
      setAiProvider('groq');
    } else if (claudeApiKey) {
      console.log('🔵 Initializing Claude (fallback mode)');
      claudeServiceRef.current = new ClaudeService(claudeApiKey);
      const systemPrompt = generateSystemPrompt(initialPersona);
      claudeServiceRef.current.setSystemPrompt(systemPrompt);
      setAiProvider('claude');
    }
  }, [groqApiKey, claudeApiKey, initialPersona]);

  const sendMessage = useCallback(async (content: string): Promise<string> => {
    const service = groqServiceRef.current || claudeServiceRef.current;
    
    if (!service) {
      throw new Error('AI service not initialized');
    }

    const provider = groqServiceRef.current ? 'groq' : 'claude';
    console.log(`${provider === 'groq' ? '🟢 Groq' : '🔵 Claude'}: Sending message:`, content);
    
    setIsProcessing(true);
    setError(null);

    try {
      // Add user message to local state
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      console.log(`${provider === 'groq' ? '🟢' : '🔵'} Calling ${provider.toUpperCase()} API...`);
      const startTime = Date.now();
      const response = await service.sendMessage(content);
      const duration = Date.now() - startTime;
      console.log(`${provider === 'groq' ? '🟢' : '🔵'} Response received in ${duration}ms:`, response);

      // Add assistant response to local state
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setIsProcessing(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      console.error(`❌ ${provider.toUpperCase()} Error:`, errorMessage);
      setError(errorMessage);
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const resetSession = useCallback((persona: ClientPersona) => {
    const service = groqServiceRef.current || claudeServiceRef.current;
    
    if (!service) {
      return;
    }

    const systemPrompt = generateSystemPrompt(persona);
    service.resetSession(systemPrompt);
    setMessages([]);
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    const service = groqServiceRef.current || claudeServiceRef.current;
    if (service) {
      service.clearHistory();
    }
  }, []);

  return {
    isProcessing,
    error,
    messages,
    aiProvider,
    sendMessage,
    resetSession,
    clearMessages,
  };
};

export default useAIChat;

