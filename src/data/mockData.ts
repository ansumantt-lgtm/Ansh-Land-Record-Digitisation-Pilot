import { User, Role, Department, Village, Agency, LandAcquisitionFile, FileMovement, Note, Attachment, AuditLog, FileStatus, AppNotification } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "U001",
    name: "Vikram Malhotra",
    role: Role.SUPER_ADMIN,
    department: Department.LAO,
    email: "vikram.admin@lao.gov.in",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U002",
    name: "Dr. Rajesh Deshmukh",
    role: Role.DISTRICT_MAGISTRATE,
    department: Department.DM_OFFICE,
    email: "deshmukh.dm@maharashtra.gov.in",
    phone: "+91 99887 76655",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U003",
    name: "Sunil Kulkarni",
    role: Role.LAO_OFFICER,
    department: Department.LAO,
    email: "sunil.kulkarni@lao.gov.in",
    phone: "+91 88776 65544",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U004",
    name: "Anil Wankhede",
    role: Role.DYSLR_OFFICER,
    department: Department.DYSLR,
    email: "anil.dyslr@landrecords.gov.in",
    phone: "+91 77665 54433",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U005",
    name: "Sanjay Shinde",
    role: Role.DISTRICT_INFORMATION_OFFICER,
    department: Department.DIO,
    email: "sanjay.dio@pib.gov.in",
    phone: "+91 66554 43322",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U006",
    name: "Prabha Jaiswal",
    role: Role.REVENUE_OFFICER,
    department: Department.REVENUE,
    email: "prabha.revenue@district.gov.in",
    phone: "+91 55443 32211",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U007",
    name: "Maruti Tambe",
    role: Role.VILLAGE_ACCOUNTANT,
    department: Department.VILLAGE_OFFICE,
    email: "tambe.maruti@village.gov.in",
    phone: "+91 94220 12345",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U008",
    name: "Rohit Shrivastava",
    role: Role.CLERK,
    department: Department.DM_OFFICE,
    email: "rohit.clerk@dm.gov.in",
    phone: "+91 91234 56789",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces"
  },
  {
    id: "U009",
    name: "Anita Deshpande",
    role: Role.VIEWER_AUDITOR,
    department: Department.LAO,
    email: "anita.auditor@cag.gov.in",
    phone: "+91 90909 09090",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces"
  }
];

export const MOCK_VILLAGES: Village[] = [
  { id: "V001", name: "Koregaon Park", taluka: "Haveli" },
  { id: "V002", name: "Chikhali", taluka: "Haveli" },
  { id: "V003", name: "Shikrapur", taluka: "Shirur" },
  { id: "V004", name: "Uruli Kanchan", taluka: "Haveli" },
  { id: "V005", name: "Mulshi Budruk", taluka: "Mulshi" }
];

export const MOCK_AGENCIES: Agency[] = [
  { id: "A001", name: "National Highways Authority of India (NHAI)", type: "Central Govt" },
  { id: "A002", name: "Maharashtra Industrial Development Corp (MIDC)", type: "State Govt" },
  { id: "A003", name: "Pune Metropolitan Regional Development Authority (PMRDA)", type: "Local Body" },
  { id: "A004", name: "Indian Railways (Central Railway Zone)", type: "Central Govt" },
  { id: "A005", name: "State Water Resources Department", type: "State Govt" }
];

