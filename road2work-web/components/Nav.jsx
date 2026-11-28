'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

const LINKS = [
  ['Fitur', '/#fitur'],
  ['Cara Kerja', '/#cara-kerja'],
  ['FAQ', '/#faq'],
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { user, ready } = useAuth();
  const close = () => setOpen(false);

  const actions = user ? (
    <Link className="btn btn-lime" href="/dashboard" onClick={close}>
      Dashboard
    </Link>
  ) : (
    <>
      <Link className="btn btn-ghost" href="/masuk" onClick={close}>
        Masuk
      </Link>
      <Link className="btn btn-lime" href="/masuk?daftar=1" onClick={close}>
        Daftar
      </Link>
    </>
  );

  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Navigasi utama">
        <Link className="logo" href="/" onClick={close}>
          <span className="logo-dot" aria-hidden="true" />
          Road2Work
        </Link>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={close}>
                {label}
              </a>
            </li>
          ))}
          <li className="nav-cta-mobile" style={ready ? undefined : { visibility: 'hidden' }}>
            {actions}
          </li>
        </ul>

        <div className="nav-actions" style={ready ? undefined : { visibility: 'hidden' }}>
          {actions}
        </div>

        <button
          className="burger"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}
