
import React, { useState } from 'react';
import CameraComponent from '@/components/Camera';
import PriceResult from '@/components/PriceResult';
import WelcomeScreen from '@/components/WelcomeScreen';
import { predictPrice } from '@/utils/aiPredictor';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [step, setStep] = useState<'welcome' | 'camera' | 'result'>('welcome');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    price: string;
    objectName: string;
    manufacturingCost: string;
    importLocation: string;
    confidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleCaptureImage = async (imageData: string) => {
    try {
      setCapturedImage(imageData);
      setStep('result');
      setIsLoading(true);
      
      // Show loading toast
      const loadingToast = toast.loading("Analyzing with OpenAI vision models...");
      
      // Process with AI
      try {
        const result = await predictPrice(imageData);
        
        setPrediction({
          price: result.price,
          objectName: result.objectName,
          manufacturingCost: result.manufacturingCost,
          importLocation: result.importLocation,
          confidence: result.confidence
        });
        
        // Show success toast
        toast.success("OpenAI analysis complete!", {
          id: loadingToast
        });
      } catch (error) {
        console.error("Prediction error:", error);
        
        toast.error("Sorry, we couldn't analyze this image", {
          id: loadingToast,
          description: "Please try again with a different photo"
        });
        
        setPrediction({
          price: "$???.??",
          objectName: "Unknown Object",
          manufacturingCost: "$???.??",
          importLocation: "Unknown",
          confidence: 0
        });
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setPrediction(null);
    setStep('camera');
  };

  const handleStart = () => {
    setStep('camera');
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-cartoon-yellow">
      <div className="container max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 cartoon-border cartoon-shadow">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-extrabold mb-2">
              {step === 'welcome' ? 'PriceSnap' : 
               step === 'camera' ? 'Take a Photo' : 
               'Price Prediction'}
            </h1>
            {step !== 'welcome' && (
              <p className="text-gray-600">
                {step === 'camera' 
                  ? 'Snap a clear photo of any object' 
                  : 'Here\'s our best guess using OpenAI!'}
              </p>
            )}
          </header>
          
          <main>
            {step === 'welcome' && (
              <WelcomeScreen onStart={handleStart} />
            )}
            
            {step === 'camera' && (
              <CameraComponent onCapture={handleCaptureImage} />
            )}
            
            {step === 'result' && capturedImage && (
              <PriceResult 
                imageData={capturedImage}
                predictedPrice={prediction?.price || null}
                manufacturingCost={prediction?.manufacturingCost || null}
                importLocation={prediction?.importLocation || null}
                confidence={prediction?.confidence || 0}
                objectName={prediction?.objectName || ""}
                isLoading={isLoading}
                onReset={handleReset}
              />
            )}
          </main>
          
          <footer className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              PriceSnap © 2025 - Using OpenAI Vision
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
