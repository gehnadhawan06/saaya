import React, { useState, useEffect } from 'react';
import { MousePointer2, Target, CheckCircle, Circle } from 'lucide-react';

interface PhantomStep {
  id: string;
  title: string;
  description: string;
  target: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    selector?: string;
  };
  action: 'click' | 'type' | 'scroll' | 'hover' | 'wait';
  value?: string;
  completed: boolean;
}

interface PhantomAIProps {
  isActive: boolean;
  currentApp: string;
  command: string;
  onStepComplete: (stepId: string) => void;
  onComplete: () => void;
}

export const PhantomAI: React.FC<PhantomAIProps> = ({
  isActive,
  currentApp,
  command,
  onStepComplete,
  onComplete
}) => {
  const [steps, setSteps] = useState<PhantomStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate steps based on app and command
  useEffect(() => {
    if (isActive && command) {
      const generatedSteps = generatePhantomSteps(currentApp, command);
      setSteps(generatedSteps);
      setCurrentStep(0);
      setIsPlaying(true);
    }
  }, [isActive, currentApp, command]);

  const generatePhantomSteps = (app: string, cmd: string): PhantomStep[] => {
    const command = cmd.toLowerCase();
    
    if (app === 'Gmail' && command.includes('compose')) {
      return [
        {
          id: 'step1',
          title: 'Click Compose',
          description: 'Click the "Compose" button to start a new email',
          target: { x: 20, y: 120, width: 140, height: 48 },
          action: 'click',
          completed: false
        },
        {
          id: 'step2',
          title: 'Enter Recipient',
          description: 'Click in the "To" field and enter the recipient email',
          target: { x: 100, y: 180, width: 400, height: 32 },
          action: 'click',
          completed: false
        },
        {
          id: 'step3',
          title: 'Add Subject',
          description: 'Click in the subject field and enter your subject',
          target: { x: 100, y: 220, width: 400, height: 32 },
          action: 'type',
          value: 'Your email subject here',
          completed: false
        },
        {
          id: 'step4',
          title: 'Write Message',
          description: 'Click in the message body and write your email',
          target: { x: 100, y: 280, width: 600, height: 300 },
          action: 'type',
          value: 'Your message content here...',
          completed: false
        },
        {
          id: 'step5',
          title: 'Send Email',
          description: 'Click the Send button to send your email',
          target: { x: 100, y: 620, width: 80, height: 36 },
          action: 'click',
          completed: false
        }
      ];
    }
    
    if (app === 'Google Docs' && command.includes('document')) {
      return [
        {
          id: 'step1',
          title: 'Create New Document',
          description: 'Click on "Blank" to create a new document',
          target: { x: 200, y: 150, width: 120, height: 160 },
          action: 'click',
          completed: false
        },
        {
          id: 'step2',
          title: 'Add Title',
          description: 'Click at the top and add your document title',
          target: { x: 100, y: 200, width: 600, height: 40 },
          action: 'type',
          value: 'Document Title',
          completed: false
        },
        {
          id: 'step3',
          title: 'Start Writing',
          description: 'Click in the document body and start writing',
          target: { x: 100, y: 260, width: 600, height: 400 },
          action: 'type',
          value: 'Start typing your content here...',
          completed: false
        }
      ];
    }

    // Generic steps for unknown commands
    return [
      {
        id: 'step1',
        title: 'Analyze Screen',
        description: 'AI is analyzing the current screen content',
        target: { x: 400, y: 300, width: 200, height: 100 },
        action: 'wait',
        completed: false
      },
      {
        id: 'step2',
        title: 'Ready for Guidance',
        description: 'Click anywhere to start the tutorial',
        target: { x: 400, y: 300, width: 200, height: 100 },
        action: 'click',
        completed: false
      }
    ];
  };

  const handleStepComplete = () => {
    if (currentStep < steps.length) {
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      onStepComplete(updatedSteps[currentStep].id);

      if (currentStep + 1 < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
        onComplete();
      }
    }
  };

  const skipStep = () => {
    if (currentStep + 1 < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
      onComplete();
    }
  };

  if (!isActive || !isPlaying || steps.length === 0) {
    return null;
  }

  const current = steps[currentStep];

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Overlay with dimmed background */}
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" />
      
      {/* Current step highlight */}
      <div
        className="absolute border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
        style={{
          left: current.target.x,
          top: current.target.y,
          width: current.target.width || 200,
          height: current.target.height || 40,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
        }}
      />

      {/* Animated pointer */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: current.target.x + (current.target.width || 200) / 2 - 12,
          top: current.target.y - 50
        }}
      >
        <MousePointer2 className="w-6 h-6 text-blue-400 animate-bounce" />
      </div>

      {/* Step instruction panel */}
      <div
        className="absolute bg-gray-900/95 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 pointer-events-auto max-w-sm"
        style={{
          left: Math.min(current.target.x + (current.target.width || 200) + 20, window.innerWidth - 400),
          top: current.target.y,
          minWidth: 300
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{currentStep + 1}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{current.title}</h3>
            <p className="text-gray-300 text-xs mt-1">{current.description}</p>
          </div>
        </div>

        {/* Action indicator */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-medium">
            {current.action === 'click' && 'Click here'}
            {current.action === 'type' && 'Type here'}
            {current.action === 'scroll' && 'Scroll here'}
            {current.action === 'hover' && 'Hover here'}
            {current.action === 'wait' && 'Please wait...'}
          </span>
        </div>

        {/* Type preview */}
        {current.action === 'type' && current.value && (
          <div className="bg-gray-800/50 rounded p-2 mb-3">
            <p className="text-gray-400 text-xs mb-1">Suggested text:</p>
            <p className="text-green-400 text-xs font-mono">"{current.value}"</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleStepComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
          >
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Done
          </button>
          <button
            onClick={skipStep}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-1">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full ${
                step.completed
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-lg rounded-lg p-3 pointer-events-auto">
        <div className="flex items-center gap-2 text-white text-sm">
          <Circle className="w-4 h-4 text-blue-400" />
          <span>Step {currentStep + 1} of {steps.length}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">{currentApp} Tutorial</div>
      </div>
    </div>
  );
};
