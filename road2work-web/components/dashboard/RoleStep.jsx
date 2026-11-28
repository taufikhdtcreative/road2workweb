'use client';

import { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Empty } from './ui';

export default function RoleStep({ data, update, onDone, goProfile }) {
  const { authHeaders } = useAuth();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const p = data.profile;
  const target = data.target;

  if (!p) {
    return (
      <Empty
        title="Isi profil dulu"
        text="Rekomendasi role dibuat dari profilmu. Unggah CV atau tulis profil singkat dulu ya."
        action={goProfile}
        actionLabel="Ke Profile"
      />
    );
  }

  function pickRole(r) {
    setNote('');
    update((d) => ({ ...d, target: { nama: r.nama, kesiapan: r.kesiapan, gap: r.gap, source: 'rekomendasi' } }));
  }

  async function useManual() {
    const nama = manual.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (nama.length < 2) return;
    setBusy(true);
    setNote('');
    let chosen = { nama, kesiapan: null, gap: [], source: 'manual' };
    try {
      // Nilai kesiapan role pilihan sendiri berdasarkan ringkasan profil yang sudah tersimpan.
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ text: `${p.profilSingkat}\n\n${p.ringkasan}`, targetRole: nama }),
      });
      const json = await res.json().catch(() => ({}));
      const first = res.ok && json.result && json.result.roles && json.result.roles[0];
      if (first) chosen = { nama, kesiapan: first.kesiapan, gap: first.gap, source: 'manual' };
      else setNote('Kesiapan untuk role ini belum bisa dinilai sekarang, tapi kamu tetap bisa mulai latihan.');
    } catch {
      setNote('Kesiapan untuk role ini belum bisa dinilai sekarang, tapi kamu tetap bisa mulai latihan.');
    }
    update((d) => ({ ...d, target: chosen }));
    setManual('');
    setBusy(false);
  }

  return (
    <div>
      <h2 className="panel-title">Tentukan arah role yang masuk akal</h2>
      <p className="panel-sub">
        Pilih salah satu rekomendasi dari profilmu, atau tulis target role sendiri kalau kamu sudah punya tujuan yang jelas.
      </p>

      <div className="role-list">
        {p.roles.map((r, i) => {
          const picked = target && target.nama === r.nama && target.source === 'rekomendasi';
          return (
            <div key={r.nama + i} className={`role-card ${picked ? 'picked' : ''}`}>
              <div className="role-head">
                <h3>{r.nama}</h3>
                <span className="badge">{r.kesiapan}% siap</span>
              </div>
              <div className="bar-track" role="presentation">
                <i style={{ width: `${r.kesiapan}%` }} />
              </div>
              <p>{r.alasan}</p>
              {r.gap.length > 0 && (
                <div className="gaps">
                  <span>{r.gap.length} fokus:</span>
                  {r.gap.map((g, k) => (
                    <em key={k}>{g}</em>
                  ))}
                </div>
              )}
              <button className={`btn ${picked ? 'btn-lime' : 'btn-outline'}`} onClick={() => pickRole(r)}>
                {picked ? 'Role terpilih ✓' : 'Pilih role ini'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="manual panel-card">
        <label className="lab">
          Atau tulis target role sendiri
          <div className="inline">
            <input
              className="field"
              value={manual}
              maxLength={60}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && useManual()}
              placeholder="Contoh: Product Analyst"
            />
            <button className="btn btn-outline" onClick={useManual} disabled={busy || manual.trim().length < 2}>
              {busy ? 'Menilai…' : 'Gunakan'}
            </button>
          </div>
        </label>
        {note && <p className="hint">{note}</p>}
      </div>

      {target && (
        <div className="picked-bar">
          <div>
            <span className="mono">TARGET ROLE</span>
            <b>{target.nama}</b>
            {target.kesiapan != null && <em>{target.kesiapan}% siap</em>}
          </div>
          <button className="btn btn-lime" onClick={onDone}>
            Mulai latihan →
          </button>
        </div>
      )}
    </div>
  );
}
