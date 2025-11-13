/**
 * Analyzes text sentiment and suggests appropriate voice emotion and rate
 */

export interface VoiceSettings {
  emotion: 'friendly' | 'serious' | 'cheerful' | 'calm' | 'soothing' | 'broadcast';
  rate: number; // 0.8 to 1.2 recommended
}

export function detectEmotionFromText(text: string): VoiceSettings {
  const lowerText = text.toLowerCase();
  
  // Excited/enthusiastic patterns
  if (
    lowerText.includes('!') ||
    lowerText.includes('wow') ||
    lowerText.includes('amazing') ||
    lowerText.includes('awesome') ||
    lowerText.includes('love it') ||
    lowerText.includes('so cool')
  ) {
    return {
      emotion: 'cheerful',
      rate: 1.1, // Slightly faster when excited
    };
  }
  
  // Serious/concerned patterns
  if (
    lowerText.includes('worried') ||
    lowerText.includes('concerned') ||
    lowerText.includes('serious') ||
    lowerText.includes('problem') ||
    lowerText.includes('difficult')
  ) {
    return {
      emotion: 'serious',
      rate: 0.95, // Slightly slower when serious
    };
  }
  
  // Calm/soothing patterns
  if (
    lowerText.includes('relax') ||
    lowerText.includes('calm') ||
    lowerText.includes('peaceful') ||
    lowerText.includes('take it easy')
  ) {
    return {
      emotion: 'soothing',
      rate: 0.9, // Slower for calming effect
    };
  }
  
  // Question patterns - more engaging
  if (lowerText.includes('?')) {
    return {
      emotion: 'friendly',
      rate: 1.05, // Slightly faster for questions
    };
  }
  
  // Default: friendly and natural
  return {
    emotion: 'friendly',
    rate: 1.0,
  };
}

/**
 * Vary speech rate slightly to sound more natural
 * Adds subtle randomness to prevent robotic consistency
 */
export function addNaturalVariation(baseRate: number): number {
  // Add ±5% variation
  const variation = (Math.random() - 0.5) * 0.1;
  const adjustedRate = baseRate + variation;
  
  // Clamp between 0.8 and 1.2
  return Math.max(0.8, Math.min(1.2, adjustedRate));
}

