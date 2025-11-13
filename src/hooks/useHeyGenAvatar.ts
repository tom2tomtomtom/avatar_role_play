import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamingEvents } from '@heygen/streaming-avatar';
import HeyGenService from '../services/heygenService';
import { AvatarConfig } from '../types';

interface UseHeyGenAvatarReturn {
  isConnected: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
  videoElement: HTMLVideoElement | null;
  initialize: (config: AvatarConfig) => Promise<void>;
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useHeyGenAvatar = (apiKey: string): UseHeyGenAvatarReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const serviceRef = useRef<HeyGenService | null>(null);

  useEffect(() => {
    // Initialize service
    serviceRef.current = new HeyGenService(apiKey);

    // Cleanup on unmount
    return () => {
      if (serviceRef.current) {
        serviceRef.current.close().catch(console.error);
      }
    };
  }, [apiKey]);

  const initialize = useCallback(async (config: AvatarConfig) => {
    if (!serviceRef.current) {
      setError('Service not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await serviceRef.current.initialize(config);

      // Set up event listeners
      serviceRef.current.on(StreamingEvents.STREAM_READY, () => {
        setIsConnected(true);
        setIsLoading(false);
        const video = serviceRef.current?.getVideoElement();
        if (video) {
          setVideoElement(video);
        }
      });

      serviceRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setIsConnected(false);
        setIsSpeaking(false);
      });

      serviceRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setIsSpeaking(true);
      });

      serviceRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setIsSpeaking(false);
      });

      serviceRef.current.on(StreamingEvents.STREAM_ERROR, (error: Error) => {
        console.error('Stream error:', error);
        setError(error.message);
        setIsConnected(false);
        setIsLoading(false);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize avatar';
      setError(errorMessage);
      setIsLoading(false);
      setIsConnected(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!serviceRef.current || !isConnected) {
      setError('Avatar not connected');
      return;
    }

    try {
      await serviceRef.current.speak(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to speak';
      setError(errorMessage);
    }
  }, [isConnected]);

  const interrupt = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    try {
      await serviceRef.current.interrupt();
    } catch (err) {
      console.error('Failed to interrupt:', err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    try {
      await serviceRef.current.close();
      setIsConnected(false);
      setIsSpeaking(false);
      setVideoElement(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMessage);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    isSpeaking,
    error,
    videoElement,
    initialize,
    speak,
    interrupt,
    disconnect,
  };
};

export default useHeyGenAvatar;
