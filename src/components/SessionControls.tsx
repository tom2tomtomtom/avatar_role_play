import React from 'react';

interface SessionControlsProps {
  isSessionActive: boolean;
  isRecording: boolean;
  isListening: boolean;
  sessionDuration: number;
  onStartSession: () => void;
  onEndSession: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownloadRecording: () => void;
  hasRecording: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isSessionActive,
  isRecording,
  isListening,
  sessionDuration,
  onStartSession,
  onEndSession,
  onStartRecording,
  onStopRecording,
  onDownloadRecording,
  hasRecording,
}) => {
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.timerSection}>
        <div style={styles.timer}>
          <span style={styles.timerLabel}>Session Time:</span>
          <span style={styles.timerValue}>{formatDuration(sessionDuration)}</span>
        </div>
        <div style={styles.statusIndicators}>
          {isListening && (
            <div style={styles.listeningIndicator}>
              <span style={styles.listeningDot}>●</span>
              <span>Listening</span>
            </div>
          )}
          {isRecording && (
            <div style={styles.recordingIndicator}>
              <span style={styles.recordingDot}>●</span>
              <span>Recording</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.controlsSection}>
        <div style={styles.buttonGroup}>
          {!isSessionActive ? (
            <button style={styles.primaryButton} onClick={onStartSession}>
              Start Session
            </button>
          ) : (
            <button style={styles.dangerButton} onClick={onEndSession}>
              End Session
            </button>
          )}
        </div>

        <div style={styles.buttonGroup}>
          {!isRecording ? (
            <button
              style={{...styles.button, ...styles.recordButton}}
              onClick={onStartRecording}
              disabled={!isSessionActive}
            >
              Start Recording
            </button>
          ) : (
            <button style={styles.button} onClick={onStopRecording}>
              Stop Recording
            </button>
          )}

          {hasRecording && !isRecording && (
            <button style={styles.button} onClick={onDownloadRecording}>
              Download Recording
            </button>
          )}
        </div>

      </div>
      
      {isSessionActive && (
        <div style={styles.helpText}>
          💡 Microphone is automatically managed - speak anytime the avatar isn't talking
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
  },
  timerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333',
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timerLabel: {
    color: '#aaa',
    fontSize: '14px',
  },
  timerValue: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  statusIndicators: {
    display: 'flex',
    gap: '16px',
  },
  listeningIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: 500,
  },
  listeningDot: {
    fontSize: '20px',
    animation: 'pulse 1s ease-in-out infinite',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: 500,
  },
  recordingDot: {
    fontSize: '20px',
    animation: 'pulse 1s ease-in-out infinite',
  },
  helpText: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    color: '#aaa',
    fontSize: '13px',
    textAlign: 'center',
  },
  controlsSection: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#374151',
    color: '#fff',
    transition: 'all 0.2s',
  },
  primaryButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#3b82f6',
    color: '#fff',
    transition: 'all 0.2s',
  },
  dangerButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#ef4444',
    color: '#fff',
    transition: 'all 0.2s',
  },
  recordButton: {
    backgroundColor: '#dc2626',
  },
};

export default SessionControls;
