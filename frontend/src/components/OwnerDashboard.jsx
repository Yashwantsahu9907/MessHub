import React, { useEffect, useState } from 'react';
import messService from '../services/messService';

const OwnerDashboard = () => {
  const [messProfile, setMessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await messService.getMessProfile();
        setMessProfile(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mess profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center p-8">Loading mess data...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-2">{messProfile.name}</h2>
        <p className="text-gray-600 mb-6">Manage your mess, students, and attendance.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Unique Join Code</p>
            <div className="text-4xl font-mono font-bold text-blue-600 tracking-widest bg-blue-100 px-6 py-3 rounded">
              {messProfile.joinCode}
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">Share this code with students so they can request to join your mess.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">Mess QR Code</p>
            <img src={messProfile.qrCode} alt="Mess QR Code" className="w-40 h-40 shadow-sm border border-gray-200 rounded" />
            <p className="mt-4 text-sm text-gray-500 text-center">Students can also scan this code to join.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium">Pending Requests</p>
            <h3 className="text-3xl font-bold text-orange-500">{messProfile.pendingRequestsCount}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-xl font-bold">
            !
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between opacity-50">
          <div>
            <p className="text-gray-500 font-medium">Active Students</p>
            <h3 className="text-3xl font-bold text-gray-800">--</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between opacity-50">
          <div>
            <p className="text-gray-500 font-medium">Today's Attendance</p>
            <h3 className="text-3xl font-bold text-gray-800">--</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
