const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative w-16 h-16">
        {/* Animated outer circle */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
        {/* Animated inner circle (the spinner) */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Search icon inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🔍</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-blue-900 font-bold text-lg animate-pulse">Chargement des données...</p>
        <p className="text-gray-500 text-sm">Veuillez patienter quelques instants</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
