import Anthropic from '@anthropic-ai/sdk';
import { API_CONFIG } from '../utils/config';
import { Message, ClientPersona } from '../types';

export class ClaudeService {
  private client: Anthropic;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private systemPrompt: string = '';

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Call Claude API
      const response = await this.client.messages.create({
        model: API_CONFIG.claude.model,
        max_tokens: API_CONFIG.claude.maxTokens,
        temperature: API_CONFIG.claude.temperature,
        system: this.systemPrompt,
        messages: this.conversationHistory,
      });

      // Extract assistant response
      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to get response from Claude: ${error}`);
    }
  }

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  resetSession(newSystemPrompt?: string): void {
    this.conversationHistory = [];
    if (newSystemPrompt) {
      this.systemPrompt = newSystemPrompt;
    }
  }
}

export default ClaudeService;
