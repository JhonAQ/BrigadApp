'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  ChevronRight, 
  MapPin, 
  Save, 
  Search, 
  ShieldAlert, 
  AlertTriangle,
  FileWarning,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import { MOCK_STUDENTS, Incident } from '@/lib/mock';
import { toast } from 'sonner';

export default function IncidentsPage() {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [severity, setSeverity] = useState<Incident['type'] | null>(null);
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState(''); // Only visible for Patrol? I'll show it generally for mock simplicity or based on role later.

  const filteredStudents = searchTerm.length > 1 
    ? MOCK_STUDENTS.filter(s => 
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.dni.includes(searchTerm)
      ) 
    : [];

  const handleNext = () => setStep(step + 1);
  
  const handleSubmit = () => {
    if (!selectedStudent || !severity || !description) return;
    
    toast.success('Incidencia registrada correctamente');
    // Reset form
    setStep(1);
    setSelectedStudent(null);
    setSeverity(null);
    setDescription('');
    setSearchTerm('');
    setZone('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Cuaderno de Incidencias
        </h1>
        <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
          Paso {step} de 3
        </div>
      </div>

      {/* Stepper Logic */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-lg font-semibold mb-4 text-slate-700">1. Identificar al Alumno</h2>
           
           <div className="relative mb-6">
             <Search className="absolute top-3 left-3 w-5 h-5 text-slate-400" />
             <input 
               type="text" 
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
               placeholder="Buscar por nombre o DNI..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           {selectedStudent ? (
             <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                   <p className="font-bold text-indigo-900">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                   <p className="text-xs text-indigo-600">{selectedStudent.grade}° {selectedStudent.section} - DNI: {selectedStudent.dni}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedStudent(null)}>
                  <X className="w-5 h-5 text-indigo-400" />
                </Button>
             </div>
           ) : (
             <div className="space-y-2 max-h-60 overflow-y-auto">
               {filteredStudents.map(student => (
                 <button 
                   key={student.id}
                   onClick={() => setSelectedStudent(student)}
                   className="w-full text-left p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                 >
                   <div>
                     <p className="font-medium text-slate-700 group-hover:text-indigo-600">{student.firstName} {student.lastName}</p>
                     <p className="text-xs text-slate-400">{student.grade}° {student.section}</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                 </button>
               ))}
               {searchTerm.length > 1 && filteredStudents.length === 0 && (
                 <p className="text-slate-400 text-center py-4">No se encontraron alumnos</p>
               )}
             </div>
           )}

           <div className="mt-6 flex justify-end">
             <Button onClick={handleNext} disabled={!selectedStudent}>
               Siguiente
               <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
           </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-lg font-semibold mb-4 text-slate-700">2. Detalles del Suceso</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                  { id: 'LEVE', label: 'Leve', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShieldAlert },
                  { id: 'MODERADA', label: 'Moderada', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
                  { id: 'GRAVE', label: 'Grave', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: FileWarning },
              ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSeverity(opt.id as any)}
                    className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                        ${severity === opt.id ? `border-current ring-2 ring-offset-2 ${opt.color.replace('bg-', 'ring-')}` : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'}
                        ${severity === opt.id ? opt.color : ''}
                    `}
                  >
                      <opt.icon className="w-6 h-6 mb-2" />
                      <span className="font-bold text-sm">{opt.label}</span>
                  </button>
              ))}
           </div>

           <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea 
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                placeholder="Describa brevemente lo ocurrido..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
           </div>

           <div className="flex justify-between items-center mt-6">
             <Button variant="secondary" onClick={() => setStep(1)}>Atrás</Button>
             <Button onClick={handleNext} disabled={!severity || !description}>
               Revisar
               <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-lg font-semibold mb-4 text-slate-700">3. Confirmación</h2>
           
           <div className="bg-slate-50 rounded-xl p-6 space-y-4 mb-6">
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-indigo-600 text-sm">A</span>
                 </div>
                 <div>
                    <p className="text-sm text-slate-400">Alumno</p>
                    <p className="font-medium text-slate-800">{selectedStudent?.firstName} {selectedStudent?.lastName}</p>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-indigo-600 text-sm">G</span>
                 </div>
                 <div>
                    <p className="text-sm text-slate-400">Gravedad</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        severity === 'LEVE' ? 'bg-emerald-100 text-emerald-700' :
                        severity === 'MODERADA' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                        {severity}
                    </span>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-indigo-600 text-sm">D</span>
                 </div>
                 <div>
                    <p className="text-sm text-slate-400">Descripción</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-4 h-4" />
                      {new Date().toLocaleTimeString()}
                  </div>
              </div>
           </div>

           <div className="flex justify-between items-center mt-6">
             <Button variant="secondary" onClick={() => setStep(2)}>Editar</Button>
             <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
               <Save className="w-4 h-4 mr-2" />
               Registrar Incidencia
             </Button>
           </div>
        </div>
      )}
    </div>
  );
}
