import { useEffect, useState } from 'react';
import { Clock } from '@phosphor-icons/react';

interface TimerProps {
  isRunning: boolean;
  onReset?: () => void;
}

export function Timer({ isRunning, onReset }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (onReset) {
      setSeconds(0);
    }
  }, [onReset]);

  const resetTimer = () => {
    setSeconds(0);
  };

  // Reset timer externally when onReset changes
  useEffect(() => {
    resetTimer();
  }, [onReset]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Clock size={20} />
      <span className="text-lg font-mono tabular-nums">
        {formatTime(seconds)}
      </span>
    </div>
  );
}