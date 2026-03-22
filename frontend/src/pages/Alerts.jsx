import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    program_id: '',
    group_id: ''
  });

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.program_id) params.append('program_id', filters.program_id);
      if (filters.group_id) params.append('group_id', filters.group_id);

      const [alertsRes, programsRes, groupsRes] = await Promise.all([
        api.get(`/alerts?${params.toString()}`),
        api.get('/programs'),
        api.get('/groups')
      ]);
      setAlerts(alertsRes.data);
      setPrograms(programsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.get('/alerts-generate');
      alert('Alertes mises à jour avec succès');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleExportCSV = () => {
    // Retrait des accents pour Excel
    const headers = ['Etat', 'Etudiant', 'Groupe', 'Message', 'Date Creation'];
    
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      // Retrait des accents
      const stringVal = String(val)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
        
      if (stringVal.includes(';') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = alerts.map(a => [
      escapeCSV(a.status === 'en_retard' ? 'En Retard' : 'A Risque'),
      escapeCSV(`${a.student?.first_name} ${a.student?.last_name}`),
      escapeCSV(a.student?.group?.name || 'N/A'),
      escapeCSV(a.message),
      escapeCSV(new Date(a.created_at).toLocaleDateString())
    ]);

    // Utilisation du point-virgule (;) et sep=; pour Excel FR
    const csvContent = "sep=;\n" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alertes_paiements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Alertes et Retards</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold transition flex items-center text-sm"
          >
            <span className="mr-2">📊</span> Excel (CSV)
          </button>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className={`${generating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-md font-bold transition flex items-center text-sm`}
          >
            <span className="mr-2">🔄</span> {generating ? 'Mise à jour...' : 'Actualiser les alertes'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">État</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Tous les états</option>
            <option value="en_retard">En Retard 🔴</option>
            <option value="a_risque">À Risque 🟠</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Programme</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.program_id}
            onChange={(e) => setFilters({...filters, program_id: e.target.value, group_id: ''})}
          >
            <option value="">Tous les programmes</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Classe / Groupe</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.group_id}
            onChange={(e) => setFilters({...filters, group_id: e.target.value})}
          >
            <option value="">Tous les groupes</option>
            {groups
              .filter(g => !filters.program_id || g.program_id == filters.program_id)
              .map(g => <option key={g.id} value={g.id}>{g.name}</option>)
            }
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#1E3A8A] px-6 py-4 flex items-center text-white">
          <span className="mr-2 text-xl">⚠️</span>
          <h2 className="text-lg font-bold">Notifications de paiement ({alerts.length})</h2>
        </div>
        <div className="p-6 space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`${
                alert.status === 'en_retard' ? 'bg-[#E53E3E]' : 'bg-[#F6AD55]'
              } text-white p-4 rounded-lg flex items-center shadow-md`}
            >
              <div className="flex-1 flex items-center">
                <span className="text-2xl mr-4">{alert.status === 'en_retard' ? '🔴' : '🟠'}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-lg">{alert.student?.first_name} {alert.student?.last_name}</p>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {alert.student?.group?.name}
                    </span>
                  </div>
                  <div className="mt-1 bg-black/10 p-2 rounded border border-white/20">
                    <p className="text-sm font-medium italic">{alert.message}</p>
                  </div>
                  <p className="text-xs opacity-80 mt-1">Créée le : {new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button 
                  onClick={() => window.location.href = `/payments?student_id=${alert.student_id}`}
                  className="bg-white text-gray-800 px-4 py-2 rounded-md text-xs font-bold hover:bg-gray-100 transition shadow-sm whitespace-nowrap"
                >
                  Régulariser →
                </button>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center text-gray-500 py-8 italic">
              Aucune alerte ne correspond aux critères.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
