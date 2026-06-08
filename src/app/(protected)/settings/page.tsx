"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Navbar/Sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { getProfile, updateProfile } from "@/services/services";
import type { Profile } from "@/types/database";

const loadingSpinner = (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function SettingsPage() {
  const { user, session } = useAuth();
  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    currency: "USD",
    avatar_url: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getProfile(user.id);
    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || user.full_name || "",
        currency: data.currency || "USD",
        avatar_url: data.avatar_url || "",
      });
    } else {
      setFormData({
        full_name: user.full_name || "",
        currency: "USD",
        avatar_url: "",
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMessage(null);

    const { error } = await updateProfile(user.id, {
      full_name: formData.full_name,
      currency: formData.currency,
      avatar_url: formData.avatar_url || null,
    });

    setSaving(false);

    if (error) {
      alert("Error saving profile: " + error);
    } else {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
        </div>

        {successMessage ? (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 border border-green-200">
            {successMessage}
          </div>
        ) : null}

        {loading ? loadingSpinner : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={user?.email || ""} disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                  <input type="url" value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com/avatar.jpg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="MAD">MAD - Moroccan Dirham</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">User ID</span>
                  <span className="text-gray-900 font-mono text-xs">{user?.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Auth Provider</span>
                  <span className="text-gray-900">{session?.user?.app_metadata?.provider || "Email"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
