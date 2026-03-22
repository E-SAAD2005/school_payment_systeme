import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import logo from '../assets/logo1.png';
import * as XLSX from 'xlsx';

const Students = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérification des permissions
  const canCreatePrograms = user?.roles?.some(role => role.name === 'admin') || 
                           user?.permissions?.some(p => p.name === 'create programs');
  const canCreateGroups = user?.roles?.some(role => role.name === 'admin' || role.name === 'agent') || 
                         user?.permissions?.some(p => p.name === 'create groups');
  const canCreateStudents = user?.roles?.some(role => role.name === 'admin' || role.name === 'agent') || 
                           user?.permissions?.some(p => p.name === 'create students');
  const canEditStudents = user?.roles?.some(role => role.name === 'admin' || role.name === 'agent') || 
                         user?.permissions?.some(p => p.name === 'edit students');
  const canDeleteStudents = user?.roles?.some(role => role.name === 'admin') || 
                           user?.permissions?.some(p => p.name === 'delete students');

  const [newProgram, setNewProgram] = useState({ name: '', description: '' });
  const [newGroup, setNewGroup] = useState({ name: '', program_id: '', academic_year: '2025-2026' });
  const [form, setForm] = useState({ 
    cne: '', 
    first_name: '', 
    last_name: '', 
    email: '',
    phone: '',
    program_id: '',
    group_id: '',
    status: 'actif' 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, programsRes, groupsRes] = await Promise.all([
        api.get(`/students?search=${debouncedSearch}`),
        api.get('/programs'),
        api.get('/groups')
      ]);
      setStudents(studentsRes.data);
      setPrograms(programsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      await api.post('/programs', newProgram);
      setShowProgramModal(false);
      setNewProgram({ name: '', description: '' });
      fetchData();
      alert('Programme ajouté');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du programme');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', newGroup);
      setShowGroupModal(false);
      setNewGroup({ name: '', program_id: '', academic_year: '2025-2026' });
      fetchData();
      alert('Groupe ajouté');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du groupe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        alert('Étudiant modifié');
      } else {
        await api.post('/students', form);
        alert('Étudiant ajouté');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      cne: student.cne,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email || '',
      phone: student.phone || '',
      program_id: student.program_id,
      group_id: student.group_id,
      status: student.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet étudiant ?')) {
      try {
        await api.delete(`/students/${id}`);
        alert('Étudiant supprimé');
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      cne: '', 
      first_name: '', 
      last_name: '', 
      email: '',
      phone: '',
      program_id: '',
      group_id: '',
      status: 'actif' 
    });
  };

  const handleExportCSV = () => {
    // Retrait des accents pour la compatibilité Excel
    const headers = ['CNE', 'Nom', 'Prenom', 'Email', 'Telephone', 'Programme', 'Groupe', 'Statut'];
    
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

    const rows = students.map(s => [
      escapeCSV(s.cne),
      escapeCSV(s.last_name),
      escapeCSV(s.first_name),
      escapeCSV(s.email || ''),
      escapeCSV(s.phone || ''),
      escapeCSV(s.program?.name || 'N/A'),
      escapeCSV(s.group?.name || 'N/A'),
      escapeCSV(s.status)
    ]);

    // Utilisation du point-virgule (;) et sep=; pour Excel FR
    const csvContent = "sep=;\n" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `liste_etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
      // Traitement spécial pour Excel via SheetJS (frontend)
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          setLoading(true);
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

          if (data.length === 0) {
            alert('Le fichier Excel est vide');
            return;
          }

          // Détecter l'en-tête
          let startIndex = 0;
          const firstRow = data[0];
          const isHeader = firstRow.some(col => 
            col && typeof col === 'string' && (col.toLowerCase().includes('cne') || col.toLowerCase().includes('nom'))
          );
          if (isHeader) startIndex = 1;

          // Convertir en format attendu par le backend
          const students = data.slice(startIndex)
            .filter(row => row.length > 0 && row[0]) // Ignorer lignes vides
            .map(row => ({
              cne: row[0],
              last_name: row[1],
              first_name: row[2],
              email: row[3],
              phone: row[4],
              program: row[5],
              group: row[6]
            }));

          const response = await api.post('/students/import', { students });
          alert(response.data.message);
          fetchData();
        } catch (error) {
          console.error(error);
          const msg = error.response?.data?.message || 'Erreur lors de l\'importation Excel';
          const details = error.response?.data?.errors ? '\n- ' + error.response.data.errors.join('\n- ') : '';
          alert(msg + details);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // Import CSV classique (backend)
      const formData = new FormData();
      formData.append('file', file);

      try {
        setLoading(true);
        const { data } = await api.post('/students/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(data.message);
        fetchData();
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || 'Erreur lors de l\'importation';
        let details = '';
        
        if (error.response?.data?.errors) {
          const errs = error.response.data.errors;
          if (Array.isArray(errs)) {
            details = '\n- ' + errs.join('\n- ');
          } else if (typeof errs === 'object') {
            details = '\n- ' + Object.values(errs).flat().join('\n- ');
          }
        }
        alert(msg + details);
      } finally {
        setLoading(false);
      }
    }
    e.target.value = null; // Reset input
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Étudiants</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold transition flex items-center justify-center text-sm shadow-sm cursor-pointer">
            <span className="mr-2">📥</span> IMPORT EXCEL/CSV
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportCSV} />
          </label>
          <button 
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold transition flex items-center justify-center text-sm shadow-sm"
          >
            <span className="mr-2">📊</span> Excel (CSV)
          </button>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {canCreateStudents || canEditStudents ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">
              {editingId ? 'Modifier l\'Étudiant' : 'Ajouter un Étudiant'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-red-600 text-sm font-bold hover:underline">Annuler</button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">CNE</label>
                <input 
                  type="text" placeholder="CNE" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.cne}
                  onChange={(e) => setForm({...form, cne: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nom</label>
                <input 
                  type="text" placeholder="Nom" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.last_name}
                  onChange={(e) => setForm({...form, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Prénom</label>
                <input 
                  type="text" placeholder="Prénom" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.first_name}
                  onChange={(e) => setForm({...form, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input 
                  type="email" placeholder="Email" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Téléphone</label>
                <input 
                  type="text" placeholder="Téléphone" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase">Programme</label>
                  {canCreatePrograms && (
                    <button type="button" onClick={() => setShowProgramModal(true)} className="text-blue-600 text-[10px] font-bold">+ Nouveau</button>
                  )}
                </div>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.program_id}
                  onChange={(e) => setForm({...form, program_id: e.target.value, group_id: ''})}
                  required
                >
                  <option value="">Sélectionner</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase">Groupe</label>
                  {canCreateGroups && (
                    <button type="button" onClick={() => { setNewGroup({ ...newGroup, program_id: form.program_id }); setShowGroupModal(true); }} className="text-blue-600 text-[10px] font-bold">+ Nouveau</button>
                  )}
                </div>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.group_id}
                  onChange={(e) => setForm({...form, group_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  {groups
                    .filter(g => !form.program_id || g.program_id == form.program_id)
                    .map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                  }
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Statut</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  required
                >
                  <option value="actif">Actif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`w-full ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2.5 rounded-lg font-bold transition shadow-sm`}>
              {editingId ? 'Mettre à jour l\'étudiant' : 'Ajouter l\'étudiant'}
            </button>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Liste des étudiants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">CNE</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nom complet</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Programme / Groupe</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.cne}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.program?.name} <span className="text-gray-300 mx-1">/</span> {student.group?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full ${student.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {student.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                    {canEditStudents && (
                      <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800 font-bold">Modifier</button>
                    )}
                    {canDeleteStudents && (
                      <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-800 font-bold">Supprimer</button>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Aucun étudiant trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Programme */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Nouveau Programme</h2>
            <form onSubmit={handleAddProgram}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Nom du programme</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowProgramModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Groupe */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Nouveau Groupe</h2>
            <form onSubmit={handleAddGroup}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Programme</label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  value={newGroup.program_id}
                  onChange={(e) => setNewGroup({...newGroup, program_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                 <label className="block text-sm font-semibold mb-1">Nom du groupe</label>
                 <input 
                   type="text" 
                   className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                   value={newGroup.name}
                   onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-semibold mb-1">Année académique</label>
                 <input 
                   type="text" 
                   className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                   value={newGroup.academic_year}
                   placeholder="Ex: 2025-2026"
                   onChange={(e) => setNewGroup({...newGroup, academic_year: e.target.value})}
                   required
                 />
               </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
