'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthProvider';
import { useUserData } from '../useUserData';
import ProfileStep from './ProfileStep';
import RoleStep from './RoleStep';
import PracticeStep from './PracticeStep';
import ImproveStep from './ImproveStep';

const STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'role', label: 'Role' },
  { id: 'practice', label: 'Practice' },
  { id: 'improve', label: 'Improve' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, ready, demo, displayName, signOut } = useAuth();
  const { data, loading, error, saving, update, wipe } = useUserData(user ? user.id : null);
  const [step, setStep] = useState(null);

  useEffect(() => {
    if (ready && !user) router.replace('/masuk');
  }, [ready, user, router]);

  useEffect(() => {
    if (data && step === null) {
      setStep(!data.profile ? 'profile' : !data.target ? 'role' : data.history.length ? 'improve' : 'practice');
    }
  }, [data, step]);

  if (!ready || !user || loading || !data || !step) {
    return (
      <main className="dash">
        <div className="dash-load">
          <span className="spin" aria-hidden="true" />
          Menyiapkan dashboard…
        </div>
      </main>
    );
  }

  const done = {
    profile: !!data.profile,
    role: !!data.target,
    practice: data.history.length > 0,
    improve: data.history.length > 0,
  };
  const first = (displayName || 'kamu').split(' ')[0];
  const hint = !data.profile
    ? 'Langkah pertama: unggah CV atau tulis profil singkatmu.'
    : !data.target
    ? 'Profilmu sudah terbaca. Sekarang pilih role target.'
    : !data.history.length
    ? `Role target: ${data.target.nama}. Saatnya latihan interview dengan suara.`
    : 'Lanjutkan latihan pada gap yang paling berdampak.';

  async function wipeAll() {
    if (!window.confirm('Hapus profil, target role, dan semua riwayat latihanmu? Tindakan ini tidak bisa dibatalkan.')) return;
    await wipe();
    setStep('profile');
  }

  return (
    <main className="dash">
      <header className="dash-top">
        <a className="logo" href="/">
          <span className="logo-dot" aria-hidden="true" />
          Road2Work
        </a>
        <div className="dash-user">
          <span>{displayName}</span>
          <button className="btn btn-outline btn-sm" onClick={signOut}>
            Keluar
          </button>
        </div>
      </header>

      <div className="wrap dash-body">
        {demo && (
          <p className="demo-note">
            Mode demo: akun dan datamu hanya tersimpan di browser ini. Hubungkan Supabase agar bisa dibuka dari perangkat lain.
          </p>
        )}
        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}

        <div className="dash-hello">
          <h1>
            Halo, <span className="serif it lime">{first}.</span>
          </h1>
          <p>{hint}</p>
        </div>

        <nav className="stepper" aria-label="Langkah persiapan">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`sbtn ${step === s.id ? 'on' : ''} ${done[s.id] ? 'done' : ''}`}
              aria-current={step === s.id ? 'step' : undefined}
              onClick={() => setStep(s.id)}
            >
              <i>{done[s.id] && step !== s.id ? '✓' : `0${i + 1}`}</i>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <section className="panel" key={step}>
          {step === 'profile' && <ProfileStep data={data} update={update} onDone={() => setStep('role')} />}
          {step === 'role' && (
            <RoleStep data={data} update={update} onDone={() => setStep('practice')} goProfile={() => setStep('profile')} />
          )}
          {step === 'practice' && (
            <PracticeStep data={data} update={update} goRole={() => setStep('role')} goImprove={() => setStep('improve')} />
          )}
          {step === 'improve' && <ImproveStep data={data} goPractice={() => setStep('practice')} />}
        </section>

        <footer className="dash-foot">
          <span>{saving ? 'Menyimpan…' : 'Tersimpan'}</span>
          <button className="linkbtn small" onClick={wipeAll}>
            Hapus semua datamu
          </button>
        </footer>
      </div>
    </main>
  );
}
