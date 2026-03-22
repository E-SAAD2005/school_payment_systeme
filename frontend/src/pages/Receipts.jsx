import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Receipts = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get(`/payments?search=${debouncedSearch}`);
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [debouncedSearch]);

  const handleDownloadReceipt = async (paymentId, receiptNumber) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu_${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
      alert('Erreur lors du téléchargement du reçu');
    }
  };

  if (loading && !debouncedSearch) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Reçus</h1>
        <input 
          type="text" 
          placeholder="Rechercher un reçu ou un étudiant..." 
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Liste des reçus générés</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N° Reçu</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono font-bold">
                    {p.receipt?.receipt_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.student ? `${p.student.first_name} ${p.student.last_name}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {p.receipt?.receipt_type || 'scolarite'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {p.amount_paid} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {p.payment_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {p.receipt && (
                      <button 
                        onClick={() => handleDownloadReceipt(p.id, p.receipt.receipt_number)}
                        className="bg-[#2B6CB0] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#2c5282] inline-flex items-center"
                      >
                        <span className="mr-1">📄</span> Voir Reçu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="p-8 text-center text-gray-500 italic">
              Aucun reçu trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receipts;
