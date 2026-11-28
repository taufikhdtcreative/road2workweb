'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === 'true';

export default function AuthForm() {
  const { user, ready, demo, signIn, signUp, signInGoogle } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('masuk');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, user, router]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('daftar')) setMode('daftar');
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (mode === 'daftar' && name.trim().length < 2) return setError('Isi nama kamu dulu.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Format email belum benar.');
    if (password.length < 6) return setError('Kata sandi minimal 6 karakter.');
    setBusy(true);
    const res =
      mode === 'daftar'
        ? await signUp({ name: name.trim(), email: email.trim(), password })
        : await signIn({ email: email.trim(), password });
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.needsConfirm) return setInfo('Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk.');
    router.replace('/dashboard');
  }

  async function google() {
    setError('');
    const res = await signInGoogle();
    if (res?.error) setError(res.error);
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        {['masuk', 'daftar'].map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? 'on' : ''}
            onClick={() => {
              setMode(m);
              setError('');
              setInfo('');
            }}
          >
            {m === 'masuk' ? 'Masuk' : 'Daftar'}
          </button>
        ))}
      </div>

      <h1 className="auth-title">
        {mode === 'masuk' ? (
          <>
            Halo lagi, <span className="serif it lime">semangat.</span>
          </>
        ) : (
          <>
            Mulai dari <span className="serif it lime">profilmu.</span>
          </>
        )}
      </h1>

      {demo && (
        <p className="demo-note">
          Mode demo: akun hanya tersimpan di browser ini. Hubungkan Supabase untuk login sungguhan (lihat README).
        </p>
      )}

      {GOOGLE && !demo && (
        <>
          <button type="button" className="btn btn-outline google" onClick={google}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8a6.1 6.1 0 1 1 0-12.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.8 0-.7-.1-1.2-.2-2z" />
            </svg>
            Lanjut dengan Google
          </button>
          <div className="or">
            <span>atau</span>
          </div>
        </>
      )}

      <form onSubmit={submit} noValidate>
        {mode === 'daftar' && (
          <label className="lab">
            Nama
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} />
          </label>
        )}
        <label className="lab">
          Email
          <input
            className="field"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="lab">
          Kata sandi
          <input
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
            minLength={6}
          />
        </label>

        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}
        {info && <div className="okmsg">{info}</div>}

        <button className="btn btn-lime btn-lg full" type="submit" disabled={busy}>
          {busy ? 'Sebentar…' : mode === 'masuk' ? 'Masuk' : 'Buat akun'}
        </button>
      </form>

      <p className="auth-foot">
        {mode === 'masuk' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <button type="button" className="linkbtn" onClick={() => setMode(mode === 'masuk' ? 'daftar' : 'masuk')}>
          {mode === 'masuk' ? 'Daftar gratis' : 'Masuk'}
        </button>
      </p>
    </div>
  );
}
