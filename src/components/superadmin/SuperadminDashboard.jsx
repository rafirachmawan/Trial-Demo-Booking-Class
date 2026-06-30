import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Building, Users, Plus, MapPin, Settings2 } from 'lucide-react';
import CabangDashboard from '../cabang/CabangDashboard';

export default function SuperadminDashboard() {
  const { branches, setBranches, users, setUsers } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('branches');
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Form States
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  
  const [newUsername, setNewUsername] = useState('');
  const [newBranchId, setNewBranchId] = useState('');

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName) return;
    const newB = { id: 'b' + Date.now(), name: newBranchName, address: newBranchAddress };
    setBranches([...branches, newB]);
    setNewBranchName('');
    setNewBranchAddress('');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername || !newBranchId) return;
    const newU = { id: 'u' + Date.now(), username: newUsername, role: 'admin_cabang', branchId: newBranchId };
    setUsers([...users, newU]);
    setNewUsername('');
    setNewBranchId('');
  };

  if (selectedBranchId) {
    return <CabangDashboard overrideBranchId={selectedBranchId} onBack={() => setSelectedBranchId(null)} />;
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Superadmin Dashboard</h1>
        <p className="text-slate-500 mb-8">Kelola cabang dan akses admin cabang di seluruh sistem.</p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveTab('branches')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'branches' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Manajemen Cabang</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Admin Cabang</span>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* List */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800">
                {activeTab === 'branches' ? 'Daftar Cabang Aktif' : 'Daftar User Admin'}
              </h2>
            </div>
            <div className="p-4">
              {activeTab === 'branches' ? (
                <div className="space-y-3">
                  {branches.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:border-purple-200 transition-colors">
                      <div className="flex items-start">
                        <div className="bg-purple-50 p-2 rounded-lg mr-4">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{b.name}</h3>
                          <p className="text-sm text-slate-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {b.address || 'Alamat belum diatur'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedBranchId(b.id)}
                        className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-bold transition-colors border border-purple-200"
                      >
                        <Settings2 className="w-4 h-4 mr-1.5" />
                        Kelola
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {users.filter(u => u.role !== 'superadmin').map(u => {
                    const b = branches.find(br => br.id === u.branchId);
                    return (
                      <div key={u.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-purple-200 transition-colors">
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-2 rounded-lg mr-4">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{u.username}</h3>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium border border-slate-200">
                              {b ? b.name : 'Unknown Branch'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'branches' ? 'Tambah Cabang Baru' : 'Tambah User Admin'}
              </h2>
            </div>
            <div className="p-5">
              {activeTab === 'branches' ? (
                <form onSubmit={handleAddBranch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Cabang</label>
                    <input 
                      type="text" required
                      value={newBranchName} onChange={e => setNewBranchName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Contoh: Cabang Bandung"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat (Opsional)</label>
                    <textarea 
                      value={newBranchAddress} onChange={e => setNewBranchAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20"
                      placeholder="Alamat lengkap..."
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors">
                    Simpan Cabang
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Username Admin</label>
                    <input 
                      type="text" required
                      value={newUsername} onChange={e => setNewUsername(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Contoh: admin_bdg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Cabang</label>
                    <select 
                      required
                      value={newBranchId} onChange={e => setNewBranchId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">-- Pilih Cabang --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors">
                    Simpan User
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
