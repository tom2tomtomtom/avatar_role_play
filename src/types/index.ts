// Conversation Partner Configuration
export interface ClientPersona {
  name: string;
  age: number;
  occupation: string;
  interests: string;
  background: string;
  communicationStyle: string;
}

// Session State
export interface SessionState {
  isActive: boolean;
  startTime: number | null;
  duration: number;
  isRecording: boolean;
}

// API Connection Status
export interface ConnectionStatus {
  heygen: 'connected' | 'connecting' | 'disconnected' | 'error';
  claude: 'connected' | 'connecting' | 'disconnected' | 'error';
  speech: 'ready' | 'listening' | 'error' | 'not-supported';
}

// Avatar Configuration
export interface AvatarConfig {
  avatarId: string;
  voice: {
    voiceId: string;
    rate: number;
    emotion: string;
  };
  quality: 'low' | 'medium' | 'high';
}

// Conversation Message
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Recording Configuration
export interface RecordingConfig {
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  mimeType: string;
}

// Environment Configuration
export interface AppConfig {
  heygenApiKey: string;
  claudeApiKey: string;
  defaultPersona: ClientPersona;
}

// HeyGen Avatar Events
export interface AvatarEvents {
  onAvatarStartedSpeaking: () => void;
  onAvatarStoppedSpeaking: () => void;
  onStreamReady: () => void;
  onStreamDisconnected: () => void;
  onError: (error: Error) => void;
}

// Speech Recognition Result
export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}
