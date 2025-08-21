"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const goHome = () => router.replace("/home");

  const handleChangePassword = async () => {
    if (!user?.email) {
      setMessage("No email associated with this account.");
      return;
    }
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (e: any) {
      setMessage(e.message || "Failed to send reset email.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const ok = confirm("Delete account permanently? This cannot be undone.");
    if (!ok) return;
    try {
      setBusy(true);
      await deleteUser(auth.currentUser!);
      // After deletion, route to auth page
      router.replace("/auth");
    } catch (e: any) {
      // Most likely requires recent login
      setMessage(e.message || "Deletion failed. You may need to reauthenticate.");
    } finally {
      setBusy(false);
    }
  };

  const Row = ({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center border border-gray-800 bg-white text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
    >
      <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 text-left px-4 py-3">{label}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            type="button"
            onClick={goHome}
            className="w-7 h-7 bg-black text-white flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-wide">SETTINGS</h1>
        </div>

        {/* Rows - black & white */}
        <div className="space-y-3">
          <Row
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="12" r="3" fill="white" stroke="white" />
                <path d="M10 12h9l-3-3" stroke="white" />
                <path d="M16 15l3-3" stroke="white" />
              </svg>
            }
            label="Change password"
            onClick={handleChangePassword}
          />
          <Row
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9" />
                <path d="M15 12l5 3v-6l-5 3z" fill="white" stroke="white" />
              </svg>
            }
            label="Log out"
            onClick={() => logout()}
          />
          <Row
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            }
            label="Delete account"
            onClick={handleDeleteAccount}
          />
        </div>

        {/* Inline messages */}

        {message && (
          <div className="mt-4 text-sm text-gray-700">{message}</div>
        )}
      </div>
    </div>
  );
}
