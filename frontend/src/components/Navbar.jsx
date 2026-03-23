import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo1.png';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Étudiants', path: '/students' },
    { name: 'Paiements', path: '/payments' },
    { name: 'Reçus', path: '/receipts' },
    { name: 'Historique', path: '/history' },
    { name: 'Alertes', path: '/alerts' },
  ];

  return (
    <nav className="bg-[#1E3A8A] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Logo and App Name */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded-md">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg">EPG</span>
                <span className="text-[10px] uppercase tracking-wider hidden sm:block">Scolarité</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 ml-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md transition duration-200 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-[#2B6CB0] text-white'
                      : 'hover:bg-[#2B6CB0]/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#2B6CB0] focus:outline-none transition"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-[#1E3A8A] border-t border-blue-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-[#2B6CB0] text-white'
                  : 'hover:bg-[#2B6CB0]/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
