// Penyimpanan data pengguna di browser (localStorage), dipisah per akun.
const key = (uid, name) => `r2w:${uid}:${name}`;

export function load(uid, name, fallback) {
  if (!uid || typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key(uid, name));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(uid, name, value) {
  if (!uid || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(uid, name), JSON.stringify(value));
  } catch {}
}

export function pushHistory(uid, entry) {
  const list = load(uid, 'history', []);
  save(uid, 'history', [entry, ...list].slice(0, 30));
}
