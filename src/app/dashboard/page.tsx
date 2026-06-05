import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useauth";
import { getMonthlySummary, getIncomes, getExpenses } from "../../lib/services";
import type { Income, Expense } from "../../types/database";

function StatCard({
  title,
  amount,
  type,
}: {
  title: string;
  amount: number;
  type: "balance" | "income" | "expense" | "savings";
}) {
  const colors = {
    balance: "bg-gradient-to-br from-blue-500 to-blue-700",
    income: "bg-gradient-to-br from-green-500 to-green-700",
    expense: "bg-gradient-to-br from-red-500 to-red-700",
    savings: "bg-gradient-to-br from-purple-500 to-purple-700",
  };

  const prefixes = {
    balance: "",
    income: "+",
    expense: "-",
    savings: "+",
  };

  return (
    <div className={`${colors[type]} rounded-2xl p-6 text-white shadow-lg`}>
      <p className="text-sm opacity-80 mb-1">{title}</p>
      <p className="text-3xl font-bold">
        {prefixes[type]}${amount.toLocaleString()}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomes: [] as Income[],
    expenses: [] as Expense[],
  });
  const [recentTransactions, setRecentTransactions] = useState<
    { id: string; title: string; amount: number; type: "income" | "expense"; category: string; date: string; category_color?: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      const now = new Date();
      const data = await getMonthlySummary(user.id, now.getFullYear(), now.getMonth() + 1);

      // Get last 10 transactions across incomes and expenses
      const [recentIncomes, recentExpenses] = await Promise.all([
        getIncomes(user.id, { limit: 10 }),
        getExpenses(user.id, { limit: 10 }),
      ]);

      // Merge and sort by date
      const merged = [
        ...recentIncomes.map((inc) => ({
          id: inc.id,
          title: inc.title,
          amount: inc.amount,
          type: "income" as const,
          category: inc.category_name || "Uncategorized",
          date: inc.date,
          category_color: inc.category_color,
        })),
        ...recentExpenses.map((exp) => ({
          id: exp.id,
          title: exp.title,
          amount: exp.amount,
          type: "expense" as const,
          category: exp.category_name || "Uncategorized",
          date: exp.date,
          category_color: exp.category_color,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setSummary(data);
      setRecentTransactions(merged);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Group incomes & expenses by category for breakdown
  const incomeByCategory = summary.incomes.reduce<Record<string, number>>((acc, inc) => {
    const cat = inc.category_name || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(inc.amount);
    return acc;
  }, {});

  const expenseByCategory = summary.expenses.reduce<Record<string, number>>((acc, exp) => {
    const cat = exp.category_name || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const maxIncomeCat = Math.max(...Object.values(incomeByCategory), 1);
  const maxExpenseCat = Math.max(...Object.values(expenseByCategory), 1);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.full_name || user?.email || "User"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's your financial overview for{" "}
              {new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Current Balance" amount={summary.balance} type="balance" />
              <StatCard title="Monthly Income" amount={summary.totalIncome} type="income" />
              <StatCard title="Monthly Expenses" amount={summary.totalExpense} type="expense" />
              <StatCard title="Estimated Savings" amount={summary.balance} type="savings" />
            </div>

            {/* Income & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Income Breakdown
                </h2>
                {Object.keys(incomeByCategory).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No income this month</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(incomeByCategory).map(([cat, amount]) => (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-medium text-green-600">
                            +${amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(amount / maxIncomeCat) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Expense Breakdown
                </h2>
                {Object.keys(expenseByCategory).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No expenses this month</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(expenseByCategory).map(([cat, amount]) => (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-medium text-red-600">
                            -${amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(amount / maxExpenseCat) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">Title</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {tx.title}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {tx.category}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {tx.date}
                          </td>
                          <td
                            className={`py-3 text-sm font-medium text-right ${
                              tx.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "-"}$
                            {tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}