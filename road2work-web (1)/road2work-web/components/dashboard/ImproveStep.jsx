'use client';

import FeedbackCard from '../FeedbackCard';
import { Empty } from './ui';

const dateId = (t) =>
  new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function ImproveStep({ data, goPractice }) {
  const history = data.history;
  if (!history.length) {
    return (
      <Empty
        title="Belum ada sesi latihan"
        text="Selesaikan satu sesi interview, lalu hasil dan gap yang perlu diperbaiki muncul di sini."
        action={goPractice}
        actionLabel="Mulai latihan"
      />
    );
  }

  const last = history[0];
  const prev = history[1];
  const delta = prev ? last.result.skor - prev.result.skor : null;
  const trend = history.slice(0, 8).reverse();

  return (
    <div>
      <h2 className="panel-title">Baca feedback, lanjutkan yang paling berdampak</h2>
      <p className="panel-sub">
        Sesi terakhir: {last.role}, {dateId(last.at)}
        {delta !== null && (
          <>
            {' '}
            <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>
              {delta >= 0 ? '+' : ''}
              {delta} dari sesi sebelumnya
            </span>
          </>
        )}
      </p>

      <div className="split">
        <FeedbackCard result={last.result} />

        <div className="stack">
          <div className="panel-card">
            <h3 className="mini-title">Perkembangan skor</h3>
            <div className="trend" role="img" aria-label="Grafik skor sesi latihan">
              {trend.map((h) => (
                <div key={h.id} className="trend-col" title={`${h.result.skor}%`}>
                  <b>{h.result.skor}</b>
                  <i style={{ height: `${Math.max(6, h.result.skor)}%` }} />
                </div>
              ))}
            </div>
            <button className="btn btn-lime" onClick={goPractice}>
              Latihan lagi
            </button>
          </div>

          <div className="panel-card">
            <h3 className="mini-title">Riwayat sesi</h3>
            <ul className="hist">
              {history.map((h) => (
                <li key={h.id}>
                  <div>
                    <b>{h.role}</b>
                    <span>{dateId(h.at)}</span>
                  </div>
                  <em>{h.result.skor}%</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
