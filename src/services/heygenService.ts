import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';
import { AvatarConfig } from '../types';

export class HeyGenService {
  private avatar: StreamingAvatar | null = null;
  private apiKey: string;
  private sessionId: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.data.token;
  }

  async initialize(config: AvatarConfig): Promise<void> {
    try {
      // Get access token first
      const token = await this.getAccessToken();
      
      // Initialize avatar with token
      this.avatar = new StreamingAvatar({ token });

      // Create and start avatar session
      const sessionData = await this.avatar.createStartAvatar({
        avatarName: config.avatarId,
        quality: config.quality as AvatarQuality,
        voice: {
          voiceId: config.voice.voiceId,
          rate: config.voice.rate,
          emotion: config.voice.emotion as VoiceEmotion,
        },
      });

      this.sessionId = sessionData.session_id;
    } catch (error) {
      console.error('Failed to initialize HeyGen avatar:', error);
      throw new Error(`HeyGen initialization failed: ${error}`);
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
