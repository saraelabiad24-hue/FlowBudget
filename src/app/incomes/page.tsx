import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useauth";
import { getIncomes, createIncome, deleteIncome } from "../../lib/services";
import type { Income } from "../../types/database";

export default function IncomesPage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    is_recurring: false,
    recurring_interval: "monthly" as string,
  });

  const fetchIncomes = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getIncomes(user.id);
    setIncomes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIncomes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await createIncome({
      user_id: user.id,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      date: formData.date,
      description: formData.description || null,
      is_recurring: formData.is_recurring,
      recurring_interval: formData.is_recurring
        ? (formData.recurring_interval as "daily" | "weekly" | "monthly" | "yearly")
        : null,
    });

    if (!error) {
      setShowForm(false);
      setFormData({
        title: "",
        amount: "",
        category_id: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        is_recurring: false,
        recurring_interval: "monthly",
      });
      fetchIncomes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    const { error } = await deleteIncome(id);
    if (!error) fetchIncomes();
  };

  const totalIncomes = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incomes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Total: ${totalIncomes.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {showForm ? "Cancel" : "+ Add Income"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g. Salary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="category-uuid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring-income"
                  checked={formData.is_recurring}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_recurring: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="recurring-income" className="text-sm text-gray-700">
                  Recurring
                </label>
              </div>
              {formData.is_recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval
                  </label>
                  <select
                    value={formData.recurring_interval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring_interval: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              Add Income
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">💰</p>
            <p className="text-lg font-medium">No incomes yet</p>
            <p className="text-sm mt-1">Add your first income to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr
                    key={income.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {income.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        {income.category_icon && <span>{income.category_icon}</span>}
                        {income.category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {income.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-green-600">
                      +${Number(income.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}