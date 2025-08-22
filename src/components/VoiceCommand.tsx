import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Loader } from 'lucide-react';
import type { AppState } from '../App';
import { processVoiceCommand, generateStepGuidance } from '../services/geminiService';

interface VoiceCommandProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  apiKey: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({ appState, updateAppState, apiKey }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [voiceGuidance, setVoiceGuidance] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      updateAppState({ isListening: true });
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        handleVoiceCommand(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      updateAppState({ isListening: false });
    };

    recognition.onend = () => {
      updateAppState({ isListening: false });
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Voice guidance effect
  useEffect(() => {
    if (appState.tutorialSteps.length > 0 && appState.currentStep < appState.tutorialSteps.length) {
      const currentStepData = appState.tutorialSteps[appState.currentStep];
      provideVoiceGuidance(currentStepData.action, currentStepData.description);
    }
  }, [appState.currentStep, appState.tutorialSteps]);

  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command received:', command);
    console.log('App state - isScreenSharing:', appState.isScreenSharing);
    console.log('App state - screenStream:', appState.screenStream);
    
    // Temporary override for testing - remove this later
    const hasScreenShare = appState.isScreenSharing || appState.screenStream || true; // Force true for testing
    
    if (!hasScreenShare) {
      const message = 'Please start screen sharing first to use voice commands.';
      speakText(message);
      setVoiceGuidance(message);
      return;
    }

    updateAppState({ 
      currentCommand: command,
      isProcessing: true 
    });

    try {
      // Process the command and determine if we need to navigate to a specific website
      const response = await processVoiceCommand(command, apiKey);
      
      if (response) {
        // Check if this is a web-based task (like Gmail)
        const websiteTarget = detectWebsiteTarget(command);
        
        if (websiteTarget) {
          // Provide guidance to navigate to the website first
          speakText(`To ${command}, let's first navigate to ${websiteTarget.name}. Please open your browser and go to ${websiteTarget.url}`);
          
          updateAppState({
            currentWebsite: websiteTarget.url,
            tutorialSteps: [
              {
                id: 'navigate-to-site',
                command,
                description: `Navigate to ${websiteTarget.name}`,
                coordinates: { x: 400, y: 300 },
                action: `Open ${websiteTarget.url}`,
                completed: false
              },
              ...response.steps
            ],
            currentStep: 0,
            isProcessing: false
          });
        } else {
          updateAppState({
            tutorialSteps: response.steps,
            currentStep: 0,
            isProcessing: false
          });
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakText('Sorry, I encountered an error processing your command. Please try again.');
      updateAppState({ isProcessing: false });
    }
  };

  const detectWebsiteTarget = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('gmail') || lowerCommand.includes('send email') || lowerCommand.includes('compose email')) {
      return { name: 'Gmail', url: 'https://gmail.com' };
    }
    if (lowerCommand.includes('google docs') || lowerCommand.includes('document')) {
      return { name: 'Google Docs', url: 'https://docs.google.com' };
    }
    if (lowerCommand.includes('youtube')) {
      return { name: 'YouTube', url: 'https://youtube.com' };
    }
    if (lowerCommand.includes('facebook')) {
      return { name: 'Facebook', url: 'https://facebook.com' };
    }
    if (lowerCommand.includes('twitter') || lowerCommand.includes('x.com')) {
      return { name: 'Twitter/X', url: 'https://x.com' };
    }
    
    return null;
  };

  const provideVoiceGuidance = async (action: string, description: string) => {
    const guidance = await generateStepGuidance(action, description, apiKey);
    setVoiceGuidance(guidance);
    speakText(guidance);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextStep = () => {
    if (appState.currentStep < appState.tutorialSteps.length - 1) {
      updateAppState({ currentStep: appState.currentStep + 1 });
    } else {
      speakText('Congratulations! You have completed all the steps.');
      updateAppState({ tutorialSteps: [], currentStep: 0 });
    }
  };

  const repeatGuidance = () => {
    if (voiceGuidance) {
      speakText(voiceGuidance);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const startListening = () => {
    if (recognitionRef.current && !appState.isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && appState.isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          <MicOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Voice Recognition Not Supported</h3>
          <p className="text-white/60 text-sm">
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Mic className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-semibold text-white">Voice Commands</h2>
      </div>

      <div className="space-y-4">
        {/* Voice Control Button */}
        <div className="text-center">
          <button
            onClick={appState.isListening ? stopListening : startListening}
            disabled={appState.isProcessing || !appState.isScreenSharing || !appState.screenStream}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
              appState.isListening
                ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25'
                : 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25'
            } ${
              (appState.isProcessing || !appState.isScreenSharing || !appState.screenStream) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
            }`}
          >
            {appState.isProcessing ? (
              <Loader className="w-8 h-8 text-white animate-spin" />
            ) : appState.isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          <p className="text-white/60 text-sm mt-3">
            {appState.isProcessing 
              ? 'Processing with AI...'
              : appState.isListening 
                ? 'Listening...'
                : (!appState.isScreenSharing || !appState.screenStream)
                  ? 'Start screen sharing first'
                  : 'Click to start voice command'
            }
          </p>
        </div>

        {/* Transcript Display */}
        {(transcript || appState.currentCommand) && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white/80 text-sm font-medium">
                  {appState.isProcessing ? 'Processing:' : 'You said:'}
                </p>
                <p className="text-white mt-1">
                  {transcript || appState.currentCommand}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Example Commands */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white/80 font-medium mb-3">Try these commands:</h4>
          
          {/* Test Phantom AI Button */}
          <button
            onClick={() => {
              updateAppState({ 
                currentCommand: 'How to compose an email in Gmail',
                detectedApplication: 'Gmail'
              });
            }}
            className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
          >
            🎭 Test Phantom AI (Gmail)
          </button>
          
          <div className="space-y-2">
            {[
              "How to compose an email in Gmail",
              "Show me how to create a Google document",
              "How to delete a photo in gallery",
              "Help me send a message on Facebook",
              "How to create a new folder"
            ].map((command, index) => (
              <button
                key={index}
                onClick={() => handleVoiceCommand(command)}
                disabled={appState.isProcessing || !appState.isScreenSharing || !appState.screenStream}
                className="block w-full text-left text-white/60 hover:text-white text-sm p-2 rounded hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{command}"
              </button>
            ))}
          </div>
        </div>

        {/* Current Tutorial Progress */}
        {appState.tutorialSteps.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white/80 font-medium mb-3">Tutorial Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">
                  Step {appState.currentStep + 1} of {appState.tutorialSteps.length}
                </span>
                <span className="text-green-400">
                  {Math.round(((appState.currentStep) / appState.tutorialSteps.length) * 100)}% Complete
                </span>
              </div>
              
              {appState.tutorialSteps[appState.currentStep] && (
                <div className="bg-white/5 p-3 rounded">
                  <p className="text-white font-medium text-sm mb-1">
                    {appState.tutorialSteps[appState.currentStep].action}
                  </p>
                  <p className="text-white/70 text-xs">
                    {appState.tutorialSteps[appState.currentStep].description}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={repeatGuidance}
                  className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                >
                  🔊 Repeat
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                >
                  ✓ Done
                </button>
                <button
                  onClick={skipStep}
                  className="flex-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                >
                  ⏭ Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Guidance Display */}
        {voiceGuidance && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🎙</span>
              </div>
              <div>
                <p className="text-green-400 text-sm font-medium mb-1">AI Voice Guidance</p>
                <p className="text-white text-sm">{voiceGuidance}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};