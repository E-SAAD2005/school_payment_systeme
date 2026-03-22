import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`${color} p-3 rounded-lg text-white text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ to, title, icon, color }) => (
  <Link to={to} className={`${color} p-4 rounded-xl flex items-center space-x-3 transition hover:scale-105 duration-200`}>
    <span className="text-xl">{icon}</span>
    <span className="font-bold text-sm">{title}</span>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    monthly_payments: 0,
    total_students: 0,
    delays_count: 0,
    risks_count: 0,
    unpaid_total: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.stats);
        setRecentPayments(data.recent_payments);
        setAlerts(data.recent_alerts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <span className="text-gray-500 text-sm font-medium">Session : </span>
          <span className="text-blue-600 font-bold">2025-2026</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Étudiants" value={stats.total_students} icon="👥" color="bg-blue-500" />
        <StatCard title="Mois en cours" value={`${stats.monthly_payments} MAD`} icon="💰" color="bg-green-500" />
        <StatCard title="Retards" value={stats.delays_count} icon="⚠️" color="bg-red-500" />
        <StatCard title="Total Impayés" value={`${stats.unpaid_total} MAD`} icon="📉" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Paiements Récents</h2>
            <Link to="/history" className="text-blue-600 text-xs font-bold hover:underline">Voir tout</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Étudiant</th>
                  <th className="px-4 py-3 text-left font-semibold">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{p.student?.first_name} {p.student?.last_name}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">{p.amount_paid} MAD</td>
                    <td className="px-4 py-3 text-gray-500">{p.payment_date}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan="3" className="p-4 text-center text-gray-400 italic">Aucun paiement récent</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickAction to="/payments" title="Nouveau Paiement" icon="💳" color="bg-blue-50 text-blue-600" />
            <QuickAction to="/students" title="Ajouter Étudiant" icon="👤" color="bg-green-50 text-green-600" />
            <QuickAction to="/alerts" title="Voir les Retards" icon="🕒" color="bg-red-50 text-red-600" />
            <QuickAction to="/receipts" title="Chercher Reçu" icon="🔍" color="bg-purple-50 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
