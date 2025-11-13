import React, { useState } from 'react';
import { ClientPersona } from '../types';
import { DEFAULT_PERSONA } from '../utils/config';

interface PersonaConfigProps {
  onPersonaChange: (persona: ClientPersona) => void;
  disabled?: boolean;
}

export const PersonaConfig: React.FC<PersonaConfigProps> = ({
  onPersonaChange,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [persona, setPersona] = useState<ClientPersona>(DEFAULT_PERSONA);

  const handleChange = (field: keyof ClientPersona, value: string | number) => {
    const updatedPersona = { ...persona, [field]: value };
    setPersona(updatedPersona);
  };

  const handleApply = () => {
    onPersonaChange(persona);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setPersona(DEFAULT_PERSONA);
    onPersonaChange(DEFAULT_PERSONA);
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
      >
        {isExpanded ? '▼' : '▶'} Client Persona Configuration
      </button>

      {isExpanded && (
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              style={styles.input}
              value={persona.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Age:</label>
            <input
              type="number"
              style={styles.input}
              value={persona.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Occupation:</label>
            <input
              type="text"
              style={styles.input}
              value={persona.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Presenting Issue:</label>
            <textarea
              style={styles.textarea}
              value={persona.presentingIssue}
              onChange={(e) => handleChange('presentingIssue', e.target.value)}
              disabled={disabled}
              rows={2}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Background:</label>
            <textarea
              style={styles.textarea}
              value={persona.background}
              onChange={(e) => handleChange('background', e.target.value)}
              disabled={disabled}
              rows={4}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Communication Style:</label>
            <textarea
              style={styles.textarea}
              value={persona.communicationStyle}
              onChange={(e) => handleChange('communicationStyle', e.target.value)}
              disabled={disabled}
              rows={3}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={handleApply}
              disabled={disabled}
            >
              Apply Changes
            </button>
            <button
              style={styles.resetButton}
              onClick={handleReset}
              disabled={disabled}
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
    overflow: 'hidden',
  },
  toggleButton: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: 600,
    textAlign: 'left',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  form: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#aaa',
    fontSize: '14px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default PersonaConfig;
