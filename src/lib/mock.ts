// Mock data for BrigadApp

export type UserRole = "teacher" | "brigadier" | "psychologist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  grade?: string;
  section?: string;
  avatar?: string;
}

export interface Brigadier {
  id: string;
  name: string;
  grade: string;
  section: string;
  dni: string;
  qrCode: string;
  role: "jefe" | "subjefe" | "vocal";
  teacherId: string;
  isActive: boolean;
  photo?: string;
}

export interface AttendanceRecord {
  id: string;
  brigadierId: string;
  date: string;
  status: "present" | "absent" | "late" | "justified";
  time?: string;
  notes?: string;
}

export interface Incident {
  id: string;
  brigadierId: string;
  reportedBy: string;
  date: string;
  type: "behavior" | "academic" | "health" | "safety" | "other";
  severity: "low" | "medium" | "high";
  description: string;
  status: "open" | "in_progress" | "resolved";
  resolution?: string;
}

export interface PsychologySession {
  id: string;
  studentId: string;
  psychologistId: string;
  date: string;
  type: "individual" | "group" | "family";
  notes: string;
  followUp?: string;
  status: "scheduled" | "completed" | "cancelled";
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Prof. Carlos Mendoza",
    email: "profesor@brigadapp.com",
    password: "profesor123",
    role: "teacher",
    grade: "5",
    section: "A",
  },
  {
    id: "u2",
    name: "Ana García",
    email: "brigadier@brigadapp.com",
    password: "brigadier123",
    role: "brigadier",
    grade: "5",
    section: "A",
  },
  {
    id: "u3",
    name: "Dra. María López",
    email: "psicologa@brigadapp.com",
    password: "psico123",
    role: "psychologist",
  },
  {
    id: "u4",
    name: "Admin Sistema",
    email: "admin@brigadapp.com",
    password: "admin123",
    role: "admin",
  },
];

// Mock Brigadiers
export const mockBrigadiers: Brigadier[] = [
  {
    id: "b1",
    name: "Ana García Pérez",
    grade: "5",
    section: "A",
    dni: "12345678",
    qrCode: "QR-B1-5A-001",
    role: "jefe",
    teacherId: "u1",
    isActive: true,
  },
  {
    id: "b2",
    name: "Luis Torres Ramos",
    grade: "5",
    section: "A",
    dni: "23456789",
    qrCode: "QR-B2-5A-002",
    role: "subjefe",
    teacherId: "u1",
    isActive: true,
  },
  {
    id: "b3",
    name: "María Fernández Villa",
    grade: "5",
    section: "B",
    dni: "34567890",
    qrCode: "QR-B3-5B-003",
    role: "vocal",
    teacherId: "u1",
    isActive: true,
  },
  {
    id: "b4",
    name: "Carlos Quispe Mamani",
    grade: "6",
    section: "A",
    dni: "45678901",
    qrCode: "QR-B4-6A-004",
    role: "jefe",
    teacherId: "u1",
    isActive: true,
  },
  {
    id: "b5",
    name: "Rosa Condori Ticona",
    grade: "6",
    section: "A",
    dni: "56789012",
    qrCode: "QR-B5-6A-005",
    role: "vocal",
    teacherId: "u1",
    isActive: false,
  },
  {
    id: "b6",
    name: "José Mamani Cruz",
    grade: "4",
    section: "B",
    dni: "67890123",
    qrCode: "QR-B6-4B-006",
    role: "subjefe",
    teacherId: "u1",
    isActive: true,
  },
];

