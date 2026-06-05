import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useauth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/incomes", label: "Incomes", icon: "💰" },
  { path: "/expenses", label: "Expenses", icon: "💳" },
  { path: "/categories", label: "Categories", icon: "🏷️" },
  { path: "/notifications", label: "Notifications", icon: "🔔" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          FlowBudget
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition w-full"
        >
          <span className="text-lg">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}