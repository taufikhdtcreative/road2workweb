'use client';

import { useRef, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Chips } from './ui';

const MAX_PDF = 3 * 1024 * 1024;

const dateId = (t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ProfileStep({ data, update, onDone }) {
  const { authHeaders } = useAuth();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pickRef = useRef(null);
  const p = data.profile;

  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    const isTxt = f.type === 'text/plain' || /\.txt$/i.test(f.name);
    if (!isPdf && !isTxt) return setError('Format belum didukung. Unggah PDF atau TXT, atau tempel teks CV-mu.');
    if (f.size > MAX_PDF) return setError('Ukuran file maksimal 3 MB.');
    if (isTxt) {
      setFile(null);
      setText((await f.text()).slice(0, 12000));
      return;
    }
    const b64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setFile({ name: f.name, b64 });
  }

  async function analyze() {
    setError('');
    if (!file && text.trim().length < 60) {
      return setError('Tulis profilmu minimal beberapa kalimat (pendidikan, pengalaman, skill), atau unggah CV.');
    }
    setBusy(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ text: text.trim(), pdf: file ? file.b64 : '' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Analisis gagal. Coba lagi.');
      update((d) => ({ ...d, profile: json.result, target: null }));
      setText('');
      setFile(null);
    } catch (e) {
      setError(e.message || 'Analisis gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  const rows = p
    ? [
        ['Fokus karier jelas', p.skor.fokus],
        ['Pengalaman relevan', p.skor.relevan],
        ['Bukti siap diceritakan', p.skor.bukti],
      ]
    : [];

  return (
    <div className="split">
      <div className="panel-card">
        <h2 className="panel-title">Rapikan cerita profesionalmu</h2>
        <p className="panel-sub">
          Unggah CV atau tulis profil singkat. Sistem membaca pengalaman, skill, dan bukti yang bisa dipakai saat interview.
        </p>

        {p && (
          <p className="saved-note">
            Profil tersimpan ({dateId(p.updatedAt)}). Tempel atau unggah CV baru kalau ingin memperbaruinya.
          </p>
        )}

        <input ref={pickRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" hidden onChange={pick} />
        <button type="button" className="drop" onClick={() => pickRef.current && pickRef.current.click()}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
          </svg>
          <span>{file ? file.name : 'Unggah CV (PDF atau TXT, maks. 3 MB)'}</span>
        </button>
        {file && (
          <button type="button" className="linkbtn small" onClick={() => setFile(null)}>
            Hapus file
          </button>
        )}

        <label className="lab">
          {file ? 'Catatan tambahan (opsional)' : 'Atau tempel/tulis profilmu'}
          <textarea
            className="field ta"
            rows={7}
            maxLength={12000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: Lulusan Sistem Informasi 2025, pernah magang 4 bulan sebagai data analyst di startup logistik, mengelola dashboard penjualan dengan SQL dan Looker Studio, aktif di organisasi kampus…"
          />
        </label>

        <p className="hint">Hindari mencantumkan nomor KTP, alamat lengkap, atau data sensitif lain.</p>

        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}
        <button className="btn btn-lime btn-lg" onClick={analyze} disabled={busy}>
          {busy ? 'Membaca profilmu…' : p ? 'Analisis ulang' : 'Analisis profil'}
        </button>
      </div>

      <div className="panel-card">
        {!p ? (
          <div className="placeholder">
            <span className="mono">CERITA PROFIL</span>
            <p>Hasil analisismu akan muncul di sini: skor, ringkasan cerita, dan langkah berikutnya.</p>
          </div>
        ) : (
          <div className="story">
            <div className="mock-head">
              <span className="mono">CERITA PROFIL</span>
              <em>01</em>
            </div>
            <div className="mock-rows">
              {rows.map(([label, v]) => (
                <div className="mock-row" key={label}>
                  <span>{label}</span>
                  <b>{v}/10</b>
                </div>
              ))}
            </div>
            <p className="story-text">{p.ringkasan}</p>
            {p.langkah && (
              <p className="fb-next">
                <b>Langkah berikutnya:</b> {p.langkah}
              </p>
            )}
            <Chips items={p.roles.map((r) => r.nama)} />
            <button className="btn btn-lime" onClick={onDone}>
              Lanjut pilih role →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
