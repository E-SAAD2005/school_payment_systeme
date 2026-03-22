import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';

const Login = () => {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#E9EDF5] px-4">

      {/* Logo above the card */}
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="logo" className="h-24 sm:h-28 w-auto mb-2" />
        <div className="text-[#1E3A8A] font-bold text-xl flex items-center">
          <span className="text-3xl mr-1">EPG</span> 
          <span className="text-lg leading-tight">Scolarité</span>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100">

        <h2 className="text-2xl font-extrabold mb-8 text-center text-[#1E3A8A]">
          Connexion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full ${isLoggingIn ? 'bg-blue-400' : 'bg-[#2B6CB0] hover:bg-[#1A365D]'} text-white p-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center space-x-2`}
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;