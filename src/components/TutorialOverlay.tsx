import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Target } from 'lucide-react';
import type { AppState } from '../App';

interface TutorialOverlayProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ appState, updateAppState }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const currentStep = appState.tutorialSteps[appState.currentStep];

  useEffect(() => {
    if (appState.tutorialSteps.length > 0) {
      setShowOverlay(true);
    }
  }, [appState.tutorialSteps]);

  const nextStep = () => {
    if (appState.currentStep < appState.tutorialSteps.length - 1) {
      // Mark current step as completed
      const updatedSteps = [...appState.tutorialSteps];
      updatedSteps[appState.currentStep].completed = true;
      
      updateAppState({
        tutorialSteps: updatedSteps,
        currentStep: appState.currentStep + 1
      });
    } else {
      // Tutorial completed
      const updatedSteps = appState.tutorialSteps.map(step => ({
        ...step,
        completed: true
      }));
      
      updateAppState({
        tutorialSteps: updatedSteps
      });
      
      setTimeout(() => {
        updateAppState({
          tutorialSteps: [],
          currentStep: 0,
          currentCommand: ''
        });
        setShowOverlay(false);
      }, 2000);
    }
  };

  const previousStep = () => {
    if (appState.currentStep > 0) {
      updateAppState({
        currentStep: appState.currentStep - 1
      });
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    updateAppState({
      tutorialSteps: [],
      currentStep: 0,
      currentCommand: ''
    });
  };

  if (!showOverlay || !currentStep) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Tutorial Indicator Circle */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          left: `${currentStep.coordinates.x}px`,
          top: `${currentStep.coordinates.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          {/* Pulsing circle */}
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-ping" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400 rounded-full" />
          
          {/* Target icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Tutorial Card */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {appState.currentStep + 1}
              </div>
              <div>
                <h3 className="text-white font-semibold">{currentStep.action}</h3>
                <p className="text-white/60 text-sm">Step {appState.currentStep + 1} of {appState.tutorialSteps.length}</p>
              </div>
            </div>
            
            <button
              onClick={closeOverlay}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-white/80 mb-6">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={appState.currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {appState.tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === appState.currentStep
                      ? 'bg-blue-400'
                      : index < appState.currentStep
                        ? 'bg-green-400'
                        : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
            >
              <span>
                {appState.currentStep === appState.tutorialSteps.length - 1 ? 'Complete' : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};