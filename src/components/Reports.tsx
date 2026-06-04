import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LandAcquisitionFile } from "../types";
import { MOCK_VILLAGES, MOCK_AGENCIES, MOCK_USERS } from "../data/mockData";
import { FileSpreadsheet, Printer, Download, Filter, HelpCircle, FileCheck2, TrendingUp } from "lucide-react";

interface ReportsProps {
  files: LandAcquisitionFile[];
}

export default function Reports({ files }: ReportsProps) {
  const { language, translateDept, translateStatus } = useLanguage();
  const [rptDept, setRptDept] = useState<string>("all");
  const [rptStatus, setRptStatus] = useState<string>("all");
  const [rptSla, setRptSla] = useState<string>("all");

  const depts = Array.from(new Set(files.map(f => f.currentDepartment)));
  const statuses = Array.from(new Set(files.map(f => f.status)));

  const filtered = files.filter(f => {
    if (rptDept !== "all" && f.currentDepartment !== rptDept) return false;
    if (rptStatus !== "all" && f.status !== rptStatus) return false;
    if (rptSla === "delayed") return f.daysPendingInCurrentDept > f.slaDaysAllocated;
    if (rptSla === "ontrack") return f.daysPendingInCurrentDept <= f.slaDaysAllocated;
    return true;
  });

  const totalValue = filtered.reduce((acc, f) => acc + (f.compensationEstimated || 0), 0);
  const delayedCount = filtered.filter(f => f.daysPendingInCurrentDept > f.slaDaysAllocated).length;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "File Number,Project Title,Village,Taluka,Survey Numbers,Current Location,Status,Pending Days,SLA Allowed,Est Compensation (INR Lakhs)\n";
    
    filtered.forEach(f => {
      const v = MOCK_VILLAGES.find(vil => vil.id === f.villageId)?.name || "Unknown";
      const escapedTitle = f.title.replace(/"/g, '""');
      csvContent += `"${f.id}","${escapedTitle}","${v}","${f.taluka}","${f.surveyNumber}","${f.currentDepartment}","${f.status}",${f.daysPendingInCurrentDept},${f.slaDaysAllocated},${f.compensationEstimated || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LAQ_Registry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-module">
      
      {/* Filtering row */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800">
            {language === 'mr' ? 'गतिशील नस्ती नोंदवही शोध व अहवाल निर्माता' : 'Dynamic Registry Query & Report Constructor'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">{language === 'mr' ? 'सध्याचे विभाग स्थान' : 'Location Department'}</label>
            <select
              value={rptDept}
              onChange={e => setRptDept(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none font-medium"
            >
              <option value="all" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? '-- सर्व विभाग --' : '-- All Departments --'}</option>
              {depts.map(d => (
                <option key={d} value={d} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{translateDept(d as any)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">{language === 'mr' ? 'नस्ती प्रवाह स्थिती' : 'Workflow Node Status'}</label>
            <select
              value={rptStatus}
              onChange={e => setRptStatus(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none font-medium"
            >
              <option value="all" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? '-- सर्व स्थिती --' : '-- All Statuses --'}</option>
              {statuses.map(s => (
                <option key={s} value={s} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{translateStatus(s as any)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">{language === 'mr' ? 'SLA मुदत अंमलबजावणी' : 'SLA Enforcement'}</label>
            <select
              value={rptSla}
              onChange={e => setRptSla(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none font-medium"
            >
              <option value="all" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'सर्व नस्ती दाखवा' : 'Show All'}</option>
              <option value="delayed" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'फक्त मुदत संपलेले दर्शवा (विलंबित)' : 'Show Only Overdue (Delayed)'}</option>
              <option value="ontrack" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'अनुपालन / वेळेवर असणारे दर्शवा' : 'Show Compliant / On-Track'}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-455" />
            {language === 'mr' ? 'अहवाल मुद्रित करा' : 'Print Report Sheet'}
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            {language === 'mr' ? 'CSV मध्ये साठवा (.csv)' : 'Export data ledger (.csv)'}
          </button>
        </div>
      </div>

      {/* Aggregate review for filtered items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold print:hidden">
        
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center space-x-3">
          <FileSpreadsheet className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase font-mono tracking-wider">{language === 'mr' ? 'फिल्टर केलेले प्रमाण' : 'Filtered Volume'}</span>
            <span className="text-slate-800 text-sm font-bold">{filtered.length} {language === 'mr' ? 'नस्ती निवडल्या' : 'files selected'}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase font-mono tracking-wider">{language === 'mr' ? 'एकूण अंदाजे नुकसानभरपाई' : 'Cumulative Valuation'}</span>
            <span className="text-slate-800 text-sm font-bold">₹{totalValue.toLocaleString()} {language === 'mr' ? 'लाख (Lakhs)' : 'Lakhs'}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase font-mono tracking-wider">{language === 'mr' ? 'SLA मुदत ओलांडलेली प्रकरणे' : 'Breached SLA Cases'}</span>
            <span className="text-slate-800 text-sm font-bold">{delayedCount} {language === 'mr' ? 'नस्ती प्रलंबित' : 'files delayed'}</span>
          </div>
        </div>

      </div>

      {/* Report Canvas Area - Print Safe */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-xs p-8 print:p-0 print:border-none print:shadow-none" id="print-area">
        
        {/* Print Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-5 flex justify-between items-start">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">{language === 'mr' ? 'अधिकृत नस्ती नोंदवही' : 'OFFICIAL REGISTRY LEDGER'}</span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1 uppercase">{language === 'mr' ? 'जिल्हाधिकारी कार्यालय भूसंपादन प्रणाली' : 'DISTRICT COLLECTORATE LAND ACQUISITION SYSTEM'}</h1>
            <p className="text-[11px] text-slate-500 mt-1">{language === 'mr' ? 'अहवाल तयार केल्याची तारीख:' : 'Generated and Compiled on:'} <strong>{new Date().toLocaleString()}</strong> • {language === 'mr' ? 'स्थिती व्याप्ती:' : 'Status Scope:'} {rptStatus === "all" ? (language === 'mr' ? 'सर्व स्थिती' : 'All') : translateStatus(rptStatus as any)} • {language === 'mr' ? 'SLA फिल्टर:' : 'SLA Filter:'} {rptSla}</p>
          </div>
          <div className="text-right text-[10px] font-mono text-slate-500">
            <p>Form ID: LAQ-GBC-228</p>
            <p>{language === 'mr' ? 'अधिकारी:' : 'Officer:'} Unified System Auditor</p>
            <p className="text-emerald-700 font-bold mt-1">✓ {language === 'mr' ? 'प्रणालीद्वारे सत्यापित' : 'SYSTEM AUTHENTICATED'}</p>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 font-mono uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">{language === 'mr' ? 'नस्ती क्र' : 'File Key'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'भूसंपादन प्रकल्पाचे स्वरूप' : 'Acquisition Project Scope'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'गाव, उपविभाग' : 'Village, Sub-Division'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'मागणी करणारी एजन्सी' : 'Requester Agency'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'सध्याचे स्थान / विवरण' : 'Current Location'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'SLA स्थिती' : 'SLA Status'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'अंदाजे बजेट' : 'Compensation Budget'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(f => {
                const isOverdue = f.daysPendingInCurrentDept > f.slaDaysAllocated;
                const v = MOCK_VILLAGES.find(vil => vil.id === f.villageId)?.name || "Unknown";
                const ag = MOCK_AGENCIES.find(a => a.id === f.acquiringAgencyId)?.name || "Unknown";
                
                return (
                  <tr key={f.id} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{f.id}</td>
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-semibold text-slate-800">{f.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{language === 'mr' ? 'गट/सर्व्हे क्र:' : 'Plot Details: Survey'} {f.surveyNumber}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-700">{v}</div>
                      <div className="text-[10px] text-slate-400">{language === 'mr' ? 'तालुका:' : 'Taluka:'} {f.taluka}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] truncate max-w-[140px]" title={ag}>
                      {ag}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">{translateDept(f.currentDepartment)}</span>
                      <span className="text-[10px] text-slate-400">{translateStatus(f.status)}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isOverdue ? (
                        <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                          {language === 'mr' ? `विलंबित (${f.daysPendingInCurrentDept}दि / SLA: ${f.slaDaysAllocated}दि)` : `DELAYED (${f.daysPendingInCurrentDept}d / SLA: ${f.slaDaysAllocated}d)`}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          {language === 'mr' ? `वेळेत (${f.daysPendingInCurrentDept}दि / SLA: ${f.slaDaysAllocated}दि)` : `ON TRACK (${f.daysPendingInCurrentDept}d / SLA: ${f.slaDaysAllocated}d)`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 text-[11px]">
                      ₹{(f.compensationEstimated || 0).toLocaleString()} {language === 'mr' ? 'लाख (L)' : 'L'}
                    </td>
                  </tr>
                );
              })}
              
              {/* Total Aggregate Summary Row */}
              <tr className="bg-slate-50 border-t-2 border-slate-900 text-xs font-semibold">
                <td colSpan={5} className="py-3 px-3 text-right uppercase text-slate-500 font-mono">
                  {language === 'mr' ? 'एकूण अहवाल मूल्यांकन मूल्य' : 'Report Aggregate Valuation'}
                </td>
                <td className="py-3 px-3 font-mono text-slate-500">
                  {filtered.length} {language === 'mr' ? 'नस्ती विभाग' : 'File Segments'}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-900 border-double border-b-4 border-slate-600">
                  ₹{totalValue.toLocaleString()} {language === 'mr' ? 'लाख' : 'L'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Print Sign-off block */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-500">
          <div>
            <p>{language === 'mr' ? 'सत्यापित लेखापरीक्षण शिक्या आणि टोकन' : 'Verified Audit Stamp & Cryptographic Token'}</p>
            <p className="font-mono text-[9px] mt-1 text-slate-400">SHA256: 3c591a2ac8b44917a610cf9ca10c4f828a1ba5f2ce01d848</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700 uppercase">{language === 'mr' ? 'जिल्हा दंडाधिकारी / जिल्हाधिकारी कार्यालय प्राधिकरण' : 'District Magistrate / Collector Office Authority'}</p>
            <p className="mt-4 text-[10px]">{language === 'mr' ? 'डिजिटल द्वारे सत्यापित सही शिक्या' : 'Authenticated Electronic Signature Stamp'}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
