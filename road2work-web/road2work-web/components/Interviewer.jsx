'use client';

import { useEffect, useRef, useState } from 'react';

const ROLES = ['Fresh Graduate', 'Marketing', 'Finance', 'Data Analyst', 'HR', 'Customer Service', 'Software Engineer'];

const STATUS_LABEL = {
  idle: 'Siap, giliranmu',
  listening: 'Aku dengerin…',
  thinking: 'Raka lagi mikir…',
  speaking: 'Raka lagi bicara',
};

const speechText = (t) => t.replace(/[*_#`>]/g, '').replace(/\s+/g, ' ').trim();

export default function Interviewer() {
  const [role, setRole] = useState(ROLES[0]);
  const [custom, setCustom] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [status, setStatus] = useState('idle');
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [auto, setAuto] = useState(true);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [canListen, setCanListen] = useState(false);

  const msgsRef = useRef([]);
  const recRef = useRef(null);
  const roleRef = useRef(ROLES[0]);
  const voiceRef = useRef(true);
  const autoRef = useRef(true);
  const endedRef = useRef(false);
  const statusRef = useRef('idle');
  const logRef = useRef(null);

  const roleValue = custom.trim() || role;

  useEffect(() => {
    roleRef.current = roleValue;
  }, [roleValue]);
  useEffect(() => {
    voiceRef.current = voiceOn;
    if (!voiceOn && typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, [voiceOn]);
  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    setCanListen(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    window.speechSynthesis?.getVoices();
    return () => {
      window.speechSynthesis?.cancel();
      try {
        recRef.current?.abort();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, interim, status, error]);

  function commit(next) {
    msgsRef.current = next;
    setMsgs(next);
  }

  function stopAll() {
    window.speechSynthesis?.cancel();
    try {
      recRef.current?.abort();
    } catch {}
    recRef.current = null;
    setInterim('');
  }

  function afterSpeak() {
    if (autoRef.current && !endedRef.current && canListenNow()) listen();
    else setStatus('idle');
  }

  function canListenNow() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function speak(reply) {
    const synth = window.speechSynthesis;
    if (!voiceRef.current || !synth) {
      afterSpeak();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(speechText(reply));
    u.lang = 'id-ID';
    u.rate = 1.02;
    const voice = synth.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('id'));
    if (voice) u.voice = voice;

    // Pengaman: sebagian browser/perangkat tidak punya suara dan tidak pernah memicu onend.
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(startGuard);
      afterSpeak();
    };
    const startGuard = setTimeout(done, 4000);
    u.onstart = () => {
      clearTimeout(startGuard);
      setStatus('speaking');
    };
    u.onend = done;
    u.onerror = done;
    setStatus('speaking');
    synth.speak(u);
  }

  async function callAI(history, mode) {
    setStatus('thinking');
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          role: roleRef.current,
          mode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
      commit([...history, { role: 'assistant', content: data.reply }]);
      speak(data.reply);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan. Coba lagi.');
      setStatus('idle');
    }
  }

  function send(raw) {
    const t = raw.trim();
    if (!t || endedRef.current || statusRef.current === 'thinking') return;
    stopAll();
    setText('');
    const next = [...msgsRef.current, { role: 'user', content: t }];
    commit(next);
    callAI(next, 'chat');
  }

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || endedRef.current) return;
    window.speechSynthesis?.cancel();
    try {
      recRef.current?.abort();
    } catch {}

    const rec = new SR();
    rec.lang = 'id-ID';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';

    rec.onstart = () => {
      setError('');
      setStatus('listening');
    };
    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + ' ';
        else live += r[0].transcript;
      }
      setInterim((finalText + live).trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Izin mikrofon ditolak. Aktifkan izin mikrofon di browser, atau ketik jawabanmu.');
        setAuto(false);
      } else if (e.error === 'network') {
        setError('Pengenalan suara butuh koneksi internet. Coba lagi atau ketik jawabanmu.');
      }
    };
    rec.onend = () => {
      if (recRef.current === rec) recRef.current = null;
      setInterim('');
      const t = finalText.trim();
      if (t) send(t);
      else if (statusRef.current === 'listening') setStatus('idle');
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      setStatus('idle');
    }
  }

  function toggleMic() {
    if (status === 'listening') {
      try {
        recRef.current?.stop();
      } catch {}
    } else if (status !== 'thinking') {
      listen();
    }
  }

  function start() {
    stopAll();
    // buka kunci suara di iOS/Safari lewat interaksi pengguna
    try {
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(''));
    } catch {}
    endedRef.current = false;
    setEnded(false);
    setStarted(true);
    const first = [{ role: 'user', content: 'Mulai interview.', hidden: true }];
    commit(first);
    callAI(first, 'chat');
  }

  function finish() {
    if (statusRef.current === 'thinking') return;
    stopAll();
    endedRef.current = true;
    setEnded(true);
    const next = [...msgsRef.current, { role: 'user', content: 'Akhiri sesi dan berikan penilaian akhir.', hidden: true }];
    commit(next);
    callAI(next, 'final');
  }

  function reset() {
    stopAll();
    endedRef.current = false;
    commit([]);
    setStarted(false);
    setEnded(false);
    setStatus('idle');
    setError('');
  }

  const visible = msgs.filter((m) => !m.hidden);
  const busy = status === 'thinking';

  return (
    <div className="talk-card">
      <aside className="talk-side">
        <div className={`orb-wrap`} data-state={status}>
          <div className="orb" aria-hidden="true">
            <span className="ring r1" />
            <span className="ring r2" />
            <span className="core" />
          </div>
          <div className="voice-bars" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
          <p className="orb-label" aria-live="polite">
            {started ? STATUS_LABEL[status] : 'Pilih posisi, lalu mulai'}
          </p>
        </div>

        <fieldset className="role-box" disabled={started && !ended}>
          <legend>Posisi yang kamu incar</legend>
          <div className="chips">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                className={`chip ${!custom.trim() && role === r ? 'on' : ''}`}
                onClick={() => {
                  setRole(r);
                  setCustom('');
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            className="field"
            type="text"
            maxLength={60}
            placeholder="Atau ketik posisi lain…"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            aria-label="Posisi lain"
          />
        </fieldset>

        <div className="toggles">
          <label className="switch">
            <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} />
            <span className="track" />
            Suara AI
          </label>
          <label className={`switch ${!canListen ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={auto && canListen}
              disabled={!canListen}
              onChange={(e) => setAuto(e.target.checked)}
            />
            <span className="track" />
            Mode ngobrol otomatis
          </label>
        </div>

        {!started ? (
          <button className="btn btn-lime btn-lg" onClick={start}>
            Mulai interview
          </button>
        ) : (
          <div className="side-actions">
            <button className="btn btn-outline" onClick={finish} disabled={busy || ended || visible.length < 3}>
              Akhiri &amp; nilai
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              Ulang
            </button>
          </div>
        )}

        {!canListen && (
          <p className="note">
            Browser ini belum mendukung input suara. Pakai Chrome, Edge, atau Safari terbaru, atau cukup ketik jawabanmu.
          </p>
        )}
        <p className="note">Pengenalan suara dijalankan browser-mu (di Chrome diproses server Google). Teks jawabanmu dikirim ke AI.</p>
      </aside>

      <div className="talk-main">
        <div className="chat-log" ref={logRef} role="log" aria-live="polite">
          {!started && (
            <div className="chat-empty">
              <p className="serif">Ngobrol langsung,</p>
              <p className="serif it">tanpa deg-degan.</p>
              <span>Raka, AI interviewer-mu, akan bertanya seperti interview sungguhan. Jawab dengan suara atau ketikan.</span>
            </div>
          )}
          {visible.map((m, i) => (
            <div key={i} className={`bubble ${m.role === 'assistant' ? 'ai' : 'me'}`}>
              <b>{m.role === 'assistant' ? 'Raka' : 'Kamu'}</b>
              <p>{m.content}</p>
            </div>
          ))}
          {interim && (
            <div className="bubble me live">
              <b>Kamu</b>
              <p>{interim}</p>
            </div>
          )}
          {busy && (
            <div className="bubble ai typing" aria-label="Raka sedang mengetik">
              <i />
              <i />
              <i />
            </div>
          )}
          {error && <div className="err">{error}</div>}
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          {canListen && (
            <button
              type="button"
              className={`mic ${status === 'listening' ? 'on' : ''}`}
              onClick={toggleMic}
              disabled={!started || ended || busy}
              aria-label={status === 'listening' ? 'Berhenti merekam' : 'Mulai bicara'}
              aria-pressed={status === 'listening'}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
          )}
          <input
            className="field grow"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={started ? (ended ? 'Sesi selesai. Tekan Ulang untuk mulai lagi.' : 'Ketik jawabanmu…') : 'Mulai interview dulu ya'}
            disabled={!started || ended || busy}
            maxLength={1500}
            aria-label="Jawabanmu"
          />
          <button className="btn btn-lime send" type="submit" disabled={!started || ended || busy || !text.trim()}>
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
