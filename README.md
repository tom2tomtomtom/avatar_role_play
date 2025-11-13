# Counseling Roleplay with Interactive Avatar

A web application for practicing counseling skills with an AI-powered client avatar. This application integrates HeyGen's Interactive Avatar API for realistic visual representation and Claude API for intelligent, contextually-aware client responses.

## Features

- **Real-time Interactive Avatar**: HeyGen streaming avatar with natural voice and expressions
- **AI-Powered Client Responses**: Claude Sonnet 4 maintains consistent client persona throughout session
- **Voice Recognition**: Web Speech API captures counselor's voice input
- **Session Recording**: Records both counselor webcam and avatar side-by-side
- **Customizable Client Personas**: Configure client background, presenting issues, and communication style
- **Professional UI**: Clean, intuitive interface with status indicators and controls

## Demo Video

[Insert demo video or GIF here]

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Avatar**: HeyGen Streaming Avatar SDK
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Speech Recognition**: Web Speech API
- **Recording**: MediaRecorder API with Canvas composition

### Key Components

```
src/
├── components/          # UI components
│   ├── AvatarView.tsx   # HeyGen avatar display
│   ├── WebcamView.tsx   # User webcam feed
│   ├── SessionControls.tsx  # Session and recording controls
│   ├── StatusIndicators.tsx # Connection status display
│   └── PersonaConfig.tsx    # Client persona configuration
├── hooks/               # Custom React hooks
│   ├── useHeyGenAvatar.ts   # Avatar management
│   ├── useClaudeAPI.ts      # Claude API integration
│   ├── useSpeechRecognition.ts  # Speech-to-text
│   └── useSessionRecording.ts   # Recording functionality
├── services/            # Service layer
│   ├── heygenService.ts     # HeyGen SDK wrapper
│   ├── claudeService.ts     # Claude API client
│   └── recordingService.ts  # Recording logic
├── types/               # TypeScript definitions
└── utils/               # Configuration and utilities
```

## Prerequisites

- Node.js 18+ and npm
- HeyGen API account and API key
- Anthropic Claude API key
- Modern web browser with:
  - WebRTC support
  - Web Speech API support (Chrome/Edge recommended)
  - MediaRecorder API support

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd avatar_role_play
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

#### Get HeyGen API Key

