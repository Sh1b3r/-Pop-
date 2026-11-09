import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserManagement } from './UserManagement';
import { PricingManager } from './PricingManager';
import { Users, DollarSign, ShieldAlert, ArrowLeft, BarChart3, ShieldCheck } from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pricing' | 'users'>('pricing');

  // Check RBAC permissions
  const hasAccess = user && (user.role === 'SuperAdmin' || user.role === 'Manager');

  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 glass-card text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-[#FF6B00] mx-auto" />
        <h2 className="text-2xl font-black">Доступ обмежено (403 Forbidden)</h2>
        <p className="text-sm opacity-70">
          Ця панель доступна виключно користувачам з ролями <b>SuperAdmin</b> або <b>Manager</b>.
        </p>
        <button onClick={onBackToStore} className="btn-accent mt-4">
          Повернутися до магазину
        </button>
      </div>
    );
  }

  const isSuperAdmin = user.role === 'SuperAdmin';

  return (
    <div className="main-content max-w-7xl mx-auto py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Повернутися до магазину"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-tight">
                Панель управління
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                {user.role}
              </span>
            </div>
            <p className="text-xs opacity-60 mt-1">
              Керування користувачами (RBAC), мультивалютними цінами та регіонами
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/5 dark:bg-black/40 p-1.5 rounded-2xl border border-black/10 dark:border-white/15">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pricing'
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/40'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Регіональні ціни</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/40'
                  : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Користувачі (RBAC)</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'pricing' ? <PricingManager /> : <UserManagement />}
      </div>
    </div>
  );
};
