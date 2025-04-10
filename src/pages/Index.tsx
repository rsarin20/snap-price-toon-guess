
import React, { useState, useEffect } from 'react';
import CameraComponent from '@/components/Camera';
import PriceResult from '@/components/PriceResult';
import WelcomeScreen from '@/components/WelcomeScreen';
import { predictPrice } from '@/utils/aiPredictor';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [step, setStep] = useState<'welcome' | 'camera' | 'result' | 'apikey'>('welcome');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [prediction, setPrediction] = useState<{
    price: string;
    objectName: string;
    manufacturingCost: string;
    importLocation: string;
    confidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  // Check if API key exists
  useEffect(() => {
    const storedApiKey = localStorage.getItem('OPENAI_API_KEY');
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!storedApiKey && !envApiKey && step === 'welcome') {
      setStep('apikey');
    }
  }, [step]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('OPENAI_API_KEY', apiKey.trim());
      toast.success('API key saved successfully');
      setStep('welcome');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

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
    // Check for API key again
    const hasApiKey = localStorage.getItem('OPENAI_API_KEY') || import.meta.env.VITE_OPENAI_API_KEY;
    setStep(hasApiKey ? 'camera' : 'apikey');
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-cartoon-yellow">
      <div className="container max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 cartoon-border cartoon-shadow">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-extrabold mb-2">
              {step === 'welcome' ? 'PriceSnap' : 
               step === 'camera' ? 'Take a Photo' : 
               step === 'apikey' ? 'OpenAI Setup' :
               'Price Prediction'}
            </h1>
            {step !== 'welcome' && step !== 'apikey' && (
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

            {step === 'apikey' && (
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-full p-4 bg-cartoon-blue rounded-2xl cartoon-border cartoon-shadow">
                    <h2 className="text-lg font-bold mb-2">OpenAI API Key Required</h2>
                    <p className="text-sm mb-4">To use the OpenAI vision models for more accurate price prediction, please enter your OpenAI API key.</p>
                    
                    <form onSubmit={handleApiKeySubmit} className="space-y-4">
                      <Input 
                        type="password"
                        placeholder="Enter your OpenAI API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="cartoon-border"
                      />
                      <Button 
                        type="submit"
                        className="w-full h-10 font-bold bg-primary hover:bg-primary/80 cartoon-border cartoon-shadow"
                      >
                        Save API Key
                      </Button>
                      <p className="text-xs text-gray-500">
                        Your API key will be stored in your browser's local storage.
                      </p>
                    </form>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setStep('welcome')}
                  className="w-full h-10 font-bold bg-secondary hover:bg-secondary/80 cartoon-border cartoon-shadow"
                  variant="secondary"
                >
                  Skip (Use Fallback AI)
                </Button>
              </div>
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
