// src/lib/mock.ts

export type UserRole = 
  | 'PROFESSOR_ADMIN' 
  | 'GENERAL_BRIGADIER' 
  | 'SUB_BRIGADIER' 
  | 'PATROL_BRIGADIER' 
  | 'PSYCHOLOGIST';

export interface User {
  id: string;
  name: string;
  dni: string;
  role: UserRole;
  password?: string; // Simplification for mock login
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  incidentsCount: number;
}

export interface Incident {
  id: string;
  studentId: string;
  type: 'LEVE' | 'MODERADA' | 'GRAVE';
  description: string;
  date: string;
  time: string;
  uniformStatus: 'COMPLETA' | 'INCOMPLETA';
  status: 'PENDIENTE' | 'ATENDIDA';
  reporterId: string;
  psychNotes?: string;
  zone?: string;
}

// Updated Mock Users with DNIS
export const MOCK_USERS: User[] = [
  { id: 'u1', dni: '00000001', name: 'Prof. Juan Pérez', role: 'PROFESSOR_ADMIN', password: 'admin' },
  { id: 'u2', dni: '10000001', name: 'Brig. Gen. Ana López', role: 'GENERAL_BRIGADIER', password: 'gen' },
  { id: 'u3', dni: '20000001', name: 'Sub-Brig. Marcos Díaz', role: 'SUB_BRIGADIER', password: 'sub' },
  { id: 'u4', dni: '30000001', name: 'Brig. Aula Sofia Ruiz', role: 'PATROL_BRIGADIER', password: 'patrol' },
  { id: 'u5', dni: '40000001', name: 'Lic. Maria Gomez', role: 'PSYCHOLOGIST', password: 'psych' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', firstName: 'Carlos', lastName: 'Mendez', grade: '5to', section: 'A', incidentsCount: 0 },
  { id: 's2', firstName: 'Lucia', lastName: 'Fernandez', grade: '4to', section: 'B', incidentsCount: 2 },
  { id: 's3', firstName: 'Pedro', lastName: 'Ramirez', grade: '3ro', section: 'C', incidentsCount: 4 },
  { id: 's4', firstName: 'Elena', lastName: 'Torres', grade: '5to', section: 'A', incidentsCount: 1 },
  { id: 's5', firstName: 'Miguel', lastName: 'Angel', grade: '1ro', section: 'A', incidentsCount: 0 },
  { id: 's6', firstName: 'Ana', lastName: 'Maria', grade: '2do', section: 'B', incidentsCount: 3 },
  { id: 's7', firstName: 'Jose', lastName: 'Luis', grade: '3ro', section: 'A', incidentsCount: 0 },
  { id: 's8', firstName: 'Maria', lastName: 'Jose', grade: '4to', section: 'C', incidentsCount: 0 },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'i1',
    studentId: 's3',
    type: 'MODERADA',
    description: 'Uso de celular en clase',
    date: '2023-10-25',
    time: '10:30',
    uniformStatus: 'COMPLETA',
    status: 'PENDIENTE',
    reporterId: 'u4'
  },
  {
      id: 'i2',
      studentId: 's3',
      type: 'GRAVE',
      description: 'Falta de respeto a docente',
      date: '2023-10-20',
      time: '08:15',
      uniformStatus: 'INCOMPLETA',
      status: 'ATENDIDA',
      reporterId: 'u2',
      psychNotes: 'Se realizó sesión de consejería con padres.'
  },
  {
      id: 'i3',
      studentId: 's2',
      type: 'LEVE',
      description: 'Llegada tardía al aula',
      date: '2023-10-26',
      time: '08:05',
      uniformStatus: 'COMPLETA',
      status: 'PENDIENTE',
      reporterId: 'u3'
  }
];

// Helper to filter students
export const getGrades = () => [...new Set(MOCK_STUDENTS.map(s => s.grade))];
export const getSections = (grade: string) => [...new Set(MOCK_STUDENTS.filter(s => s.grade === grade).map(s => s.section))];
