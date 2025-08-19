import React from 'react';
import { Settings, RefreshCw, Trash2, Users } from 'lucide-react';
import type { AppState } from '../App';

interface ControlPanelProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  apiKey: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ appState, updateAppState, apiKey }) => {
  const clearTutorial = () => {
    updateAppState({
      tutorialSteps: [],
      currentStep: 0,
      currentCommand: ''
    });
  };

  const resetApp = () => {
    if (appState.screenStream) {
      appState.screenStream.getTracks().forEach(track => track.stop());
    }
    
    updateAppState({
      isScreenSharing: false,
      isListening: false,
      isProcessing: false,
      currentCommand: '',
      tutorialSteps: [],
      currentStep: 0,
      screenStream: null
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Control Panel</h2>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${appState.isScreenSharing ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span>Screen: {appState.isScreenSharing ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${appState.isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`} />
              <span>Voice: {appState.isListening ? 'Listening' : 'Idle'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Steps: {appState.tutorialSteps.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {appState.tutorialSteps.length > 0 && (
            <button
              onClick={clearTutorial}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg font-medium transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Tutorial</span>
            </button>
          )}
          
          <button
            onClick={resetApp}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {appState.tutorialSteps.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm font-medium">Tutorial Progress</span>
            <span className="text-white/60 text-sm">
              Step {appState.currentStep + 1} of {appState.tutorialSteps.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((appState.currentStep + 1) / appState.tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};