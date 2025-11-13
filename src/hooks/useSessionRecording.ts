import { useState, useCallback, useRef } from 'react';
import RecordingService from '../services/recordingService';

interface UseSessionRecordingReturn {
  isRecording: boolean;
  error: string | null;
  recordedBlob: Blob | null;
  startRecording: (webcamVideo: HTMLVideoElement, avatarVideo: HTMLVideoElement) => Promise<void>;
  stopRecording: () => Promise<void>;
  downloadRecording: (filename?: string) => void;
  clearRecording: () => void;
}

export const useSessionRecording = (): UseSessionRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const serviceRef = useRef<RecordingService>(new RecordingService());

  const startRecording = useCallback(
    async (webcamVideo: HTMLVideoElement, avatarVideo: HTMLVideoElement) => {
      setError(null);

      try {
        await serviceRef.current.startRecording(webcamVideo, avatarVideo);
        setIsRecording(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
        setError(errorMessage);
        setIsRecording(false);
      }
    },
    []
  );

  const stopRecording = useCallback(async () => {
    try {
      const blob = await serviceRef.current.stopRecording();
      setRecordedBlob(blob);
      setIsRecording(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      setIsRecording(false);
    }
  }, []);

  const downloadRecording = useCallback(
    (filename?: string) => {
      if (!recordedBlob) {
        setError('No recording available to download');
        return;
      }

      serviceRef.current.downloadRecording(recordedBlob, filename);
    },
    [recordedBlob]
  );

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setError(null);
  }, []);

  return {
    isRecording,
    error,
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  };
};

export default useSessionRecording;
