import { supabase } from "@/lib/supabase";
import type {
  Profile,
  UserRole,
  ProfileUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  Income,
  IncomeInsert,
  IncomeUpdate,
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  Notification,
  FinancialGoal,
  FinancialGoalInsert,
  FinancialGoalUpdate,
} from "@/types/database";

// ─── Profiles ───────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createCategory(
  category: CategoryInsert
): Promise<{ data: Category | null; error: string | null }> {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateCategory(
  categoryId: string,
  updates: CategoryUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId);

  return { error: error?.message ?? null };
}

export async function deleteCategory(
  categoryId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  return { error: error?.message ?? null };
}

// ─── Incomes ────────────────────────────────────────────────────────────────

function mapIncome(raw: any): Income & { category_name?: string; category_icon?: string; category_color?: string } {
  return {
    id: raw.id,
    user_id: raw.user_id,
    category_id: raw.category_id,
    title: raw.title,
    amount: raw.amount,
    date: raw.date,
    description: raw.description,
    is_recurring: raw.is_recurring,
    recurring_interval: raw.recurring_interval,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    category_name: raw.categories?.name,
    category_icon: raw.categories?.icon,
    category_color: raw.categories?.color,
  };
}

export async function getIncomes(
  userId: string,
  options?: { limit?: number; startDate?: string; endDate?: string }
): Promise<(Income & { category_name?: string; category_icon?: string; category_color?: string })[]> {
  let query = supabase
    .from("incomes")
    .select("*, categories(name, icon, color)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.startDate) query = query.gte("date", options.startDate);
  if (options?.endDate) query = query.lte("date", options.endDate);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching incomes:", error.message);
    return [];
  }

  return (data ?? []).map(mapIncome);
}

export async function getIncomeById(
  incomeId: string
): Promise<(Income & { category_name?: string; category_icon?: string; category_color?: string }) | null> {
  const { data, error } = await supabase
    .from("incomes")
    .select("*, categories(name, icon, color)")
    .eq("id", incomeId)
    .single();

  if (error) {
    console.error("Error fetching income:", error.message);
    return null;
  }

  return data ? mapIncome(data) : null;
}

export async function createIncome(
  income: IncomeInsert
): Promise<{ data: (Income & { category_name?: string; category_icon?: string; category_color?: string }) | null; error: string | null }> {
  const { data, error } = await supabase
    .from("incomes")
    .insert(income)
    .select("*, categories(name, icon, color)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapIncome(data), error: null };
}

export async function updateIncome(
  incomeId: string,
  updates: IncomeUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("incomes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", incomeId);

  return { error: error?.message ?? null };
}

export async function deleteIncome(
  incomeId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", incomeId);

  return { error: error?.message ?? null };
}

// ─── Expenses ───────────────────────────────────────────────────────────────

function mapExpense(raw: any): Expense & { category_name?: string; category_icon?: string; category_color?: string } {
  return {
    id: raw.id,
    user_id: raw.user_id,
    category_id: raw.category_id,
    title: raw.title,
    amount: raw.amount,
    date: raw.date,
    description: raw.description,
    is_recurring: raw.is_recurring,
    recurring_interval: raw.recurring_interval,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    category_name: raw.categories?.name,
    category_icon: raw.categories?.icon,
    category_color: raw.categories?.color,
  };
}

export async function getExpenses(
  userId: string,
  options?: { limit?: number; startDate?: string; endDate?: string }
): Promise<(Expense & { category_name?: string; category_icon?: string; category_color?: string })[]> {
  let query = supabase
    .from("expenses")
    .select("*, categories(name, icon, color)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.startDate) query = query.gte("date", options.startDate);
  if (options?.endDate) query = query.lte("date", options.endDate);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching expenses:", error.message);
    return [];
  }

  return (data ?? []).map(mapExpense);
}

export async function getExpenseById(
  expenseId: string
): Promise<(Expense & { category_name?: string; category_icon?: string; category_color?: string }) | null> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, categories(name, icon, color)")
    .eq("id", expenseId)
    .single();

  if (error) {
    console.error("Error fetching expense:", error.message);
    return null;
  }

  return data ? mapExpense(data) : null;
}

