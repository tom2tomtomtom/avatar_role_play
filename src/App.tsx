import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebcamView from './components/WebcamView';
import AvatarView from './components/AvatarView';
import SessionControls from './components/SessionControls';
import StatusIndicators from './components/StatusIndicators';
import PersonaConfig from './components/PersonaConfig';
import { useHeyGenAvatar } from './hooks/useHeyGenAvatar';
import { useAIChat } from './hooks/useAIChat';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSessionRecording } from './hooks/useSessionRecording';
import { ClientPersona, ConnectionStatus } from './types';
import { getApiKeys, DEFAULT_PERSONA, DEFAULT_AVATAR_CONFIG } from './utils/config';
import './App.css';

function App() {
  // Get API keys
  const { heygenApiKey, groqApiKey, claudeApiKey } = getApiKeys();

  // State
  const [currentPersona, setCurrentPersona] = useState<ClientPersona>(DEFAULT_PERSONA);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    heygen: 'disconnected',
    ai: 'disconnected',
    speech: 'ready',
  });

  // Refs for video elements
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);

  // Hooks
  const avatar = useHeyGenAvatar(heygenApiKey);
  const ai = useAIChat(groqApiKey, claudeApiKey, currentPersona);
  const speech = useSpeechRecognition();
  const recording = useSessionRecording();

  // Update connection status
  useEffect(() => {
    setConnectionStatus({
      heygen: avatar.isLoading
        ? 'connecting'
        : avatar.isConnected
        ? 'connected'
        : avatar.error
        ? 'error'
        : 'disconnected',
      ai: ai.isProcessing
        ? 'connecting'
        : ai.error
        ? 'error'
        : 'connected',
      speech: speech.error
        ? 'error'
        : !speech.isSupported
        ? 'not-supported'
        : speech.isListening
        ? 'listening'
        : 'ready',
    });
  }, [
    avatar.isLoading,
    avatar.isConnected,
    avatar.error,
    ai.isProcessing,
    ai.error,
    speech.error,
    speech.isSupported,
    speech.isListening,
  ]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  // Handle speech recognition results (only when avatar is NOT speaking)
  useEffect(() => {
    if (speech.transcript && isSessionActive && !avatar.isSpeaking) {
      console.log('Speech recognized:', speech.transcript);
      handleUserMessage(speech.transcript);
      speech.resetTranscript();
    } else if (speech.transcript && avatar.isSpeaking) {
      console.log('Ignoring speech while avatar is speaking:', speech.transcript);
      speech.resetTranscript(); // Clear it to prevent processing later
    }
  }, [speech.transcript, isSessionActive, avatar.isSpeaking]);
  
  // Auto-manage speech recognition based on session and avatar state
  useEffect(() => {
    if (!isSessionActive) {
      // Session not active - stop listening
      if (speech.isListening) {
        console.log('🎤 Session ended - stopping speech recognition');
        speech.stopListening();
      }
      return;
    }

    // Session is active
    if (avatar.isSpeaking) {
      // Avatar is speaking - pause listening to avoid feedback
      if (speech.isListening) {
        console.log('🤐 Avatar speaking - pausing speech recognition');
        speech.stopListening();
      }
    } else {
      // Avatar not speaking - start/resume listening
      if (!speech.isListening && avatar.isConnected) {
        console.log('🎤 Auto-starting speech recognition');
        speech.startListening();
      }
    }
  }, [isSessionActive, avatar.isSpeaking, avatar.isConnected, speech.isListening]);

  // Start session
  const handleStartSession = useCallback(async () => {
    // Prevent multiple session creation
    if (isSessionActive || avatar.isLoading) {
      console.log('Session already active or loading, ignoring duplicate start request');
      return;
    }
    
    try {
      console.log('Starting new session...');
      
      // Initialize avatar
      await avatar.initialize(DEFAULT_AVATAR_CONFIG);

      // Reset AI session with current persona
      ai.resetSession(currentPersona);

      setIsSessionActive(true);
      setSessionDuration(0);
      
      console.log('Session started successfully');
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please check your API keys and try again.');
    }
  }, [currentPersona, isSessionActive, avatar.isLoading]);

  // End session
  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);

    // Speech recognition will auto-stop via useEffect
    
    // Stop recording if active
    if (recording.isRecording) {
      await recording.stopRecording();
    }

    // Disconnect avatar
    await avatar.disconnect();

    // Clear messages
    ai.clearMessages();
  }, [speech.isListening, recording.isRecording]);

  // Handle user message
  const handleUserMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !isSessionActive) return;

      console.log('🎯 Processing user message:', message);

      try {
        // Send to AI and get response
        console.log(`📤 Sending to ${ai.aiProvider.toUpperCase()}...`);
        const response = await ai.sendMessage(message);
        console.log(`📥 ${ai.aiProvider.toUpperCase()} response received:`, response.substring(0, 200) + '...');
        console.log('📊 Response length:', response.length, 'characters');

        // Make avatar speak the response
        console.log('🎤 Sending text to avatar to speak...');
        await avatar.speak(response);
        console.log('✅ Avatar.speak() completed');
      } catch (error) {
        console.error('❌ Failed to process message:', error);
      }
    },
    [isSessionActive, ai, avatar]
  );

  // Recording controls
  const handleStartRecording = useCallback(async () => {
    if (!webcamVideoRef.current || !avatarVideoRef.current) {
      alert('Video feeds not ready. Please try again.');
      return;
    }

    try {
      await recording.startRecording(webcamVideoRef.current, avatarVideoRef.current);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check permissions.');
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    try {
      await recording.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, []);

  const handleDownloadRecording = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `counseling-session-${timestamp}.webm`;
    recording.downloadRecording(filename);
  }, []);

  // Persona change handler
  const handlePersonaChange = useCallback((newPersona: ClientPersona) => {
    setCurrentPersona(newPersona);
    if (isSessionActive) {
      ai.resetSession(newPersona);
    }
  }, [isSessionActive]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Conversation Partner</h1>
        <p>Have natural conversations with an AI-powered avatar</p>
      </header>

      <main className="app-main">
        <div className="status-section">
          <StatusIndicators status={connectionStatus} />
        </div>

        <div className="config-section">
          <PersonaConfig
            onPersonaChange={handlePersonaChange}
            disabled={isSessionActive}
          />
        </div>

        <div className="video-section">
          <WebcamView onVideoReady={(video) => (webcamVideoRef.current = video)} />
          <AvatarView
            videoElement={avatar.videoElement}
            isConnected={avatar.isConnected}
            isSpeaking={avatar.isSpeaking}
            onVideoReady={(video) => (avatarVideoRef.current = video)}
          />
        </div>

        <div className="controls-section">
          <SessionControls
            isSessionActive={isSessionActive}
            isRecording={recording.isRecording}
            isListening={speech.isListening}
            sessionDuration={sessionDuration}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onDownloadRecording={handleDownloadRecording}
            hasRecording={recording.recordedBlob !== null}
          />
        </div>

        {(avatar.error || ai.error || speech.error || recording.error) && (
          <div className="error-section">
            {avatar.error && <div className="error-message">Avatar: {avatar.error}</div>}
            {ai.error && <div className="error-message">AI ({ai.aiProvider}): {ai.error}</div>}
            {speech.error && <div className="error-message">Speech: {speech.error}</div>}
            {recording.error && <div className="error-message">Recording: {recording.error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
