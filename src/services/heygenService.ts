import * as HeyGenSDK from '@heygen/streaming-avatar';
import { AvatarConfig } from '../types';

// Extract types from SDK
const StreamingAvatar = HeyGenSDK.default;
const { AvatarQuality, StreamingEvents, TaskType, VoiceEmotion } = HeyGenSDK;

export class HeyGenService {
  private avatar: InstanceType<typeof StreamingAvatar> | null = null;
  private apiKey: string;
  private sessionId: string | null = null;

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

    try {
      await this.avatar.speak({
        text,
        taskType,
      });
    } catch (error) {
      console.error('Failed to make avatar speak:', error);
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

    // Create a video element and attach the media stream
    const video = document.createElement('video');
    video.srcObject = this.avatar.mediaStream;
    video.autoplay = true;
    video.playsInline = true;
    
    return video;
  }

  async close(): Promise<void> {
    if (!this.avatar) {
      return;
    }

    try {
      await this.avatar.stopAvatar();
      this.avatar = null;
      this.sessionId = null;
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
