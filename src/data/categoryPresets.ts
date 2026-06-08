export interface IconGroup {
  label: string;
  icons: string[];
}

export const EXPENSE_ICONS: IconGroup[] = [
  { label: "Food & Dining", icons: ["🍕", "🍔", "🍱", "🍜", "🥗", "🍣", "🌮", "🍝", "🥐", "🍩", "☕", "🧃"] },
  { label: "Transport", icons: ["🚗", "🚌", "🚂", "✈️", "🚲", "🛵", "⛽", "🚇", "🚕", "🛴"] },
  { label: "Shopping", icons: ["🛒", "👕", "👗", "👟", "👜", "💄", "🎁", "🛍️", "👶", "🐾"] },
  { label: "Home & Bills", icons: ["🏠", "💡", "🔌", "📺", "🧹", "🔧", "🏗️", "📋", "💧", "🔥"] },
  { label: "Health", icons: ["💊", "🏥", "🩺", "💉", "🧘", "💪", "🧠", "🦷", "❤️"] },
  { label: "Entertainment", icons: ["🎬", "🎮", "🎵", "🎧", "📚", "🎭", "🏄", "🎯", "🎨", "🎪"] },
  { label: "Education", icons: ["📖", "✏️", "🎓", "📚", "💻", "🔬", "📐", "🌍", "🧪", "📝"] },
  { label: "Other Expense", icons: ["📦", "📌", "🔖", "💳", "📱", "⌚", "🎒", "🧳", "🎫", "♻️"] },
];

export const INCOME_ICONS: IconGroup[] = [
  { label: "Salary", icons: ["💰", "💵", "💶", "💷", "🏦", "📊", "💳", "🧾"] },
  { label: "Freelance", icons: ["💻", "📱", "🎨", "📝", "🎯", "🖥️", "📸", "✍️"] },
  { label: "Investment", icons: ["📈", "🏢", "💹", "📉", "🏛️", "💎", "🪙"] },
  { label: "Passive Income", icons: ["🏠", "🚗", "📦", "🔄", "🤖", "🌐", "📡"] },
  { label: "Gifts & Bonus", icons: ["🎁", "🎉", "🎊", "🧧", "💝", "✨", "🌟", "🎀"] },
  { label: "Other Income", icons: ["📌", "🔖", "📋", "📂", "📎", "🗂️", "📑", "📃"] },
];

export interface ColorOption {
  name: string;
  value: string;
}

export const CATEGORY_COLORS: ColorOption[] = [
  { name: "red", value: "#ef4444" },
  { name: "orange", value: "#f97316" },
  { name: "amber", value: "#f59e0b" },
  { name: "yellow", value: "#eab308" },
  { name: "lime", value: "#84cc16" },
  { name: "green", value: "#22c55e" },
  { name: "emerald", value: "#10b981" },
  { name: "teal", value: "#14b8a6" },
  { name: "cyan", value: "#06b6d4" },
  { name: "blue", value: "#3b82f6" },
  { name: "indigo", value: "#6366f1" },
  { name: "violet", value: "#8b5cf6" },
  { name: "purple", value: "#a855f7" },
  { name: "pink", value: "#ec4899" },
  { name: "rose", value: "#f43f5e" },
  { name: "gray", value: "#78716c" },
];

export function getIconsByType(type: "income" | "expense"): IconGroup[] {
  return type === "income" ? INCOME_ICONS : EXPENSE_ICONS;
}
