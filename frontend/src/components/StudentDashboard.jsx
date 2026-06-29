import React, { useState } from 'react';
import messService from '../services/messService';

const StudentDashboard = () => {
  const [joinCode, setJoinCode] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const data = await messService.requestJoin(joinCode);
      setStatusMsg({ type: 'success', text: data.message });
      setJoinCode('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
        <h2 className="text-2xl font-bold mb-2">Welcome to MessHub</h2>
        <p className="text-gray-600 mb-6">You are currently not an active member of any mess. Join one to get started.</p>
        
        <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
          <h3 className="text-lg font-bold mb-4 text-center">Join a Mess</h3>
          
          {statusMsg.text && (
            <div className={`mb-4 p-3 rounded text-center ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter 8-Character Join Code</label>
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                maxLength={8}
                className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || joinCode.length < 8}
              className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Join Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
