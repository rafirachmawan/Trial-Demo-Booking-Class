import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Calendar, Users, Settings, UserPlus, ClipboardList } from 'lucide-react';
import CabangSchedule from './CabangSchedule';
import CabangMasterData from './CabangMasterData';
import CabangStudents from './CabangStudents';
import CabangCgForm from './CabangCgForm';
import CabangStudentManage from './CabangStudentManage';

export default function CabangDashboard({ overrideBranchId, onBack }) {
  const { currentUser, branches } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('schedule');
  
  const targetBranchId = overrideBranchId || currentUser.branchId;
  const branch = branches.find(b => b.id === targetBranchId);

  if (!branch) {
    return <div className="p-8 text-center text-red-500">Cabang tidak ditemukan untuk user ini.</div>;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'schedule': return <CabangSchedule branchId={branch.id} />;
      case 'students': return <CabangStudents branchId={branch.id} />;
      case 'cg_form': return <CabangCgForm branchId={branch.id} onSuccess={() => setActiveTab('students')} />;
      case 'manage': return <CabangStudentManage branchId={branch.id} />;
      case 'master': return <CabangMasterData branchId={branch.id} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start mb-1">
            <h2 className="font-bold text-slate-800 line-clamp-1">{branch.name}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{branch.address}</p>
        </div>
        
        {onBack && (
          <div className="p-3 border-b border-slate-100 bg-purple-50/50">
            <button 
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors"
            >
              <span>← Kembali ke Pusat</span>
            </button>
          </div>
        )}
        
        <div className="p-3 space-y-1">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'schedule' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Matriks Jadwal</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'students' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Siswa</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('manage')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'manage' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Kelola Siswa</span>
          </button>

          <button 
            onClick={() => setActiveTab('cg_form')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'cg_form' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Form Coba Gratis (CG)</span>
          </button>
          
          <div className="my-2 border-t border-slate-100"></div>

          <button 
            onClick={() => setActiveTab('master')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'master' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Master Data Cabang</span>
          </button>
        </div>
      </div>
      
      {/* Main Area */}
      <div className="flex-1 overflow-auto bg-slate-50 relative">
        {renderContent()}
      </div>
    </div>
  );
}
