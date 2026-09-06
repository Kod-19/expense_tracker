import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Helper to apply active styling to navigation links
  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive(path)
        ? "bg-blue-700 text-white"
        : "text-gray-300 hover:bg-blue-500 hover:text-white"
    }`;

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold tracking-wide">
              ExpenseTracker
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-2">
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={navLinkClass("/transactions")}
              >
                Transactions
              </Link>
              <Link to="/categories" className={navLinkClass("/categories")}>
                Categories
              </Link>
              <Link to="/budgets" className={navLinkClass("/budgets")}>
                Budgets
              </Link>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm font-medium text-blue-100 hidden sm:inline">
                {user.full_name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded font-medium transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden border-t border-blue-500 py-2 flex justify-around">
          <Link to="/dashboard" className={navLinkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/transactions" className={navLinkClass("/transactions")}>
            Transactions
          </Link>
          <Link to="/categories" className={navLinkClass("/categories")}>
            Categories
          </Link>
          <Link to="/budgets" className={navLinkClass("/budgets")}>
            Budgets
          </Link>
        </div>
      </div>
    </nav>
  );
}
