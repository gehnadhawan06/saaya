import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Square, Play, Download } from 'lucide-react';
import type { AppState } from '../App';

interface ScreenShareProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export const ScreenShare: React.FC<ScreenShareProps> = ({ appState, updateAppState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' as MediaStreamMediaSource },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      updateAppState({ 
        isScreenSharing: true, 
        screenStream: stream,
        tutorialSteps: [],
        currentStep: 0
      });
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = () => {
    if (appState.screenStream) {
      appState.screenStream.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    updateAppState({ 
      isScreenSharing: false, 
      screenStream: null,
      tutorialSteps: [],
      currentStep: 0,
      currentCommand: '',
      isListening: false,
      isProcessing: false
    });

    stopRecording();
  };

  const startRecording = () => {
    if (!appState.screenStream) return;

    const mediaRecorder = new MediaRecorder(appState.screenStream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-tutorial-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  const captureScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (appState.screenStream) {
        appState.screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Monitor className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Screen Share</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {appState.isScreenSharing && (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 inline-block mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline-block mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              
              {recordedChunks.length > 0 && (
                <button
                  onClick={downloadRecording}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg font-medium transition-all duration-200"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Download
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="relative">
        {!appState.isScreenSharing ? (
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/80 mb-2">Start Screen Sharing</h3>
              <p className="text-white/60 mb-6 max-w-sm">
                Share your screen to begin creating interactive tutorials with AI guidance
              </p>
              <button
                onClick={startScreenShare}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                Share Screen
              </button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-contain"
            />
            
            {/* Status indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                Live
              </span>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  Recording
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hidden canvas for screenshots */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {appState.isScreenSharing && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-white/60 text-sm">
            Screen sharing active • Click elements to interact
          </div>
          <button
            onClick={stopScreenShare}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Stop Sharing
          </button>
        </div>
      )}
    </div>
  );
};