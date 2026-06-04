export enum Role {
  SUPER_ADMIN = "Super Admin",
  DISTRICT_MAGISTRATE = "District Magistrate",
  LAO_OFFICER = "LAO Officer",
  DYSLR_OFFICER = "DYSLR Officer",
  DISTRICT_INFORMATION_OFFICER = "District Information Officer",
  REVENUE_OFFICER = "Revenue Officer",
  VILLAGE_ACCOUNTANT = "Village Accountant",
  CLERK = "Clerk",
  VIEWER_AUDITOR = "Viewer/Auditor"
}

export enum FileStatus {
  CREATED = "Created",
  SUBMITTED = "Submitted",
  UNDER_REVIEW = "Under Review",
  SURVEY_PENDING = "Survey Pending",
  SURVEY_COMPLETED = "Survey Completed",
  NOTIFICATION_DRAFTED = "Notification Drafted",
  PUBLICATION_PENDING = "Publication Pending",
  PUBLICATION_COMPLETED = "Publication Completed",
  PANCHNAMA_PENDING = "Panchnama Pending",
  CLOSED = "Closed"
}

export enum Department {
  DM_OFFICE = "District Magistrate Office",
  LAO = "Land Acquisition Office",
  DYSLR = "Deputy Superintendent of Land Records",
  DIO = "District Information Office",
  REVENUE = "Revenue Department",
  VILLAGE_OFFICE = "Village Accountant Office"
}

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Village {
  id: string;
  name: string;
  taluka: string;
}

export interface Agency {
  id: string;
  name: string;
  type: string;
}

export interface LandAcquisitionFile {
  id: string; // Unique File Number (e.g., LAQ/2026/1001)
  title: string;
  description: string;
  status: FileStatus;
  currentOwnerId: string; // User ID
  currentDepartment: Department;
  villageId: string;
  surveyNumber: string;
  taluka: string;
  areaAcquired: string; // e.g., "12.4 Hectares"
  landOwnerInfo: string; // e.g., "Suresh Patel & 14 others"
  acquiringAgencyId: string;
  createdDate: string;
  lastUpdatedDate: string;
  slaDaysAllocated: number;
  daysPendingInCurrentDept: number;
  stepProgress: number; // 1 to 7 corresponding to Steps 1 to 7
  compensationEstimated?: number; // e.g., in INR Lakhs
}

export interface FileMovement {
  id: string;
  fileId: string;
  fromDepartment: Department;
  toDepartment: Department;
  fromOfficerId: string;
  toOfficerId: string;
  dispatchDate: string;
  remarks: string;
  expectedCompletionDate: string;
  isAcknowledged: boolean;
  acknowledgedDate?: string;
}

export interface Note {
  id: string;
  fileId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  department: Department;
  content: string;
  type: "Note" | "Query" | "Clarification" | "Recommendation" | "Approval";
  createdAt: string;
}

export interface Attachment {
  id: string;
  fileId: string;
  name: string;
  type: string; // File type or Document Category
  url: string; // Base64 or mock URL
  uploadedBy: string; // User Name
  uploadedAt: string;
  version: number;
  size?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // Target User Role/ID
  role: Role;
  fileId: string;
  message: string;
  type: "Info" | "Alert" | "Warning";
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  fileId: string;
  userEmail: string;
  userName: string;
  userRole: Role;
  action: string;
  previousStatus: FileStatus | "None";
  newStatus: FileStatus;
  timestamp: string;
  ipAddress: string;
}
