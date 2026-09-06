import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/reports/summary');
      return data;
    }
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 shadow rounded border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Income</p>
          <p className="text-2xl font-bold text-green-600">${summary?.income || '0.00'}</p>
        </div>
        <div className="bg-white p-6 shadow rounded border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">${summary?.expenses || '0.00'}</p>
        </div>
        <div className="bg-white p-6 shadow rounded border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Net Balance</p>
          <p className="text-2xl font-bold text-blue-600">${summary?.balance || '0.00'}</p>
        </div>
      </div>
    </div>
  );
}