1. Sign up at [HeyGen](https://app.heygen.com/)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Note your Avatar ID and Voice ID from the dashboard

#### Get Claude API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (it will only be shown once)

#### Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
VITE_HEYGEN_API_KEY=your_heygen_api_key_here
VITE_HEYGEN_AVATAR_ID=your_avatar_id_here
VITE_HEYGEN_VOICE_ID=your_voice_id_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

### 4. Run the Application

#### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

### Starting a Session

1. **Configure Client Persona** (optional)
   - Click "Client Persona Configuration" to expand
   - Modify name, age, occupation, presenting issue, background, and communication style
   - Click "Apply Changes" or use "Reset to Default"

2. **Check Status Indicators**
   - Ensure all systems show "Connected" or "Ready"
   - Grant microphone and webcam permissions when prompted

3. **Start Session**
   - Click "Start Session"
   - Wait for avatar to connect (status will show "Connected")

### During the Session

1. **Communicate with Client**
   - Click "Start Listening" to activate voice recognition
   - Speak your counselor responses
   - The system will:
     - Transcribe your speech
     - Send to Claude for processing
     - Generate client response
     - Have avatar speak the response

2. **Record the Session**
   - Click "Start Recording" to begin recording
   - Recording captures both your webcam and the avatar side-by-side
   - Click "Stop Recording" when finished

3. **Download Recording**
   - After stopping, click "Download Recording"
   - File will be saved as `counseling-session-[timestamp].webm`

### Ending the Session

1. Click "Stop Listening" if active
2. Click "Stop Recording" if recording
3. Click "End Session"
4. Download your recording before starting a new session

## Default Client Persona: Sarah

The application comes with a default client persona:

- **Name**: Sarah
- **Age**: 28
- **Occupation**: Graphic Designer
- **Presenting Issue**: Career anxiety and work-life balance struggles
- **Background**: Recently promoted to senior designer. Experiencing imposter syndrome and feeling overwhelmed. Long work hours causing relationship strain.
- **Communication Style**: Initially guarded, opens up with empathetic prompting. Tends to minimize feelings.

## Customizing Client Personas

You can create custom client personas to practice different counseling scenarios:

### Example Personas

**Anxious College Student**
```
Name: Alex, 20, College Student
Presenting Issue: Test anxiety and academic pressure
Background: Pre-med student struggling with perfectionism
Communication Style: Fast-paced, scattered thoughts, seeks reassurance
```

**Recently Divorced Professional**
```
Name: Michael, 45, Financial Analyst
Presenting Issue: Coping with divorce and co-parenting challenges
Background: Married 15 years, two children, initiated divorce
Communication Style: Analytical, avoids emotions initially, intellectual defense
```

**Person with Depression**
```
Name: Emma, 32, Teacher
Presenting Issue: Depression and loss of motivation
Background: Struggling for 6 months, affecting work and relationships
Communication Style: Low energy, speaks slowly, hopeless outlook
```

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Web Speech API | ✅ | ✅ | ❌ | ✅ |
| MediaRecorder | ✅ | ✅ | ✅ | ⚠️ |
| WebRTC | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Chrome or Edge for best compatibility

## Troubleshooting

### Avatar Not Connecting

- Verify HeyGen API key is correct
- Check avatar ID and voice ID are valid
- Ensure stable internet connection
- Check browser console for detailed errors

### Speech Recognition Not Working

- Use Chrome or Edge browser
- Grant microphone permissions
- Check microphone is working in system settings
- Speak clearly and at normal pace

### Recording Fails

- Grant both camera and microphone permissions
- Ensure both video feeds are active
- Check available disk space
- Try a different browser if issues persist

### Claude API Errors

- Verify API key is correct and active
- Check API rate limits and usage
- Ensure proper network connectivity
- Review browser console for error details

## Security Considerations

### API Keys

⚠️ **IMPORTANT**: This application uses `dangerouslyAllowBrowser: true` for the Claude API client. This is **NOT recommended for production**.

**For Production**:
- Create a backend proxy server
- Store API keys server-side
- Never expose API keys in client-side code
- Use environment variables properly

### Permissions

The application requires:
- **Microphone**: For speech recognition
- **Camera**: For webcam recording
- Ensure users understand what's being recorded

### Data Privacy

- Recordings are stored locally only
- No data is sent to external servers except:
  - HeyGen API (for avatar)
  - Claude API (for AI responses)
- Review HeyGen and Anthropic privacy policies

## Performance Optimization

### Recommendations

- Use wired internet connection for stable avatar streaming
- Close unnecessary browser tabs
- Ensure adequate system resources (RAM, CPU)
- Use HD webcam for better recording quality

### Recording Settings

Adjust in `src/utils/config.ts`:

```typescript
export const RECORDING_CONFIG: RecordingConfig = {
  videoBitsPerSecond: 2500000,  // Adjust for quality/size tradeoff
  audioBitsPerSecond: 128000,
  mimeType: 'video/webm;codecs=vp9,opus'
};
```

## API Costs

### HeyGen

- Streaming avatar costs vary by usage
- Check [HeyGen Pricing](https://www.heygen.com/pricing)

### Claude API

- Model: claude-sonnet-4-20250514
- Pricing per 1M tokens:
  - Input: Check Anthropic pricing
  - Output: Check Anthropic pricing
- Typical session (~20 interactions): ~$0.10-0.50

## Development

### Project Structure

```
avatar_role_play/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities and config
│   ├── App.tsx         # Main app component
│   ├── App.css         # Global styles
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── .env.example        # Environment template
```

### Adding New Features

1. **New Client Persona Fields**: Update `ClientPersona` type in `src/types/index.ts`
2. **Custom Avatar Behaviors**: Modify `HeyGenService` in `src/services/heygenService.ts`
3. **Enhanced Prompting**: Adjust `generateSystemPrompt` in `src/utils/config.ts`
4. **UI Customization**: Edit component styles or add new components

### Running Tests

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Specify your license here]

## Acknowledgments

- [HeyGen](https://www.heygen.com/) for Interactive Avatar API
- [Anthropic](https://www.anthropic.com/) for Claude API
- [Vite](https://vitejs.dev/) for build tooling
- [React](https://react.dev/) for UI framework

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API documentation for HeyGen and Claude

## Roadmap

- [ ] Multi-language support
- [ ] Session playback and review
- [ ] Conversation transcript export
- [ ] Supervisor feedback integration
- [ ] Performance metrics and analytics
- [ ] Mobile app version
- [ ] Backend proxy for production deployment

---

Built with ❤️ for counseling education and practice