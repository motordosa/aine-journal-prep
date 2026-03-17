// Storage utility wrapping window.storage with localStorage fallback

const storage = {
  async get(key) {
    try {
      if (window.storage) {
        return await window.storage.get(key);
      }
      return localStorage.getItem(key);
    } catch {
      return localStorage.getItem(key);
    }
  },
  async set(key, value) {
    try {
      if (window.storage) {
        await window.storage.set(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      localStorage.setItem(key, value);
    }
  },
};

export async function loadProfile() {
  const raw = await storage.get('profile');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function saveProfile(profile) {
  await storage.set('profile', JSON.stringify(profile));
}

export async function addSession(sessionData) {
  const ts = Date.now();
  await storage.set(`session:${ts}`, JSON.stringify({ ...sessionData, createdAt: ts }));

  // Update index
  const raw = await storage.get('session_index');
  const index = raw ? JSON.parse(raw) : [];
  index.push(ts);
  await storage.set('session_index', JSON.stringify(index));
  return ts;
}

export async function getSessions() {
  const raw = await storage.get('session_index');
  if (!raw) return [];
  const index = JSON.parse(raw);
  const sessions = [];
  for (const ts of index) {
    const s = await storage.get(`session:${ts}`);
    if (s) sessions.push(JSON.parse(s));
  }
  return sessions.sort((a, b) => b.createdAt - a.createdAt);
}

export function getLevel(score) {
  if (score < 60) return { level: 0, title: '씨앗 기자', emoji: '🌱', color: 'from-green-200 to-green-300' };
  if (score < 120) return { level: 1, title: '새싹 기자', emoji: '🌿', color: 'from-green-300 to-teal-300' };
  if (score < 180) return { level: 2, title: '꽃봉오리 기자', emoji: '🌸', color: 'from-pink-200 to-pink-300' };
  if (score < 240) return { level: 3, title: '별빛 기자', emoji: '⭐', color: 'from-yellow-200 to-yellow-300' };
  return { level: 4, title: '슈퍼 기자', emoji: '🏆', color: 'from-orange-200 to-orange-300' };
}

export function getStreakBadges(profile) {
  const badges = [];
  if (!profile?.sessionDates) return badges;
  const dates = [...new Set(profile.sessionDates.map(d => new Date(d).toDateString()))];
  if (dates.length >= 3) badges.push({ label: '3일 연속 🔥', color: 'bg-orange-100 text-orange-600' });
  if (dates.length >= 7) badges.push({ label: '7일 연속 🌟', color: 'bg-yellow-100 text-yellow-600' });
  if (dates.length >= 14) badges.push({ label: '14일 연속 🏆', color: 'bg-purple-100 text-purple-600' });
  return badges;
}
