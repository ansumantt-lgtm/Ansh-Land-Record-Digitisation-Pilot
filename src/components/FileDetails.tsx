import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LandAcquisitionFile, FileStatus, Department, FileMovement, Note, Attachment, AuditLog, User, Role } from "../types";
import { MOCK_USERS, MOCK_VILLAGES, MOCK_AGENCIES } from "../data/mockData";
import { 
  Building2, Calendar, Clock, FileDown, FileUp, FolderGit, History, 
  MapIcon, MessageSquare, Send, ShieldAlert, ArrowLeftRight, UserCheck, 
  AlertCircle, FileCheck2, Info, ArrowRight, UserPlus 
} from "lucide-react";

interface FileDetailsProps {
  file: LandAcquisitionFile;
  currentUser: User;
  movements: FileMovement[];
  notes: Note[];
  attachments: Attachment[];
  auditLogs: AuditLog[];
  onBack: () => void;
  onWorkflowSubmit: (
    fileId: string, 
    action: "Forward" | "Return" | "Approve" | "Reject" | "Close" | "Reopen",
    toDept: Department,
    toOfficerId: string,
    remarks: string,
    uploadedFiles: Array<{ name: string; size: string; type: string }>
  ) => void;
  onAddNote: (fileId: string, content: string, type: "Note" | "Query" | "Clarification" | "Recommendation" | "Approval") => void;
  onUploadAttachment: (fileId: string, name: string, type: string) => void;
}

