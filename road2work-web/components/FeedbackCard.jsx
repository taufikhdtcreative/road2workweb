import { Bar } from './dashboard/ui';

export default function FeedbackCard({ result }) {
  const bars = [
    ['Konteks pengalaman', result.konteks],
    ['Kontribusi pribadi', result.kontribusi],
    ['Hasil terukur', result.hasil],
  ];
  const kekuatan = result.kekuatan || [];
  const perbaikan = result.perbaikan || [];

  return (
    <div className="fbcard">
      <div className="fb-hero">
        <span className="mono">JAWABAN LEBIH TERUKUR</span>
        <b>{result.skor}%</b>
      </div>
      <div className="fb-body">
        {bars.map(([label, value]) => (
          <Bar key={label} label={label} value={value} />
        ))}
        {result.ringkasan && <p className="fb-sum">{result.ringkasan}</p>}
        {(kekuatan.length > 0 || perbaikan.length > 0) && (
          <div className="fb-cols">
            <div>
              <h4>Kekuatan</h4>
              <ul>
                {kekuatan.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Perlu diperbaiki</h4>
              <ul>
                {perbaikan.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {result.saran && (
          <p className="fb-next">
            <b>Latihan berikutnya:</b> {result.saran}
          </p>
        )}
        <p className="fb-note">Skor adalah perkiraan AI dari jawabanmu, bukan penilaian resmi.</p>
      </div>
    </div>
  );
}
