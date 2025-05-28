const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 shadow-lg">
          <div className="text-orange-500 text-8xl mb-6">🚗</div>
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <h2 className="text-xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
          <p className="text-slate-400 mb-8">
            The page you're looking for doesn't exist in our car repair management system.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