export default function FileDetails({
  file,
  currentUser,
  movements,
  notes,
  attachments,
  auditLogs,
  onBack,
  onWorkflowSubmit,
  onAddNote,
  onUploadAttachment
}: FileDetailsProps) {
  const { language, t, translateStatus, translateDept, translateRole } = useLanguage();
  
  // Selection states
  const [activeTab, setActiveTab] = useState<"workflow" | "documents" | "movements" | "notes" | "audit">("workflow");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"Note" | "Query" | "Clarification" | "Recommendation" | "Approval">("Note");

  // Workflow Action panel states
  const [workflowAction, setWorkflowAction] = useState<"Forward" | "Return" | "Approve" | "Reject" | "Close">("Forward");
  const [targetDept, setTargetDept] = useState<Department>(Department.LAO);
  const [targetOfficerId, setTargetOfficerId] = useState("");
  const [wfRemarks, setWfRemarks] = useState("");
  const [wfFiles, setWfFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [dragActive, setDragActive] = useState(false);

  // Filter attachments for current file
  const fileAttachments = attachments.filter(a => a.fileId === file.id);
  // Filter movements for current file
  const fileMovements = movements.filter(m => m.fileId === file.id).sort((a,b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
  // Filter notes for current file
  const fileNotes = notes.filter(n => n.fileId === file.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Filter audit logs
  const fileAudits = auditLogs.filter(l => l.fileId === file.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const currentVillage = MOCK_VILLAGES.find(v => v.id === file.villageId) || MOCK_VILLAGES[0];
  const currentAgency = MOCK_AGENCIES.find(a => a.id === file.acquiringAgencyId) || MOCK_AGENCIES[0];
  const currentOwner = MOCK_USERS.find(u => u.id === file.currentOwnerId) || MOCK_USERS[0];

  const stepsList = [
    { num: 1, label: language === 'mr' ? "टप्पा १: प्रस्ताव सादर" : "Step 1: Proposal Submit", status: FileStatus.CREATED, dept: Department.DM_OFFICE },
    { num: 2, label: language === 'mr' ? "टप्पा २: LAO कडे पाठवा" : "Step 2: Assign to LAO", status: FileStatus.SUBMITTED, dept: Department.LAO },
    { num: 3, label: language === 'mr' ? "टप्पा ३: मोजणी प्रलंबित" : "Step 3: Survey Pending", status: FileStatus.SURVEY_PENDING, dept: Department.DYSLR },
    { num: 4, label: language === 'mr' ? "टप्पा ४: मोजणी पूर्ण" : "Step 4: Survey Completed", status: FileStatus.SURVEY_COMPLETED, dept: Department.LAO },
    { num: 5, label: language === 'mr' ? "टप्पा ५: धारा ११ मसुदा" : "Step 5: Section 11 Draft", status: FileStatus.NOTIFICATION_DRAFTED, dept: Department.LAO },
    { num: 6, label: language === 'mr' ? "टप्पा ६: वृत्त प्रसिद्धी" : "Step 6: Media Publication", status: FileStatus.PUBLICATION_PENDING, dept: Department.DIO },
    { num: 7, label: language === 'mr' ? "टप्पा ७: ग्राम पंचनामा" : "Step 7: Village Panchnama", status: FileStatus.PANCHNAMA_PENDING, dept: Department.VILLAGE_OFFICE },
  ];

  const isDelayed = file.daysPendingInCurrentDept > file.slaDaysAllocated;

  // Determine authorized departmental officers for routing
  const getDepartmentOfficers = (dept: Department) => {
    return MOCK_USERS.filter(u => u.department === dept);
  };

  // Update dropdown values contextually when workflow selection changes
  const handleActionChange = (action: "Forward" | "Return" | "Approve" | "Reject" | "Close") => {
    setWorkflowAction(action);
    setWfRemarks("");
    // Defaults:
    if (action === "Forward") {
      // Suggest next step department based on current file progress
      if (file.stepProgress === 1) {
        setTargetDept(Department.LAO);
        const officers = getDepartmentOfficers(Department.LAO);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else if (file.stepProgress === 2) {
        setTargetDept(Department.DYSLR);
        const officers = getDepartmentOfficers(Department.DYSLR);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else if (file.stepProgress === 3) {
        setTargetDept(Department.LAO);
        const officers = getDepartmentOfficers(Department.LAO);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else if (file.stepProgress === 4) {
        setTargetDept(Department.LAO);
        const officers = getDepartmentOfficers(Department.LAO);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else if (file.stepProgress === 5) {
        setTargetDept(Department.DIO);
        const officers = getDepartmentOfficers(Department.DIO);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else if (file.stepProgress === 6) {
        setTargetDept(Department.VILLAGE_OFFICE);
        const officers = getDepartmentOfficers(Department.VILLAGE_OFFICE);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      } else {
        setTargetDept(Department.DM_OFFICE);
        const officers = getDepartmentOfficers(Department.DM_OFFICE);
        if (officers.length > 0) setTargetOfficerId(officers[0].id);
      }
    } else if (action === "Return" || action === "Reject") {
      // Return typically to DM or previous creator
      setTargetDept(Department.DM_OFFICE);
      const officers = getDepartmentOfficers(Department.DM_OFFICE);
      if (officers.length > 0) setTargetOfficerId(officers[0].id);
    }
  };

  const handleDeptChange = (dept: Department) => {
    setTargetDept(dept);
    const officers = getDepartmentOfficers(dept);
    if (officers.length > 0) {
      setTargetOfficerId(officers[0].id);
    } else {
      setTargetOfficerId("");
    }
  };

  const isUserAuthorized = currentUser.id === file.currentOwnerId || currentUser.role === Role.SUPER_ADMIN;

  const executeWorkflowAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfRemarks) {
      alert("Please provide action remarks.");
      return;
    }
    
    // Perform standard trigger
    onWorkflowSubmit(
      file.id,
      workflowAction,
      targetDept,
      targetOfficerId || "U003",
      wfRemarks,
      wfFiles
    );

    // Reset console states
    setWfRemarks("");
    setWfFiles([]);
    setActiveTab("movements");
  };

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    onAddNote(file.id, newNoteContent, newNoteType);
    setNewNoteContent("");
    setNewNoteType("Note");
  };

  const handleWfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropFiles = Array.from(e.dataTransfer.files).map((f: any) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: "Supporting Execution Attachment"
      }));
      setWfFiles(prev => [...prev, ...dropFiles]);
    }
  };

  const handleWfManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const dropFiles = Array.from(e.target.files).map((f: any) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: "Supporting Execution Attachment"
      }));
      setWfFiles(prev => [...prev, ...dropFiles]);
    }
  };

  return (
    <div className="space-y-6" id="details-module">
      
      {/* Header Panel */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer mb-2"
          >
            ← {t("Back to File Tracker Index")}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg">
              {file.id}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
              {translateStatus(file.status)}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight mt-1">{file.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">{file.description}</p>
        </div>

        {/* Current State Indicator Box */}
        <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl min-w-[240px] text-xs">
          <div className="flex items-center gap-2 mb-2 font-mono uppercase text-[10px] text-slate-400 font-bold">
            <UserCheck className="w-4 h-4 text-slate-500" />
            {t("Active Officer Assignment")}
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={currentOwner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"} 
              alt={currentOwner.name}
              className="w-8 h-8 rounded-full border border-white shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="font-bold text-slate-800">{currentOwner.name}</div>
              <div className="text-[11px] text-slate-500">{translateRole(currentOwner.role)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-slate-500 font-medium">
            {language === 'mr' ? 'कार्यालय स्थान' : 'Location'}: <span className="text-slate-800">{translateDept(file.currentDepartment)}</span>
          </div>
        </div>
      </div>

      {/* Step Progress Visualisation Trail */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs overflow-x-auto">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">{language === 'mr' ? 'नोंदणीकृत अधिकृत संपादन प्रक्रिया आराखडा' : 'Official Land Acquisition Process Blueprint'}</h4>
        <div className="flex items-center justify-between min-w-[900px] relative px-4">
          
          {/* Connector Line decoration */}
          <div className="absolute left-10 right-10 top-5 h-0.5 bg-slate-100 z-0"></div>
          <div 
            className="absolute left-10 top-5 h-0.5 bg-indigo-500 z-0 transition-all duration-500"
            style={{ width: `${((file.stepProgress - 1) / 6) * 100}%` }}
          />

          {stepsList.map((step) => {
            const isCompleted = step.num < file.stepProgress || file.status === FileStatus.CLOSED;
            const isActive = step.num === file.stepProgress && file.status !== FileStatus.CLOSED;

            return (
              <div key={step.num} className="flex flex-col items-center z-10 text-center w-28">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border-2 transition-colors ${
                  isCompleted ? "bg-indigo-600 border-indigo-700 text-white" :
                  isActive ? "bg-amber-100 border-amber-500 text-amber-800 animate-pulse" :
                  "bg-white border-slate-200 text-slate-400"
                }`}>
                  {isCompleted ? "✓" : step.num}
                </div>
                <div className={`mt-2 text-[10px] font-semibold leading-tight ${isActive ? 'text-amber-800 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[100px]">{translateDept(step.dept)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Pane Dashboard split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Pane: Facts and Documents */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section A: Coordinates Info Card */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-indigo-500" />
              {language === 'mr' ? 'भौगोलिक आणि प्रकल्प माहिती' : 'Case Demographics'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block font-normal text-[11px]">{t("Target Revenue Village")}</span>
                <span className="text-slate-700">{currentVillage.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-normal text-[11px]">{language === 'mr' ? 'तालुका' : 'Taluka'}</span>
                <span className="text-slate-700">{file.taluka}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-normal text-[11px]">{t("Survey Number / Gat Number")}</span>
                <span className="text-slate-800 font-mono bg-slate-50 px-2 py-1 rounded inline-block text-[11px] mt-0.5">{file.surveyNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-normal text-[11px]">{t("Total Area Code (Hectares)")}</span>
                <span className="text-slate-700">{file.areaAcquired}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-normal text-[11px]">{language === 'mr' ? 'अंदाजित नुकसानभरपाई' : 'Compensation Budget'}</span>
                <span className="text-slate-700">₹{file.compensationEstimated || 0} {language === 'mr' ? 'लाख' : 'Lakhs'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-normal text-[11px]">{t("Acquiring Agency")}</span>
                <span className="text-slate-700">{currentAgency.name}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-normal text-[11px]">{t("Primary Landowner Info / Demographics")}</span>
                <span className="text-slate-700 leading-relaxed font-medium">{file.landOwnerInfo}</span>
              </div>
            </div>
          </div>

          {/* Section B: Current Stage SLA Aging Meter */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              {language === 'mr' ? 'प्रलंबित कालावधी आणि SLA विश्लेषण' : 'SLA & Aging Telemetry'}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">{language === 'mr' ? 'सध्याच्या अधिकाऱ्यांकडे प्रलंबित दिवस:' : 'Days Pending with Owner:'}</span>
                <span className={isDelayed ? "text-amber-600 font-bold" : "text-slate-700"}>
                  {file.daysPendingInCurrentDept} {language === 'mr' ? 'दिवस' : 'Days'}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">{language === 'mr' ? 'कार्यालयीन SLA मुदत मर्यादा:' : 'Department SLA Limit:'}</span>
                <span className="text-slate-700 font-mono">{file.slaDaysAllocated} {language === 'mr' ? 'दिवस' : 'Days'}</span>
              </div>

              {/* SLA Visual Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isDelayed ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((file.daysPendingInCurrentDept / (file.slaDaysAllocated || 1)) * 100, 100)}%` }}
                />
              </div>

              {isDelayed ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[10px] leading-relaxed flex gap-1.5 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {language === 'mr' ? (
                      <span>चेतावणी: मंजूर SLA कालमर्यादा <strong>{file.daysPendingInCurrentDept - file.slaDaysAllocated} दिवसांनी</strong> ओलांडली गेली आहे. तातडीने निपटारा करण्याचे निर्देश दिले आहेत.</span>
                    ) : (
                      <span>Warning: SLA threshold breached by <strong>{file.daysPendingInCurrentDept - file.slaDaysAllocated} days</strong>. Notifications dispatched to Superiors.</span>
                    )}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-md text-[10px] leading-relaxed flex gap-1.5 font-medium">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'mr' ? 'नस्तीची विल्हेवाट वेळेत प्रगतीपथावर आहे.' : 'Processing matches SLA expectation timeline.'}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Pane: Action Center, Timeline, Notes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col min-h-[500px]">
          
          {/* Tab Selection Row */}
          <div className="border-b border-slate-100 flex overflow-x-auto bg-slate-50/50 rounded-t-xl">
            <button
              onClick={() => setActiveTab("workflow")}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === "workflow" ? "border-indigo-600 text-indigo-700 bg-white font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FolderGit className="w-4 h-4" />
              {language === 'mr' ? 'कार्यप्रवाह नियंत्रण कक्ष' : 'Workflow Console'}
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === "documents" ? "border-indigo-600 text-indigo-700 bg-white font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileUp className="w-4 h-4" />
              {language === 'mr' ? 'दस्तऐवज व्यवस्थापन' : 'Document DMS'} ({fileAttachments.length})
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === "notes" ? "border-indigo-600 text-indigo-700 bg-white font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {language === 'mr' ? 'अधिकारी निरीक्षणे व हरकती' : 'Observations & Queries'} ({fileNotes.length})
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === "movements" ? "border-indigo-600 text-indigo-700 bg-white font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {language === 'mr' ? 'नस्तीचा प्रवास मार्ग' : 'Movement Trail'} ({fileMovements.length})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === "audit" ? "border-indigo-600 text-indigo-700 bg-white font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              {language === 'mr' ? 'लेखापरीक्षण नोंद' : 'Audit Log'}
            </button>
          </div>

          {/* Tab Contents Frame */}
          <div className="p-6 flex-1">
            
            {/* TAB 1: WORKFLOW ENGINE */}
            {activeTab === "workflow" && (
              <div className="space-y-6">
                
                {/* Warning Card if user persona is NOT the actual owner */}
                {!isUserAuthorized ? (
                  <div className="bg-red-50/70 border border-red-150 p-4 rounded-xl flex items-start gap-3 text-xs">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-red-800">
                      <strong className="font-bold">{language === 'mr' ? 'प्रवेश मर्यादित (भूमिका गार्ड अंमलबजावणी)' : 'Access Denied (Role Enforcement Guard)'}</strong>
                      <p className="leading-relaxed text-[11px] text-red-700">
                        {language === 'mr' ? (
                          <span>ही भूसंपादन नस्ती सध्या <strong>{translateDept(file.currentDepartment)}</strong> अंतर्गत अधिकारी <strong>{currentOwner.name} ({translateRole(currentOwner.role)})</strong> यांच्याकडे वर्ग करण्यात आलेली आहे.</span>
                        ) : (
                          <span>This land acquisition file is currently allocated with <strong className="font-semibold">{currentOwner.name} ({translateRole(currentOwner.role)})</strong> within the <strong>{translateDept(file.currentDepartment)}</strong> segment.</span>
                        )}
                      </p>
                      <p className="text-[10px] font-medium bg-red-100/50 p-1.5 rounded text-red-800 mt-2">
                        {language === 'mr' ? (
                          <span>💡 नस्ती पुढील प्रक्रियेत पाठविण्यासाठी पानावरच्या शीर्षभागी असलेल्या <strong>'सिम्युलेटेड अधिकारी'</strong> ड्रॉपडाउनमधून तुमचे प्रोफाइल <strong>{currentOwner.name}</strong> वर बदला.</span>
                        ) : (
                          <span>💡 To proceed with actions or hand off this file, please use the <strong>Simulated Officer Persona Dropdown</strong> at the top of the screen to switch your profile to <strong>{currentOwner.name}</strong>.</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
                    <UserCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">{language === 'mr' ? 'अधिकृत कृती केंद्र' : 'Authorized Action Center'}</strong>
                      <p className="leading-relaxed text-[11px] mt-0.5">
                        {language === 'mr' ? (
                          <span>तुमची सध्याची भूमिका (<strong className="font-bold">{currentUser.name}</strong>) कार्यप्रवाह हाताळण्यासाठी अधिकृत आहे. तुमच्या निर्णयामुळे नस्तीचे मालक, कार्यालयीन विभाग स्थान आणि टप्पा प्रगती ताजी केली जाईल.</span>
                        ) : (
                          <span>Your current persona (<strong className="font-bold">{currentUser.name}</strong>) is authorized to execute workflow actions. Your decisions will update the file's ownership, current department, and step progress.</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Workflow Form */}
                <form onSubmit={executeWorkflowAction} className={`space-y-4 ${!isUserAuthorized ? 'opacity-45 pointer-events-none' : ''}`}>
                  
                  {/* Row 1: Decisions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'कार्यप्रवाह अधिकार कृती निवडा' : 'Select Workflow Action'}</label>
                      <select
                        value={workflowAction}
                        onChange={e => handleActionChange(e.target.value as any)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 font-semibold text-slate-800 appearance-none bg-white"
                      >
                        {file.status !== FileStatus.CLOSED && (
                          <>
                            <option value="Forward" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'नस्ती पुढील विभागाकडे पाठवा' : 'Forward File to Next Department'}</option>
                            <option value="Return" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'मागील अधिकाऱ्याकडे परत करा' : 'Return to Previous Author'}</option>
                            <option value="Reject" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'प्रस्ताव फेटाळा / हरकत नोंदवा' : 'Reject Proposal / Objects'}</option>
                          </>
                        )}
                        {file.stepProgress === 7 && file.status !== FileStatus.CLOSED && (
                          <option value="Close" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'मंजूरी द्या आणि संपादन प्रकरण बंद करा' : 'Approve & Close Acquisition Segment'}</option>
                        )}
                        {file.status === FileStatus.CLOSED && (
                          <option value="Reopen" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'प्रकरण पुन्हा उघडा' : 'Reopen Acquisition Case'}</option>
                        )}
                      </select>
                    </div>

                    {/* Department Allocation Routing */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'लक्ष्य विभाग स्थान' : 'Target Department Location'}</label>
                      <select
                        value={targetDept}
                        onChange={e => handleDeptChange(e.target.value as Department)}
                        className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-lg p-2.5 outline-none font-semibold"
                      >
                        {Object.values(Department).map(dept => (
                          <option key={dept} value={dept} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{translateDept(dept)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Target Officer & Auto Acknowledged info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'विशिष्ट अधिकार्‍याकडे सोपवा' : 'Assign To Specific Officer'}</label>
                      <select
                        value={targetOfficerId}
                        onChange={e => setTargetOfficerId(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none font-medium text-slate-800 bg-white"
                        required
                      >
                        <option value="" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? '-- अधिकारी निवडा --' : '-- Choose Officer --'}</option>
                        {getDepartmentOfficers(targetDept).map(o => (
                          <option key={o.id} value={o.id} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                            {o.name} ({translateRole(o.role)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-500 border border-slate-100 flex flex-col justify-center">
                      <span className="font-bold flex items-center gap-1 text-slate-600">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        {language === 'mr' ? 'पुढील SLA कालमर्यादा वाटप' : 'Next SLA Allocation'}
                      </span>
                      <p className="mt-0.5">
                        {language === 'mr' ? (
                          <span>नस्ती वर्ग केल्यास स्वयंचलित <strong>{targetDept === Department.DYSLR ? 14 : targetDept === Department.VILLAGE_OFFICE ? 7 : 10} दिवसांची SLA मर्यादा</strong> लागू केली जाईल.</span>
                        ) : (
                          <span>Routing triggers an automatic <strong>{targetDept === Department.DYSLR ? 14 : targetDept === Department.VILLAGE_OFFICE ? 7 : 10}-day SLA ceiling</strong>.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Remarks input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'कार्यालयीन नोंद टिप्पणी / निर्णय शेरा' : 'Official Minute / Action Remarks'}</label>
                    <textarea
                      rows={3}
                      required
                      placeholder={language === 'mr' ? 'कायमस्वरूपी दप्तरी नोंदणीसाठी आवश्यक निरीक्षणे, अधिकृत हरकती किंवा मोजणी कामाची मते नोंदवा...' : "Add observations, structural queries, publication catalog numbers, or survey report notes required for the permanent ledger..."}
                      value={wfRemarks}
                      onChange={e => setWfRemarks(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Form specific file attachment simulator depending on STEP progress */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                      <span>{language === 'mr' ? 'टप्प्यानुसार आवश्यक कागदपत्रे जोडणी' : 'Step Attachment Generation'}</span>
                      <span className="text-[9px] text-indigo-600 font-mono italic">
                        {file.stepProgress === 3 ? (language === 'mr' ? "आवश्यक: संयुक्त मोजणी अहवाल, नकाशे व परिशिष्ट १६" : "Required: Survey report, maps, or Appendix 16") : 
                         file.stepProgress === 5 ? (language === 'mr' ? "कलम ११ मसुदा जाहीरनामा" : "Draft Section 11 Notification") : 
                         file.stepProgress === 6 ? (language === 'mr' ? "राजपत्र प्रसिद्धी पुरावा" : "Gazette publication proof") : (language === 'mr' ? "ऐच्छिक कागदपत्रे" : "Optional attachment")}
                      </span>
                    </label>

                    <div
                      onDragEnter={() => setDragActive(true)}
                      onDragOver={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleWfDrop}
                      className={`border border-dashed p-3 rounded-lg text-center transition-all cursor-pointer ${
                        dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50/30"
                      }`}
                    >
                      <input
                        type="file"
                        id="wf-action-file-upload"
                        onChange={handleWfManualUpload}
                        className="hidden"
                      />
                      <label htmlFor="wf-action-file-upload" className="cursor-pointer text-[11px] text-slate-500 block">
                        <span className="font-bold text-indigo-600">{language === 'mr' ? 'संगणकावरून फाईल निवडा' : 'Browse file'}</span> {language === 'mr' ? 'आणि डिजिटल दस्तऐवजात जोडा' : 'to append to DMS records'}
                      </label>
                    </div>

                    {/* Show files currently pending submittal */}
                    {wfFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {wfFiles.map((f, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-slate-700 bg-emerald-50 border border-emerald-100 p-2 rounded">
                            <span className="font-bold">{f.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setWfFiles(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:underline"
                            >
                              {language === 'mr' ? 'काढून टाका' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submission */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:translate-x-1"
                    >
                      <Send className="w-4 h-4" />
                      {language === 'mr' ? 'नस्ती रवाना करा आणि नवीन मालक नियुक्त करा' : 'Dispatch & Re-assign File Owner'}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 2: DOCUMENTS (DMS) */}
            {activeTab === "documents" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'डिजिटल दस्तऐवज व्यवस्थापन प्रणाली (DMS)' : 'Document Management System (DMS)'}</h3>
                    <p className="text-[11px] text-slate-400">{language === 'mr' ? 'अधिकृत प्रमाणपत्रे, मोजणी नकाशे, शासकीय राजपत्रे व पंचनामे साठविणारे सुरक्षित दालन.' : 'Secure digital repository holding official certificates, survey maps, gazette copies, and panchnamas.'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const name = prompt(language === 'mr' ? 'दस्तऐवजाचे नाव टाका (उदा: मोजणी_नकाशा.pdf):' : "Enter simulated document name (e.g., Appendix_16_Report.pdf)");
                      if (name) {
                        onUploadAttachment(file.id, name, language === 'mr' ? "मोजणी अहवाल" : "Survey Reports");
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <FileUp className="w-4 h-4 text-slate-500" />
                    {language === 'mr' ? 'कागदपत्र जोडा' : 'Manually Append Doc'}
                  </button>
                </div>

                {fileAttachments.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    {language === 'mr' ? 'या नस्तीसाठी अद्याप कोणतेही दस्तऐवज अपलोड केलेले नाहीत.' : 'No documents uploaded or generated for this file yet.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fileAttachments.map(doc => (
                      <div key={doc.id} className="border border-slate-150 p-4 rounded-xl hover:border-indigo-300 hover:shadow-2xs transition-all flex items-start gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                          <FolderGit className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <h4 className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {language === 'mr' ? 'वर्ग' : 'Category'}: <span className="text-indigo-600 font-bold">{doc.type}</span> • Size: {doc.size || '3.5 MB'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-2">
                            {language === 'mr' ? 'अपलोड करणारे' : 'Uploaded by'} <strong className="font-semibold text-slate-600">{doc.uploadedBy}</strong>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">{new Date(doc.uploadedAt).toLocaleString()}</p>
                          
                          <div className="border-t border-slate-100 mt-3 pt-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Version {doc.version}.0</span>
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(language === 'mr' ? `${doc.name} फाईल सुरक्षितपणे डाउनलोड होत आहे (प्रायोगिक).` : `Downloading ${doc.name} secure attachment (Simulated).`);
                              }}
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-bold"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              {language === 'mr' ? 'डाउनलोड' : 'Download'}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OBSERVATIONS LEDGER */}
            {activeTab === "notes" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'कायमस्वरूपी अधिकृत निरीक्षण नोंदवही' : 'Permanent Observations Ledger'}</h3>
                  <p className="text-[11px] text-slate-400">{language === 'mr' ? 'महसूल अधिकाऱ्यांच्या अनिवार्य नोंदी, आक्षेप, सविस्तर हरकतींचे निराकरण व अधिकृत शेरे.' : 'Mandatory officer remarks, internal clarifications, statutory queries, and legal objections.'}</p>
                </div>

                {/* Submittal Form */}
                <form onSubmit={submitNote} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <select
                        value={newNoteType}
                        onChange={e => setNewNoteType(e.target.value as any)}
                        className="text-xs border border-slate-250 bg-white rounded-md p-1.5 font-semibold text-slate-700 outline-none"
                      >
                        <option value="Note" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'सर्वसाधारण कार्यालयीन नोंद' : 'General Observation Minute'}</option>
                        <option value="Query" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'हरकत / आक्षेप उपस्थित करा' : 'Raise Objecting Query'}</option>
                        <option value="Clarification" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'स्पष्टीकरण सादर करा' : 'Submit Clarification Response'}</option>
                        <option value="Recommendation" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'अधिकृत शिफारसीची नोंद करा' : 'Record Official Recommendation'}</option>
                        <option value="Approval" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{language === 'mr' ? 'विभागीय अंतिम स्वाक्षरी / सहमती द्या' : 'Affix Section Authorization'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={language === 'mr' ? 'तुमचे अधिकृत शेरे / निरीक्षणे इथे प्रविष्ट करा...' : 'Type your official observation...'}
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 outline-none focus:border-indigo-400 font-medium text-slate-800"
                    />
                    <button 
                      type="submit"
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded-md flex items-center justify-center absolute right-2 top-2 select-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Notes Loop */}
                {fileNotes.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    {language === 'mr' ? 'अद्याप कोणतेही अधिकृत शेरे नोंदविलेले नाहीत.' : 'No officer remarks recorded yet.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fileNotes.map(n => (
                      <div key={n.id} className="border-l-2 pl-4 py-1.5 space-y-1.5 border-slate-200 hover:border-indigo-500 transition-colors">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-800">{n.authorName}</strong>
                          <span className="text-[10px] text-slate-400">{translateRole(n.authorRole)} ({translateDept(n.department)})</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                            n.type === 'Query' ? 'bg-red-50 text-red-600 border border-red-100' :
                            n.type === 'Clarification' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            n.type === 'Approval' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {language === 'mr' ? (
                              n.type === 'Note' ? 'नोंद' :
                              n.type === 'Query' ? 'हरकत/आक्षेप' :
                              n.type === 'Clarification' ? 'स्पष्टीकरण' :
                              n.type === 'Recommendation' ? 'शिफारस' : 'सहमत अंतिम स्वाक्षरी'
                            ) : n.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed leading-snug">{n.content}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MOVEMENT HISTORY */}
            {activeTab === "movements" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'कालानुक्रमिक नस्तीचा प्रवास इतिहास' : 'chronological movement history'}</h3>
                  <p className="text-[11px] text-slate-400">{language === 'mr' ? 'कार्यालयांदरम्यान झालेल्या प्रत्यक्ष व डिजिटल हस्तांतरण पायऱ्या. नस्ती गहाळ होण्याचे वाद टाळण्यासाठी उपयुक्त.' : 'Verifiable physical and digital transfer steps across offices. Eliminates file missing disputes.'}</p>
                </div>

                {fileMovements.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    {language === 'mr' ? 'अद्याप कोणतेही नस्ती हस्तांतरण आढळले नाही.' : 'No file transfers detected yet.'}
                  </div>
                ) : (
                  <div className="relative border-l border-slate-100 pl-6 space-y-6 text-xs">
                    {fileMovements.map((move, index) => {
                      const fromOfficer = MOCK_USERS.find(u => u.id === move.fromOfficerId);
                      const toOfficer = MOCK_USERS.find(u => u.id === move.toOfficerId);
                      
                      return (
                        <div key={move.id} className="relative space-y-1.5">
                          {/* Circle on timeline */}
                          <div className={`absolute -left-[30px] top-1 w-3 h-3 rounded-full border-2 bg-white ${
                            index === 0 ? 'border-indigo-600 scale-125' : 'border-slate-300'
                          }`}></div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="font-extrabold text-slate-800 inline-flex items-center gap-1">
                              <span>{translateDept(move.fromDepartment)}</span>
                              <span className="text-slate-400 font-normal">→</span>
                              <span>{translateDept(move.toDepartment)}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(move.dispatchDate).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            {language === 'mr' ? (
                              <span><strong>{fromOfficer?.name || "Clerk/DM"}</strong> ({translateRole(fromOfficer?.role || Role.CLERK)}) यांच्याकडून <strong>{toOfficer?.name || "Officer"}</strong> ({translateRole(toOfficer?.role || Role.CLERK)}) यांच्याकडे रवाना.</span>
                            ) : (
                              <span>Dispatched by <strong className="font-semibold text-slate-700">{fromOfficer?.name || "Clerk/DM"}</strong> to <strong className="font-semibold text-slate-700">{toOfficer?.name || "Officer"}</strong></span>
                            )}
                          </div>

                          <p className="text-slate-600 bg-slate-50 font-normal leading-relaxed text-[11px] p-2.5 rounded-lg border border-slate-100/50">
                            {move.remarks}
                          </p>

                          <div className="flex items-center gap-2 text-[10px]">
                            {move.isAcknowledged ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {language === 'mr' ? 'पावती स्वीकारली:' : 'Acknowledged on'} {move.acknowledgedDate ? new Date(move.acknowledgedDate).toLocaleDateString() : ""}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {language === 'mr' ? 'स्वीकृती पावती प्रलंबित' : 'Pending Acknowledgment Receipt'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
            {activeTab === "audit" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-transparent">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{language === 'mr' ? 'अपरिवर्तनीय व्यवहार लेखापरीक्षण नोंदवही' : 'immutable transaction audit log'}</h3>
                    <p className="text-[11px] text-slate-400">{language === 'mr' ? 'नस्तीची प्रगती स्थिती, कृती इतिहास, आणि प्रक्रियेचे सुरक्षित लेखापरीक्षण.' : 'Cryptographically sound activity logs detailing state switches, actions, and author IP hashes.'}</p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 border border-emerald-150 bg-emerald-50 px-2 py-0.5 rounded font-extrabold uppercase">{language === 'mr' ? 'सुरक्षित' : 'SECURED'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[9px] tracking-wider">
                        <th className="py-2 px-3">{language === 'mr' ? 'वेळ' : 'Timestamp'}</th>
                        <th className="py-2 px-3">{language === 'mr' ? 'अधिकारी' : 'Officer'}</th>
                        <th className="py-2 px-3">{language === 'mr' ? 'कृतीचे वर्णन' : 'Action Description'}</th>
                        <th className="py-2 px-3">{language === 'mr' ? 'पूर्वीची स्थिती' : 'Previous Status'}</th>
                        <th className="py-2 px-3">{language === 'mr' ? 'नवीन स्थिती' : 'New Status'}</th>
                        <th className="py-2 px-3 text-right">{language === 'mr' ? 'नोंदणीकृत IP' : 'Registered IP'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {fileAudits.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-extrabold text-slate-700">{log.userName}</span>
                            <span className="text-[10px] text-slate-400 block">{translateRole(log.userRole)}</span>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-xs font-medium text-slate-650 min-w-[200px]">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {translateStatus(log.previousStatus)}
                          </td>
                          <td className="py-2.5 px-3 text-indigo-600 font-bold">
                            {translateStatus(log.newStatus)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                            {log.ipAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
