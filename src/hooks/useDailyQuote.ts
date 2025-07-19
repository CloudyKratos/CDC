
import { useState, useEffect } from 'react';
import { inspirationalQuotes, Quote } from '@/data/inspirationalQuotes';

export const useDailyQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useDailyQuote hook initialized');
    console.log('Available quotes:', inspirationalQuotes.length);
    
    const getQuoteForToday = () => {
      // Use today's date as a seed for consistent daily quotes
      const today = new Date();
      const dateString = today.toDateString();
      
      // Simple hash function to convert date string to number
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Ensure positive index
      const index = Math.abs(hash) % inspirationalQuotes.length;
      console.log('Selected quote index:', index);
      return inspirationalQuotes[index];
    };

    // Simulate a brief loading period for smooth UX
    const timer = setTimeout(() => {
      const selectedQuote = getQuoteForToday();
      console.log('Setting quote:', selectedQuote);
      setQuote(selectedQuote);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refreshQuote = () => {
    console.log('Refreshing quote...');
    setIsLoading(true);
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    
    setTimeout(() => {
      const newQuote = inspirationalQuotes[randomIndex];
      console.log('New quote selected:', newQuote);
      setQuote(newQuote);
      setIsLoading(false);
    }, 300);
  };

  return {
    quote,
    isLoading,
    refreshQuote
  };
};
