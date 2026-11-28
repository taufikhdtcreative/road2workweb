'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { hasSupabase, supabase } from '../lib/supabase';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const DEMO_USERS = 'r2w:demo:users';
const DEMO_SESSION = 'r2w:demo:session';

const readJson = (k, fb) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fb;
  } catch {
    return fb;
  }
};

// Mode demo saja. crypto.subtle hanya ada di HTTPS/localhost, jadi sediakan cadangan untuk http biasa.
async function sha256(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  return 'f' + (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

const uuid = () =>
  globalThis.crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

function friendly(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'Email atau kata sandi salah.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Email ini sudah terdaftar. Coba masuk.';
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masukmu.';
  if (m.includes('password') && m.includes('characters')) return 'Kata sandi minimal 6 karakter.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
  if (m.includes('fetch') || m.includes('network')) return 'Tidak bisa terhubung. Cek koneksi internetmu.';
  return msg || 'Terjadi kesalahan. Coba lagi.';
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSupabase) {
      let active = true;
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session || null);
        setUser(data.session?.user || null);
        setReady(true);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s || null);
        setUser(s?.user || null);
        setReady(true);
      });
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }
    const email = readJson(DEMO_SESSION, null);
    if (email) {
      const u = readJson(DEMO_USERS, {})[email];
      if (u) setUser({ id: u.id, email, name: u.name });
    }
    setReady(true);
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin + '/dashboard' },
      });
      if (error) return { error: friendly(error.message) };
      if (!data.session) return { needsConfirm: true };
      return {};
    }
    const users = readJson(DEMO_USERS, {});
    const key = email.toLowerCase();
    if (users[key]) return { error: 'Email ini sudah terdaftar. Coba masuk.' };
    users[key] = { id: 'demo-' + uuid(), name, hash: await sha256(password + key) };
    localStorage.setItem(DEMO_USERS, JSON.stringify(users));
    localStorage.setItem(DEMO_SESSION, JSON.stringify(key));
    setUser({ id: users[key].id, email: key, name });
    return {};
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (hasSupabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: friendly(error.message) } : {};
    }
    const key = email.toLowerCase();
    const u = readJson(DEMO_USERS, {})[key];
    if (!u || u.hash !== (await sha256(password + key))) return { error: 'Email atau kata sandi salah.' };
    localStorage.setItem(DEMO_SESSION, JSON.stringify(key));
    setUser({ id: u.id, email: key, name: u.name });
    return {};
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!hasSupabase) return { error: 'Login Google butuh Supabase. Gunakan email dan kata sandi.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    return error ? { error: friendly(error.message) } : {};
  }, []);

  const signOut = useCallback(async () => {
    if (hasSupabase) await supabase.auth.signOut();
    else {
      localStorage.removeItem(DEMO_SESSION);
      setUser(null);
    }
  }, []);

  // Header Authorization untuk memanggil API kita (hanya dipakai saat Supabase aktif).
  const authHeaders = useCallback(async () => {
    if (!hasSupabase) return {};
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [session]);

  const value = useMemo(
    () => ({
      user,
      ready,
      demo: !hasSupabase,
      signUp,
      signIn,
      signInGoogle,
      signOut,
      authHeaders,
      displayName: user?.user_metadata?.name || user?.name || (user?.email ? user.email.split('@')[0] : ''),
    }),
    [user, ready, signUp, signIn, signInGoogle, signOut, authHeaders]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
