"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/useAuth";
import {
  getAllProfiles,
  getAllCategoriesAdmin,
  updateProfileAsAdmin,
  deleteProfileAsAdmin,
  updateAnyCategory,
  deleteAnyCategory,
  getProfile,
} from "@/services/services";
import type { Profile, Category, UserRole } from "@/types/database";

type Tab = "users" | "categories";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<(Category & { profiles?: Pick<Profile, "full_name" | "email"> })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editingCategory, setEditingCategory] = useState<(Category & { profiles?: Pick<Profile, "full_name" | "email"> }) | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [p, c] = await Promise.all([getAllProfiles(), getAllCategoriesAdmin()]);
    setProfiles(p);
    setCategories(c);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    const { error: err } = await deleteProfileAsAdmin(userId);
    if (err) { setError(err); return; }
    fetchData();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const { error: err } = await updateProfileAsAdmin(editingUser.id, {
      full_name: data.get("full_name") as string,
      role: data.get("role") as UserRole,
    });
    if (err) { setError(err); return; }
    setEditingUser(null);
    fetchData();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this category?")) return;
    const { error: err } = await deleteAnyCategory(categoryId);
    if (err) { setError(err); return; }
    fetchData();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const { error: err } = await updateAnyCategory(editingCategory.id, {
      name: data.get("name") as string,
      type: data.get("type") as "income" | "expense",
      icon: (data.get("icon") as string) || null,
      color: (data.get("color") as string) || null,
    });
    if (err) { setError(err); return; }
    setEditingCategory(null);
    fetchData();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "users", label: "Users", icon: "👥" },
    { key: "categories", label: "Categories", icon: "🏷️" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : activeTab === "users" ? (
        <UsersSection profiles={profiles} onEdit={setEditingUser} onDelete={handleDeleteUser} />
      ) : (
        <CategoriesSection categories={categories} onEdit={setEditingCategory} onDelete={handleDeleteCategory} />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit User</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="full_name" defaultValue={editingUser.full_name} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" defaultValue={editingUser.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Category</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" defaultValue={editingCategory.name} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" defaultValue={editingCategory.type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input name="icon" defaultValue={editingCategory.icon || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 🍕" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input name="color" defaultValue={editingCategory.color || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. #ef4444" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersSection({
  profiles,
  onEdit,
  onDelete,
}: {
  profiles: Profile[];
  onEdit: (p: Profile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Currency</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No users found</td></tr>
          ) : profiles.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.full_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.email}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {p.role === "admin" ? "Admin" : "User"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.currency}</td>
              <td className="px-6 py-4 text-sm text-right space-x-2">
                <button onClick={() => onEdit(p)} className="text-gray-400 hover:text-purple-600 transition">✏️</button>
                <button onClick={() => onDelete(p.id)} className="text-gray-400 hover:text-red-600 transition">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesSection({
  categories,
  onEdit,
  onDelete,
}: {
  categories: (Category & { profiles?: Pick<Profile, "full_name" | "email"> })[];
  onEdit: (c: Category & { profiles?: Pick<Profile, "full_name" | "email"> }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-3 font-medium">Icon</th>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Owner</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No categories found</td></tr>
          ) : categories.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-lg">{c.icon}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  c.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>{c.type}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{c.profiles?.full_name || "Unknown"}</td>
              <td className="px-6 py-4 text-sm text-right space-x-2">
                <button onClick={() => onEdit(c)} className="text-gray-400 hover:text-purple-600 transition">✏️</button>
                <button onClick={() => onDelete(c.id)} className="text-gray-400 hover:text-red-600 transition">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
