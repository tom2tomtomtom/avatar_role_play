import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebcamView from './components/WebcamView';
import AvatarView from './components/AvatarView';
import SessionControls from './components/SessionControls';
import StatusIndicators from './components/StatusIndicators';
import PersonaConfig from './components/PersonaConfig';
import { useHeyGenAvatar } from './hooks/useHeyGenAvatar';
import { useClaudeAPI } from './hooks/useClaudeAPI';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSessionRecording } from './hooks/useSessionRecording';
import { ClientPersona, ConnectionStatus } from './types';
import { getApiKeys, DEFAULT_PERSONA, DEFAULT_AVATAR_CONFIG } from './utils/config';
import './App.css';

function App() {
  // Get API keys
  const { heygenApiKey, claudeApiKey } = getApiKeys();

  // State
  const [currentPersona, setCurrentPersona] = useState<ClientPersona>(DEFAULT_PERSONA);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    heygen: 'disconnected',
    claude: 'disconnected',
    speech: 'ready',
  });

  // Refs for video elements
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);

  // Hooks
  const avatar = useHeyGenAvatar(heygenApiKey);
  const claude = useClaudeAPI(claudeApiKey, currentPersona);
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
      claude: claude.isProcessing
        ? 'connecting'
        : claude.error
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
    claude.isProcessing,
    claude.error,
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

  // Handle speech recognition results
  useEffect(() => {
    if (speech.transcript && isSessionActive) {
      handleCounselorMessage(speech.transcript);
      speech.resetTranscript();
    }
  }, [speech.transcript, isSessionActive]);

  // Start session
  const handleStartSession = useCallback(async () => {
    try {
      // Initialize avatar
      await avatar.initialize(DEFAULT_AVATAR_CONFIG);

      // Reset Claude session with current persona
      claude.resetSession(currentPersona);

      setIsSessionActive(true);
      setSessionDuration(0);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please check your API keys and try again.');
    }
  }, [currentPersona]);

  // End session
  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);

    // Stop listening
    if (speech.isListening) {
      speech.stopListening();
    }

    // Stop recording if active
    if (recording.isRecording) {
      await recording.stopRecording();
    }

    // Disconnect avatar
    await avatar.disconnect();

    // Clear messages
    claude.clearMessages();
  }, [speech.isListening, recording.isRecording]);

  // Handle counselor message
  const handleCounselorMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !isSessionActive) return;

      try {
        // Send to Claude and get client response
        const clientResponse = await claude.sendMessage(message);

        // Make avatar speak the response
        await avatar.speak(clientResponse);
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    },
    [isSessionActive, claude, avatar]
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
      claude.resetSession(newPersona);
    }
  }, [isSessionActive]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Counseling Roleplay with Interactive Avatar</h1>
        <p>Practice counseling skills with an AI-powered client avatar</p>
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
            onStartListening={speech.startListening}
            onStopListening={speech.stopListening}
            onDownloadRecording={handleDownloadRecording}
            hasRecording={recording.recordedBlob !== null}
          />
        </div>

        {(avatar.error || claude.error || speech.error || recording.error) && (
          <div className="error-section">
            {avatar.error && <div className="error-message">Avatar: {avatar.error}</div>}
            {claude.error && <div className="error-message">Claude: {claude.error}</div>}
            {speech.error && <div className="error-message">Speech: {speech.error}</div>}
            {recording.error && <div className="error-message">Recording: {recording.error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
