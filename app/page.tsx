"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Clock, CalendarDays, Calendar as CalendarIcon, ListTodo, Car, UserPlus, Trash2, KeyRound, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Zustände für Termin-Formular
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("00");
  const [driveType, setDriveType] = useState("Übungsfahrt");
  const [car, setCar] = useState("Automatik");
  const [status, setStatus] = useState("");

  // Zustand für die angezeigte Woche (Offset zur aktuellen Woche)
  const [weekOffset, setWeekOffset] = useState(0);

  const hours = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, "0")); // 06:00 bis 21:00
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
        drive_type: driveType,
        car: car
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

  // Hilfsfunktion: Kalenderwoche (KW) berechnen
  const getCalendarWeek = (d: Date) => {
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return Math.ceil((1 + Math.abs((firstThursday - target.valueOf()) / 86400000)) / 7);
  };

  // Wochentage für die aktuelle Wochenansicht berechnen (Mo-So)
  const getDaysForCurrentWeek = () => {
    const now = new Date();
    // Auf Montag der aktuellen Woche ausrichten + Offset
    const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getDaysForCurrentWeek();
  const currentKW = weekDays.length > 0 ? getCalendarWeek(weekDays[0]) : 1;

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 font-sans pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto mt-6 border-b-4 border-red-600 pb-4 mb-8 flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="Buzziol Fahrschule Logo" 
          className="h-14 object-contain mb-2"
        />
        <p className="text-gray-400 text-sm">Hallo Max! 👋 Lass uns fahren.</p>
      </div>

      {/* Eingabe-Formular */}
      <div className="max-w-md mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8">
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

          {/* Fahrzeug-Auswahl */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Fahrzeug</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-gray-500" size={18} />
              <select 
                className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 px-10 text-gray-200 appearance-none focus:outline-none focus:border-yellow-500"
                value={car}
                onChange={(e) => setCar(e.target.value)}
              >
                <option value="Automatik">Automatik</option>
                <option value="Schalter">Schalter</option>
                <option value="Motorrad">Motorrad</option>
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
              <CalendarIcon className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="date" 
                className="w-full bg-[#222222] border border-gray-700 rounded-lg py-3 pl-10 pr-2 text-gray-200 focus:outline-none focus:border-yellow-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Von Uhrzeit */}
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

          {/* Bis Uhrzeit */}
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
      <div className="max-w-md mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8">
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

      {/* WOCHENANSICHT (Kalender) */}
      <div className="max-w-6xl mx-auto bg-[#1a1a1a] p-6 rounded-xl shadow-2xl border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <ListTodo className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-gray-200">WOCHENANSICHT</h2>
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
              KW {currentKW}
            </span>
          </div>
          
          {/* Wochen-Navigation */}
          <div className="flex items-center gap-2 bg-[#222222] p-1.5 rounded-lg border border-gray-700">
            <button 
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Vorherige Woche"
            >
              <ChevronLeft size={16} /> Vorherige
            </button>
            <button 
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold transition-colors"
            >
              Aktuelle Woche
            </button>
            <button 
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Nächste Woche"
            >
              Nächste <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 7-Tage Grid (Horizontal nebeneinander auf großen Bildschirmen, untereinander auf Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const dateStr = formatDateString(day);
            // Filtere Termine für diesen specific Tag
            const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
            const isToday = formatDateString(new Date()) === dateStr;

            return (
              <div 
                key={idx} 
                className={`bg-[#222222] rounded-lg p-3 border flex flex-col ${
                  isToday ? 'border-yellow-500 shadow-lg shadow-yellow-500/10' : 'border-gray-700/80'
                }`}
              >
                {/* Tageskopf */}
                <div className="border-b border-gray-700 pb-2 mb-3 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                  </p>
                  <p className={`text-sm font-black ${isToday ? 'text-yellow-500' : 'text-gray-200'}`}>
                    {day.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>

                {/* Termine am jeweiligen Tag (mit Zeitraster sortiert) */}
                <div className="space-y-2 flex-1">
                  {dayAppointments.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-6 italic">Keine Fahrten</p>
                  ) : (
                    dayAppointments.map((apt) => (
                      <div 
                        key={apt.id} 
                        className="bg-[#181818] border border-gray-700/60 p-2.5 rounded-md hover:border-yellow-500/50 transition-all text-xs"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-yellow-500 bg-[#111111] px-1.5 py-0.5 rounded text-[11px]">
                            {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                          </span>
                          <button 
                            onClick={() => handleDelete(apt.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-0.5"
                            title="Löschen"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <p className="font-bold text-gray-100 mt-1 truncate">{apt.students?.name || "Unbekannt"}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                            {apt.drive_type || 'Übungsfahrt'}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                            🚗 {apt.car || 'Automatik'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}