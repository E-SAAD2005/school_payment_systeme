import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Receipts from './pages/Receipts';
import History from './pages/History';
import Alerts from './pages/Alerts';
import Layout from './components/Layout';

function App() {
  return (
    <div className="min-h-screen bg-[#E9EDF5] font-sans text-gray-800">
      <Routes>
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/payments" element={<Layout><Payments /></Layout>} />
        <Route path="/receipts" element={<Layout><Receipts /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
        <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
