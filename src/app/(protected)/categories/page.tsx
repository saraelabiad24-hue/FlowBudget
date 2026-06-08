"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Navbar/Sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { getCategories, createCategory, updateCategory, deleteCategory, getProfile } from "@/services/services";
import type { Category } from "@/types/database";
import IconPicker from "@/components/ui/IconPicker";
import ColorPicker from "@/components/ui/ColorPicker";

const loadingSpinner = (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const emptyState = (
  <div className="text-center py-20 text-gray-500">
    <p className="text-4xl mb-4">🏷️</p>
    <p className="text-lg font-medium">No categories yet</p>
    <p className="text-sm mt-1">Create categories to organize your transactions</p>
  </div>
);

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "",
    color: "",
  });

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [data, profile] = await Promise.all([
      getCategories(user.id),
      getProfile(user.id),
    ]);
    if (profile?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setCategories(data);
    setIsAdmin(true);
    setLoading(false);
  }, [user, router]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setFormData({ name: "", type: "expense", icon: "", color: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      const { error } = await updateCategory(editingId, formData);
      if (!error) { resetForm(); fetchCategories(); }
    } else {
      const { error } = await createCategory({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        icon: formData.icon || null,
        color: formData.color || null,
      });
      if (!error) { resetForm(); fetchCategories(); }
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, type: cat.type, icon: cat.icon || "", color: cat.color || "" });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const { error } = await deleteCategory(id);
    if (!error) fetchCategories();
  };

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === "income"), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === "expense"), [categories]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            {showForm ? "Cancel" : "+ Add Category"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Groceries" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "income" | "expense" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="expense">Expense</option><option value="income">Income</option>
                </select>
              </div>
              <IconPicker value={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} type={formData.type} />
              <ColorPicker value={formData.color} onChange={(color) => setFormData({ ...formData, color })} />
            </div>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              {editingId ? "Update" : "Create"} Category
            </button>
          </form>
        ) : null}

        {loading ? loadingSpinner : categories.length === 0 ? emptyState : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>Expense Categories
              </h2>
              <div className="space-y-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <><button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-blue-600 text-sm">✏️</button>
                        <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button></>
                      )}
                    </div>
                  </div>
                ))}
                {expenseCategories.length === 0 ? <p className="text-sm text-gray-400 italic pl-2">No expense categories</p> : null}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>Income Categories
              </h2>
              <div className="space-y-2">
                {incomeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <><button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-blue-600 text-sm">✏️</button>
                        <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button></>
                      )}
                    </div>
                  </div>
                ))}
                {incomeCategories.length === 0 ? <p className="text-sm text-gray-400 italic pl-2">No income categories</p> : null}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
