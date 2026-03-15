const fs = require('fs');

const content = `"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, GraduationCap } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newStudent, setNewStudent] = useState({ 
    first_name: '', 
    last_name: '', 
    grade: '', 
    section: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [dbSections, setDbSections] = useState<any[]>([]);

  useEffect(() => { 
    fetchStudents(); 
    fetchSections(); 
  }, []);

  async function fetchSections() { 
    const {data} = await supabase.from('sections').select('*').order('grade', { ascending: true }); 
    const sectionsData = data || [];
    setDbSections(sectionsData);
    if (sectionsData.length > 0) {
      setNewStudent(prev => ({
        ...prev,
        grade: sectionsData[0].grade,
        section: sectionsData[0].name
      }));
    }
  }

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });
      
    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const addStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.grade || !newStudent.section) {
      alert('Por favor completa todos los campos'); 
      return;
    }

    const { error } = await supabase.from('students').insert([{ 
      first_name: newStudent.first_name, 
      last_name: newStudent.last_name, 
      grade: newStudent.grade, 
      section: newStudent.section 
    }]);

    if (!error) {
      setShowAddModal(false);
      setNewStudent({ 
        first_name: '', 
        last_name: '', 
        grade: dbSections[0]?.grade || '', 
        section: dbSections[0]?.name || '' 
      });
      fetchStudents();
    } else {
      alert('Error al registrar alumno: ' + error.message);
      console.error('Insert error details:', error);
    }
  };

  const deleteStudent = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este estudiante?')) {
      await supabase.from('students').delete().match({ id });
      fetchStudents();
    }
  };

  const filtered = students.filter(s => 
    (s.first_name + ' ' + s.last_name + ' ' + s.grade + ' ' + s.section).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableGrades = Array.from(new Set(dbSections.map(s => s.grade)));
  const availableSections = dbSections.filter(s => s.grade === newStudent.grade).map(s => s.name);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Base de Estudiantes
          </h1>
          <p className="text-slate-500 mt-1">Registro y gestión de alumnos regulares</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Registrar Alumno
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, grado o sección..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="font-semibold p-4">Apellidos y Nombres</th>
                <th className="font-semibold p-4">Grado</th>
                <th className="font-semibold p-4">Sección</th>
                <th className="font-semibold p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Cargando base de datos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hay estudiantes listados.</td></tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{s.last_name}, {s.first_name}</td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {s.section}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteStudent(s.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors" title="Eliminar estudiante">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Registrar Nuevo Alumno
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombres</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Carlos" 
                    value={newStudent.first_name} 
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apellidos</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Pérez Gómez" 
                    value={newStudent.last_name} 
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Grado</label>
                  <select 
                    value={newStudent.grade} 
                    onChange={(e) => {
                      const newGrade = e.target.value;
                      const newSections = dbSections.filter(s => s.grade === newGrade).map(s => s.name);
                      setNewStudent({...newStudent, grade: newGrade, section: newSections[0] || ''});
                    }} 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white font-medium"
                  >
                    {availableGrades.map(g => <option key={g as string} value={g as string}>{g as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sección</label>
                  <select 
                    value={newStudent.section} 
                    onChange={(e) => setNewStudent({...newStudent, section: e.target.value})} 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white font-medium"
                  >
                    {availableSections.map((s, i) => <option key={i} value={s as string}>{s as string}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button onClick={() => setShowAddModal(false)} variant="secondary" className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">
                Cancelar
              </Button>
              <Button onClick={addStudent} variant="primary" className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm">
                Guardar Alumno
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/dashboard/students/page.tsx', content);
