import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000";

const defaultForm = {
  email: "",
  password: "",
  full_name: "",
};

const defaultCategory = {
  name: "",
  type: "expense",
};

const App = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultForm);
  const [category, setCategory] = useState(defaultCategory);
  const [token, setToken] = useState(
    localStorage.getItem("expense-tracker-token") || ""
  );
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLoggedIn = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("expense-tracker-token", token);
      fetchProfile();
      fetchCategories();
    } else {
      localStorage.removeItem("expense-tracker-token");
      setUser(null);
      setCategories([]);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      setUser(data.profile);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const endpoint =
      mode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.session?.access_token) {
        setToken(data.session.access_token);
      }

      setMessage(
        mode === "register"
          ? "Registration successful. You can now sign in."
          : "Login successful."
      );

      if (mode === "login") {
        setForm(defaultForm);
      }

      if (mode === "register") {
        setMode("login");
        setForm({ ...defaultForm, email: form.email });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category creation failed");
      }

      setMessage("Category created successfully.");
      setCategory(defaultCategory);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    setForm(defaultForm);
    setCategory(defaultCategory);
    setMessage("You have been logged out.");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Expense Tracker
            </p>
            <h1 className="mt-2 text-3xl font-bold">Day 13 Progress</h1>
          </div>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 font-medium text-slate-100 transition hover:border-slate-400"
            >
              Logout
            </button>
          )}
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 font-medium ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-lg px-3 py-2 font-medium ${mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(event) =>
                      setForm({ ...form, full_name: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  placeholder="At least 8 characters"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                {mode === "register" ? "Create account" : "Log in"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Category manager</h2>
            {!isLoggedIn ? (
              <p className="rounded-xl bg-slate-100 p-4 text-slate-600">
                Log in to create and review your categories.
              </p>
            ) : (
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Category name
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(event) =>
                      setCategory({ ...category, name: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                    placeholder="Groceries"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <select
                    value={category.type}
                    onChange={(event) =>
                      setCategory({ ...category, type: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600"
                >
                  Add category
                </button>
              </form>
            )}

            {categories.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Saved categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span>{item.name}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold capitalize text-slate-700">
                        {item.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {user && (
          <section className="mt-6 rounded-2xl bg-slate-900 p-6 text-white shadow-md">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Authenticated user
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{user.full_name}</h2>
            <p className="mt-2 text-slate-300">{user.id}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
