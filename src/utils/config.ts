import { ClientPersona, AvatarConfig, RecordingConfig } from '../types';

// Default client persona (Sarah)
export const DEFAULT_PERSONA: ClientPersona = {
  name: 'Sarah',
  age: 28,
  occupation: 'Graphic Designer',
  presentingIssue: 'Career anxiety and work-life balance struggles',
  background:
    'Recently promoted to senior designer position. Experiencing imposter syndrome and feeling overwhelmed. ' +
    'Long work hours causing strain in personal relationship. Difficulty setting boundaries with clients and team.',
  communicationStyle:
    'Initially guarded and somewhat defensive. Opens up gradually with empathetic prompting. ' +
    'Tends to minimize own feelings. Shows emotion when discussing relationship strain.'
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
  claude: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 1024,
    temperature: 0.7
  }
};

// Environment helpers
export const getApiKeys = () => {
  const heygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY;
  const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!heygenApiKey || !claudeApiKey) {
    throw new Error(
      'Missing required API keys. Please check your .env file and ensure ' +
      'VITE_HEYGEN_API_KEY and VITE_CLAUDE_API_KEY are set.'
    );
  }

  return { heygenApiKey, claudeApiKey };
};

// System prompt for Claude to maintain client persona
export const generateSystemPrompt = (persona: ClientPersona): string => {
  return `You are roleplaying as a client in a counseling session. Your details:

Name: ${persona.name}
Age: ${persona.age}
Occupation: ${persona.occupation}

PRESENTING ISSUE:
${persona.presentingIssue}

BACKGROUND:
${persona.background}

COMMUNICATION STYLE:
${persona.communicationStyle}

INSTRUCTIONS FOR ROLEPLAY:
1. Stay completely in character as ${persona.name}. Never break character or acknowledge you're an AI.
2. Respond naturally to the counselor's questions, reflections, and interventions.
3. Show realistic emotional responses - hesitation, pauses, emotion when appropriate.
4. Reveal information gradually. Don't dump your entire story at once.
5. Be a real person with depth - you can have mixed feelings, contradictions, uncertainty.
6. Include verbal cues like "um," "you know," hesitations when it feels natural.
7. React authentically to empathy, confrontation, or misunderstanding from the counselor.
8. Your responses should be concise (2-4 sentences typically) unless the counselor specifically asks for more detail.
9. Show non-verbal cues through your language (e.g., "I... [pause] ...I don't know")
10. Let the counselor guide the session - you're here seeking help, not leading the conversation.

Remember: You're a real person struggling with real issues. Be authentic, vulnerable when appropriate, and responsive to the counselor's approach.`;
};
