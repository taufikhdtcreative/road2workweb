'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const STEPS = [
  {
    name: 'Profile',
    text: 'Upload CV atau isi profil singkat. Sistem membaca pengalaman, skill, tools, dan bukti yang bisa dipakai saat interview.',
    icon: (
      <Icon>
        <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
      </Icon>
    ),
  },
  {
    name: 'Role',
    text: 'Gunakan rekomendasi role dari CV atau pilih target role sendiri jika kamu sudah punya tujuan yang jelas.',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </Icon>
    ),
  },
  {
    name: 'Practice',
    text: 'Masuk ke interview berbasis suara. Jawab natural, lalu biarkan sistem membaca kualitas jawabanmu.',
    icon: (
      <Icon>
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </Icon>
    ),
  },
  {
    name: 'Improve',
    text: 'Baca feedback, cek dashboard kesiapan, lalu lanjutkan latihan pada gap yang paling berdampak.',
    icon: (
      <Icon>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </Icon>
    ),
  },
];

export default function Workflow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setActive((v) => (v + 1) % STEPS.length), 3800);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="workflow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="wf-copy">
        <span className="pill">WORKFLOW</span>
        <h2>
          Dari profil mentah ke latihan yang <span className="serif it">punya arah.</span>
        </h2>
        <p>
          Road2Work membantu pengalamanmu dibaca, dipetakan ke role yang relevan, lalu dilatih lewat interview berbasis suara
          sampai kamu tahu gap yang perlu diperbaiki.
        </p>
        <Link className="btn btn-dark btn-lg" href="/masuk?daftar=1">
          Mulai dari Profile <span aria-hidden="true">→</span>
        </Link>
      </div>

      <ol className="wf-steps">
        {STEPS.map((s, i) => (
          <li key={s.name} className={i === active ? 'on' : ''}>
            <button type="button" onClick={() => setActive(i)} aria-current={i === active ? 'step' : undefined}>
              <span className="wf-icon">{s.icon}</span>
              <span className="wf-text">
                <b>
                  {s.name} <em>0{i + 1}</em>
                </b>
                <span>{s.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
