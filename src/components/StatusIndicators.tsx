import React from 'react';
import { ConnectionStatus } from '../types';

interface StatusIndicatorsProps {
  status: ConnectionStatus;
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({ status }) => {
  const getStatusColor = (
    state: 'connected' | 'connecting' | 'disconnected' | 'error' | 'ready' | 'listening' | 'not-supported'
  ): string => {
    switch (state) {
      case 'connected':
      case 'ready':
        return '#10b981';
      case 'connecting':
      case 'listening':
        return '#f59e0b';
      case 'disconnected':
        return '#6b7280';
      case 'error':
      case 'not-supported':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (
    state: 'connected' | 'connecting' | 'disconnected' | 'error' | 'ready' | 'listening' | 'not-supported'
  ): string => {
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'ready':
        return 'Ready';
      case 'listening':
        return 'Listening';
      case 'not-supported':
        return 'Not Supported';
      default:
        return 'Unknown';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.statusItem}>
        <span style={styles.label}>HeyGen:</span>
        <div style={styles.statusBadge}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: getStatusColor(status.heygen),
            }}
          />
          <span style={styles.statusText}>{getStatusText(status.heygen)}</span>
        </div>
      </div>

      <div style={styles.statusItem}>
        <span style={styles.label}>Claude:</span>
        <div style={styles.statusBadge}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: getStatusColor(status.claude),
            }}
          />
          <span style={styles.statusText}>{getStatusText(status.claude)}</span>
        </div>
      </div>

      <div style={styles.statusItem}>
        <span style={styles.label}>Speech:</span>
        <div style={styles.statusBadge}>
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: getStatusColor(status.speech),
            }}
          />
          <span style={styles.statusText}>{getStatusText(status.speech)}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '24px',
    padding: '16px 20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    color: '#aaa',
    fontSize: '14px',
    fontWeight: 500,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '4px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 500,
  },
};

export default StatusIndicators;
