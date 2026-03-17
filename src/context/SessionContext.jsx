import { createContext, useContext, useState, useEffect, useRef } from 'react';

const SESSION_DURATION = 40 * 60; // 40 minutes in seconds

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const [sessionStart] = useState(() => Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
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

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timeDisplay = `${mm}:${ss}`;
  const percentLeft = (timeLeft / SESSION_DURATION) * 100;

  return (
    <SessionContext.Provider value={{ timeLeft, isExpired, timeDisplay, percentLeft, sessionStart }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
