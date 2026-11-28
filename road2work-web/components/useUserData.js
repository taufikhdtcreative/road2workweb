'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { hasSupabase, supabase } from '../lib/supabase';
import { load, save } from '../lib/store';

const EMPTY = { profile: null, target: null, history: [] };

const normalize = (d) => ({
  profile: d?.profile || null,
  target: d?.target || null,
  history: Array.isArray(d?.history) ? d.history : [],
});
const hasContent = (d) => !!(d.profile || d.target || d.history.length);

// Data pengguna: profil, target role, riwayat sesi.
// Selalu disimpan di browser (cache). Jika Supabase aktif, disinkronkan ke tabel user_data
// sehingga bisa dibuka dari HP maupun laptop.
export function useUserData(uid) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const dirty = useRef(false);
  const uidRef = useRef(uid);

  useEffect(() => {
    if (!uid) return;
    uidRef.current = uid;
    let cancelled = false;
    setLoading(true);

    (async () => {
      let d = normalize(load(uid, 'doc', null));
      let pendingUpload = false;

      if (hasSupabase) {
        const { data: row, error: e } = await supabase.from('user_data').select('data').maybeSingle();
        if (cancelled) return;
        if (e) {
          const missing = e.code === 'PGRST205' || e.code === '42P01' || /user_data/.test(e.message || '');
          setError(
            missing
              ? 'Tabel database belum dibuat. Jalankan SQL di README (bagian Supabase). Sementara ini datamu hanya tersimpan di perangkat ini.'
              : 'Tidak bisa menyinkronkan data. Menampilkan data yang tersimpan di perangkat ini.'
          );
        } else if (row && row.data) {
          d = normalize(row.data);
        } else if (hasContent(d)) {
          pendingUpload = true; // data lokal lama, belum ada di server
        }
      }

      ref.current = d;
      setData(d);
      setLoading(false);
      if (pendingUpload) {
        dirty.current = true;
        timer.current = setTimeout(flush, 300);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (!dirty.current || !ref.current || !uidRef.current) return;
    dirty.current = false;
    save(uidRef.current, 'doc', ref.current);
    if (!hasSupabase) return;
    setSaving(true);
    const { error: e } = await supabase
      .from('user_data')
      .upsert({ user_id: uidRef.current, data: ref.current, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    setSaving(false);
    if (e) {
      dirty.current = true;
      setError('Perubahan belum tersimpan ke server. Akan dicoba lagi saat kamu mengubah sesuatu.');
    } else {
      setError((prev) => (prev.startsWith('Perubahan belum') ? '' : prev));
    }
  }, []);

  const update = useCallback(
    (fn) => {
      const next = normalize(fn(ref.current || EMPTY));
      ref.current = next;
      setData(next);
      dirty.current = true;
      save(uidRef.current, 'doc', next); // cache lokal langsung
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 700);
    },
    [flush]
  );

  const wipe = useCallback(async () => {
    ref.current = EMPTY;
    setData(EMPTY);
    dirty.current = true;
    await flush();
  }, [flush]);

  // Simpan sisa perubahan saat tab ditutup atau pindah halaman.
  useEffect(() => {
    const h = () => flush();
    window.addEventListener('pagehide', h);
    return () => {
      window.removeEventListener('pagehide', h);
      flush();
    };
  }, [flush]);

  return { data, loading, error, saving, update, wipe };
}