// Seed five different acquisition cases at different stages on the timeline
export const INITIAL_FILES: LandAcquisitionFile[] = [
  {
    id: "LAQ/2026/1001",
    title: "National Highway 48 Bypass Expansion Segment B",
    description: "Acquisition of private agricultural land for the widening and expansion of the NH48 Bypass at Shikrapur.",
    status: FileStatus.PANCHNAMA_PENDING,
    currentOwnerId: "U007", // Village Accountant
    currentDepartment: Department.VILLAGE_OFFICE,
    villageId: "V003", // Shikrapur
    surveyNumber: "142/A, 142/B, 143, 145/1",
    taluka: "Shirur",
    areaAcquired: "4.85 Hectares",
    landOwnerInfo: "Rambhau Patil, Shivaji Gaikwad & 18 other local farmers",
    acquiringAgencyId: "A001", // NHAI
    createdDate: "2026-03-01T10:00:00Z",
    lastUpdatedDate: "2026-05-20T14:30:00Z",
    slaDaysAllocated: 7, // SLA for current department (Village Accountant has 7 days for Panchnama)
    daysPendingInCurrentDept: 15, // Delay alert! 15 days pending, SLA is 7 days.
    stepProgress: 7, // Step 7 of 7
    compensationEstimated: 750 // INR Lakhs
  },
  {
    id: "LAQ/2026/1002",
    title: "MIDC Industrial Hub Phase-IV Land Acquisition",
    description: "Proposed land assembly for MIDC heavy fabrication cluster setting up in Chikhali village.",
    status: FileStatus.SURVEY_PENDING,
    currentOwnerId: "U004", // DYSLR Officer
    currentDepartment: Department.DYSLR,
    villageId: "V002", // Chikhali
    surveyNumber: "305, 306, 307/1, 308/2",
    taluka: "Haveli",
    areaAcquired: "18.20 Hectares",
    landOwnerInfo: "Chikhali Land Holders Syndicate & 8 Individual Heirs",
    acquiringAgencyId: "A002", // MIDC
    createdDate: "2026-05-15T11:20:00Z",
    lastUpdatedDate: "2026-05-31T09:15:00Z",
    slaDaysAllocated: 14, // SLA for land records department to complete survey
    daysPendingInCurrentDept: 4, // On track
    stepProgress: 3, // Step 3 of 7
    compensationEstimated: 2400
  },
  {
    id: "LAQ/2026/1003",
    title: "Metro Line 3 Car Depot Allocation Uruli",
    description: "Acquisition of commercial and plain terrain for permanent station maintenance yard.",
    status: FileStatus.PUBLICATION_PENDING,
    currentOwnerId: "U005", // DIO Officer
    currentDepartment: Department.DIO,
    villageId: "V004", // Uruli Kanchan
    surveyNumber: "89/1, 89/2, 90",
    taluka: "Haveli",
    areaAcquired: "6.40 Hectares",
    landOwnerInfo: "Uruli Agro-Processing Co-operative Society Ltd.",
    acquiringAgencyId: "A003", // PMRDA
    createdDate: "2026-04-10T09:00:00Z",
    lastUpdatedDate: "2026-05-12T16:45:00Z",
    slaDaysAllocated: 10, // SLA for publication dispatch
    daysPendingInCurrentDept: 23, // Massive SLA breach! 23 days pending
    stepProgress: 6, // Step 6 of 7
    compensationEstimated: 1120
  },
  {
    id: "LAQ/2026/1004",
    title: "Railway Quadrupling Scheme Koregaon Junction",
    description: "Acquisition of peripheral settlement areas for adding third and fourth rapid transit lines.",
    status: FileStatus.SUBMITTED,
    currentOwnerId: "U003", // LAO Officer
    currentDepartment: Department.LAO,
    villageId: "V001", // Koregaon Park
    surveyNumber: "12, 13/A, 14",
    taluka: "Haveli",
    areaAcquired: "1.25 Hectares",
    landOwnerInfo: "Khanduji Builders Private Ltd & 4 Residence Tenants",
    acquiringAgencyId: "A004", // Railways
    createdDate: "2026-06-02T10:30:00Z",
    lastUpdatedDate: "2026-06-03T15:00:00Z",
    slaDaysAllocated: 5,
    daysPendingInCurrentDept: 1, // On track
    stepProgress: 2, // Step 2 of 7
    compensationEstimated: 950
  },
  {
    id: "LAQ/2026/1005",
    title: "Mulshi Dam Reservoir Feeding Canal Catchment",
    description: "Acquisition of rugged land segments to design reinforced lining canals for feeding water reservoir.",
    status: FileStatus.CREATED,
    currentOwnerId: "U002", // District Magistrate
    currentDepartment: Department.DM_OFFICE,
    villageId: "V005", // Mulshi Budruk
    surveyNumber: "109, 110, 111/4, 112",
    taluka: "Mulshi",
    areaAcquired: "11.15 Hectares",
    landOwnerInfo: "Mulshi Forest-Range Buffer Association & 6 farming families",
    acquiringAgencyId: "A005", // Water Resources
    createdDate: "2026-06-03T08:15:00Z",
    lastUpdatedDate: "2026-06-03T08:15:00Z",
    slaDaysAllocated: 3,
    daysPendingInCurrentDept: 1, // On track
    stepProgress: 1, // Step 1 of 7
    compensationEstimated: 580
  }
];