export async function createExpense(
  expense: ExpenseInsert
): Promise<{ data: (Expense & { category_name?: string; category_icon?: string; category_color?: string }) | null; error: string | null }> {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expense)
    .select("*, categories(name, icon, color)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapExpense(data), error: null };
}

export async function updateExpense(
  expenseId: string,
  updates: ExpenseUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("expenses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", expenseId);

  return { error: error?.message ?? null };
}

export async function deleteExpense(
  expenseId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  return { error: error?.message ?? null };
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function getNotifications(
  userId: string,
  unreadOnly?: boolean
): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (unreadOnly) query = query.eq("is_read", false);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error.message);
    return [];
  }
  return data ?? [];
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  return { error: error?.message ?? null };
}

export async function markAllNotificationsRead(
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return { error: error?.message ?? null };
}

// ─── Financial Goals ───────────────────────────────────────────────────────

export async function getFinancialGoals(
  userId: string
): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching financial goals:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createFinancialGoal(
  goal: FinancialGoalInsert
): Promise<{ data: FinancialGoal | null; error: string | null }> {
  const { data, error } = await supabase
    .from("financial_goals")
    .insert(goal)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateFinancialGoal(
  goalId: string,
  updates: FinancialGoalUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("financial_goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", goalId);

  return { error: error?.message ?? null };
}

export async function deleteFinancialGoal(
  goalId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("financial_goals")
    .delete()
    .eq("id", goalId);

  return { error: error?.message ?? null };
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all profiles:", error.message);
    return [];
  }
  return data ?? [];
}

export async function updateProfileAsAdmin(
  userId: string,
  updates: { full_name?: string; email?: string; role?: UserRole }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export async function deleteProfileAsAdmin(
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*, profiles(full_name, email)")
    .order("name");

  if (error) {
    console.error("Error fetching all categories:", error.message);
    return [];
  }
  return data ?? [];
}

export async function updateAnyCategory(
  categoryId: string,
  updates: CategoryUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId);

  return { error: error?.message ?? null };
}

export async function deleteAnyCategory(
  categoryId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  return { error: error?.message ?? null };
}

// ─── Dashboard / Aggregations ─────────────────────────────────────────────

export async function getMonthlySummary(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const [incomes, expenses] = await Promise.all([
    getIncomes(userId, { startDate, endDate }),
    getExpenses(userId, { startDate, endDate }),
  ]);

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, incomes, expenses };
}

export async function getYearlyAnalytics(userId: string, year: number) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const start = `${year}-${String(m).padStart(2, "0")}-01`;
    const end = `${year}-${String(m).padStart(2, "0")}-31`;
    return { month: m, start, end };
  });

  const results = await Promise.all(
    months.map(({ month, start, end }) =>
      Promise.all([
        getIncomes(userId, { startDate: start, endDate: end }),
        getExpenses(userId, { startDate: start, endDate: end }),
      ]).then(([incomes, expenses]) => {
        const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
        const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
        return { month, totalIncome, totalExpense, balance: totalIncome - totalExpense, incomes, expenses };
      })
    )
  );

  const yearTotalIncome = results.reduce((s, r) => s + r.totalIncome, 0);
  const yearTotalExpense = results.reduce((s, r) => s + r.totalExpense, 0);
  const monthsWithData = results.filter((r) => r.totalIncome > 0 || r.totalExpense > 0).length;

  return {
    months: results,
    yearTotalIncome,
    yearTotalExpense,
    yearBalance: yearTotalIncome - yearTotalExpense,
    monthsWithData,
    avgMonthlyIncome: monthsWithData > 0 ? yearTotalIncome / monthsWithData : 0,
    avgMonthlyExpense: monthsWithData > 0 ? yearTotalExpense / monthsWithData : 0,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error counting notifications:", error.message);
    return 0;
  }
  return count ?? 0;
}
