import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Payments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification des permissions
  const canViewPayments = user?.roles?.some(role => role.name === 'admin' || role.name === 'comptable') || 
                         user?.permissions?.some(p => p.name === 'view payments');
  const canCreatePayments = user?.roles?.some(role => role.name === 'admin' || role.name === 'comptable') || 
                           user?.permissions?.some(p => p.name === 'create payments');
  const canEditPayments = user?.roles?.some(role => role.name === 'admin' || role.name === 'comptable') || 
                         user?.permissions?.some(p => p.name === 'edit payments');
  const canDeletePayments = user?.roles?.some(role => role.name === 'admin') || 
                           user?.permissions?.some(p => p.name === 'delete payments');
  const canCreateFees = user?.roles?.some(role => role.name === 'admin' || role.name === 'comptable') || 
                       user?.permissions?.some(p => p.name === 'create fees');

  const [newFee, setNewFee] = useState({ 
    program_id: '', 
    amount_total: '', 
    installment_number: '1', 
    due_date: new Date().toISOString().split('T')[0] 
  });
  const [form, setForm] = useState({ 
    student_id: '', 
    fee_id: '', 
    amount_paid: '', 
    payment_method: 'especes', 
    receipt_type: 'scolarite', 
    reference: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests = [
        api.get('/programs'),
        api.get('/fees'),
        api.get('/students')
      ];
      
      if (canViewPayments) {
        requests.push(api.get('/payments'));
      }

      const results = await Promise.all(requests);
      
      setPrograms(results[0].data);
      setFees(results[1].data);
      setStudents(results[2].data);
      
      if (canViewPayments) {
        setPayments(results[3].data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, canViewPayments]);

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees', newFee);
      setShowFeeModal(false);
      setNewFee({ 
        program_id: '', 
        amount_total: '', 
        installment_number: '1', 
        due_date: new Date().toISOString().split('T')[0] 
      });
      fetchData();
      alert('Frais ajouté');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du frais');
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment.id);
    setForm({
      student_id: payment.student_id,
      fee_id: payment.fee_id,
      amount_paid: payment.amount_paid,
      payment_method: payment.payment_method,
      receipt_type: payment.receipt?.receipt_type || 'scolarite',
      reference: payment.reference || '',
      payment_date: payment.payment_date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      try {
        await api.delete(`/payments/${id}`);
        alert('Paiement supprimé');
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
      student_id: '', 
      fee_id: '', 
      amount_paid: '', 
      payment_method: 'especes', 
      receipt_type: 'scolarite', 
      reference: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, form);
        alert('Paiement modifié');
      } else {
        const { data } = await api.post('/payments', form);
        alert('Paiement enregistré!');
        
        if (data.receipt && data.receipt.receipt_number) {
          window.open(`http://127.0.0.1:8000/api/payments/${data.payment.id}/receipt/download`, '_blank');
        }
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.cne}`.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id == form.student_id);

  const availableFees = fees.filter(f => {
    return selectedStudent && f.program_id == selectedStudent.program_id;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Paiements</h1>
      </div>

      {canCreatePayments || canEditPayments ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#2B6CB0] px-6 py-4 flex items-center text-white justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-xl">💳</span>
              <h2 className="text-lg font-bold">
                {editingId ? 'Modifier le Paiement' : 'Nouveau Paiement'}
              </h2>
            </div>
            {editingId && (
              <button onClick={resetForm} className="text-white font-bold hover:underline text-sm">Annuler</button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rechercher Étudiant</label>
                <input 
                  type="text" 
                  placeholder="Nom ou CNE..."
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-400 text-sm mb-1"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm" 
                  value={form.student_id} 
                  onChange={(e) => setForm({...form, student_id: e.target.value, fee_id: ''})}
                  required
                >
                  <option value="">Sélectionner un étudiant</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.cne})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frais / Tranche</label>
                  {canCreateFees && (
                    <button 
                      type="button" 
                      onClick={() => {
                        if (selectedStudent) {
                          setNewFee({ ...newFee, program_id: selectedStudent.program_id });
                        }
                        setShowFeeModal(true);
                      }}
                      className="text-blue-600 text-[10px] font-bold"
                    >
                      + Nouveau
                    </button>
                  )}
                </div>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm" 
                  value={form.fee_id} 
                  onChange={(e) => {
                    const selectedFee = fees.find(f => f.id == e.target.value);
                    setForm({
                      ...form, 
                      fee_id: e.target.value,
                      amount_paid: selectedFee ? selectedFee.amount_total : ''
                    });
                  }}
                  required
                  disabled={!form.student_id}
                >
                  <option value="">Sélectionner le frais</option>
                  {availableFees.map(f => (
                    <option key={f.id} value={f.id}>Tranche {f.installment_number} - {f.amount_total} MAD</option>
                  ))}
                </select>
                {form.student_id && availableFees.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-1 italic">Aucun frais configuré pour ce programme.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type de Reçu</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm" 
                  value={form.receipt_type} 
                  onChange={(e) => setForm({...form, receipt_type: e.target.value})}
                  required
                >
                  <option value="scolarite">Reçu de scolarité</option>
                  <option value="assurance">Reçu d'assurance</option>
                  <option value="inscription">Reçu d'inscription</option>
                  <option value="formation">Reçu frais de formation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Montant Payé (MAD)</label>
                <input 
                  type="number" placeholder="Montant" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.amount_paid}
                  onChange={(e) => setForm({...form, amount_paid: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mode de Paiement</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm" 
                  value={form.payment_method} 
                  onChange={(e) => setForm({...form, payment_method: e.target.value})}
                  required
                >
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Référence (Optionnel)</label>
                <input 
                  type="text" placeholder="N° Chèque / Virement" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.reference}
                  onChange={(e) => setForm({...form, reference: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date de Paiement</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 text-sm"
                  value={form.payment_date}
                  onChange={(e) => setForm({...form, payment_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#2B6CB0] text-white py-3 rounded-xl font-bold hover:bg-[#2c5282] transition shadow-md">
              {editingId ? 'Mettre à jour le paiement' : 'Enregistrer et Imprimer le Reçu'}
            </button>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Historique des Paiements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reçu</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.payment_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.student?.first_name} {p.student?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">{p.amount_paid} MAD</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{p.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {p.receipt && (
                      <button 
                        onClick={() => window.open(`http://127.0.0.1:8000/api/payments/${p.id}/receipt/download`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 font-bold flex items-center"
                      >
                        📄 <span className="ml-1 text-[10px]">{p.receipt.receipt_number}</span>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-3">
                    {canEditPayments && (
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 font-bold">Modifier</button>
                    )}
                    {canDeletePayments && (
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-bold">Supprimer</button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Aucun paiement trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Frais */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4">Nouveau Frais / Tranche</h2>
            <form onSubmit={handleAddFee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Programme</label>
                  <select 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    value={newFee.program_id}
                    onChange={(e) => setNewFee({...newFee, program_id: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Numéro de Tranche</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    value={newFee.installment_number}
                    onChange={(e) => setNewFee({...newFee, installment_number: e.target.value})}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Montant Total (MAD)</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    value={newFee.amount_total}
                    onChange={(e) => setNewFee({...newFee, amount_total: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date d'échéance</label>
                  <input 
                    type="date" 
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    value={newFee.due_date}
                    onChange={(e) => setNewFee({...newFee, due_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowFeeModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
