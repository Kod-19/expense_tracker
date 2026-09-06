import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, createTransaction } from '../api/transactions';

export default function Transactions() {
  const queryClient = useQueryClient();

  // Automatically fetch transactions and manage loading/error state
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => fetchTransactions()
  });

  // Mutation to add new transactions and invalidate cache to auto-refresh list
  const addMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh dashboard stats
    }
  });

  if (isLoading) return <div>Loading transactions...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <ul className="divide-y">
        {transactions?.map((t) => (
          <li key={t.id} className="py-2 flex justify-between">
            <span>{t.note || 'No description'}</span>
            <span className={t.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
              ${t.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}