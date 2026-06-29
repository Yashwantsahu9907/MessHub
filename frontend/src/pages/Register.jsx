import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register for MessHub</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Role</label>
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="mess_owner">Mess Owner</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength="6"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