export const INITIAL_MOVEMENTS: FileMovement[] = [
  // Movements for File 1001 (Step 1 to Step 7)
  {
    id: "M001",
    fileId: "LAQ/2026/1001",
    fromDepartment: Department.DM_OFFICE,
    toDepartment: Department.LAO,
    fromOfficerId: "U008", // Clerk
    toOfficerId: "U003", // LAO Officer
    dispatchDate: "2026-03-05T11:00:00Z",
    remarks: "Proposal vetted and routed from DM Office. Forwarded to LAO for structural verification.",
    expectedCompletionDate: "2026-03-10T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-03-05T14:15:00Z"
  },
  {
    id: "M002",
    fileId: "LAQ/2026/1001",
    fromDepartment: Department.LAO,
    toDepartment: Department.DYSLR,
    fromOfficerId: "U003", // LAO Officer
    toOfficerId: "U004", // DYSLR Officer
    dispatchDate: "2026-03-12T16:00:00Z",
    remarks: "Survey requests. Required Counting Map, Appendix 16 reports and physical ground calculations.",
    expectedCompletionDate: "2026-03-26T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-03-13T10:30:00Z"
  },
  {
    id: "M003",
    fileId: "LAQ/2026/1001",
    fromDepartment: Department.DYSLR,
    toDepartment: Department.LAO,
    fromOfficerId: "U004", // DYSLR Officer
    toOfficerId: "U003", // LAO Officer
    dispatchDate: "2026-04-10T11:30:00Z",
    remarks: "Survey completed. Uploaded Appendix 16, Survey Report and boundary plans for validation.",
    expectedCompletionDate: "2026-04-15T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-04-11T09:00:00Z"
  },
  {
    id: "M004",
    fileId: "LAQ/2026/1001",
    fromDepartment: Department.LAO,
    toDepartment: Department.DIO,
    fromOfficerId: "U003", // LAO Officer
    toOfficerId: "U005", // DIO Officer
    dispatchDate: "2026-04-20T15:00:00Z",
    remarks: "Section 11 Notification approved. Dispatched to District Information Officer for gazette publication.",
    expectedCompletionDate: "2026-04-30T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-04-20T16:20:00Z"
  },
  {
    id: "M005",
    fileId: "LAQ/2026/1001",
    fromDepartment: Department.DIO,
    toDepartment: Department.VILLAGE_OFFICE,
    fromOfficerId: "U005", // DIO Officer
    toOfficerId: "U007", // Village Accountant
    dispatchDate: "2026-05-20T14:30:00Z",
    remarks: "Notification published in state gazette and Marathi Daily Sakal. Forwarded to village level for local publicity and panchnama.",
    expectedCompletionDate: "2026-05-27T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-05-20T15:00:00Z"
  },

  // Movements for File 1002 (Step 1 to Step 3)
  {
    id: "M006",
    fileId: "LAQ/2026/1002",
    fromDepartment: Department.DM_OFFICE,
    toDepartment: Department.LAO,
    fromOfficerId: "U002", // DM
    toOfficerId: "U003", // LAO Officer
    dispatchDate: "2026-05-18T10:00:00Z",
    remarks: "MIDC proposal received and routed to LAO.",
    expectedCompletionDate: "2026-05-23T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-05-18T11:45:00Z"
  },
  {
    id: "M007",
    fileId: "LAQ/2026/1002",
    fromDepartment: Department.LAO,
    toDepartment: Department.DYSLR,
    fromOfficerId: "U003", // LAO Officer
    toOfficerId: "U004", // DYSLR Officer
    dispatchDate: "2026-05-31T09:15:00Z",
    remarks: "Forwarding for urgent land boundary survey. Rapid growth corridor request.",
    expectedCompletionDate: "2026-06-14T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-05-31T11:00:00Z"
  },

  // Movements for File 1003 (Step 1 to Step 6)
  {
    id: "M008",
    fileId: "LAQ/2026/1003",
    fromDepartment: Department.DM_OFFICE,
    toDepartment: Department.LAO,
    fromOfficerId: "U002", // DM
    toOfficerId: "U003", // LAO Officer
    dispatchDate: "2026-04-12T14:00:00Z",
    remarks: "PMRDA proposal assigned for Metro Station 3 yard.",
    expectedCompletionDate: "2026-04-17T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-04-12T15:30:00Z"
  },
  {
    id: "M009",
    fileId: "LAQ/2026/1003",
    fromDepartment: Department.LAO,
    toDepartment: Department.DYSLR,
    fromOfficerId: "U003", // LAO Officer
    toOfficerId: "U004", // DYSLR Officer
    dispatchDate: "2026-04-18T10:00:00Z",
    remarks: "DYSLR requested for joint survey.",
    expectedCompletionDate: "2026-04-28T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-04-18T12:00:00Z"
  },
  {
    id: "M010",
    fileId: "LAQ/2026/1003",
    fromDepartment: Department.DYSLR,
    toDepartment: Department.LAO,
    fromOfficerId: "U004", // DYSLR
    toOfficerId: "U003", // LAO
    dispatchDate: "2026-04-29T16:00:00Z",
    remarks: "Survey report uploaded and files returned.",
    expectedCompletionDate: "2026-05-04T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-04-30T10:00:00Z"
  },
  {
    id: "M011",
    fileId: "LAQ/2026/1003",
    fromDepartment: Department.LAO,
    toDepartment: Department.DIO,
    fromOfficerId: "U003", // LAO
    toOfficerId: "U005", // DIO
    dispatchDate: "2026-05-12T16:45:00Z",
    remarks: "Section 11 drafted. DIO is requested to expedite print in local media.",
    expectedCompletionDate: "2026-05-22T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-05-12T17:30:00Z"
  },

  // Movements for File 1004 (Step 1 to Step 2)
  {
    id: "M012",
    fileId: "LAQ/2026/1004",
    fromDepartment: Department.DM_OFFICE,
    toDepartment: Department.LAO,
    fromOfficerId: "U002", // DM
    toOfficerId: "U003", // LAO
    dispatchDate: "2026-06-03T15:00:00Z",
    remarks: "Proposal vetted and approved by DM. Forwarded to LAO for structural verification.",
    expectedCompletionDate: "2026-06-08T00:00:00Z",
    isAcknowledged: true,
    acknowledgedDate: "2026-06-03T16:15:00Z"
  }
];

