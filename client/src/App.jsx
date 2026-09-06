import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import Dashboard from "../src/pages/Dashboard";
import Transactions from "../src/pages/Transactions";
import Categories from "../src/pages/Categories";
import Budgets from "../src/pages/Budgets";

// Components
import Navbar from "../src/components/Navbar";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading session...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {token && <Navbar />}
      <div className="container mx-auto p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
