"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Navbar/Sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { getMonthlySummary, getIncomes, getExpenses, getYearlyAnalytics } from "@/services/services";
import type { Income, Expense } from "@/types/database";

const StatCard = memo(function StatCard({
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
});

const KpiCard = memo(function KpiCard({
  label,
  value,
  icon,
  positive,
}: {
  label: string;
  value: string;
  icon: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs font-medium ${positive === undefined ? "text-gray-500" : positive ? "text-green-600" : "text-red-600"}`}>
          {positive === undefined ? "" : positive ? "▲" : "▼"}
        </span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
});

const InsightCard = memo(function InsightCard({
  message,
  type,
}: {
  message: string;
  type: "positive" | "negative" | "neutral";
}) {
  const icons = { positive: "✅", negative: "⚠️", neutral: "💡" };
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
      <span className="text-lg mt-0.5">{icons[type]}</span>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  );
});

const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

const loadingSpinner = (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  type IncomeWithCategory = Income & { category_name?: string; category_icon?: string; category_color?: string };
  type ExpenseWithCategory = Expense & { category_name?: string; category_icon?: string; category_color?: string };

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomes: [] as IncomeWithCategory[],
    expenses: [] as ExpenseWithCategory[],
  });
  const [recentTransactions, setRecentTransactions] = useState<
    { id: string; title: string; amount: number; type: "income" | "expense"; category: string; date: string; category_color?: string }[]
  >([]);
  const [yearlyAnalytics, setYearlyAnalytics] = useState<{
    months: { month: number; totalIncome: number; totalExpense: number; balance: number }[];
    yearTotalIncome: number;
    yearTotalExpense: number;
    yearBalance: number;
    monthsWithData: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
  } | null>(null);
  const [prevSummary, setPrevSummary] = useState<{ totalIncome: number; totalExpense: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const fetchData = async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1;

      let prevMonth = currentMonthNum - 1;
      let prevYear = currentYear;
      if (prevMonth === 0) { prevMonth = 12; prevYear = currentYear - 1; }

      const [summaryData, recentIncomes, recentExpenses, yearlyData, prevData] = await Promise.all([
        getMonthlySummary(user.id, currentYear, currentMonthNum),
        getIncomes(user.id, { limit: 10 }),
        getExpenses(user.id, { limit: 10 }),
        getYearlyAnalytics(user.id, currentYear),
        getMonthlySummary(user.id, prevYear, prevMonth),
      ]);

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

      setSummary(summaryData);
      setRecentTransactions(merged);
      setYearlyAnalytics(yearlyData);
      setPrevSummary(prevData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const incomeByCategory = useMemo(() => {
    return summary.incomes.reduce<Record<string, number>>((acc, inc) => {
      const cat = inc.category_name || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + Number(inc.amount);
      return acc;
    }, {});
  }, [summary.incomes]);

  const expenseByCategory = useMemo(() => {
    return summary.expenses.reduce<Record<string, number>>((acc, exp) => {
      const cat = exp.category_name || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + Number(exp.amount);
      return acc;
    }, {});
  }, [summary.expenses]);

  const maxIncomeCat = Math.max(...Object.values(incomeByCategory), 1);
  const maxExpenseCat = Math.max(...Object.values(expenseByCategory), 1);

  const incomeBars = useMemo(() => {
    return Object.entries(incomeByCategory).map(([cat, amount]) => (
      <div key={cat}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">{cat}</span>
          <span className="font-medium text-green-600">+${amount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(amount / maxIncomeCat) * 100}%` }} />
        </div>
      </div>
    ));
  }, [incomeByCategory, maxIncomeCat]);

  const expenseBars = useMemo(() => {
    return Object.entries(expenseByCategory).map(([cat, amount]) => (
      <div key={cat}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600">{cat}</span>
          <span className="font-medium text-red-600">-${amount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(amount / maxExpenseCat) * 100}%` }} />
        </div>
      </div>
    ));
  }, [expenseByCategory, maxExpenseCat]);

  const highestIncomeCategory = useMemo(() => {
    const entries = Object.entries(incomeByCategory);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b);
  }, [incomeByCategory]);

  const highestExpenseCategory = useMemo(() => {
    const entries = Object.entries(expenseByCategory);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b);
  }, [expenseByCategory]);

  const savingsRate = useMemo(() => {
    if (summary.totalIncome === 0) return 0;
    return (summary.balance / summary.totalIncome) * 100;
  }, [summary]);

  const monthlyGrowth = useMemo(() => {
    if (!prevSummary || prevSummary.totalIncome === 0 && prevSummary.totalExpense === 0) return null;
    const prevNet = prevSummary.totalIncome - prevSummary.totalExpense;
    const currNet = summary.balance;
    if (prevNet === 0) return currNet > 0 ? 100 : currNet < 0 ? -100 : 0;
    return ((currNet - prevNet) / Math.abs(prevNet)) * 100;
  }, [summary, prevSummary]);

  const insights = useMemo(() => {
    const items: { message: string; type: "positive" | "negative" | "neutral" }[] = [];

    if (summary.totalIncome > 0) {
      if (savingsRate > 20) items.push({ message: `Great job! You saved ${savingsRate.toFixed(1)}% of your income this month.`, type: "positive" });
      else if (savingsRate > 0) items.push({ message: `You saved ${savingsRate.toFixed(1)}% of your income this month.`, type: "neutral" });
      else items.push({ message: `Your expenses exceeded your income this month. Consider reviewing your spending.`, type: "negative" });
    }

    if (highestExpenseCategory) {
      items.push({
        message: `Your highest expense category is "${highestExpenseCategory[0]}" at $${Number(highestExpenseCategory[1]).toLocaleString()}.`,
        type: "neutral",
      });
    }

    if (highestIncomeCategory) {
      items.push({
        message: `Your main income source is "${highestIncomeCategory[0]}" at $${Number(highestIncomeCategory[1]).toLocaleString()}.`,
        type: "positive",
      });
    }

    if (monthlyGrowth !== null) {
      const direction = monthlyGrowth >= 0 ? "improved" : "declined";
      const absGrowth = Math.abs(monthlyGrowth);
      items.push({
        message: `Your net balance ${direction} by ${absGrowth.toFixed(1)}% compared to last month.`,
        type: monthlyGrowth >= 0 ? "positive" : "negative",
      });
    }

    if (yearlyAnalytics && yearlyAnalytics.monthsWithData > 1) {
      const bestMonth = yearlyAnalytics.months.reduce((a, b) => a.balance > b.balance ? a : b);
      const worstMonth = yearlyAnalytics.months.reduce((a, b) => a.balance < b.balance ? a : b);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      items.push({
        message: `Your best month this year was ${monthNames[bestMonth.month - 1]} with $${bestMonth.balance.toLocaleString()} net.`,
        type: "positive",
      });
      if (worstMonth.balance < 0) {
        items.push({
          message: `Your toughest month was ${monthNames[worstMonth.month - 1]} with $${Math.abs(worstMonth.balance).toLocaleString()} net deficit.`,
          type: "negative",
        });
      }
    }

    return items;
  }, [summary, savingsRate, highestExpenseCategory, highestIncomeCategory, monthlyGrowth, yearlyAnalytics]);

  const hasIncome = Object.keys(incomeByCategory).length > 0;
  const hasExpenses = Object.keys(expenseByCategory).length > 0;
  const hasTransactions = recentTransactions.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.full_name || user?.email || "User"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here&apos;s your financial overview for {currentMonth}
            </p>
          </div>
        </div>

        {loading ? loadingSpinner : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Current Balance" amount={summary.balance} type="balance" />
              <StatCard title="Monthly Income" amount={summary.totalIncome} type="income" />
              <StatCard title="Monthly Expenses" amount={summary.totalExpense} type="expense" />
              <StatCard title="Estimated Savings" amount={summary.balance} type="savings" />
            </div>

            {/* KPIs */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Indicators</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <KpiCard label="Savings Rate" value={savingsRate.toFixed(1) + "%"} icon="🏦" positive={savingsRate >= 0} />
                <KpiCard label="Avg Monthly Income" value={"$" + (yearlyAnalytics?.avgMonthlyIncome ?? 0).toLocaleString()} icon="📈" positive={true} />
                <KpiCard label="Avg Monthly Expenses" value={"$" + (yearlyAnalytics?.avgMonthlyExpense ?? 0).toLocaleString()} icon="📉" positive={false} />
                <KpiCard label="Total Income (YTD)" value={"$" + (yearlyAnalytics?.yearTotalIncome ?? 0).toLocaleString()} icon="💰" />
                <KpiCard label="Total Expenses (YTD)" value={"$" + (yearlyAnalytics?.yearTotalExpense ?? 0).toLocaleString()} icon="💳" />
                <KpiCard label="Net Balance" value={"$" + (yearlyAnalytics?.yearBalance ?? 0).toLocaleString()} icon="⚖️" positive={(yearlyAnalytics?.yearBalance ?? 0) >= 0} />
                {highestIncomeCategory && (
                  <KpiCard label="Top Income Source" value={highestIncomeCategory[0] + " ($" + Number(highestIncomeCategory[1]).toLocaleString() + ")"} icon="🏆" />
                )}
                {highestExpenseCategory && (
                  <KpiCard label="Top Expense Category" value={highestExpenseCategory[0] + " ($" + Number(highestExpenseCategory[1]).toLocaleString() + ")"} icon="🔥" />
                )}
                {monthlyGrowth !== null && (
                  <KpiCard label="Monthly Growth" value={(monthlyGrowth >= 0 ? "+" : "") + monthlyGrowth.toFixed(1) + "%"} icon="📊" positive={monthlyGrowth >= 0} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h2>
                {hasIncome ? <div className="space-y-3">{incomeBars}</div> : (
                  <p className="text-sm text-gray-400 italic">No income this month</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
                {hasExpenses ? <div className="space-y-3">{expenseBars}</div> : (
                  <p className="text-sm text-gray-400 italic">No expenses this month</p>
                )}
              </div>
            </div>

            {/* Yearly Trends */}
            {yearlyAnalytics && yearlyAnalytics.monthsWithData > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Yearly Trends</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">Month</th>
                        <th className="pb-3 font-medium text-right">Income</th>
                        <th className="pb-3 font-medium text-right">Expenses</th>
                        <th className="pb-3 font-medium text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyAnalytics.months.map((m) => {
                        if (m.totalIncome === 0 && m.totalExpense === 0) return null;
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        return (
                          <tr key={m.month} className="border-b border-gray-50 last:border-0">
                            <td className="py-2.5 text-sm font-medium text-gray-900">{monthNames[m.month - 1]}</td>
                            <td className="py-2.5 text-sm text-right text-green-600">+${m.totalIncome.toLocaleString()}</td>
                            <td className="py-2.5 text-sm text-right text-red-600">-${m.totalExpense.toLocaleString()}</td>
                            <td className={`py-2.5 text-sm text-right font-medium ${m.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {m.balance >= 0 ? "+" : ""}${m.balance.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.map((insight, i) => (
                    <InsightCard key={i} message={insight.message} type={insight.type} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              {hasTransactions ? (
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
                        <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 text-sm font-medium text-gray-900">{tx.title}</td>
                          <td className="py-3 text-sm text-gray-500">{tx.category}</td>
                          <td className="py-3 text-sm text-gray-500">{tx.date}</td>
                          <td className={`py-3 text-sm font-medium text-right ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-8">No transactions yet</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
