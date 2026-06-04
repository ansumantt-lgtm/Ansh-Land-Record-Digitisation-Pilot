import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LandAcquisitionFile, FileStatus, Department, Village, Agency, Attachment, User, Role } from "../types";
import { MOCK_VILLAGES, MOCK_AGENCIES } from "../data/mockData";
import { FileUp, Landmark, MapPin, AlignLeft, HelpCircle, Save, CheckCircle } from "lucide-react";

interface FileRegistrationProps {
  onRegister: (newFile: LandAcquisitionFile, attachments: Attachment[]) => void;
  filesCount: number;
}

export default function FileRegistration({ onRegister, filesCount }: FileRegistrationProps) {
  const { language, t } = useLanguage();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVillageId, setSelectedVillageId] = useState(MOCK_VILLAGES[0].id);
  const [surveyNumber, setSurveyNumber] = useState("");
  const [areaAcquired, setAreaAcquired] = useState("");
  const [landOwnerInfo, setLandOwnerInfo] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState(MOCK_AGENCIES[0].id);
  const [estimatedCompensation, setEstimatedCompensation] = useState<number>(100);
  
  // Simulated File Upload Section
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const nextIdNum = 1001 + filesCount;
  const generatedFileNumber = `LAQ/2026/${nextIdNum}`;

  const selectedVillage = MOCK_VILLAGES.find(v => v.id === selectedVillageId) || MOCK_VILLAGES[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map((file: any) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: "Proposal Document"
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).map((file: any) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: "Proposal Document"
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !surveyNumber || !landOwnerInfo || !areaAcquired) {
      alert(t("Please fill out all mandatory fields."));
      return;
    }

    const timestamp = new Date().toISOString();

    const registeredFile: LandAcquisitionFile = {
      id: generatedFileNumber,
      title,
      description,
      status: FileStatus.CREATED,
      currentOwnerId: "U002", // Primary assignment to District Magistrate Rajesh Deshmukh
      currentDepartment: Department.DM_OFFICE,
      villageId: selectedVillageId,
      surveyNumber,
      taluka: selectedVillage.taluka,
      areaAcquired: areaAcquired.includes("Hectare") ? areaAcquired : `${areaAcquired} Hectares`,
      landOwnerInfo,
      acquiringAgencyId: selectedAgencyId,
      createdDate: timestamp,
      lastUpdatedDate: timestamp,
      slaDaysAllocated: 5, // SLA at DM Office for initial forwarding
      daysPendingInCurrentDept: 0,
      stepProgress: 1, // Step 1: Proposal Submission
      compensationEstimated: estimatedCompensation
    };

    // Attachments creation
    const finalAttachments: Attachment[] = [];
    
    // Always attach a default proposal document if none is uploaded
    if (uploadedFiles.length === 0) {
      finalAttachments.push({
        id: `A_NEW_${Math.floor(Math.random() * 10000)}`,
        fileId: generatedFileNumber,
        name: `${title.replace(/\s+/g, "_")}_Official_Proposal.pdf`,
        type: "Proposal",
        url: "#",
        uploadedBy: "Acquiring Agency Representative",
        uploadedAt: timestamp,
        version: 1,
        size: "3.5 MB"
      });
    } else {
      uploadedFiles.forEach((f, index) => {
        finalAttachments.push({
          id: `A_NEW_${index}_${Math.floor(Math.random() * 10000)}`,
          fileId: generatedFileNumber,
          name: f.name,
          type: "Proposal",
          url: "#",
          uploadedBy: "Acquiring Agency Representative",
          uploadedAt: timestamp,
          version: 1,
          size: f.size
        });
      });
    }

    onRegister(registeredFile, finalAttachments);

    // Show success & reset
    setSuccessMsg(language === 'mr' 
      ? `नस्ती क्रमांक ${generatedFileNumber} यशस्वीरीत्या नोंदणीकृत झाली! कार्यप्रवाहासाठी ती जिल्हाधिकारी कार्यालयाकडे हस्तांतरित करण्यात आली आहे.`
      : `File ${generatedFileNumber} registered successfully! Handed over to District Magistrate Office.`);
    setTitle("");
    setDescription("");
    setSurveyNumber("");
    setAreaAcquired("");
    setLandOwnerInfo("");
    setUploadedFiles([]);
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-xs max-w-4xl mx-auto" id="registration-module">
      <div className="border-b border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t("Register New Acquisition Project File")}</h2>
          <p className="text-xs text-slate-400">{t("Initiate official tracking ledger for new land acquisition proposal")}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 block uppercase">{t("Generated Case Number")}</span>
          <span className="font-mono text-indigo-600 font-bold text-sm bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded-md inline-block mt-0.5">
            {generatedFileNumber}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-xs animate-fadeIn hover:bg-emerald-100 transition-colors">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-semibold">{language === 'mr' ? 'यशस्वी!' : 'Success!'}</strong> {successMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Row 1: Title & Agency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Project Proposal Title")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={t("e.g., Pune-Mumbai Expressway Expansion, Sector 4")}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium text-slate-800 placeholder-slate-400"
              />
              <AlignLeft className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Acquiring Agency")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedAgencyId}
                onChange={e => setSelectedAgencyId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium text-slate-800 appearance-none bg-white"
              >
                {MOCK_AGENCIES.map(agency => (
                  <option key={agency.id} value={agency.id} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {agency.name} ({agency.type})
                  </option>
                ))}
              </select>
              <Landmark className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">{t("Brief Project Context / Description")}</label>
          <textarea
            rows={3}
            placeholder={t("Provide specific details: purpose, benefits, scope...")}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Row 3: Village, Taluka & Survey Key */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Target Revenue Village")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedVillageId}
                onChange={e => setSelectedVillageId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-medium text-slate-800 appearance-none bg-white"
              >
                {MOCK_VILLAGES.map(v => (
                  <option key={v.id} value={v.id} className="text-slate-900 bg-white" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {v.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{language === 'mr' ? 'तालुका (विभाग)' : 'Taluka (Sub-Division)'}</label>
            <input
              type="text"
              readOnly
              value={selectedVillage.taluka}
              className="w-full text-xs bg-slate-50 border border-slate-100 rounded-lg py-2.5 px-3 font-medium text-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Survey Number / Gat Number")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("e.g., 142/A, 143, 144/1")}
              value={surveyNumber}
              onChange={e => setSurveyNumber(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg py-2.5 px-3 font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Row 4: Land Owners, Area & Estimated Valuation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Total Area Code (Hectares)")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("e.g., 4.25")}
              value={areaAcquired}
              onChange={e => setAreaAcquired(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg py-2.5 px-3 font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Estimated Compensation Reserve (₹ Lakhs)")}
            </label>
            <input
              type="number"
              min={1}
              value={estimatedCompensation}
              onChange={e => setEstimatedCompensation(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg py-2.5 px-3 font-medium text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              {t("Primary Landowner Info / Demographics")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("e.g., Ramesh Deshmukh & 12 other landowners")}
              value={landOwnerInfo}
              onChange={e => setLandOwnerInfo(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg py-2.5 px-3 font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Drag and Drop Document Upload Area */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">{t("Proposal Supporting Documents (Drag & Drop)")}</label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/30"
            }`}
          >
            <input
              type="file"
              id="registration-file-upload"
              multiple
              onChange={handleManualUpload}
              className="hidden"
            />
            <label htmlFor="registration-file-upload" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <FileUp className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-indigo-600 hover:underline">{language === 'mr' ? 'दस्ताऐवज अपलोड करण्यासाठी क्लिक करा' : 'Click to upload files'}</span> {t("or browse local files to attach")}
              </div>
              <p className="text-[10px] text-slate-400">{t("Drag additional joint measurement shapes, layout plans here")}</p>
            </label>
          </div>

          {/* List of uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{language === 'mr' ? 'निवडलेली कागदपत्रे' : 'Selected Attachments'} ({uploadedFiles.length})</h4>
              <div className="divide-y divide-slate-100">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs font-medium text-slate-700">
                    <span className="truncate max-w-sm">{file.name} ({file.size})</span>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(idx)}
                      className="text-red-500 text-[11px] hover:underline hover:text-red-700"
                    >
                      {language === 'mr' ? 'काढून टाका' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer / Notice */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-indigo-800 leading-relaxed flex gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p>
            {language === 'mr' ? (
              <span>नस्ती नोंदविल्यास एक <strong className="font-bold">अपरिवर्तनीय मागोवा ओळख क्रमांक (Unique Key)</strong> तयार होतो. सुरक्षा नियमांनुसार प्रक्रियेची परवानगी सध्या नियुक्त असणाऱ्या कार्यालयापुरती मर्यादित राहील (जिल्हाधिकारी कार्यालयापासून प्रारंभ).</span>
            ) : (
              <span>Registering this proposal creates an <strong className="font-bold">immutable tracking key</strong>. Security rules limit modification capabilities to the active assigned owning office (commencing with the District Magistrate Office segment).</span>
            )}
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 border border-indigo-700 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs hover:shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {t("Submit & Dispatch File")}
          </button>
        </div>

      </form>
    </div>
  );
}
