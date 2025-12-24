import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../services/api';

const linkBase =
  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors';

const linkClass = ({ isActive }) =>
  `${linkBase} ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;

export default function DashboardNavbar() {
  const navigate = useNavigate();

  const onLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500" />
          <div>
            <div className="text-sm font-semibold leading-tight">BizMind AI</div>
            <div className="text-xs text-white/70">Dashboard</div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={linkClass} end>
            Overview
          </NavLink>
          <NavLink to="/dashboard/proposals" className={linkClass}>
            Proposal History
          </NavLink>
          <NavLink to="/dashboard/proposals/new" className={linkClass}>
            New Proposal
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
