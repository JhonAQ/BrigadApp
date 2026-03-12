export type UserRole = "admin" | "coordinator" | "brigadier";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  grade?: string;
  section?: string;
  studentCode?: string;
  active: boolean;
  createdAt: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  registeredBy: string;
  time?: string;
  notes?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: "behavioral" | "medical" | "safety" | "other";
  severity: "low" | "medium" | "high";
  reportedBy: string;
  involvedStudents: string[];
  date: string;
  time: string;
  location: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  resolution?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  openIncidents: number;
  attendanceRate: number;
  activeCredentials: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
