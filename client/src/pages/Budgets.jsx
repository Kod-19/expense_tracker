import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function Budgets() {
  const queryClient = useQueryClient();
  
  // Default to current month formatted as YYYY-MM-01
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch user categories (filter for expense types only)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/categories');
      return data;
    }
  });

  // 2. Fetch budgets with spending progress for the selected month
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', selectedMonth],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/budgets?month=${selectedMonth}`);
      return data;
    }
  });

  // 3. Create or update (upsert) budget limit mutation
  const budgetMutation = useMutation({
    mutationFn: async (budgetData) => axiosClient.post('/budgets', budgetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', selectedMonth] });
      setMonthlyLimit('');
      setCategoryId('');
      setError('');
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to save budget limit.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryId || !monthlyLimit) return;

    budgetMutation.mutate({
      category_id: parseInt(categoryId, 10),
      monthly_limit: parseFloat(monthlyLimit),
      month: selectedMonth
    });
  };

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Month Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 shadow rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monthly Budgets</h1>
          <p className="text-sm text-gray-500">Set limits and track category spending</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Select Month:</label>
          <input
            type="date"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Set Budget Limit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Set or Update Budget Limit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Expense Category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 500.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={budgetMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition shadow-sm"
            >
              {budgetMutation.isPending ? 'Saving...' : 'Save Limit'}
            </button>
          </div>
        </div>
      </form>

      {/* Budget Progress List */}
      <div className="bg-white p-6 shadow rounded-lg space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">Budget Progress</h2>

        {isLoading ? (
          <div className="text-center py-6 text-gray-500">Loading budget progress...</div>
        ) : !budgets || budgets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No budgets configured for this month yet. Use the form above to add one!
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((b) => {
              const spent = parseFloat(b.spent || 0);
              const limit = parseFloat(b.monthly_limit || 0);
              const remaining = limit - spent;
              const percentage = Math.min(100, Math.round((spent / limit) * 100));

              // Dynamic color coding based on threshold
              let barColor = 'bg-green-500';
              let badgeColor = 'bg-green-100 text-green-800';

              if (percentage >= 100) {
                barColor = 'bg-red-500';
                badgeColor = 'bg-red-100 text-red-800';
              } else if (percentage >= 80) {
                barColor = 'bg-amber-500';
                badgeColor = 'bg-amber-100 text-amber-800';
              }

              return (
                <div key={b.category_id} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800 text-lg">{b.name}</span>
                      <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-medium ${badgeColor}`}>
                        {percentage}% used
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        ${spent.toFixed(2)} / ${limit.toFixed(2)}
                      </p>
                      <p className={`text-xs ${remaining < 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                        {remaining < 0
                          ? `Over budget by $${Math.abs(remaining).toFixed(2)}`
                          : `$${remaining.toFixed(2)} remaining`}
                      </p>
                    </div>
                  </div>

                  {/* Tailwind Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}