
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Gift, MapPin, Gauge } from 'lucide-react';

interface PriceResultProps {
  imageData: string;
  predictedPrice: string | null;
  manufacturingCost: string | null;
  importLocation: string | null;
  confidence: number;
  objectName: string;
  isLoading: boolean;
  onReset: () => void;
}

const PriceResult: React.FC<PriceResultProps> = ({ 
  imageData, 
  predictedPrice, 
  manufacturingCost,
  importLocation,
  confidence, 
  objectName, 
  isLoading, 
  onReset 
}) => {
  // Helper function to get confidence color and label
  const getConfidenceDetails = (score: number) => {
    if (score >= 0.8) return { color: 'bg-green-500', label: 'High Confidence' };
    if (score >= 0.5) return { color: 'bg-yellow-500', label: 'Medium Confidence' };
    return { color: 'bg-red-500', label: 'Low Confidence' };
  };
  
  const confidenceDetails = getConfidenceDetails(confidence);
  
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden cartoon-border cartoon-shadow mb-4">
        <img src={imageData} alt="Captured object" className="w-full h-full object-cover" />
      </div>

      {isLoading ? (
        <div className="w-full p-6 bg-cartoon-blue rounded-2xl cartoon-border cartoon-shadow text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin-slow"></div>
          </div>
          <p className="text-lg font-bold">Analyzing with OpenAI...</p>
          <p className="text-sm">Our AI is trying to guess the price!</p>
        </div>
      ) : (
        <div className="w-full">
          <div className="p-6 bg-cartoon-blue rounded-2xl cartoon-border cartoon-shadow mb-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-2">
              <Lightbulb className="inline-block mr-2" size={20} />
              OpenAI thinks this is:
            </h2>
            <p className="text-2xl font-extrabold mb-4">{objectName}</p>
            
            {predictedPrice && (
              <div className="flex flex-col items-center my-4 animate-price-reveal">
                <div className="price-tag mb-4 w-full">
                  <p className="text-sm font-bold">OpenAI Estimated Price:</p>
                  <p className="text-3xl font-extrabold">{predictedPrice}</p>
                </div>
                
                {manufacturingCost && (
                  <div className="price-tag mb-4 w-full bg-cartoon-yellow">
                    <p className="text-sm font-bold">
                      <Gift className="inline-block mr-2" size={16} />
                      Est. Manufacturing Cost:
                    </p>
                    <p className="text-2xl font-bold">{manufacturingCost}</p>
                  </div>
                )}
                
                {importLocation && (
                  <div className="price-tag mb-4 w-full bg-cartoon-pink">
                    <p className="text-sm font-bold">
                      <MapPin className="inline-block mr-2" size={16} />
                      Likely Import From:
                    </p>
                    <p className="text-2xl font-bold">{importLocation}</p>
                  </div>
                )}
                
                <div className="w-full mt-2">
                  <div className="text-sm font-medium mb-1 flex justify-between">
                    <span className="flex items-center">
                      <Gauge className="inline-block mr-1" size={16} />
                      AI Confidence ({confidenceDetails.label})
                    </span>
                    <span>{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 cartoon-border overflow-hidden">
                    <div 
                      className={`${confidenceDetails.color} h-full cartoon-shadow`} 
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={onReset}
            className="w-full h-14 text-lg font-bold bg-secondary hover:bg-secondary/80 cartoon-border cartoon-shadow"
          >
            Try Another Object
          </Button>
        </div>
      )}
    </div>
  );
};

export default PriceResult;
