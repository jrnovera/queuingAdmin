'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    username: '',
    birthday: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        interface UserData {
          displayName?: string;
          username?: string;
          birthday?: string;
          address?: string;
          phone?: string;
        }
        const userData = data as UserData;
        setForm({
          name: user.displayName || userData.displayName || '',
          username: userData.username || '',
          birthday: userData.birthday || '',
          address: userData.address || '',
          phone: userData.phone || '',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const goBack = () => router.replace('/home');

  const onChange = (k: keyof typeof form, v: string) => setForm(s => ({ ...s, [k]: v }));

  // Try to format arbitrary date strings to yyyy-MM-ddTHH:mm for datetime-local inputs
  const formatForDateTimeInput = (s: string): string => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };

  const saveChanges = async () => {
    if (!user) return;
    try {
      setBusy(true);
      setMessage(null);
      // Update Auth displayName
      if (form.name && form.name !== user.displayName) {
        await updateProfile(auth.currentUser!, { displayName: form.name.trim() });
      }
      // Merge to Firestore
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, {
        uid: user.uid,
        email: user.email || '',
        displayName: form.name || '',
        username: form.username || '',
        birthday: form.birthday || '',
        address: form.address || '',
        phone: form.phone || '',
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch (e: Error | unknown) {
      setMessage(e instanceof Error ? e.message : 'Failed to update profile.');
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const Field = ({ label, value, onInput, readOnly, type }: { label: string; value: string; onInput: (v: string) => void; readOnly: boolean; type?: string; }) => (
    <div className="flex items-stretch">
      <div className="w-48 bg-black text-white px-3 py-2 text-sm font-semibold flex items-center">
        {label}
      </div>
      <input
        className={`flex-1 border border-black px-3 py-2 outline-none ${readOnly ? 'bg-white' : 'bg-white'}`}
        type={readOnly ? 'text' : (type || 'text')}
        value={!readOnly && type === 'datetime-local' ? formatForDateTimeInput(value) : value}
        readOnly={readOnly}
        onChange={(e) => onInput(e.target.value)}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <button
            type="button"
            onClick={goBack}
            className="w-7 h-7 bg-black text-white flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-wide">ACCOUNT</h1>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Avatar */}
          <div className={`border-2 border-black rounded-2xl w-64 h-64 flex items-center justify-center ${editing ? 'ring-2 ring-purple-600' : ''}`}>
            <svg className="w-32 h-32 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <Field label="NAME" value={form.name} onInput={(v) => onChange('name', v)} readOnly={!editing} />
            <Field label="USERNAME" value={form.username} onInput={(v) => onChange('username', v)} readOnly={!editing} />
            <Field label="BIRTHDAY" value={form.birthday} onInput={(v) => onChange('birthday', v)} readOnly={!editing} type="datetime-local" />
            <Field label="ADDRESS" value={form.address} onInput={(v) => onChange('address', v)} readOnly={!editing} />
            <Field label="PHONE NUMBER" value={form.phone} onInput={(v) => onChange('phone', v)} readOnly={!editing} />

            {/* Action button */}
            <div className="pt-2">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-black text-white font-semibold"
                >
                  EDIT PROFILE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="px-6 py-3 bg-black text-white font-semibold"
                >
                  DONE
                </button>
              )}
            </div>
          </div>
        </div>

        {message && <div className="mt-6 text-sm text-gray-800">{message}</div>}
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-black rounded-2xl w-full max-w-xl">
            <div className="px-6 py-4 text-center font-semibold border-b border-black">SAVE CHANGES</div>
            <div className="px-6 py-6 flex items-center justify-center gap-6">
              <button
                type="button"
                disabled={busy}
                onClick={saveChanges}
                className="px-6 py-2 border border-black rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Yes
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => { setConfirmOpen(false); setEditing(false); }}
                className="px-6 py-2 border border-black rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