export const INITIAL_NOTES: Note[] = [
  // Notes for File 1001
  {
    id: "N001",
    fileId: "LAQ/2026/1001",
    authorId: "U008",
    authorName: "Rohit Shrivastava",
    authorRole: Role.CLERK,
    department: Department.DM_OFFICE,
    content: "Agency proposal contains structural drawings but water-line crosses the central section. Raised with high importance.",
    type: "Note",
    createdAt: "2026-03-02T11:00:00Z"
  },
  {
    id: "N002",
    fileId: "LAQ/2026/1001",
    authorId: "U003",
    authorName: "Sunil Kulkarni",
    authorRole: Role.LAO_OFFICER,
    department: Department.LAO,
    content: "Requesting immediate ground boundary checking by land records team. Some survey numbers show residential structures.",
    type: "Query",
    createdAt: "2026-03-10T15:30:00Z"
  },
  {
    id: "N003",
    fileId: "LAQ/2026/1001",
    authorId: "U004",
    authorName: "Anil Wankhede",
    authorRole: Role.DYSLR_OFFICER,
    department: Department.DYSLR,
    content: "Joint land measurement completed. Responding to query: No permanent residential structures reside in the core 4.85 Hectares corridor. Recommending acquisition proceeding.",
    type: "Clarification",
    createdAt: "2026-04-08T12:00:00Z"
  },
  {
    id: "N004",
    fileId: "LAQ/2026/1001",
    authorId: "U007",
    authorName: "Maruti Tambe",
    authorRole: Role.VILLAGE_ACCOUNTANT,
    department: Department.VILLAGE_OFFICE,
    content: "Need to verify claims of local community regarding common well in dry zone.",
    type: "Note",
    createdAt: "2026-05-25T11:20:00Z"
  },

  // Notes for File 1002
  {
    id: "N005",
    fileId: "LAQ/2026/1002",
    authorId: "U002",
    authorName: "Dr. Rajesh Deshmukh",
    authorRole: Role.DISTRICT_MAGISTRATE,
    department: Department.DM_OFFICE,
    content: "This project holds high industrial development significance. Instructed DYSLR to expedite joint surveyor reporting.",
    type: "Recommendation",
    createdAt: "2026-05-17T11:00:00Z"
  },

  // Notes for File 1003
  {
    id: "N006",
    fileId: "LAQ/2026/1003",
    authorId: "U003",
    authorName: "Sunil Kulkarni",
    authorRole: Role.LAO_OFFICER,
    department: Department.LAO,
    content: "Section 11 draft prepared adhering to state fair-value index. Send to DIO for final publishing authorization.",
    type: "Approval",
    createdAt: "2026-05-11T14:00:00Z"
  },
  {
    id: "N007",
    fileId: "LAQ/2026/1003",
    authorId: "U005",
    authorName: "Sanjay Shinde",
    authorRole: Role.DISTRICT_INFORMATION_OFFICER,
    department: Department.DIO,
    content: "Requested budget allocation verification. Publication queue is heavily congested.",
    type: "Query",
    createdAt: "2026-05-20T10:15:00Z"
  }
];

