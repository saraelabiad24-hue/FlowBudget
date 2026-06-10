"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/useAuth";
import {
  getAllProfiles,
  getAllCategoriesAdmin,
  updateProfileAsAdmin,
  deleteProfileAsAdmin,
} from "@/services/services";
import type { Profile, Category, UserRole } from "@/types/database";
import { Spinner, Tabs, Tab } from "@heroui/react";
import { UsersTable } from "@/components/ui/UsersTable";
import { CategoriesSection } from "@/components/ui/CategoriesSection";

type TabKey = "users" | "categories";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<
    (Category & { profiles?: Pick<Profile, "full_name" | "email"> })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [p, c] = await Promise.all([
      getAllProfiles(),
      getAllCategoriesAdmin(),
    ]);
    setProfiles(p);
    setCategories(c);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingRoles((prev) => new Set(prev).add(userId));
    setError(null);
    const { error: err } = await updateProfileAsAdmin(userId, { role });
    if (err) {
      setError(err);
    }
    setUpdatingRoles((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
    fetchData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    setError(null);
    const { error: err } = await deleteProfileAsAdmin(userId);
    if (err) {
      setError(err);
      return;
    }
    fetchData();
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "users", label: "Users" },
    { key: "categories", label: "Categories" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          setActiveTab(key as TabKey);
          setError(null);
        }}
        className="mb-6"
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : activeTab === "users" ? (
        <UsersTable
          profiles={profiles}
          updatingRoles={updatingRoles}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteUser}
        />
      ) : (
        <CategoriesSection
          categories={categories}
          onUpdated={fetchData}
          setError={setError}
        />
      )}
    </div>
  );
}
