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
  const videoAttachedRef = useRef<boolean>(false);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log('AvatarView effect:', { 
      hasVideo: !!videoElement, 
      isConnected, 
      attached: videoAttachedRef.current,
      sameVideo: currentVideoRef.current === videoElement
    });
    
    // Only attach if we have a NEW video element
    if (videoElement && containerRef.current && isConnected && 
        !videoAttachedRef.current && currentVideoRef.current !== videoElement) {
      // Clear container only once
      containerRef.current.innerHTML = '';

      // Append the HeyGen video element
      containerRef.current.appendChild(videoElement);
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      
      // Add background to cover green screen
      containerRef.current.style.background = 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
      
      // Optional: Try to remove green screen using CSS filter (experimental)
      // videoElement.style.filter = 'saturate(0.8)';
      
      currentVideoRef.current = videoElement;
      videoAttachedRef.current = true;
      
      console.log('✅ Video element attached');

      if (onVideoReady) {
        onVideoReady(videoElement);
      }
    }
    
    // Clean up on disconnect
    if (!isConnected && videoAttachedRef.current) {
      videoAttachedRef.current = false;
      currentVideoRef.current = null;
      console.log('🔴 Video detached due to disconnect');
    }
  }, [videoElement, isConnected, onVideoReady]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Conversation Partner</h3>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple gradient background
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
