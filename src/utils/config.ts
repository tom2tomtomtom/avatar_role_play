import { ClientPersona, AvatarConfig, RecordingConfig } from '../types';

// Default conversation partner
export const DEFAULT_PERSONA: ClientPersona = {
  name: 'Emma',
  age: 32,
  occupation: 'Product Manager at a tech startup',
  interests: 'Technology, travel, photography, reading sci-fi, hiking, trying new restaurants',
  background:
    'Originally from Seattle, moved to San Francisco 5 years ago for work. ' +
    'Loves exploring new ideas and discussing everything from AI ethics to travel adventures. ' +
    'Recently got into landscape photography and is learning Spanish. Has a rescue dog named Max.',
  communicationStyle:
    'Friendly and engaging. Asks thoughtful questions and shares personal experiences. ' +
    'Enthusiastic when discussing topics she\'s passionate about. Good sense of humor. ' +
    'Enjoys deep conversations but also light-hearted banter.'
};

// Default avatar configuration
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  avatarId: import.meta.env.VITE_HEYGEN_AVATAR_ID || 'default_avatar',
  voice: {
    voiceId: import.meta.env.VITE_HEYGEN_VOICE_ID || 'default_voice',
    rate: 1.0,
    emotion: 'friendly'
  },
  quality: 'high'
};

// Recording configuration
export const RECORDING_CONFIG: RecordingConfig = {
  videoBitsPerSecond: 2500000,
  audioBitsPerSecond: 128000,
  mimeType: 'video/webm;codecs=vp9,opus'
};

// API endpoints
export const API_CONFIG = {
  heygen: {
    baseUrl: 'https://api.heygen.com/v1',
    streamingUrl: 'wss://api.heygen.com/v1/streaming'
  },
  groq: {
    model: 'llama-3.3-70b-versatile', // Ultra-fast, high quality
    maxTokens: 300,
    temperature: 0.9
  },
  claude: {
    model: 'claude-3-5-haiku-20241022', // Fallback option
    maxTokens: 300,
    temperature: 0.9
  }
};

// Environment helpers
export const getApiKeys = () => {
  const heygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!heygenApiKey) {
    throw new Error('Missing VITE_HEYGEN_API_KEY in .env file');
  }

  // Prefer Groq, fallback to Claude
  if (!groqApiKey && !claudeApiKey) {
    throw new Error(
      'Missing AI API key. Please set either VITE_GROQ_API_KEY or VITE_CLAUDE_API_KEY in .env file'
    );
  }

  return { 
    heygenApiKey, 
    groqApiKey: groqApiKey || '',
    claudeApiKey: claudeApiKey || ''
  };
};

// System prompt for Claude to maintain conversation partner persona
export const generateSystemPrompt = (persona: ClientPersona): string => {
  return `You're ${persona.name}, ${persona.age}. ${persona.occupation}. Into: ${persona.interests}

${persona.communicationStyle}

CONVERSATION RULES:
- Match response length to the context:
  * Simple questions/greetings = 1-2 sentences, punchy
  * Deep topics/stories = 2-4 sentences, more detail
  * Follow their energy level
- Sometimes (but NOT always) ask a follow-up question to keep it flowing
- Vary your style: sometimes just respond, sometimes engage with a question
- Be natural and conversational, like texting a friend
- Don't over-explain, keep it real`;
};
