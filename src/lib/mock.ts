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
  role: UserRole;
  password?: string; // Simplification for mock login
}

export interface Student {
  id: string;
  dni: string;
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
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Prof. Juan Pérez', role: 'PROFESSOR_ADMIN', password: 'admin' },
  { id: 'u2', name: 'Brig. Gen. Ana López', role: 'GENERAL_BRIGADIER', password: 'gen' },
  { id: 'u3', name: 'Sub-Brig. Marcos Díaz', role: 'SUB_BRIGADIER', password: 'sub' },
  { id: 'u4', name: 'Brig. Aula Sofia Ruiz', role: 'PATROL_BRIGADIER', password: 'patrol' },
  { id: 'u5', name: 'Lic. Maria Gomez', role: 'PSYCHOLOGIST', password: 'psych' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', dni: '10000001', firstName: 'Carlos', lastName: 'Mendez', grade: '5to', section: 'A', incidentsCount: 0 },
  { id: 's2', dni: '10000002', firstName: 'Lucia', lastName: 'Fernandez', grade: '4to', section: 'B', incidentsCount: 2 }, // Close to warning
  { id: 's3', dni: '10000003', firstName: 'Pedro', lastName: 'Ramirez', grade: '3ro', section: 'C', incidentsCount: 4 }, // Warning!
  { id: 's4', dni: '10000004', firstName: 'Elena', lastName: 'Torres', grade: '5to', section: 'A', incidentsCount: 1 },
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
