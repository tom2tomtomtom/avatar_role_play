import * as HeyGenSDK from '@heygen/streaming-avatar';
import { AvatarConfig } from '../types';

// Extract types from SDK
const StreamingAvatar = HeyGenSDK.default;
const { AvatarQuality, StreamingEvents, TaskType, VoiceEmotion } = HeyGenSDK;

export class HeyGenService {
  private avatar: InstanceType<typeof StreamingAvatar> | null = null;
  private apiKey: string;
  private sessionId: string | null = null;
  private videoElement: HTMLVideoElement | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string> {
    console.log('Requesting access token from HeyGen API...');
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, errorText);
      throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Access token received successfully');
    return data.data.token;
  }

  async initialize(config: AvatarConfig, eventCallbacks?: {
    onReady?: () => void;
    onDisconnected?: () => void;
    onStartTalking?: () => void;
    onStopTalking?: () => void;
  }): Promise<void> {
    try {
      // Get access token first
      const token = await this.getAccessToken();
      
      // Initialize avatar with token
      this.avatar = new StreamingAvatar({ token });

      // Set up event listeners BEFORE creating the session
      if (eventCallbacks) {
        if (eventCallbacks.onReady) {
          this.avatar.on(StreamingEvents.STREAM_READY, eventCallbacks.onReady);
        }
        if (eventCallbacks.onDisconnected) {
          this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, eventCallbacks.onDisconnected);
        }
        if (eventCallbacks.onStartTalking) {
          this.avatar.on(StreamingEvents.AVATAR_START_TALKING, eventCallbacks.onStartTalking);
        }
        if (eventCallbacks.onStopTalking) {
          this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, eventCallbacks.onStopTalking);
        }
      }

      // Create and start avatar session
      const requestConfig: any = {
        avatarName: String(config.avatarId),
        quality: config.quality as AvatarQuality,
        language: 'en',
        // Explicitly disable ALL interactive features
        disableIdleTimeout: true,
        useSilencePrompt: false,
        // Try to disable knowledge base / AI responses
        knowledgeBase: null,
        knowledgeId: null,
      };
      
      // Only add voice if voiceId is provided and not 'default_voice'
      if (config.voice.voiceId && config.voice.voiceId !== 'default_voice') {
        requestConfig.voice = {
          voiceId: String(config.voice.voiceId),
          rate: config.voice.rate,
          emotion: config.voice.emotion as VoiceEmotion,
        };
      }
      
      console.log('Creating avatar session with config:', JSON.stringify(requestConfig, null, 2));
      
      const sessionData = await this.avatar.createStartAvatar(requestConfig);

      console.log('Avatar session created:', sessionData);
      this.sessionId = sessionData.session_id;
      
      // CRITICAL: Close voice chat if it was auto-started
      if (this.avatar) {
        try {
          console.log('⚠️ Attempting to close voice chat to prevent auto-responses...');
          await this.avatar.closeVoiceChat();
          console.log('✅ Voice chat closed - avatar will only speak our text');
        } catch (e) {
          console.log('ℹ️ Voice chat was not active or already closed');
        }
      }
    } catch (error: any) {
      console.error('Failed to initialize HeyGen avatar:', error);
      const errorDetails = {
        message: error.message,
        status: error.status,
        body: error.body,
        errorText: error.errorText,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      };
      console.error('Error details (stringified):', JSON.stringify(errorDetails, null, 2));
      
      throw new Error(`HeyGen initialization failed: ${error.message || error}`);
    }
  }

  async speak(text: string, taskType: TaskType = TaskType.TALK): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar not initialized');
    }

    // Strip stage directions and formatting that can't be spoken
    // Remove text between asterisks (e.g., *shifts in chair*)
    let cleanText = text.replace(/\*[^*]+\*/g, '').trim();
    // Remove multiple spaces/newlines
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    console.log('🎤 Avatar: Original text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('🎤 Avatar: Cleaned text:', cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : ''));
    console.log('🎤 Avatar: Text length:', cleanText.length, 'characters');
    console.log('🎤 Avatar: TaskType:', taskType);
    
    if (!cleanText || cleanText.length === 0) {
      console.warn('⚠️ No speakable text after cleaning, skipping speak command');
      return;
    }
    
    try {
      const speakRequest = {
        text: cleanText,
        taskType,
      };
      console.log('🎤 Avatar: Sending speak request:', speakRequest);
      
      const result = await this.avatar.speak(speakRequest);
      console.log('🎤 Avatar: Speak result:', result);
      console.log('🎤 Avatar: Speak command sent successfully');
    } catch (error) {
      console.error('🔴 Avatar: Failed to make avatar speak:', error);
      throw new Error(`Avatar speak failed: ${error}`);
    }
  }

  async interrupt(): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar not initialized');
    }

    try {
      await this.avatar.interrupt();
    } catch (error) {
      console.error('Failed to interrupt avatar:', error);
      throw error;
    }
  }

  on(event: StreamingEvents, callback: (...args: any[]) => void): void {
    if (!this.avatar) {
      throw new Error('Avatar not initialized');
    }
    this.avatar.on(event, callback);
  }

  off(event: StreamingEvents, callback: (...args: any[]) => void): void {
    if (!this.avatar) {
      throw new Error('Avatar not initialized');
    }
    this.avatar.off(event, callback);
  }

  getVideoElement(): HTMLVideoElement | null {
    if (!this.avatar || !this.avatar.mediaStream) {
      return null;
    }

    // Create video element only once and cache it
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = false; // Ensure avatar audio is not muted
      console.log('Video element created');
    }
    
    // Update the media stream
    if (this.videoElement.srcObject !== this.avatar.mediaStream) {
      this.videoElement.srcObject = this.avatar.mediaStream;
      console.log('Media stream attached to video element');
    }
    
    return this.videoElement;
  }

  async close(): Promise<void> {
    if (!this.avatar) {
      return;
    }

    try {
      await this.avatar.stopAvatar();
      this.avatar = null;
      this.sessionId = null;
      this.videoElement = null; // Clear cached video element
    } catch (error) {
      console.error('Failed to close avatar session:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.avatar !== null && this.sessionId !== null;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

export default HeyGenService;
