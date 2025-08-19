import React from 'react';
import { Wifi, Brain, Mic, Monitor } from 'lucide-react';
import type { AppState } from '../App';

interface StatusBarProps {
  appState: AppState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ appState }) => {
  const getStatusColor = (isActive: boolean, isProcessing = false) => {
    if (isProcessing) return 'text-yellow-400';
    return isActive ? 'text-green-400' : 'text-gray-400';
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Screen Share Status */}
      <div className="flex items-center space-x-2">
        <Monitor className={`w-4 h-4 ${getStatusColor(appState.isScreenSharing)}`} />
        <span className={`text-sm ${getStatusColor(appState.isScreenSharing)}`}>
          {appState.isScreenSharing ? 'Screen Active' : 'Screen Inactive'}
        </span>
      </div>

      {/* Voice Status */}
      <div className="flex items-center space-x-2">
        <Mic className={`w-4 h-4 ${getStatusColor(appState.isListening, appState.isProcessing)}`} />
        <span className={`text-sm ${getStatusColor(appState.isListening, appState.isProcessing)}`}>
          {appState.isProcessing ? 'Processing' : appState.isListening ? 'Listening' : 'Voice Ready'}
        </span>
      </div>

      {/* AI Status */}
      <div className="flex items-center space-x-2">
        <Brain className={`w-4 h-4 ${getStatusColor(true)}`} />
        <span className="text-sm text-green-400">AI Ready</span>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <Wifi className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400">Connected</span>
      </div>
    </div>
  );
};