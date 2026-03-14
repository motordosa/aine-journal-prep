import { useState, useEffect } from 'react';
import './index.css';
import TimerBar from './components/TimerBar';
import ProfileModal from './components/ProfileModal';
import HomePage from './pages/HomePage';
import ShortPractice from './pages/ShortPractice';
import LongPractice from './pages/LongPractice';
import EditorialPractice from './pages/EditorialPractice';
import TeacherDashboard from './pages/TeacherDashboard';
import { loadProfile, saveProfile, addSession, getLevel } from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [page, setPage] = useState('home');
  const [appLoading, setAppLoading] = useState(true);
  const [isLevelUp, setIsLevelUp] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      if (p) {
        setProfile(p);
        try {
          const k = window.storage
            ? await window.storage.get('apiKey')
            : localStorage.getItem('apiKey');
          if (k) setApiKey(k);
        } catch {}
      }
      setAppLoading(false);
    })();
  }, []);

  const handleProfileSave = async (name, key) => {
    const newProfile = {
      name,
      totalScore: 0,
      completedSessions: 0,
      sessionDates: [],
      createdAt: Date.now(),
    };
    await saveProfile(newProfile);
    try {
      if (window.storage) await window.storage.set('apiKey', key);
      else localStorage.setItem('apiKey', key);
    } catch {}
    setProfile(newProfile);
    setApiKey(key);
  };

  // Called when a practice mode completes.
  // score=undefined means "go home without saving" (back button pressed before feedback)
  const handlePracticeDone = async (score, mode, topic, studentText, feedback) => {
    if (score === undefined || score === null) {
      setPage('home');
      return;
    }

    // Save session record
    try {
      await addSession({ mode, topic, studentText, feedback, score });
    } catch (e) {
      console.warn('세션 저장 실패:', e);
    }

    // Update profile score
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
      setTimeout(() => setIsLevelUp(false), 3000);
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
              apiKey={apiKey}
              onDone={handlePracticeDone}
            />
          )}

          {page === 'long' && (
            <LongPractice
              profile={profile}
              apiKey={apiKey}
              onDone={handlePracticeDone}
            />
          )}

          {page === 'editorial' && (
            <EditorialPractice
              profile={profile}
              apiKey={apiKey}
              onDone={handlePracticeDone}
            />
          )}

          {page === 'teacher' && (
            <TeacherDashboard
              profile={profile}
              onBack={() => setPage('home')}
              onReset={() => {
                setProfile(null);
                setApiKey('');
                setPage('home');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
