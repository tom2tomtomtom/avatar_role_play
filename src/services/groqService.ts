import Groq from 'groq-sdk';
import { API_CONFIG } from '../utils/config';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqService {
  private client: Groq;
  private conversationHistory: GroqMessage[] = [];
  private systemPrompt: string = '';

  constructor(apiKey: string) {
    this.client = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Prepare messages with system prompt
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        ...this.conversationHistory,
      ];

      const response = await this.client.chat.completions.create({
        model: API_CONFIG.groq.model,
        messages: messages,
        max_tokens: API_CONFIG.groq.maxTokens,
        temperature: API_CONFIG.groq.temperature,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error: any) {
      console.error('Groq API error:', error);
      throw new Error(`Groq request failed: ${error.message || 'Unknown error'}`);
    }
  }

  resetSession(newSystemPrompt: string): void {
    this.systemPrompt = newSystemPrompt;
    this.conversationHistory = [];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getMessageCount(): number {
    return this.conversationHistory.length;
  }
}

export default GroqService;

