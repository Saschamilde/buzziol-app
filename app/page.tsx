"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Clock, CalendarDays, Calendar, ListTodo, Car, UserPlus, Trash2 } from "lucide-react";

// 1. Supabase Verbindung
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [students, setStudents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Zustände für Schüler anlegen
  const [newStudentName, setNewStudentName] = useState("");
  const [studentStatus, setStudentStatus] = useState("");

  // Zustände für Termin-Formular (getrennt nach Stunde und Minute für 15-Minuten-Takt)
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [driveType, setDriveType] = useState("Übungsfahrt");
  const [status, setStatus] = useState("");

  // Verfügbare Stunden (06 bis 21 Uhr) und Minuten-Schritte (15 Min)
  const hours = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  // 2. Daten laden
  const fetchData = async () => {
    const { data: studentData } = await supabase.from("students").select("*").order("name", { ascending: true });
    if (studentData) setStudents(studentData);

    const { data: aptData } = await supabase
      .from("availabilities")
      .select("*, students(name)")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (aptData) setAppointments(aptData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. Schüler anlegen
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      setStudentStatus("Bitte einen Namen eingeben!");
      return;
    }
    setStudentStatus("Wird gespeichert...");
    const { error } = await supabase.from("students").insert([{ name: newStudentName.trim() }]);

    if (error) {
      setStudentStatus("Fehler: " + error.message);
    } else {
      setStudentStatus("Schüler hinzugefügt! ✅");
      setNewStudentName("");
      fetchData();
      setTimeout(() => setStudentStatus(""), 3000);
    }
  };

  // 4. Termin speichern
  const handleSave = async () => {
    if (!selectedStudent || !date) {
      setStatus("Bitte Schüler und Datum ausfüllen!");
      return;
    }

    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;

    setStatus("Wird gespeichert...");
    const { error } = await supabase.from("availabilities").insert([
      { 
        student_id: selectedStudent, 
        date: date,
        start_time: startTime, 
        end_time: endTime,
        drive_type: driveType
      }
    ]);

    if (error) {
      setStatus("Fehler beim Speichern: " + error.message);
    } else {
      setStatus("Termin erfolgreich gespeichert! ✅");
      setDate("");
      setDriveType("Übungsfahrt");
      fetchData();
      setTimeout(() => setStatus(""), 3000);
    }
  };

  // 5. Termin löschen
  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Termin wirklich löschen?")) return;

    const { error } = await supabase.from("availabilities").delete().eq("id", id);
    
    if (error) {
      alert("Fehler beim Löschen: " + error.message);
    } else {
      fetchData();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 font-sans pb-20">
      {/* Header */}
      <div className="max-w-md mx-auto mt-8 border-b-4 border-red-600 pb-4 mb-8">
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black tracking-wider text-gray-200">BUZZIOL</h1>
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm tracking-widest">
            FAHRSCHULE
          </span>
        </div>
        <p className="text-gray-400 mt-2 text-sm">Hallo Max! 👋 Lass uns fahren.</p>
      </div>

      {/* Eingabe-Formular */}
      <div className="max-w-md mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800 mb-6">
        <h2 className="text-lg font-bold mb-6 text-gray-300 flex items-center gap-2">
          <CalendarDays className="text-yellow-500" size={20} />
          ZEITEN EINTRAGEN
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Schüler auswählen</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <select 
                className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 px-10 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Bitte wählen --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Art der Fahrt</label>
            <div className="relative">
              <Car className="absolute left-3 top-3 text-gray-500" size={18} />
              <select 
                className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 px-10 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500"
                value={driveType}
                onChange={(e) => setDriveType(e.target.value)}
              >
                <option value="Übungsfahrt">Übungsfahrt (Standard)</option>
                <option value="Überlandfahrt">Überlandfahrt (Sonderfahrt)</option>
                <option value="Autobahnfahrt">Autobahnfahrt (Sonderfahrt)</option>
                <option value="Nachtfahrt">Nachtfahrt (Sonderfahrt)</option>
                <option value="Prüfung">Praktische Prüfung</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Datum</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="date" 
                className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 pl-10 pr-2 text-gray-200 focus:outline-none focus:border-yellow-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Von Uhrzeit (Stunde : Minute) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Von</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-500" size={18} />
                <select 
                  className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 pl-10 pr-2 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>{h} Uhr</option>
                  ))}
                </select>
              </div>
              <div>
                <select 
                  className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 px-4 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500 text-center"
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m} Min</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bis Uhrzeit (Stunde : Minute) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Bis</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-500" size={18} />
                <select 
                  className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 pl-10 pr-2 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>{h} Uhr</option>
                  ))}
                </select>
              </div>
              <div>
                <select 
                  className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 px-4 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500 text-center"
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m} Min</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-all active:scale-95"
          >
            ZEITEN SPEICHERN
          </button>

          {status && (
            <p className={`text-center text-sm font-semibold mt-4 ${status.includes('Fehler') || status.includes('Bitte') ? 'text-red-500' : 'text-green-500'}`}>
              {status}
            </p>
          )}
        </div>
      </div>

      {/* Schüler anlegen */}
      <div className="max-w-md mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800 mb-6">
        <h2 className="text-sm font-bold mb-4 text-gray-300 flex items-center gap-2">
          <UserPlus className="text-gray-500" size={18} />
          NEUEN SCHÜLER ANLEGEN
        </h2>
        <div className="flex gap-2">
          <input 
            type="text" placeholder="Name des Schülers..."
            className="flex-1 bg-[#222222] border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-yellow-500 text-sm"
            value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
          />
          <button 
            onClick={handleAddStudent}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            HINZUFÜGEN
          </button>
        </div>
        {studentStatus && (
          <p className={`text-xs font-semibold mt-3 ${studentStatus.includes('Fehler') || studentStatus.includes('Bitte') ? 'text-red-500' : 'text-green-500'}`}>
            {studentStatus}
          </p>
        )}
      </div>

      {/* Termin-Übersicht */}
      <div className="max-w-md mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800">
        <h2 className="text-lg font-bold mb-4 text-gray-300 flex items-center gap-2">
          <ListTodo className="text-yellow-500" size={20} />
          GEBUCHTE FAHRTEN
        </h2>
        
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 italic">Noch keine Termine eingetragen.</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="bg-[#222222] border border-gray-700 p-4 rounded-lg flex justify-between items-center hover:border-gray-500 transition-colors group">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-200">{apt.students?.name || "Unbekannt"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      apt.drive_type === 'Übungsfahrt' || !apt.drive_type
                        ? 'bg-gray-700 text-gray-300' 
                        : apt.drive_type === 'Prüfung'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {apt.drive_type || 'Übungsfahrt'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(apt.date)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-yellow-500 font-bold bg-[#111111] px-3 py-1 rounded">
                      {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(apt.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors p-1"
                    title="Termin löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}