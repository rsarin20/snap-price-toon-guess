
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <div className="mb-6 relative">
        <div className="w-32 h-32 bg-cartoon-pink rounded-full flex items-center justify-center cartoon-border cartoon-shadow">
          <Camera size={64} />
        </div>
        <div className="absolute -top-2 -right-2 bg-cartoon-yellow cartoon-border cartoon-shadow rounded-full px-3 py-1 transform rotate-12">
          <p className="font-bold">$?</p>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold mb-4">PriceSnap</h1>
      
      <div className="bubble-text mb-6 w-full">
        <h2 className="text-xl font-bold mb-2">How It Works:</h2>
        <ol className="text-left space-y-2">
          <li className="flex items-start">
            <span className="bg-cartoon-blue rounded-full cartoon-border h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
            <p>Take a photo of any object</p>
          </li>
          <li className="flex items-start">
            <span className="bg-cartoon-pink rounded-full cartoon-border h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
            <p>Our AI will analyze it</p>
          </li>
          <li className="flex items-start">
            <span className="bg-cartoon-yellow rounded-full cartoon-border h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
            <p>Get an estimated price!</p>
          </li>
        </ol>
      </div>
      
      <Button 
        onClick={onStart}
        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/80 cartoon-border cartoon-shadow animate-bounce"
      >
        <Camera className="mr-2" size={24} />
        Let's Get Started!
      </Button>
      
      <p className="text-sm mt-4 text-gray-500">
        Note: This is just for fun! Prices are estimates and may vary.
      </p>
    </div>
  );
};

export default WelcomeScreen;
