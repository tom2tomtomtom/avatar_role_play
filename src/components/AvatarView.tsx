import React, { useEffect, useRef } from 'react';

interface AvatarViewProps {
  videoElement: HTMLVideoElement | null;
  isConnected: boolean;
  isSpeaking: boolean;
  onVideoReady?: (video: HTMLVideoElement) => void;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  videoElement,
  isConnected,
  isSpeaking,
  onVideoReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoElement && containerRef.current && isConnected) {
      // Clear container
      containerRef.current.innerHTML = '';

      // Append the HeyGen video element
      containerRef.current.appendChild(videoElement);
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';

      if (onVideoReady) {
        onVideoReady(videoElement);
      }
    }
  }, [videoElement, isConnected, onVideoReady]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Client Avatar</h3>
        {isSpeaking && (
          <span style={styles.speakingIndicator}>Speaking...</span>
        )}
      </div>
      <div style={styles.videoContainer} ref={containerRef}>
        {!isConnected && (
          <div style={styles.placeholder}>
            <p>Avatar not connected</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #333',
  },
  header: {
    padding: '12px 16px',
    backgroundColor: '#2a2a2a',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
  },
  speakingIndicator: {
    fontSize: '12px',
    color: '#4ade80',
    fontWeight: 500,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#aaa',
    textAlign: 'center',
  },
};

export default AvatarView;
