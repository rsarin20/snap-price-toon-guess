
import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please make sure you have granted permission.");
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and send to parent
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
          setIsStreaming(false);
        }
      }
    }
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden cartoon-border cartoon-shadow mb-4">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-white bg-red-500 p-4 rounded-lg">{error}</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          playsInline
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bubble-text">
              <p className="text-lg font-bold mb-2">Ready to guess the price?</p>
              <p>Click below to start your camera!</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {!isStreaming ? (
          <Button 
            onClick={startCamera}
            className="flex-1 h-14 text-lg font-bold bg-primary hover:bg-primary/80 cartoon-border cartoon-shadow"
          >
            <Camera className="mr-2" size={24} />
            Start Camera
          </Button>
        ) : (
          <Button 
            onClick={captureImage}
            className="flex-1 h-14 text-lg font-bold bg-secondary hover:bg-secondary/80 cartoon-border cartoon-shadow"
          >
            <Camera className="mr-2" size={24} />
            Take Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;
