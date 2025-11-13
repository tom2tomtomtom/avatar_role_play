import { useState, useEffect, useCallback, useRef } from 'react';
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
      // Pass event callbacks to initialize - they'll be set up BEFORE the session starts
      await serviceRef.current.initialize(config, {
        onReady: () => {
          console.log('✅ Avatar stream is ready');
          setIsConnected(true);
          setIsLoading(false);
          const video = serviceRef.current?.getVideoElement();
          if (video) {
            console.log('✅ Video element retrieved');
            setVideoElement(video);
          }
        },
        onDisconnected: () => {
          console.error('🔴 Avatar stream disconnected - THIS SHOULD NOT HAPPEN DURING SESSION');
          console.trace('Disconnect stack trace');
          // Don't set isConnected to false unless we explicitly disconnected
          // This prevents accidental disconnects from breaking the session
        },
        onStartTalking: () => {
          console.log('🗣️ Avatar started talking');
          setIsSpeaking(true);
        },
        onStopTalking: () => {
          console.log('🤐 Avatar stopped talking');
          setIsSpeaking(false);
        },
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize avatar';
      console.error('Initialization error:', err);
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
      // Use REPEAT mode to prevent avatar AI from generating its own responses
      await serviceRef.current.speak(text, 'repeat' as any);
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
      console.log('🛑 Explicitly disconnecting avatar...');
      await serviceRef.current.close();
      setIsConnected(false);
      setIsSpeaking(false);
      setVideoElement(null);
      console.log('✅ Avatar disconnected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      console.error('❌ Disconnect error:', errorMessage);
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
