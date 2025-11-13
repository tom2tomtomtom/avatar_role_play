import { RECORDING_CONFIG } from '../utils/config';

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private canvasStream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  async startRecording(
    webcamVideo: HTMLVideoElement,
    avatarVideo: HTMLVideoElement
  ): Promise<void> {
    try {
      // Create a canvas to combine both video feeds
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions (side by side layout)
      canvas.width = 1920; // Full HD width
      canvas.height = 1080; // Full HD height

      // Calculate video dimensions for side-by-side layout
      const videoWidth = canvas.width / 2;
      const videoHeight = canvas.height;

      // Animation loop to draw both videos on canvas
      const drawFrame = () => {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw webcam on left side
        if (webcamVideo && webcamVideo.readyState >= 2) {
          ctx.drawImage(webcamVideo, 0, 0, videoWidth, videoHeight);
        }

        // Draw avatar on right side
        if (avatarVideo && avatarVideo.readyState >= 2) {
          ctx.drawImage(avatarVideo, videoWidth, 0, videoWidth, videoHeight);
        }

        // Add labels
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText('Counselor', 20, 40);
        ctx.fillText('Client (Avatar)', videoWidth + 20, 40);

        this.animationFrameId = requestAnimationFrame(drawFrame);
      };

      drawFrame();

      // Capture stream from canvas
      this.canvasStream = canvas.captureStream(30); // 30 FPS

      // Get audio from webcam (counselor's microphone)
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = audioStream.getAudioTracks()[0];

      // Combine video and audio tracks
      const combinedStream = new MediaStream([
        ...this.canvasStream.getVideoTracks(),
        audioTrack,
      ]);

      // Determine supported mime type
      let mimeType = RECORDING_CONFIG.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else {
          throw new Error('No supported video mime type found');
        }
      }

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: RECORDING_CONFIG.videoBitsPerSecond,
        audioBitsPerSecond: RECORDING_CONFIG.audioBitsPerSecond,
      });

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error(`Recording failed: ${error}`);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Stop animation frame
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }

        // Stop canvas stream
        if (this.canvasStream) {
          this.canvasStream.getTracks().forEach((track) => track.stop());
          this.canvasStream = null;
        }

        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'video/webm',
        });

        // Clear chunks
        this.recordedChunks = [];

        resolve(blob);
      };

      this.mediaRecorder.onerror = (event: Event) => {
        reject(new Error('Recording error occurred'));
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  downloadRecording(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || `counseling-session-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default RecordingService;
