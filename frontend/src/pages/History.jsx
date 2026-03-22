import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [filters, setFilters] = useState({
    student_id: '',
    program_id: '',
    start_date: '',
    end_date: '',
  });

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const [paymentsRes, studentsRes, programsRes] = await Promise.all([
        api.get(`/payments?${params.toString()}`),
        api.get('/students'),
        api.get('/programs')
      ]);
      setPayments(paymentsRes.data);
      setStudents(studentsRes.data);
      setPrograms(programsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.student_id, filters.start_date, filters.end_date]);

  const filteredPaymentsByProgram = payments.filter(p => {
    return !filters.program_id || (p.student && p.student.program_id == filters.program_id);
  });

  const handleExportCSV = () => {
    // Retrait des accents dans les headers pour éviter les problèmes d'encodage Excel
    const headers = ['Date', 'Etudiant', 'Programme', 'Montant', 'Mode', 'Reference', 'Recu'];
    
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      // Retrait des accents dans les données
      const stringVal = String(val)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
        
      if (stringVal.includes(';') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = filteredPaymentsByProgram.map(p => {
      // Formatage de la date DD/MM/YYYY pour Excel
      let formattedDate = p.payment_date;
      if (p.payment_date) {
        const [y, m, d] = p.payment_date.split('-');
        formattedDate = `${d}/${m}/${y}`;
      }

      return [
        escapeCSV(formattedDate),
        escapeCSV(`${p.student?.first_name} ${p.student?.last_name}`),
        escapeCSV(p.student?.program?.name || 'N/A'),
        escapeCSV(p.amount_paid),
        escapeCSV(p.payment_method),
        escapeCSV(p.reference || ''),
        escapeCSV(p.receipt?.receipt_number || '')
      ];
    });

    const csvContent = "sep=;\n" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historique_paiements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await api.get(`/payments/export-pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historique_paiements.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Historique des Transactions</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700 transition flex items-center text-sm"
          >
            <span className="mr-2">📊</span> Excel (CSV)
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 transition flex items-center text-sm"
          >
            <span className="mr-2">📄</span> PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Étudiant</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.student_id}
            onChange={(e) => setFilters({...filters, student_id: e.target.value})}
          >
            <option value="">Tous les étudiants</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Programme</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.program_id}
            onChange={(e) => setFilters({...filters, program_id: e.target.value})}
          >
            <option value="">Tous les programmes</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Du</label>
          <input 
            type="date" 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Au</label>
          <input 
            type="date" 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
          />
        </div>
      </div>

      {/* Tableau de l'historique */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#1E3A8A] px-6 py-4 flex items-center text-white">
          <span className="mr-2 text-xl">📁</span>
          <h2 className="text-lg font-bold">Journal des paiements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reçu</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPaymentsByProgram.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.payment_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.student?.first_name} {p.student?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {p.student?.program?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                    {p.amount_paid} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {p.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {p.receipt && (
                      <button 
                        onClick={() => handleDownloadReceipt(p.id, p.receipt.receipt_number)}
                        className="text-blue-600 hover:text-blue-900 font-bold"
                      >
                        📄 {p.receipt.receipt_number}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPaymentsByProgram.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">
                    Aucune transaction ne correspond aux critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
