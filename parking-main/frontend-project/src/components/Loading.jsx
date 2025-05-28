const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-slate-400">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
