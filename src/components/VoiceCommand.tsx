import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Loader } from 'lucide-react';
import type { AppState } from '../App';
import { processVoiceCommand } from '../services/geminiService';

interface VoiceCommandProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  apiKey: string;
}

export const VoiceCommand: React.FC<VoiceCommandProps> = ({ appState, updateAppState, apiKey }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

  const handleVoiceCommand = async (command: string) => {
    if (!appState.isScreenSharing || !appState.screenStream) {
      alert('Please start screen sharing first to use voice commands.');
      return;
    }

    updateAppState({ 
      currentCommand: command,
      isProcessing: true 
    });

    try {
      const response = await processVoiceCommand(command, apiKey);
      
      if (response) {
        updateAppState({
          tutorialSteps: response.steps,
          currentStep: 0,
          isProcessing: false
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      updateAppState({ isProcessing: false });
    }
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
          <div className="space-y-2">
            {[
              "How to delete a photo in gallery",
              "Show me how to send an email",
              "How to create a new folder",
              "Help me change settings",
              "How to save this document"
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
      </div>
    </div>
  );
};