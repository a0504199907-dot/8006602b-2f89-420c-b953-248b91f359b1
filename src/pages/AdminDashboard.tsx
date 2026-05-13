import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface DashboardData {
    dashboard: {
          title: string;
          project_id: string;
          data_tables: Record<string, any>;
          total_rows: number;
          total_tables: number;
          last_updated: string;
          status: string;
    };
}

const AdminDashboard: FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          fetch('/dashboard-data.json')
            .then(res => res.json())
            .then(data => {
                      setData(data);
                      setLoading(false);
            })
            .catch(err => {
                      console.error('Error loading dashboard data:', err);
                      setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8">\u05d8\u05d5\u05e2\u05df...</div>div>;
    if (!data) return <div className="p-8">Error loading data</div>div>;
  
    return (
          <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-2">{data.dashboard.title}</h1>h1>
                        <p className="text-gray-600 mb-8">\u05d3\u05e9\u05d1\u05d5\u05e8\u05d3 \u05e4\u05e8\u05d9\u05d8 - {data.dashboard.total_tables} \u05d8\u05d1\u05dc\u05d0\u05d5\u05ea, {data.dashboard.total_rows} \u05e9\u05d5\u05e8\u05d5\u05ea</p>p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(data.dashboard.data_tables).map(([key, table]: [string, any]) => (
                        <div key={key} className="bg-white p-6 rounded-lg shadow">
                                      <div className="text-2xl mb-2">{table.icon === 'chart-bar' ? '\ud83d\udccb' : '\ud83d\uddf3'}</div>div>
                                      <h2 className="text-lg font-semibold mb-1">{table.name}</h2>h2>
                                      <p className="text-gray-600">{table.rows} \u05e9\u05d5\u05e8\u05d5\u05ea</p>p>
                        </div>div>
                      ))}
                        </div>div>
                </div>div>
          </div>div>
        );
};

export default AdminDashboard;</div>
