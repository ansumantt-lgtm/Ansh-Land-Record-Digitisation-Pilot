import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LandAcquisitionFile } from "../types";
import { MOCK_USERS } from "../data/mockData";
import { Clock, ShieldAlert, Sparkles, Filter, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

interface DelayMonitoringProps {
  files: LandAcquisitionFile[];
  onSelectFile: (fileId: string) => void;
}

export default function DelayMonitoring({ files, onSelectFile }: DelayMonitoringProps) {
  const { language, t, translateRole, translateDept } = useLanguage();
  const [filterDelay, setFilterDelay] = useState<"all" | "delayed" | "ontrack" | "critical">("all");

  const totalTracked = files.length;
  const delayedFiles = files.filter(f => f.daysPendingInCurrentDept > f.slaDaysAllocated);
  const totalDelayed = delayedFiles.length;
  const complianceRate = totalTracked > 0 ? Math.round(((totalTracked - totalDelayed) / totalTracked) * 100) : 100;

  // Calculate avg delay in delayed files
  const avgDelay = totalDelayed > 0 
    ? Math.round(delayedFiles.reduce((sum, f) => sum + (f.daysPendingInCurrentDept - f.slaDaysAllocated), 0) / totalDelayed)
    : 0;

  // Department worst bottleneck calculation
  const deptDelays = files.reduce((acc, f) => {
    if (f.daysPendingInCurrentDept > f.slaDaysAllocated) {
      const excess = f.daysPendingInCurrentDept - f.slaDaysAllocated;
      acc[f.currentDepartment] = (acc[f.currentDepartment] || 0) + excess;
    }
    return acc;
  }, {} as Record<string, number>);

  let worstDept = language === 'mr' ? "काहीही नाही (पूर्ण अनुपालन)" : "None (Fully Compliant)";
  let maxExcess = 0;
  Object.entries(deptDelays).forEach(([dept, excess]) => {
    if (excess > maxExcess) {
      maxExcess = excess;
      worstDept = dept;
    }
  });

  // Filter logic
  const filteredFiles = files.filter(f => {
    const isOverdue = f.daysPendingInCurrentDept > f.slaDaysAllocated;
    if (filterDelay === "delayed") return isOverdue;
    if (filterDelay === "ontrack") return !isOverdue;
    if (filterDelay === "critical") return isOverdue && (f.daysPendingInCurrentDept - f.slaDaysAllocated) > 10;
    return true;
  });

  return (
    <div className="space-y-6" id="delay-monitoring-module">
      {/* Analytics overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${complianceRate > 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'SLA अनुपालन दर' : 'SLA Compliance Rate'}</p>
            <h3 className={`text-2xl font-bold tracking-tight ${complianceRate > 75 ? 'text-slate-800' : 'text-rose-600'}`}>{complianceRate}%</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{language === 'mr' ? 'जिल्हा प्रशासकीय उद्दिष्ट ≥ ९०% आहे' : 'District Target is ≥ 90%'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'सरासरी प्रलंबित कालावधी' : 'Avg Overdue Age'}</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{avgDelay} {language === 'mr' ? 'दिवस' : 'Days'}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{language === 'mr' ? 'थकीत प्रकरणांमधील सरासरी' : 'Average across overdue cases'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'सर्वाधिक प्रलंबित विभाग' : 'Bottleneck Segment'}</p>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px]" title={worstDept}>
              {worstDept !== "None (Fully Compliant)" && worstDept !== "काहीही नाही (पूर्ण अनुपालन)" ? translateDept(worstDept) : worstDept}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{language === 'mr' ? `एकूण ${maxExcess} प्रलंबित दिवस नोंदवले` : `Cumulative ${maxExcess} delay days recorded`}</p>
          </div>
        </div>

      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'प्रलंबित स्थितीनुसार गाळणी:' : 'Filter by Aging Status:'}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterDelay("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDelay === "all" ? "bg-slate-800 text-white shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {language === 'mr' ? 'सर्व नस्ती' : 'All Files'} ({totalTracked})
          </button>
          
          <button
            onClick={() => setFilterDelay("delayed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDelay === "delayed" ? "bg-amber-600 text-white shadow-xs" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100"
            }`}
          >
            {language === 'mr' ? 'SLA कालावधी संपलेले' : 'SLA Overdue'} ({totalDelayed})
          </button>

          <button
            onClick={() => setFilterDelay("critical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDelay === "critical" ? "bg-red-600 text-white shadow-xs animate-pulse" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
            }`}
          >
            {language === 'mr' ? 'अति-गंभीर प्रलंबित (१०+ दिवस अधिक)' : 'Critical Overdue (10+ Days Breach)'} ({files.filter(f => f.daysPendingInCurrentDept - f.slaDaysAllocated > 10).length})
          </button>

          <button
            onClick={() => setFilterDelay("ontrack")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDelay === "ontrack" ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
            }`}
          >
            {language === 'mr' ? 'वेळेवर प्रगतीपथावर' : 'On Track'} ({totalTracked - totalDelayed})
          </button>
        </div>
      </div>

      {/* SLA aging monitoring board */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
          {language === 'mr' ? 'जिल्हा SLA प्रलंबित नोंदवही' : 'District SLA Aging Ledger'}
        </div>
        
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {language === 'mr' ? 'सध्याच्या प्रलंबित फिल्टरनुसार कोणतीही नस्ती आढळली नाही.' : 'No matching files found under the current SLA filter.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFiles.map(file => {
              const isOverdue = file.daysPendingInCurrentDept > file.slaDaysAllocated;
              const delayDays = file.daysPendingInCurrentDept - file.slaDaysAllocated;
              const currentOwner = MOCK_USERS.find(u => u.id === file.currentOwnerId) || MOCK_USERS[0];

              return (
                <div key={file.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                  
                  {/* File Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        {file.id}
                      </span>
                      <span className="text-[10px] bg-slate-100 font-mono text-slate-650 px-2 py-0.5 rounded-full font-semibold">
                        {translateDept(file.currentDepartment)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 truncate mt-1.5">{file.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'mr' ? 'तालुका' : 'Taluka'}: <strong className="font-medium text-slate-650">{file.taluka}</strong> • {language === 'mr' ? 'मालक माहिती' : 'Owners'}: {file.landOwnerInfo}
                    </p>
                  </div>

                  {/* Owner Display */}
                  <div className="text-xs min-w-[180px]">
                    <span className="text-[10px] text-slate-400 block font-mono">{language === 'mr' ? 'नियुक्त अधिकारी' : 'Assigned Officer'}</span>
                    <div className="font-bold text-slate-700 truncate mt-0.5">{currentOwner.name}</div>
                    <div className="text-[11px] text-slate-400">{translateRole(currentOwner.role)}</div>
                  </div>

                  {/* SLA Aging metrics */}
                  <div className="text-xs min-w-[200px] flex items-center space-x-6">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">{language === 'mr' ? 'प्रलंबित कालावधी' : 'Pending For'}</span>
                      <div className={`text-sm font-extrabold font-mono mt-0.5 ${isOverdue ? 'text-amber-600' : 'text-slate-700'}`}>
                        {file.daysPendingInCurrentDept} {language === 'mr' ? 'दिवस' : 'Days'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{language === 'mr' ? `मंजूर SLA: ${file.slaDaysAllocated} दिवस` : `SLA Allowed: ${file.slaDaysAllocated}d`}</span>
                    </div>

                    {isOverdue ? (
                      <div className="bg-amber-50 text-amber-700 border border-amber-250 rounded-lg p-2.5 flex items-center space-x-2 text-[10px] flex-1">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <div>
                          <p className="font-bold">{language === 'mr' ? 'मुदत ओलांडली' : 'Overdue Age'}</p>
                          <p className="font-semibold underline">+{delayDays} {language === 'mr' ? 'दिवस विलंब' : 'Days delayed'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg p-2.5 flex items-center space-x-2 text-[10px] flex-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <div>
                          <p className="font-bold text-emerald-800">{language === 'mr' ? 'SLA अनुपालन' : 'SLA Compliant'}</p>
                          <p className="text-emerald-600">{file.slaDaysAllocated - file.daysPendingInCurrentDept} {language === 'mr' ? 'दिवस शिल्लक' : 'days left'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track link */}
                  <button
                    onClick={() => onSelectFile(file.id)}
                    className="self-end md:self-auto p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors inline-block cursor-pointer"
                    title={language === 'mr' ? 'निरीक्षण करा' : 'Track details layout'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