export const INITIAL_ATTACHMENTS: Attachment[] = [
  // Attachments for File 1001
  {
    id: "A_DOC_001",
    fileId: "LAQ/2026/1001",
    name: "Land Acquisition Proposal - NH48 widening.pdf",
    type: "Proposal",
    url: "#",
    uploadedBy: "NHAI Project Director",
    uploadedAt: "2026-03-01T10:15:00Z",
    version: 1,
    size: "4.2 MB"
  },
  {
    id: "A_DOC_002",
    fileId: "LAQ/2026/1001",
    name: "Survey Report - Shikrapur Boundary Segment.pdf",
    type: "Survey Reports",
    url: "#",
    uploadedBy: "Anil Wankhede (DYSLR)",
    uploadedAt: "2026-04-10T11:15:00Z",
    version: 1,
    size: "8.1 MB"
  },
  {
    id: "A_DOC_003",
    fileId: "LAQ/2026/1001",
    name: "Counting Map - Sec B Shikrapur.dwg",
    type: "Maps",
    url: "#",
    uploadedBy: "Anil Wankhede (DYSLR)",
    uploadedAt: "2026-04-10T11:18:00Z",
    version: 1,
    size: "15.4 MB"
  },
  {
    id: "A_DOC_004",
    fileId: "LAQ/2026/1001",
    name: "Appendix 16 Report Signed.pdf",
    type: "Appendix 16",
    url: "#",
    uploadedBy: "Anil Wankhede (DYSLR)",
    uploadedAt: "2026-04-10T11:22:00Z",
    version: 1,
    size: "2.5 MB"
  },
  {
    id: "A_DOC_005",
    fileId: "LAQ/2026/1001",
    name: "Section 11 Notification - Gazette No 442.pdf",
    type: "Notifications",
    url: "#",
    uploadedBy: "Sunil Kulkarni (LAO)",
    uploadedAt: "2026-04-19T14:30:00Z",
    version: 2,
    size: "3.1 MB"
  },
  {
    id: "A_DOC_006",
    fileId: "LAQ/2026/1001",
    name: "Sakal Press Release Evidence.jpg",
    type: "Gazette Publications",
    url: "#",
    uploadedBy: "Sanjay Shinde (DIO)",
    uploadedAt: "2026-05-19T10:00:00Z",
    version: 1,
    size: "1.1 MB"
  },

  // Attachments for File 1002
  {
    id: "A_DOC_007",
    fileId: "LAQ/2026/1002",
    name: "MIDC Cluster Proposal Doc.pdf",
    type: "Proposal",
    url: "#",
    uploadedBy: "MIDC Regional Head",
    uploadedAt: "2026-05-15T11:45:00Z",
    version: 1,
    size: "6.8 MB"
  },

  // Attachments for File 1003
  {
    id: "A_DOC_008",
    fileId: "LAQ/2026/1003",
    name: "Metro Depot Alignment Area.pdf",
    type: "Proposal",
    url: "#",
    uploadedBy: "PMRDA Infrastructure Planner",
    uploadedAt: "2026-04-10T09:12:00Z",
    version: 1,
    size: "5.5 MB"
  },
  {
    id: "A_DOC_009",
    fileId: "LAQ/2026/1003",
    name: "Joint Survey Findings Depot.pdf",
    type: "Survey Reports",
    url: "#",
    uploadedBy: "Anil Wankhede (DYSLR)",
    uploadedAt: "2026-04-29T15:50:00Z",
    version: 1,
    size: "4.8 MB"
  },
  {
    id: "A_DOC_010",
    fileId: "LAQ/2026/1003",
    name: "Sec 11 Hindi and English Drafts.docx",
    type: "Notifications",
    url: "#",
    uploadedBy: "Sunil Kulkarni (LAO)",
    uploadedAt: "2026-05-11T13:10:00Z",
    version: 1,
    size: "1.9 MB"
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "N_ALERT_01",
    userId: "U007",
    role: Role.VILLAGE_ACCOUNTANT,
    fileId: "LAQ/2026/1001",
    message: "SLA Delay Alert! File LAQ/2026/1001 for NH48 Expansion has been pending with you for 15 days (SLA: 7 days). Immediate Panchnama completion required.",
    type: "Warning",
    isRead: false,
    createdAt: "2026-05-28T09:00:00Z"
  },
  {
    id: "N_ALERT_02",
    userId: "U005",
    role: Role.DISTRICT_INFORMATION_OFFICER,
    fileId: "LAQ/2026/1003",
    message: "SLA Breach Alert! Gazette Publication for Metro 3 Depot has exceeded allocated 10-day timeline. Pending 23 days.",
    type: "Warning",
    isRead: false,
    createdAt: "2026-05-22T09:00:00Z"
  },
  {
    id: "N_ALERT_03",
    userId: "U004",
    role: Role.DYSLR_OFFICER,
    fileId: "LAQ/2026/1002",
    message: "New land acquisition survey requested for MIDC Hub Chikhali (18.2 Hectares). Assigned from LAO Office.",
    type: "Info",
    isRead: false,
    createdAt: "2025-05-31T09:15:00Z"
  },
  {
    id: "N_ALERT_04",
    userId: "U003",
    role: Role.LAO_OFFICER,
    fileId: "LAQ/2026/1004",
    message: "District Magistrate approved proposal routing for Railway Expansion Koregaon. Handed over to you for Survey scheduling.",
    type: "Info",
    isRead: true,
    createdAt: "2026-06-03T15:15:00Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "AUD_001",
    fileId: "LAQ/2026/1001",
    userEmail: "rohit.clerk@dm.gov.in",
    userName: "Rohit Shrivastava",
    userRole: Role.CLERK,
    action: "Assigned proposal to Land Acquisition Office segment.",
    previousStatus: FileStatus.CREATED,
    newStatus: FileStatus.SUBMITTED,
    timestamp: "2026-03-05T11:00:00Z",
    ipAddress: "10.160.2.45"
  },
  {
    id: "AUD_002",
    fileId: "LAQ/2026/1001",
    userEmail: "sunil.kulkarni@lao.gov.in",
    userName: "Sunil Kulkarni",
    userRole: Role.LAO_OFFICER,
    action: "Acknowledge file reception and verified project coordinates. Requested boundary survey support.",
    previousStatus: FileStatus.SUBMITTED,
    newStatus: FileStatus.SURVEY_PENDING,
    timestamp: "2026-03-12T16:00:00Z",
    ipAddress: "10.160.14.88"
  },
  {
    id: "AUD_003",
    fileId: "LAQ/2026/1001",
    userEmail: "anil.dyslr@landrecords.gov.in",
    userName: "Anil Wankhede",
    userRole: Role.DYSLR_OFFICER,
    action: "Uploaded Appendix 16, Survey Drawings and authenticated counting maps.",
    previousStatus: FileStatus.SURVEY_PENDING,
    newStatus: FileStatus.SURVEY_COMPLETED,
    timestamp: "2026-04-10T11:30:00Z",
    ipAddress: "10.160.28.10"
  },
  {
    id: "AUD_004",
    fileId: "LAQ/2026/1001",
    userEmail: "sunil.kulkarni@lao.gov.in",
    userName: "Sunil Kulkarni",
    userRole: Role.LAO_OFFICER,
    action: "Prepared draft Section 11 Notification. Send to Information officer for mass dispatch.",
    previousStatus: FileStatus.SURVEY_COMPLETED,
    newStatus: FileStatus.NOTIFICATION_DRAFTED,
    timestamp: "2026-04-20T15:00:00Z",
    ipAddress: "10.160.14.88"
  },
  {
    id: "AUD_005",
    fileId: "LAQ/2026/1001",
    userEmail: "sanjay.dio@pib.gov.in",
    userName: "Sanjay Shinde",
    userRole: Role.DISTRICT_INFORMATION_OFFICER,
    action: "Completed multi-medium newspaper layout and loaded gazette publication. Closed tracking stage.",
    previousStatus: FileStatus.NOTIFICATION_DRAFTED,
    newStatus: FileStatus.PUBLICATION_COMPLETED,
    timestamp: "2026-05-20T14:30:00Z",
    ipAddress: "10.161.4.11"
  }
];
