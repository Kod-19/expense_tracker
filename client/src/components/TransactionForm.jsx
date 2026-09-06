import { useState } = require('react');
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '../api/transactions';

export default function TransactionForm({ categories }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate queries so UI updates automatically
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setForm({ ...form, amount: '', note: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
      <input 
        type="number" 
        placeholder="Amount" 
        value={form.amount} 
        onChange={(e) => setForm({ ...form, amount: e.target.value })} 
        className="w-full border p-2 rounded"
        required 
      />
      <select 
        value={form.category_id} 
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Select Category</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Transaction
      </button>
    </form>
  );
}