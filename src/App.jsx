import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './index.css';
import TimerBar from './components/TimerBar';
import ProfileModal from './components/ProfileModal';
import HomePage from './pages/HomePage';
import ShortPractice from './pages/ShortPractice';
import LongPractice from './pages/LongPractice';
import EditorialPractice from './pages/EditorialPractice';
import SummaryPractice from './pages/SummaryPractice';
import TeacherDashboard from './pages/TeacherDashboard';
import { loadProfile, saveProfile, addSession, getLevel } from './utils/storage';
import { SessionProvider } from './context/SessionContext';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('home');
  const [appLoading, setAppLoading] = useState(true);
  const [isLevelUp, setIsLevelUp] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      if (p) setProfile(p);
      setAppLoading(false);
    })();
  }, []);

  const handleProfileSave = async (name) => {
    const newProfile = {
      name,
      totalScore: 0,
      completedSessions: 0,
      sessionDates: [],
      createdAt: Date.now(),
    };
    await saveProfile(newProfile);
    setProfile(newProfile);
  };

  // score=undefined → go home without saving (back button)
  const handlePracticeDone = async (score, mode, topic, studentText, feedback) => {
    if (score === undefined || score === null) {
      setPage('home');
      return;
    }

    try {
      await addSession({ mode, topic, studentText, feedback, score });
    } catch (e) {
      console.warn('세션 저장 실패:', e);
    }

    const prevLevel = getLevel(profile.totalScore).level;
    const newScore = Math.min((profile.totalScore || 0) + score, 100);
    const newLevel = getLevel(newScore).level;

    const updatedProfile = {
      ...profile,
      totalScore: newScore,
      completedSessions: (profile.completedSessions || 0) + 1,
      sessionDates: [...(profile.sessionDates || []), Date.now()],
    };

    await saveProfile(updatedProfile);
    setProfile(updatedProfile);

    if (newLevel > prevLevel) {
      setIsLevelUp(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setIsLevelUp(false), 4000);
    }

    setPage('home');
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">🗞️</div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <div className="min-h-screen">
        <TimerBar />

        {!profile && (
          <ProfileModal onSave={handleProfileSave} />
        )}

        {profile && (
          <>
            {page === 'home' && (
              <HomePage
                profile={{ ...profile, isLevelUp }}
                onNavigate={setPage}
                onOpenTeacher={() => setPage('teacher')}
              />
            )}

            {page === 'short' && (
              <ShortPractice
                profile={profile}
                onDone={handlePracticeDone}
              />
            )}

            {page === 'long' && (
              <LongPractice
                profile={profile}
                onDone={handlePracticeDone}
              />
            )}

            {page === 'editorial' && (
              <EditorialPractice
                profile={profile}
                onDone={handlePracticeDone}
              />
            )}

            {page === 'summary' && (
              <SummaryPractice
                profile={profile}
                onDone={handlePracticeDone}
              />
            )}

            {page === 'teacher' && (
              <TeacherDashboard
                profile={profile}
                onBack={() => setPage('home')}
                onReset={() => {
                  setProfile(null);
                  setPage('home');
                }}
              />
            )}
          </>
        )}
      </div>
    </SessionProvider>
  );
}