// Mock Attendance Records
export const mockAttendance: AttendanceRecord[] = [
  {
    id: "a1",
    brigadierId: "b1",
    date: "2026-03-10",
    status: "present",
    time: "07:30",
  },
  {
    id: "a2",
    brigadierId: "b2",
    date: "2026-03-10",
    status: "late",
    time: "07:45",
    notes: "Llegó tarde por tráfico",
  },
  {
    id: "a3",
    brigadierId: "b3",
    date: "2026-03-10",
    status: "absent",
  },
  {
    id: "a4",
    brigadierId: "b4",
    date: "2026-03-10",
    status: "present",
    time: "07:25",
  },
  {
    id: "a5",
    brigadierId: "b5",
    date: "2026-03-10",
    status: "justified",
    notes: "Cita médica",
  },
  {
    id: "a6",
    brigadierId: "b6",
    date: "2026-03-10",
    status: "present",
    time: "07:28",
  },
  {
    id: "a7",
    brigadierId: "b1",
    date: "2026-03-11",
    status: "present",
    time: "07:29",
  },
  {
    id: "a8",
    brigadierId: "b2",
    date: "2026-03-11",
    status: "present",
    time: "07:30",
  },
];

// Mock Incidents
export const mockIncidents: Incident[] = [
  {
    id: "i1",
    brigadierId: "b2",
    reportedBy: "u1",
    date: "2026-03-08",
    type: "behavior",
    severity: "medium",
    description:
      "El brigadier no cumplió con su turno de servicio sin aviso previo.",
    status: "resolved",
    resolution: "Se habló con el estudiante y sus padres. Se comprometió a comunicar con anticipación.",
  },
  {
    id: "i2",
    brigadierId: "b3",
    reportedBy: "u1",
    date: "2026-03-09",
    type: "health",
    severity: "high",
    description: "La brigadier se desmayó durante el turno de servicio.",
    status: "in_progress",
  },
  {
    id: "i3",
    brigadierId: "b4",
    reportedBy: "u1",
    date: "2026-03-10",
    type: "academic",
    severity: "low",
    description: "Bajo rendimiento académico. Podría afectar su continuidad en la brigada.",
    status: "open",
  },
  {
    id: "i4",
    brigadierId: "b1",
    reportedBy: "u1",
    date: "2026-03-05",
    type: "safety",
    severity: "medium",
    description: "Incidente de seguridad en el cruce peatonal durante el turno.",
    status: "resolved",
    resolution: "Se implementaron nuevos protocolos de seguridad.",
  },
];

// Mock Psychology Sessions
export const mockPsychologySessions: PsychologySession[] = [
  {
    id: "ps1",
    studentId: "b2",
    psychologistId: "u3",
    date: "2026-03-08",
    type: "individual",
    notes: "Sesión de seguimiento por bajo rendimiento académico.",
    followUp: "Próxima sesión en 2 semanas.",
    status: "completed",
  },
  {
    id: "ps2",
    studentId: "b3",
    psychologistId: "u3",
    date: "2026-03-12",
    type: "individual",
    notes: "Evaluación post-incidente de salud.",
    status: "scheduled",
  },
  {
    id: "ps3",
    studentId: "b5",
    psychologistId: "u3",
    date: "2026-03-07",
    type: "family",
    notes: "Reunión con padres por inasistencias recurrentes.",
    followUp: "Seguimiento en 1 semana.",
    status: "completed",
  },
];

// Helper functions
export function getBrigadierById(id: string): Brigadier | undefined {
  return mockBrigadiers.find((b) => b.id === id);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return mockAttendance.filter((a) => a.date === date);
}

export function getBrigadierAttendance(brigadierId: string): AttendanceRecord[] {
  return mockAttendance.filter((a) => a.brigadierId === brigadierId);
}

export function getOpenIncidents(): Incident[] {
  return mockIncidents.filter((i) => i.status === "open");
}

export function getAttendanceStats() {
  const today = mockAttendance.filter((a) => a.date === "2026-03-10");
  return {
    total: mockBrigadiers.filter((b) => b.isActive).length,
    present: today.filter((a) => a.status === "present").length,
    absent: today.filter((a) => a.status === "absent").length,
    late: today.filter((a) => a.status === "late").length,
    justified: today.filter((a) => a.status === "justified").length,
  };
}
