import { createContext, useContext, useState, useEffect, useRef } from 'react';

const SESSION_DURATION = 50 * 60; // 50 minutes in seconds

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const intervalRef = useRef(null);
  useEffect(() => {
    setIsExpired(false);
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const remaining = Math.max(SESSION_DURATION - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(intervalRef.current);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sessionStart]);

  const resetSession = () => {
    setSessionStart(Date.now());
    setTimeLeft(SESSION_DURATION);
    setIsExpired(false);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timeDisplay = `${mm}:${ss}`;
  const percentLeft = (timeLeft / SESSION_DURATION) * 100;

  return (
    <SessionContext.Provider value={{ timeLeft, isExpired, timeDisplay, percentLeft, sessionStart, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
