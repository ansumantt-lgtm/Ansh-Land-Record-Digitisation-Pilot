import React from "react";
import { LandAcquisitionFile, Department, FileStatus } from "../types";
import { AlertTriangle, Clock, FileCheck2, Files, Landmark, ArrowRight, Hourglass } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface DashboardProps {
  files: LandAcquisitionFile[];
  onSelectFile: (fileId: string) => void;
}

export default function Dashboard({ files, onSelectFile }: DashboardProps) {
  const { language, t, translateStatus, translateDept } = useLanguage();

  // Metrics calculation
  const totalFiles = files.length;
  
  const filesByStatus = files.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const delayedFiles = files.filter(f => f.daysPendingInCurrentDept > f.slaDaysAllocated);
  const totalDelayed = delayedFiles.length;

  const completedFilesCount = files.filter(f => f.status === FileStatus.CLOSED).length;
  
  const totalCompensation = files.reduce((sum, f) => sum + (f.compensationEstimated || 0), 0);

  // Department-wise pendency calculation
  const deptPendency = Object.values(Department).map(dept => {
    const deptFilesCount = files.filter(f => f.currentDepartment === dept).length;
    const deptDelayed = files.filter(f => f.currentDepartment === dept && f.daysPendingInCurrentDept > f.slaDaysAllocated).length;
    return {
      name: dept,
      count: deptFilesCount,
      delayed: deptDelayed
    };
  }).filter(d => d.count > 0);

  // Maximum count for scaling the chart
  const maxCount = Math.max(...deptPendency.map(d => d.count), 1);

  return (
    <div className="space-y-6" id="dashboard-module">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="stat-total-files" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{t("Total Files Tracked")}</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{totalFiles}</h3>
            <p className="text-xs text-slate-500 mt-1">{t("Across all departments")}</p>
          </div>
        </div>

        <div id="stat-delayed-files" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{t("SLA Overdue")}</p>
            <h3 className="text-2xl font-bold text-amber-600 tracking-tight">{totalDelayed}</h3>
            <p className="text-xs text-amber-500 mt-1 font-semibold">{t("Immediate attention needed")}</p>
          </div>
        </div>

        <div id="stat-completed-files" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{t("Completed Segments")}</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{completedFilesCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {totalFiles > 0 ? Math.round((completedFilesCount / totalFiles) * 100) : 0}% {t("success rate")}
            </p>
          </div>
        </div>

        <div id="stat-total-compensation" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{t("Estimated Value")}</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">₹{totalCompensation.toLocaleString()} L</h3>
            <p className="text-xs text-slate-500 mt-1">{t("Acquisition compensation")}</p>
          </div>
        </div>
      </div>

      {/* SLA Risk Banner & Crucial Highlights */}
      {totalDelayed > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-2xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-800">{t("Delayed Acquisition Actions Detected")}</h4>
            <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
              {language === 'mr' ? (
                <span>सध्या एकूण <strong className="font-bold underline">{totalDelayed} नस्त्या</strong> त्यांच्या मंजूर मुदती (SLA) पेक्षा जास्त काळ प्रलंबित आहेत. तातडीने निपटारा करण्याचे निर्देश दिले आहेत.</span>
              ) : (
                <span>There are currently <strong className="font-bold underline">{totalDelayed} files</strong> waiting past their allocated Service Level Agreements (SLA). Delayed items need immediate officer focus.</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department-wise Pendency Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{t("Department-wise File Distribution")}</h3>
              <p className="text-xs text-slate-400">{t("Comparing active workload allocation and delayed files")}</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{t("Live Statistics")}</span>
          </div>

          <div className="space-y-4">
            {deptPendency.map(dept => {
              const overallPercent = (dept.count / maxCount) * 100;
              
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600 truncate max-w-[240px]" title={dept.name}>
                      {translateDept(dept.name)}
                    </span>
                    <span className="text-slate-500 font-mono">
                      <strong>{dept.count}</strong> {language === 'mr' ? 'नस्ती' : (dept.count === 1 ? 'file' : 'files')}{' '}
                      {dept.delayed > 0 && (
                        <span className="text-amber-600 font-semibold">({dept.delayed} {language === 'mr' ? 'विलंबित' : 'overdue'})</span>
                      )}
                    </span>
                  </div>
                  
                  {/* Custom Multi-bar */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${overallPercent}%` }}
                    />
                    {dept.delayed > 0 && (
                      <div 
                        className="absolute left-0 top-0 h-full bg-amber-500/80 rounded-full transition-all duration-500"
                        style={{ width: `${(dept.delayed / maxCount) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-start space-x-4 text-[10px] font-mono text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block"></span>
                <span>{t("Active Workload")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block"></span>
                <span>{t("Delayed Items")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{language === 'mr' ? 'प्रगती टप्पे वाटप' : 'Status Categorization'}</h3>
              <p className="text-xs text-slate-400">{language === 'mr' ? 'थेट टप्पा वाटप वर्गीकरण' : 'Real-time progression status'}</p>
            </div>
            <Hourglass className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {Object.values(FileStatus).map(status => {
              const count = filesByStatus[status] || 0;
              const percent = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
              
              if (count === 0) return null; // Only show active statuses

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">{translateStatus(status)}</span>
                    <span className="font-mono font-semibold text-slate-700">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full">
                    <div 
                      className="h-full bg-slate-400 rounded-full" 
                      style={{ width: `${percent}%`, backgroundColor: getStatusColor(status) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* End grid */}
      </div>

      {/* Critical Escalations Queue / Recent Files */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{language === 'mr' ? 'अति-विलंबित वेळेचे नियंत्रण व प्रक्रिया' : 'Critical Delay Monitoring & Routing'}</h3>
            <p className="text-xs text-slate-400">{language === 'mr' ? 'त्वरित अधिकृत कारवाई आणि निपटारा अपेक्षित असणाऱ्या नस्त्या' : 'Acquisition files flagged for immediate officer acknowledgment and action'}</p>
          </div>
          <span className="text-xs font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">{language === 'mr' ? 'कारवाई आवश्यक' : 'Action Required'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono tracking-wider uppercase text-[10px]">
                <th className="py-3 px-4">{t("File Number")}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'भूमी संपादन प्रकल्प शीर्षक आणि गट क्र.' : 'Project Title & Case Coordinates'}</th>
                <th className="py-3 px-4">{t("Current Department Location")}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'प्रलंबित कालावधी' : 'Pending Period'}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'मंजूर मुदत' : 'SLA Allowed'}</th>
                <th className="py-3 px-4">{language === 'mr' ? 'सद्यस्थिती' : 'Escalation Status'}</th>
                <th className="py-3 px-4 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {files.map(file => {
                const isDelayed = file.daysPendingInCurrentDept > file.slaDaysAllocated;
                return (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{file.id}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-800">{file.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {language === 'mr' ? 'गट' : 'Survey'}: {file.surveyNumber} • {language === 'mr' ? 'तालुका' : 'Taluka'}: {file.taluka}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium inline-block">
                        {translateDept(file.currentDepartment)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={isDelayed ? "text-amber-600 font-bold" : "text-slate-600"}>
                        {file.daysPendingInCurrentDept} {language === 'mr' ? 'दिवस' : 'Days'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {file.slaDaysAllocated} {language === 'mr' ? 'दिवस' : 'Days'}
                    </td>
                    <td className="py-3.5 px-4">
                      {isDelayed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          {language === 'mr' ? 'विलंबित • मुदत ओलांडली' : 'Delayed • SLA Breached'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {language === 'mr' ? 'वेळेत' : 'On Track'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => onSelectFile(file.id)}
                        className="text-indigo-600 hover:text-indigo-900 hover:underline inline-flex items-center font-semibold gap-1"
                      >
                        {language === 'mr' ? 'निवडा' : 'Track File'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper to resolve status colors nicely
function getStatusColor(status: FileStatus): string {
  switch (status) {
    case FileStatus.CREATED:
    case FileStatus.SUBMITTED:
      return "#3b82f6"; // Blue
    case FileStatus.UNDER_REVIEW:
      return "#8b5cf6"; // Purple
    case FileStatus.SURVEY_PENDING:
      return "#eab308"; // Amber
    case FileStatus.SURVEY_COMPLETED:
      return "#10b981"; // Emerald
    case FileStatus.NOTIFICATION_DRAFTED:
      return "#6366f1"; // Indigo
    case FileStatus.PUBLICATION_PENDING:
      return "#f97316"; // Orange
    case FileStatus.PUBLICATION_COMPLETED:
      return "#14b8a6"; // Teal
    case FileStatus.PANCHNAMA_PENDING:
      return "#ec4899"; // Pink
    case FileStatus.CLOSED:
      return "#64748b"; // Slate
    default:
      return "#cbd5e1";
  }
}
