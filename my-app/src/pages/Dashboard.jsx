import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutApi } from '../services/auth';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutApi();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              You’re logged in. Manage your profile and preferences below.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-600 mt-1">View or update your profile details.</p>
            <div className="mt-4 flex gap-3">
              <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/profile">
                View
              </Link>
              <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/profile/edit">
                Edit
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            <p className="text-sm text-gray-600 mt-1">Control how BizMind AI works for you.</p>
            <div className="mt-4 flex gap-3">
              <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/preferences">
                View
              </Link>
              <Link className="text-blue-600 hover:text-blue-500 font-medium" to="/preferences/edit">
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}