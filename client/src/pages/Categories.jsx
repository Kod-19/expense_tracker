import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function Categories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/categories');
      return data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newCat) => axiosClient.post('/categories', newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setError('');
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to create category')
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => axiosClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (err) => setError(err.response?.data?.error || 'Cannot delete category in use.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, type });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Manage Categories</h1>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded flex gap-4">
        <input
          type="text"
          placeholder="Category name (e.g. Rent, Groceries)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 border rounded outline-none"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      {isLoading ? (
        <div>Loading categories...</div>
      ) : (
        <div className="bg-white shadow rounded divide-y">
          {categories?.map((cat) => (
            <div key={cat.id} className="p-4 flex justify-between items-center">
              <div>
                <span className="font-semibold">{cat.name}</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  cat.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {cat.type}
                </span>
              </div>
              <button
                onClick={() => deleteMutation.mutate(cat.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}