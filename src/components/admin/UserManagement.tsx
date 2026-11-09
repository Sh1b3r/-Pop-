import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { CheckCircle, XCircle, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { allUsers, updateUserRole, toggleUserStatus } = useAuth();
  const [search, setSearch] = useState('');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card p-6 rounded-3xl space-y-6">
      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black">Керування користувачами (RBAC)</h2>
          <p className="text-xs opacity-60">
            Всього зареєстровано: {allUsers.length} облікових записів
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Пошук користувача..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 py-2 text-xs"
          />
          <Search className="w-4 h-4 opacity-40 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Користувач</th>
              <th>Роль (RBAC)</th>
              <th>Статус</th>
              <th>Створено</th>
              <th className="text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center font-bold text-xs text-[#FF6B00]">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold block">{u.name}</span>
                      <span className="text-xs opacity-60">{u.email}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                    className="glass-input text-xs py-1 px-2.5 rounded-lg font-bold"
                  >
                    <option value="Customer" className="bg-[#121620] text-white">Customer</option>
                    <option value="Manager" className="bg-[#121620] text-white">Manager</option>
                    <option value="SuperAdmin" className="bg-[#121620] text-white">SuperAdmin</option>
                  </select>
                </td>

                <td>
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Активний
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      Заблокований
                    </span>
                  )}
                </td>

                <td className="text-xs opacity-70 font-mono tabular-numbers">
                  {new Date(u.createdAt).toLocaleDateString('uk-UA')}
                </td>

                <td className="text-right">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${u.isActive
                        ? 'border-red-500/30 text-red-500 hover:bg-red-500/20'
                        : 'border-green-500/30 text-green-500 hover:bg-green-500/20'
                      }`}
                  >
                    {u.isActive ? 'Деактивувати' : 'Активувати'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
