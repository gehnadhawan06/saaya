import React, { useState, useEffect } from 'react';
import { ScreenShare } from './components/ScreenShare';
import { VoiceCommand } from './components/VoiceCommand';
import { ControlPanel } from './components/ControlPanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { StatusBar } from './components/StatusBar';
import { Monitor, Mic, Brain, Circle } from 'lucide-react';

export interface TutorialStep {
  id: string;
  command: string;
  description: string;
  coordinates: { x: number; y: number };
  action: string;
  completed: boolean;
}

export interface AppState {
  isScreenSharing: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentCommand: string;
  tutorialSteps: TutorialStep[];
  currentStep: number;
  screenStream: MediaStream | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    isScreenSharing: false,
    isListening: false,
    isProcessing: false,
    currentCommand: '',
    tutorialSteps: [],
    currentStep: 0,
    screenStream: null,
  });

  // Hardcode the API key here
  const [apiKey] = useState('YOUR_HARDCODED_API_KEY_HERE');

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Screen Tutorial</h1>
                <p className="text-white/60 text-sm">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>

            <StatusBar appState={appState} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Control Panel */}
        <ControlPanel 
          appState={appState} 
          updateAppState={updateAppState}
          apiKey={apiKey}
        />

        {/* Screen Share and Voice Control */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Screen Share Section */}
          <div className="lg:col-span-2">
            <ScreenShare 
              appState={appState} 
              updateAppState={updateAppState}
            />
          </div>

          {/* Voice Command Section */}
          <div className="space-y-6">
            <VoiceCommand 
              appState={appState} 
              updateAppState={updateAppState}
              apiKey={apiKey}
            />

            {/* Tutorial Steps */}
            {appState.tutorialSteps.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Tutorial Steps</h3>
                <div className="space-y-3">
                  {appState.tutorialSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        index === appState.currentStep 
                          ? 'bg-blue-500/20 border border-blue-400/30' 
                          : 'bg-white/5'
                      } ${step.completed ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : index === appState.currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{step.action}</p>
                        <p className="text-white/60 text-xs">{step.description}</p>
                      </div>
                      {index === appState.currentStep && (
                        <Circle className="w-4 h-4 text-blue-400 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tutorial Overlay */}
        {appState.isScreenSharing && appState.tutorialSteps.length > 0 && (
          <TutorialOverlay
            appState={appState}
            updateAppState={updateAppState}
          />
        )}
      </main>
    </div>
  );
}

export default App;