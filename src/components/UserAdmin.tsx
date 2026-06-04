import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { User, LandAcquisitionFile } from "../types";
import { MOCK_USERS } from "../data/mockData";
import { ShieldCheck, UserCog, Mail, Phone, Users, Landmark, AlertTriangle } from "lucide-react";

interface UserAdminProps {
  files: LandAcquisitionFile[];
  currentUser: User;
  onSwitchUser: (userId: string) => void;
}

export default function UserAdmin({ files, currentUser, onSwitchUser }: UserAdminProps) {
  const { language, translateDept, translateRole } = useLanguage();
  
  // Calculate workload per user
  const getUserWorkload = (userId: string) => {
    const assignedFiles = files.filter(f => f.currentOwnerId === userId);
    const criticalDelays = assignedFiles.filter(f => f.daysPendingInCurrentDept > f.slaDaysAllocated).length;
    return {
      count: assignedFiles.length,
      critical: criticalDelays,
      items: assignedFiles
    };
  };

  return (
    <div className="space-y-6" id="user-admin-module">
      {/* Overview Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            {language === 'mr' ? 'सक्रिय अधिकारी मार्गदर्शिका आणि कार्यभार विश्लेषक' : 'Active Team Directory & Workload Load-Balancer'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'mr' ? 'अधिकारी कार्यक्षमता, सोपवलेली कामे आणि विभागांमधील SLA प्रलंबित स्थिती तपासा' : 'Check team capacity, active holdings, and immediate SLA alerts across target departments.'}
          </p>
        </div>
        <div className="text-left sm:text-right text-xs">
          <span className="text-slate-400 block font-mono">{language === 'mr' ? 'चालू प्रायोगिक स्थिती' : 'Current Simulation Mode'}</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1 uppercase text-[10px]">
            {language === 'mr' ? `${translateRole(currentUser.role)} खाते सक्रिय` : `${currentUser.role} Account Active`}
          </span>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_USERS.map(user => {
          const workload = getUserWorkload(user.id);
          const isCurrentUser = user.id === currentUser.id;

          return (
            <div 
              key={user.id} 
              className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                isCurrentUser 
                  ? "border-emerald-500 ring-4 ring-emerald-50 bg-emerald-50/5" 
                  : "border-slate-100 hover:border-indigo-300"
              }`}
            >
              <div>
                
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-slate-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        {user.name}
                        {isCurrentUser && (
                          <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-1.5 bg-emerald-100 text-emerald-800 rounded">
                            {language === 'mr' ? 'सक्रिय' : 'Active'}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">{translateRole(user.role)}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="mt-4 space-y-1 text-xs text-slate-500 font-semibold border-t border-slate-100/50 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <Landmark className="w-3.5 h-3.5 text-slate-450" />
                    <span>{translateDept(user.department as any)}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-455" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-455" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Workload Metric Details */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50/70 py-3 px-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">{language === 'mr' ? 'सक्रिय नस्ती' : 'Active Holds'}</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 inline-block">
                      {language === 'mr' ? `${workload.count} नस्ती` : `${workload.count} ${workload.count === 1 ? 'file' : 'files'}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">{language === 'mr' ? 'SLA मुदत संपलेले' : 'SLA Overdue'}</span>
                    <span className={`font-extrabold text-sm mt-0.5 inline-block flex items-center gap-1 ${
                      workload.critical > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {workload.critical > 0 && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {workload.critical} {language === 'mr' ? 'विलंबित' : 'Breach'}
                    </span>
                  </div>
                </div>

                {/* Displaying title list of files they are working on */}
                {workload.count > 0 && (
                  <div className="mt-3.5 space-y-1 text-[11px] border-t border-slate-50 pt-2.5">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-1">{language === 'mr' ? 'सोपवलेली प्रकरणे' : 'Assigned Cases'}</span>
                    {workload.items.map(i => (
                      <div key={i.id} className="text-slate-600 truncate font-semibold bg-white border border-slate-100 px-2 py-1 rounded inline-block w-full text-left" title={i.title}>
                        <span className="font-mono font-bold text-indigo-700 mr-1">{i.id}</span>
                        {i.title}
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Persona selection trigger */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                {isCurrentUser ? (
                  <div className="text-center text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 py-2 border border-emerald-150 rounded-lg flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {language === 'mr' ? 'या अधिकार्‍याच्या स्वाक्षरी अधिकार आहेत' : 'AUTHORIZED TO DEPLOY DECISIONS'}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSwitchUser(user.id);
                    }}
                    className="w-full py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold text-indigo-700 rounded-lg flex items-center justify-center gap-1 cursor-pointer hover:shadow-xs"
                  >
                    <UserCog className="w-4 h-4" />
                    {language === 'mr' ? 'या अधिकार्‍याच्या नावाने प्रविष्ट व्हा' : 'Impersonate this Officer Profile'}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
