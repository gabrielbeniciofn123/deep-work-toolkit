import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

type Mode = "work" | "break" | "longBreak";

const TIMES = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

const SESSIONS_UNTIL_LONG_BREAK = 4;

export const usePomodoro = () => {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current.volume = 0.7;
    // Preload the audio
    audioRef.current.load();
  }, []);

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log("Audio play failed:", e);
      });
    }
  }, []);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(TIMES[newMode]);
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    // Calculate end time based on current timeLeft
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  }, [timeLeft]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    setTimeLeft(TIMES[mode]);
    setIsRunning(false);
    endTimeRef.current = null;
  }, [mode]);

  const handleSkip = useCallback(() => {
    if (mode === "work") {
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);
      
      if (newSessions % SESSIONS_UNTIL_LONG_BREAK === 0) {
        handleModeChange("longBreak");
        toast({
          title: "🎉 Hora da pausa longa!",
          description: "Você completou 4 sessões. Descanse bem!",
        });
      } else {
        handleModeChange("break");
        toast({
          title: "☕ Hora da pausa!",
          description: "Ótimo trabalho! Descanse um pouco.",
        });
      }
    } else {
      handleModeChange("work");
      toast({
        title: "💪 Vamos focar!",
        description: "Nova sessão de estudo iniciando.",
      });
    }
  }, [mode, completedSessions, handleModeChange]);

  // Timer logic - uses timestamp-based calculation for accuracy even when minimized
  useEffect(() => {
    let animationId: number;
    let intervalId: NodeJS.Timeout;

    const updateTimer = () => {
      if (!endTimeRef.current) return;
      
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        playNotification();
        handleSkip();
      }
    };

    if (isRunning) {
      // Use both requestAnimationFrame (for smooth updates when visible) 
      // and setInterval (for background updates)
      const tick = () => {
        updateTimer();
        if (isRunning) {
          animationId = requestAnimationFrame(tick);
        }
      };
      animationId = requestAnimationFrame(tick);
      
      // Backup interval for when tab is in background (browsers throttle RAF)
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, handleSkip, playNotification]);

  // Handle visibility change - recalculate time when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setIsRunning(false);
          endTimeRef.current = null;
          playNotification();
          handleSkip();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, handleSkip, playNotification]);

  // Update document title
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    const modeLabel = mode === "work" ? "Foco" : mode === "break" ? "Pausa" : "Pausa Longa";
    document.title = `${timeString} - ${modeLabel} | Pomodoro`;
  }, [timeLeft, mode]);

  return {
    mode,
    timeLeft,
    totalTime: TIMES[mode],
    isRunning,
    completedSessions,
    sessionsUntilLongBreak: SESSIONS_UNTIL_LONG_BREAK,
    handleModeChange,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
  };
};