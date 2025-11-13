import React, { useEffect, useRef, useState } from 'react';

interface WebcamViewProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
}

export const WebcamView: React.FC<WebcamViewProps> = ({ onVideoReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false, // Audio is handled separately for recording
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsLoading(false);
            if (onVideoReady && videoRef.current) {
              onVideoReady(videoRef.current);
            }
          };
        }
      } catch (err) {
        console.error('Failed to access webcam:', err);
        setError('Failed to access webcam. Please check permissions.');
        setIsLoading(false);
      }
    };

    initializeWebcam();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVideoReady]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Counselor (You)</h3>
      </div>
      <div style={styles.videoContainer}>
        {isLoading && (
          <div style={styles.loading}>
            <p>Loading webcam...</p>
          </div>
        )}
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
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
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#aaa',
    textAlign: 'center',
  },
  error: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ff6b6b',
    textAlign: 'center',
    padding: '20px',
  },
};

export default WebcamView;
