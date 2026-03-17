import { createContext, useContext, useState, useEffect, useRef } from 'react';

// No longer using fixed duration, tracking elapsed time instead.

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      setSecondsElapsed(elapsed);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sessionStart]);

  const resetSession = () => {
    setSessionStart(Date.now());
    setSecondsElapsed(0);
  };

  const mm = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const ss = String(secondsElapsed % 60).padStart(2, '0');
  const timeDisplay = `${mm}:${ss}`;
  // percentLeft logic is no longer applicable for a stopwatch, but kept as 100 for compatibility if needed.
  const percentLeft = 100;

  return (
    <SessionContext.Provider value={{ secondsElapsed, isExpired: false, timeDisplay, percentLeft, sessionStart, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
