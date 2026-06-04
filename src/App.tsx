import React, { useState, useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";
import { 
  LandAcquisitionFile, FileStatus, Department, FileMovement, Note, Attachment, AuditLog, User, Role, AppNotification 
} from "./types";
import { 
  MOCK_USERS, MOCK_VILLAGES, INITIAL_FILES, INITIAL_MOVEMENTS, INITIAL_NOTES, INITIAL_ATTACHMENTS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS 
} from "./data/mockData";
import Dashboard from "./components/Dashboard";
import FileRegistration from "./components/FileRegistration";
import FileDetails from "./components/FileDetails";
import DelayMonitoring from "./components/DelayMonitoring";
import Reports from "./components/Reports";
import UserAdmin from "./components/UserAdmin";

import { 
  ShieldAlert, Files, FolderPlus, Clock, FileBarChart, Users, Landmark, Search, 
  Bell, Check, Trash2, LayoutDashboard, Globe, AlertTriangle 
} from "lucide-react";

export default function App() {
  const { language, setLanguage, t, translateStatus, translateDept, translateRole } = useLanguage();
  
  // LocalStorage state engines
  const [files, setFiles] = useState<LandAcquisitionFile[]>([]);
  const [movements, setMovements] = useState<FileMovement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Simulation parameters
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[2]); // Default is Sunil Kulkarni (LAO)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "registry" | "register" | "delays" | "reports" | "users">("dashboard");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Search parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Load configuration or fallback to seeds on first load
  useEffect(() => {
    const cachedFiles = localStorage.getItem("lao_registry_files");
    const cachedMovements = localStorage.getItem("lao_registry_movements");
    const cachedNotes = localStorage.getItem("lao_registry_notes");
    const cachedAttachments = localStorage.getItem("lao_registry_attachments");
    const cachedNotifications = localStorage.getItem("lao_registry_notifications");
    const cachedAudits = localStorage.getItem("lao_registry_audits");

    if (cachedFiles) {
      setFiles(JSON.parse(cachedFiles));
      setMovements(JSON.parse(cachedMovements || "[]"));
      setNotes(JSON.parse(cachedNotes || "[]"));
      setAttachments(JSON.parse(cachedAttachments || "[]"));
      setNotifications(JSON.parse(cachedNotifications || "[]"));
      setAuditLogs(JSON.parse(cachedAudits || "[]"));
    } else {
      // Seed default mockup files
      setFiles(INITIAL_FILES);
      setMovements(INITIAL_MOVEMENTS);
      setNotes(INITIAL_NOTES);
      setAttachments(INITIAL_ATTACHMENTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      
      saveToStorage(INITIAL_FILES, INITIAL_MOVEMENTS, INITIAL_NOTES, INITIAL_ATTACHMENTS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS);
    }
  }, []);

  const saveToStorage = (
    f: LandAcquisitionFile[], 
    m: FileMovement[], 
    n: Note[], 
    a: Attachment[], 
    notifs: AppNotification[], 
    log: AuditLog[]
  ) => {
    localStorage.setItem("lao_registry_files", JSON.stringify(f));
    localStorage.setItem("lao_registry_movements", JSON.stringify(m));
    localStorage.setItem("lao_registry_notes", JSON.stringify(n));
    localStorage.setItem("lao_registry_attachments", JSON.stringify(a));
    localStorage.setItem("lao_registry_notifications", JSON.stringify(notifs));
    localStorage.setItem("lao_registry_audits", JSON.stringify(log));
  };

  // Switch impersonated team member
  const handleSwitchUser = (userId: string) => {
    const match = MOCK_USERS.find(u => u.id === userId);
    if (match) {
      setCurrentUser(match);
      // Trigger temporary visual indication
      const notif = {
        id: `N_SW_${Math.floor(Math.random()*10000)}`,
        userId: match.id,
        role: match.role,
        fileId: "",
        message: `Successfully authenticated as ${match.name}. Your dashboard is configured for the ${match.department} workspace.`,
        type: "Info" as const,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => {
        const update = [notif, ...prev];
        localStorage.setItem("lao_registry_notifications", JSON.stringify(update));
        return update;
      });
    }
  };

  // Register a new proposal (Step 1)
  const handleRegisterFile = (newFile: LandAcquisitionFile, initialAttachments: Attachment[]) => {
    const updatedFiles = [newFile, ...files];
    const updatedAttachments = [...initialAttachments, ...attachments];

    // Seed audit logs
    const log: AuditLog = {
      id: `AUD_NEW_${Math.floor(Math.random()*10000)}`,
      fileId: newFile.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: `Created new land acquisition proposal. Uploaded initial files. Assigned current owner to DM Office.`,
      previousStatus: "None",
      newStatus: FileStatus.CREATED,
      timestamp: new Date().toISOString(),
      ipAddress: `${10 + Math.floor(Math.random()*100)}.${100 + Math.floor(Math.random()*150)}.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*200)}`
    };
    const updatedAudits = [log, ...auditLogs];

    // Dispatches notification to DM for attention
    const notif: AppNotification = {
      id: `N_${Math.floor(Math.random()*10000)}`,
      userId: "U002", // Dr. Rajesh Deshmukh (DM)
      role: Role.DISTRICT_MAGISTRATE,
      fileId: newFile.id,
      message: `Action Required: New Acquisition Proposal registered: ${newFile.id} - ${newFile.title}. Needs routing to LAO.`,
      type: "Info",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifications = [notif, ...notifications];

    setFiles(updatedFiles);
    setAttachments(updatedAttachments);
    setAuditLogs(updatedAudits);
    setNotifications(updatedNotifications);
    saveToStorage(updatedFiles, movements, notes, updatedAttachments, updatedNotifications, updatedAudits);

    // Swap to registry view directly to admire
    setCurrentTab("registry");
  };

  // Workflow Hand-off Actions (Step 2 to Step 7 and closed)
  const handleWorkflowSubmit = (
    fileId: string,
    action: "Forward" | "Return" | "Approve" | "Reject" | "Close" | "Reopen",
    toDept: Department,
    toOfficerId: string,
    remarks: string,
    uploadedExecutionFiles: Array<{ name: string; size: string; type: string }>
  ) => {
    const timestamp = new Date().toISOString();
    const mockIP = `${10 + Math.floor(Math.random()*100)}.${100 + Math.floor(Math.random()*150)}.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*200)}`;

    const originalFile = files.find(f => f.id === fileId);
    if (!originalFile) return;

    // 1. Compute Next Status based on Progression Core logic
    let nextStatus = originalFile.status;
    let nextStepProgress = originalFile.stepProgress;

    if (action === "Forward") {
      if (originalFile.stepProgress === 1) {
        // Step 1 -> Forward to LAO
        nextStatus = FileStatus.SUBMITTED;
        nextStepProgress = 2;
      } else if (originalFile.stepProgress === 2) {
        // Step 2 -> Forward to DYSLR for land survey
        nextStatus = FileStatus.SURVEY_PENDING;
        nextStepProgress = 3;
      } else if (originalFile.stepProgress === 3) {
        // Step 3 -> Survey Completed (DYSLR sends back findings)
        nextStatus = FileStatus.SURVEY_COMPLETED;
        nextStepProgress = 4;
      } else if (originalFile.stepProgress === 4) {
        // Step 4 -> Draft notification under prepare
        nextStatus = FileStatus.NOTIFICATION_DRAFTED;
        nextStepProgress = 5;
      } else if (originalFile.stepProgress === 5) {
        // Step 5 -> Sent for Gazetting/Media Publication
        nextStatus = FileStatus.PUBLICATION_PENDING;
        nextStepProgress = 6;
      } else if (originalFile.stepProgress === 6) {
        // Step 6 -> Published, Forward to VRO for publicity panchnama
        nextStatus = FileStatus.PANCHNAMA_PENDING;
        nextStepProgress = 7;
      }
    } else if (action === "Return") {
      nextStatus = FileStatus.UNDER_REVIEW;
      if (nextStepProgress > 1) {
        nextStepProgress = nextStepProgress - 1;
      }
    } else if (action === "Reject") {
      nextStatus = FileStatus.CLOSED; // Closed with objections
    } else if (action === "Close") {
      nextStatus = FileStatus.CLOSED;
    } else if (action === "Reopen") {
      nextStatus = FileStatus.UNDER_REVIEW;
      nextStepProgress = 1;
    }

    // Allocate SLA based on department
    let nextSla = 10; // default 10 days
    if (toDept === Department.DYSLR) nextSla = 14; // joint land survey gets 14 days
    if (toDept === Department.VILLAGE_OFFICE) nextSla = 7; // local panchnama verification is 7 days
    if (toDept === Department.DM_OFFICE) nextSla = 5;

    // 2. Map updated file properties
    const updatedFiles = files.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          status: nextStatus,
          stepProgress: nextStepProgress,
          currentOwnerId: toOfficerId,
          currentDepartment: toDept,
          lastUpdatedDate: timestamp,
          slaDaysAllocated: nextSla,
          daysPendingInCurrentDept: 0 // Reset timer since it's a new owner
        };
      }
      return f;
    });

    // 3. Insert chronological Movement Trail Entry
    const newMovement: FileMovement = {
      id: `M_NEW_${Math.floor(Math.random()*10000)}`,
      fileId,
      fromDepartment: originalFile.currentDepartment,
      toDepartment: toDept,
      fromOfficerId: currentUser.id,
      toOfficerId,
      dispatchDate: timestamp,
      remarks: remarks,
      expectedCompletionDate: new Date(Date.now() + nextSla * 24 * 60 * 60 * 1000).toISOString(),
      isAcknowledged: true, // auto-acknowledged in digital environment
      acknowledgedDate: timestamp
    };
    const updatedMovements = [newMovement, ...movements];

    // 4. Save optional documents if officer attached any
    const newDocs: Attachment[] = [];
    uploadedExecutionFiles.forEach((fileItem, idx) => {
      newDocs.push({
        id: `A_WORK_${idx}_${Math.floor(Math.random()*10000)}`,
        fileId,
        name: fileItem.name,
        type: originalFile.stepProgress === 3 ? "Survey Reports" : 
              originalFile.stepProgress === 5 ? "Notifications" : 
              originalFile.stepProgress === 6 ? "Gazette Publications" : "Other Attachments",
        url: "#",
        uploadedBy: currentUser.name,
        uploadedAt: timestamp,
        version: 1,
        size: fileItem.size
      });
    });
    const updatedAttachments = [...newDocs, ...attachments];

    // 5. Append Officer notes as formal ledger entry
    const newNote: Note = {
      id: `N_WF_${Math.floor(Math.random()*10000)}`,
      fileId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      department: currentUser.department,
      content: `[Workflow Action: ${action} - Dispatched to ${toDept}] ${remarks}`,
      type: action === "Approve" ? ("Approval" as const) : action === "Reject" ? ("Query" as const) : ("Note" as const),
      createdAt: timestamp
    };
    const updatedNotes = [newNote, ...notes];

    // 6. Build immutable audit logs
    const newAudit: AuditLog = {
      id: `AUD_WF_${Math.floor(Math.random()*10000)}`,
      fileId,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: `${action} decision deployed. Reallocated ownership from ${originalFile.currentDepartment} to ${toDept}. Minute recorded in timeline ledger.`,
      previousStatus: originalFile.status,
      newStatus: nextStatus,
      timestamp,
      ipAddress: mockIP
    };
    const updatedAudits = [newAudit, ...auditLogs];

    // 7. Update alerts / notifications
    const targetOfficer = MOCK_USERS.find(u => u.id === toOfficerId) || MOCK_USERS[0];
    const newNotif: AppNotification = {
      id: `N_WF_NOT_${Math.floor(Math.random()*10000)}`,
      userId: toOfficerId,
      role: targetOfficer.role,
      fileId,
      message: `Urgent: File ${fileId} handoff received at ${toDept}. Dispatched from ${currentUser.name} - Reason: ${remarks.slice(0, 50)}...`,
      type: "Info",
      isRead: false,
      createdAt: timestamp
    };
    const updatedNotifications = [newNotif, ...notifications];

    setFiles(updatedFiles);
    setMovements(updatedMovements);
    setAttachments(updatedAttachments);
    setNotes(updatedNotes);
    setAuditLogs(updatedAudits);
    setNotifications(updatedNotifications);
    saveToStorage(updatedFiles, updatedMovements, updatedNotes, updatedAttachments, updatedNotifications, updatedAudits);
  };

  // Append note directly from observation tab
  const handleAddNote = (fileId: string, content: string, type: "Note" | "Query" | "Clarification" | "Recommendation" | "Approval") => {
    const timestamp = new Date().toISOString();
    const newNote: Note = {
      id: `N_OBS_${Math.floor(Math.random()*10000)}`,
      fileId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      department: currentUser.department,
      content,
      type,
      createdAt: timestamp
    };
    const updatedNotes = [newNote, ...notes];

    const newAudit: AuditLog = {
      id: `AUD_OBS_${Math.floor(Math.random()*10000)}`,
      fileId,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: `Recorded official observation of type: ${type}. Details appended securely.`,
      previousStatus: files.find(f => f.id === fileId)?.status || FileStatus.CREATED,
      newStatus: files.find(f => f.id === fileId)?.status || FileStatus.CREATED,
      timestamp,
      ipAddress: "10.160.2.14"
    };
    const updatedAudits = [newAudit, ...auditLogs];

    setNotes(updatedNotes);
    setAuditLogs(updatedAudits);
    saveToStorage(files, movements, updatedNotes, attachments, notifications, updatedAudits);
  };

  // Simulating DMS upload independently
  const handleUploadAttachment = (fileId: string, name: string, type: string) => {
    const timestamp = new Date().toISOString();
    const newDoc: Attachment = {
      id: `A_DMS_${Math.floor(Math.random()*10000)}`,
      fileId,
      name,
      type,
      url: "#",
      uploadedBy: currentUser.name,
      uploadedAt: timestamp,
      version: 1,
      size: `${(1 + Math.random() * 8).toFixed(1)} MB`
    };
    const updatedAttachments = [newDoc, ...attachments];

    const newAudit: AuditLog = {
      id: `AUD_DOC_${Math.floor(Math.random()*10000)}`,
      fileId,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: `Uploaded and version-controlled new attachment: ${name} (Category: ${type}).`,
      previousStatus: files.find(f => f.id === fileId)?.status || FileStatus.CREATED,
      newStatus: files.find(f => f.id === fileId)?.status || FileStatus.CREATED,
      timestamp,
      ipAddress: "10.160.2.14"
    };
    const updatedAudits = [newAudit, ...auditLogs];

    setAttachments(updatedAttachments);
    setAuditLogs(updatedAudits);
    saveToStorage(files, movements, notes, updatedAttachments, notifications, updatedAudits);
  };

  // Clean local storage cache to reset demo
  const handleResetDemo = () => {
    if (confirm("Reset district registry database back to structural seed values? All customized cases and timeline comments will be cleared.")) {
      localStorage.removeItem("lao_registry_files");
      localStorage.removeItem("lao_registry_movements");
      localStorage.removeItem("lao_registry_notes");
      localStorage.removeItem("lao_registry_attachments");
      localStorage.removeItem("lao_registry_notifications");
      localStorage.removeItem("lao_registry_audits");

      setFiles(INITIAL_FILES);
      setMovements(INITIAL_MOVEMENTS);
      setNotes(INITIAL_NOTES);
      setAttachments(INITIAL_ATTACHMENTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      
      setCurrentUser(MOCK_USERS[2]); // Back to Sunil LAO Officer
      setSelectedFileId(null);
      setCurrentTab("dashboard");
    }
  };

  // Searching mechanics
  const filteredRegistryFiles = files.filter(f => {
    const matchedSearch = searchTerm.trim() === "" || 
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.landOwnerInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.taluka.toLowerCase().includes(searchTerm.toLowerCase());

    const matchedStatus = statusFilter === "all" || f.status === statusFilter;
    const matchedDept = deptFilter === "all" || f.currentDepartment === deptFilter;

    return matchedSearch && matchedStatus && matchedDept;
  });

  // Notifications filtering
  const activeUserNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadNotifsCount = activeUserNotifs.filter(n => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem("lao_registry_notifications", JSON.stringify(updated));
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("lao_registry_notifications", JSON.stringify(updated));
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans" id="application-root">
      
      {/* Major Navigation System Header */}
      <header className="bg-slate-900 text-white shadow-md z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Subsystem Badge */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-650 rounded-lg">
              <Landmark className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide bg-gradient-to-r from-indigo-400 to-indigo-100 bg-clip-text text-transparent">
                  {t("LAO File Tracking")}
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-[9px] font-mono font-bold text-indigo-300 rounded uppercase tracking-widest border border-indigo-400/20">
                  v1.2.0
                </span>
              </div>
              <h1 className="text-xs text-slate-400 font-semibold mt-0.5">{t("District Collectorate • Workflow Suite")}</h1>
            </div>
          </div>

          {/* Persona Switching simulation console */}
          <div className="flex items-center flex-wrap gap-3">
            
            {/* UTC clock */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[11px] font-mono text-indigo-300 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>{t("UTC")}: 2026-06-04 07:00:00</span>
            </div>

            {/* Language dropdown switcher */}
            <div className="bg-slate-800 border-2 border-indigo-500/30 rounded-lg py-1.5 pl-3 pr-2 flex items-center space-x-2 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-400">Language / भाषा:</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as "en" | "mr")}
                className="bg-slate-800 text-white font-bold outline-none border-none text-xs rounded cursor-pointer"
              >
                <option value="en" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>English (EN)</option>
                <option value="mr" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>मराठी (MR)</option>
              </select>
            </div>

            {/* Officer impersonation dropdown */}
            <div className="bg-slate-800 border-2 border-indigo-500/30 rounded-lg py-1.5 pl-3 pr-2 flex items-center space-x-2 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-400">{t("Persona")}:</span>
              <select
                value={currentUser.id}
                onChange={e => handleSwitchUser(e.target.value)}
                className="bg-slate-800 text-white font-bold outline-none border-none text-xs rounded cursor-pointer max-w-[200px]"
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {u.name} ({translateRole(u.role).replace("Officer", "Off.")})
                  </option>
                ))}
              </select>
            </div>

            {/* In-app notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 bg-slate-800/60 border border-slate-700 hover:bg-slate-800 transition-colors rounded-lg relative text-slate-300 cursor-pointer"
                title="SLA Alert Center"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 border border-slate-900 absolute -top-1 -right-1 text-[9px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-55 text-xs text-slate-800 animate-fadeIn">
                  <div className="p-3 bg-slate-900 text-white font-bold flex items-center justify-between rounded-t-xl border-b border-slate-800">
                    <span className="flex items-center gap-1.5 uppercase font-mono text-[10px]">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      {t("Department Alarms")} ({activeUserNotifs.length})
                    </span>
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {t("Close")}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {activeUserNotifs.length === 0 ? (
                      <div className="p-6 text-center text-slate-404 text-[11px] font-medium font-sans">
                        {t("You have no alerts or assignments in your queue.")}
                      </div>
                    ) : (
                      activeUserNotifs.map(notif => (
                        <div key={notif.id} className={`p-3.5 space-y-1 ${notif.isRead ? 'bg-slate-50/50' : 'bg-amber-50/20'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded font-mono ${
                              notif.type === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-850'
                            }`}>
                              {notif.type}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono italic">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-semibold leading-snug">{notif.message}</p>
                          
                          <div className="flex items-center justify-end space-x-2 pt-1">
                            {!notif.isRead && (
                              <button
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                {t("Mark Read")}
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(notif.id)}
                              className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              {t("Dismiss")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 text-center bg-slate-50 rounded-b-xl border-t border-slate-100 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                    {t("SLA monitors continuously active")}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Global tabbed panel switcher */}
        <div className="bg-slate-800 border-t border-slate-700/55 scroll-smooth">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex overflow-x-auto">
            <button
              onClick={() => { setCurrentTab("dashboard"); setSelectedFileId(null); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "dashboard" && !selectedFileId ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("Administrative Dashboard")}
            </button>
            <button
              onClick={() => { setCurrentTab("registry"); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "registry" || selectedFileId ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Files className="w-4 h-4" />
              {t("File Registry Tracker")}
            </button>
            <button
              onClick={() => { setCurrentTab("register"); setSelectedFileId(null); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "register" ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              {t("Register New File (Step 1)")}
            </button>
            <button
              onClick={() => { setCurrentTab("delays"); setSelectedFileId(null); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "delays" ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              {t("SLA Monitoring & Delays")}
            </button>
            <button
              onClick={() => { setCurrentTab("reports"); setSelectedFileId(null); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "reports" ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileBarChart className="w-4 h-4" />
              {t("Reports & Print Ledger")}
            </button>
            <button
              onClick={() => { setCurrentTab("users"); setSelectedFileId(null); }}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer inline-flex items-center gap-2 ${
                currentTab === "users" ? "border-indigo-400 text-indigo-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              {t("Team Directory & Workloads")}
            </button>
          </div>
        </div>
      </header>

      {/* Main viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 z-10 overflow-y-auto">
        
        {/* If a file deep-dive is explicitly selected, render its dedicated tracking engine and override tabs */}
        {selectedFileId ? (
          <div>
            {(() => {
              const fileObj = files.find(f => f.id === selectedFileId);
              if (!fileObj) {
                setSelectedFileId(null);
                return null;
              }
              return (
                <FileDetails
                  file={fileObj}
                  currentUser={currentUser}
                  movements={movements}
                  notes={notes}
                  attachments={attachments}
                  auditLogs={auditLogs}
                  onBack={() => setSelectedFileId(null)}
                  onWorkflowSubmit={handleWorkflowSubmit}
                  onAddNote={handleAddNote}
                  onUploadAttachment={handleUploadAttachment}
                />
              );
            })()}
          </div>
        ) : (
          <div>
            
            {/* View A: DASHBOARD VIEW */}
            {currentTab === "dashboard" && (
              <Dashboard 
                files={files} 
                onSelectFile={(id) => setSelectedFileId(id)} 
              />
            )}

            {/* View B: FILE REGISTRY LIST TRACKER (Holds filtering capabilities) */}
            {currentTab === "registry" && (
              <div className="space-y-6">
                
                {/* Search / Filter Utility bar */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search query input */}
                  <div className="relative w-full md:w-96">
                    <input
                      type="text"
                      placeholder={t("Search File#, Owner, Village, Survey#, Agency...")}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 outline-none focus:bg-white focus:border-indigo-500 font-semibold"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  {/* Status & Dept filters */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none font-semibold"
                    >
                      <option value="all" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>-- {t("Created")} --</option>
                      {Object.values(FileStatus).map(s => (
                        <option key={s} value={s} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{translateStatus(s)}</option>
                      ))}
                    </select>

                    <select
                      value={deptFilter}
                      onChange={e => setDeptFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none font-semibold"
                    >
                      <option value="all" className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>-- {t("Department Scope")} --</option>
                      {Object.values(Department).map(d => (
                        <option key={d} value={d} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>{translateDept(d)}</option>
                      ))}
                    </select>

                    {searchTerm || statusFilter !== "all" || deptFilter !== "all" ? (
                      <button 
                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setDeptFilter("all"); }}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        {t("Reset Filters")}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Registry tabular grid */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{t("General Land Registry Ledger Table")}</h2>
                      <p className="text-[10px] text-slate-400">
                        {language === 'mr' 
                          ? `प्रदर्शित नस्त्या: ${filteredRegistryFiles.length} (एकूण प्रकरणांपैकी: ${files.length})` 
                          : `Displaying ${filteredRegistryFiles.length} of ${files.length} active files matched`}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-650 font-mono">DISTRICT LEVEL ENCRYPTION</span>
                  </div>

                  {filteredRegistryFiles.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400">
                      {t("No acquisition files matched")}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-mono tracking-wider uppercase text-[10px] bg-slate-50/30">
                            <th className="py-3 px-4">{t("File Number")}</th>
                            <th className="py-3 px-4">{t("Project Title / Agency")}</th>
                            <th className="py-3 px-4">{t("Stage Progression")}</th>
                            <th className="py-3 px-4">{t("Current Department Location")}</th>
                            <th className="py-3 px-4">{t("Chronology Timer")}</th>
                            <th className="py-3 px-4 text-right">{t("Actions")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                          {filteredRegistryFiles.map(file => {
                            const isOverdue = file.daysPendingInCurrentDept > file.slaDaysAllocated;
                            const villageObj = MOCK_VILLAGES.find(v => v.id === file.villageId);
                            const percentProgress = Math.round((file.stepProgress / 7) * 100);

                            return (
                              <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                                
                                {/* File Code */}
                                <td className="py-4 px-4 font-mono font-bold text-slate-900 group-hover:text-indigo-650">
                                  {file.id}
                                </td>

                                {/* Main title & demographics */}
                                <td className="py-4 px-4">
                                  <div>
                                    <div className="font-extrabold text-slate-800">{file.title}</div>
                                    <div className="text-slate-400 text-[10px] font-medium leading-relaxed mt-0.5">
                                      {language === 'mr' ? 'गाव' : 'Village'}: <strong className="font-semibold text-slate-600">{villageObj?.name}</strong> • {language === 'mr' ? 'गट क्र' : 'Plot Survey'}: {file.surveyNumber}
                                    </div>
                                  </div>
                                </td>

                                {/* Step Progress and Status pill */}
                                <td className="py-4 px-4">
                                  <div className="w-24">
                                    <div className="flex justify-between items-center text-[10px] font-semibold mb-1">
                                      <span className="text-slate-500 font-normal">{language === 'mr' ? 'टप्पा' : 'Step'} {file.stepProgress}/7</span>
                                      <span className="text-slate-700">{percentProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-indigo-600 rounded-full" 
                                        style={{ width: `${percentProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Owner Location detail */}
                                <td className="py-4 px-4">
                                  <div>
                                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-150 text-slate-700 rounded-md text-[10px] font-mono uppercase inline-block">
                                      {translateDept(file.currentDepartment)}
                                    </span>
                                    <span className="block text-[9px] text-indigo-650 mt-1 font-semibold italic">{language === 'mr' ? 'मालक आयडी' : 'Owner ID'}: {file.currentOwnerId}</span>
                                  </div>
                                </td>

                                {/* Pending / Aging Period */}
                                <td className="py-4 px-4 font-mono">
                                  <div>
                                    <span className={`block font-bold text-xs ${isOverdue ? 'text-amber-600' : 'text-slate-700'}`}>
                                      {file.daysPendingInCurrentDept} {t("Days Pending")}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-normal">SLA Cap: {file.slaDaysAllocated}d</span>
                                  </div>
                                </td>

                                {/* Tracking actions */}
                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedFileId(file.id)}
                                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold transition-all inline-block cursor-pointer"
                                  >
                                    {t("Inspect & Route File")}
                                  </button>
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* View C: REGISTER SCREEN */}
            {currentTab === "register" && (
              <FileRegistration 
                onRegister={handleRegisterFile} 
                filesCount={files.length} 
              />
            )}

            {/* View D: SLA MONITORING & DELAYS */}
            {currentTab === "delays" && (
              <DelayMonitoring 
                files={files} 
                onSelectFile={(id) => setSelectedFileId(id)} 
              />
            )}

            {/* View E: REPORTS PORTAL */}
            {currentTab === "reports" && (
              <Reports files={files} />
            )}

            {/* View F: TEAM AND DIRECTORY WORKLOAD STATUS */}
            {currentTab === "users" && (
              <UserAdmin 
                files={files} 
                currentUser={currentUser} 
                onSwitchUser={handleSwitchUser} 
              />
            )}

          </div>
        )}

      </main>

      {/* Persistent System Footer Status Rails */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 shrink-0 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-semibold">
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{t("District Collectorate LAO Network Server Active")}</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 font-mono">
            <span>{t("Database Node ID")}: Pune-SLA-02</span>
            <span>{t("Logs Encrypted SSL")}</span>
            <button 
              onClick={handleResetDemo}
              className="text-indigo-400 hover:text-indigo-200 transition-colors underline font-bold cursor-pointer"
            >
              {t("Reset Database Seed")}
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
