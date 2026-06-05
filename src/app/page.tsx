import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">FlowBudget</div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Smart financial management{" "}
          <span className="text-blue-600">made simple</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Track your income, manage expenses, and get powerful insights
          into your financial health. All in one beautiful dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg shadow-lg shadow-blue-200"
          >
            Start free trial
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 transition font-medium text-lg"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Income</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Add and manage both fixed and variable income sources. Salary, freelance, investments - all in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Analytics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Visualize your spending habits with beautiful charts and detailed category breakdowns.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Insights</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get monthly and yearly reports, saving tips, and financial predictions powered by your data.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} FlowBudget. All rights reserved.</p>
      </footer>
    </div>
  );
}