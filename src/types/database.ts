export type UserRole = "admin" | "user";

// ─── Profile ───────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  currency: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Pick<Profile, "id" | "full_name"> &
  Partial<Pick<Profile, "avatar_url" | "currency">>;

export type ProfileUpdate = Partial<
  Pick<Profile, "full_name" | "avatar_url" | "currency">
>;

// ─── Category ──────────────────────────────────────────────────────
export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
  created_at: string;
}

export type CategoryInsert = Omit<Category, "id" | "created_at">;

export type CategoryUpdate = Partial<
  Pick<Category, "name" | "icon" | "color" | "type">
>;

// ─── Income ────────────────────────────────────────────────────────
export interface Income {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  amount: number;
  date: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: "daily" | "weekly" | "monthly" | "yearly" | null;
  created_at: string;
  updated_at: string;
}

export type IncomeInsert = Omit<
  Income,
  "id" | "created_at" | "updated_at"
>;

export type IncomeUpdate = Partial<
  Pick<
    Income,
    | "title"
    | "amount"
    | "category_id"
    | "date"
    | "description"
    | "is_recurring"
    | "recurring_interval"
  >
>;

// ─── Expense ───────────────────────────────────────────────────────
export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  amount: number;
  date: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: "daily" | "weekly" | "monthly" | "yearly" | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseInsert = Omit<
  Expense,
  "id" | "created_at" | "updated_at"
>;

export type ExpenseUpdate = Partial<
  Pick<
    Expense,
    | "title"
    | "amount"
    | "category_id"
    | "date"
    | "description"
    | "is_recurring"
    | "recurring_interval"
  >
>;

// ─── Notification ──────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  is_read: boolean;
  created_at: string;
}

export type NotificationInsert = Omit<Notification, "id" | "created_at">;

export type NotificationUpdate = Partial<
  Pick<Notification, "is_read">
>;

// ─── Financial Goal ────────────────────────────────────────────────
export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  status: "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export type FinancialGoalInsert = Omit<
  FinancialGoal,
  "id" | "created_at" | "updated_at"
>;

export type FinancialGoalUpdate = Partial<
  Pick<
    FinancialGoal,
    | "title"
    | "target_amount"
    | "current_amount"
    | "deadline"
    | "category"
    | "status"
  >
>;

// ─── Joined types (for Supabase .select("*, categories(...)") ) ───
export interface IncomeWithCategory extends Income {
  categories: Pick<Category, "name" | "icon" | "color"> | null;
}

export interface ExpenseWithCategory extends Expense {
  categories: Pick<Category, "name" | "icon" | "color"> | null;
}