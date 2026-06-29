import React from 'react';

const Loader = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
        <div className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-indigo-400 dark:bg-indigo-600 opacity-20"></div>
      </div>
      <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase animate-pulse">Loading MessHub...</p>
    </div>
  );
};

export default Loader;
