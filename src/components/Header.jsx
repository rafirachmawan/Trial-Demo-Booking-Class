import React, { useContext } from 'react';
import { Sun, UserCog, Building } from 'lucide-react';
import { AppContext } from '../App';

export default function Header() {
  const { users, currentUser, setCurrentUser } = useContext(AppContext);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-50">
      <div className="flex items-center space-x-2">
        <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm">
          <Sun className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">ShiningSun<span className="text-amber-500">Booking</span></span>
        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600 uppercase tracking-wider border border-blue-200">SaaS v2</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-sm font-semibold text-slate-500">Login As:</div>
        
        <select 
          value={currentUser.id}
          onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value))}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-medium outline-none cursor-pointer"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.username} ({u.role === 'superadmin' ? 'Superadmin' : 'Admin Cabang'})
            </option>
          ))}
        </select>
        
        <div className={`p-2 rounded-full ${currentUser.role === 'superadmin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
          {currentUser.role === 'superadmin' ? <Building className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
        </div>
      </div>
    </header>
  );
}
