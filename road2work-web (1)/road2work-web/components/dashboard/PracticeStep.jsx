'use client';

import Interviewer from '../Interviewer';
import { Empty } from './ui';

export default function PracticeStep({ data, update, goRole, goImprove }) {
  const t = data.target;
  if (!t) {
    return (
      <Empty
        title="Pilih target role dulu"
        text="Pertanyaan interview disesuaikan dengan role yang kamu tuju dan profilmu."
        action={goRole}
        actionLabel="Ke Role"
      />
    );
  }

  const context = [
    data.profile && data.profile.profilSingkat,
    t.gap && t.gap.length ? `Area yang perlu diuji: ${t.gap.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <h2 className="panel-title">Latihan interview berbasis suara</h2>
      <p className="panel-sub">
        Jawab natural dengan suara atau ketikan. Setelah beberapa pertanyaan, akhiri sesi untuk membaca kualitas jawabanmu.
      </p>
      <Interviewer
        key={t.nama}
        role={t.nama}
        profile={context}
        onComplete={(entry) => update((d) => ({ ...d, history: [entry, ...d.history].slice(0, 30) }))}
        onViewResult={goImprove}
      />
    </div>
  );
}
