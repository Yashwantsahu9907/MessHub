import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to MessHub</h1>
      <p className="text-xl mb-8">Multi-tenant Mess Attendance & Management Platform</p>
      <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        Login
      </Link>
    </div>
  );
};

export default Home;
