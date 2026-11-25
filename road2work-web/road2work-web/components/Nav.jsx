'use client';

import { useState } from 'react';

const LINKS = [
  ['Cara Kerja', '#cara-kerja'],
  ['Ngobrol dengan AI', '#ngobrol'],
  ['Fitur', '#fitur'],
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Navigasi utama">
        <a className="logo" href="#top" onClick={() => setOpen(false)}>
          <span className="logo-dot" aria-hidden="true" />
          Road2Work
        </a>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
          <li className="nav-cta-mobile">
            <a className="btn btn-lime" href="#ngobrol" onClick={() => setOpen(false)}>
              Mulai ngobrol
            </a>
          </li>
        </ul>

        <a className="btn btn-lime nav-cta" href="#ngobrol">
          Mulai ngobrol
        </a>

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
