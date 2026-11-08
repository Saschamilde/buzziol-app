"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Clock, CalendarDays, Calendar as CalendarIcon, ListTodo, Car, UserPlus, Trash2, KeyRound, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

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
  const [pickupLocation, setPickupLocation] = useState("Fahrschule"); // Standard-Abholort
  const [status, setStatus] = useState("");

  // Zustand für die angezeigte Woche
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // Erstelle alle 15-Minuten-Slots von 07:00 bis 00:00 Uhr
  const timeSlots: { time: string; isFullHour: boolean }[] = [];
  for (let hour = 7; hour <= 23; hour++) {
    const hStr = String(hour).padStart(2, "0");
    timeSlots.push({ time: `${hStr}:00`, isFullHour: true });
    timeSlots.push({ time: `${hStr}:15`, isFullHour: false });
    timeSlots.push({ time: `${hStr}:30`, isFullHour: false });
    timeSlots.push({ time: `${hStr}:45`, isFullHour: false });
  }
  timeSlots.push({ time: "00:00", isFullHour: true });

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
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
        car: car,
        pickup_location: pickupLocation
      }
    ]);

    if (error) {
      setStatus("Fehler beim Speichern: " + error.message);
    } else {
      setStatus("Termin erfolgreich gespeichert! ✅");
      setDate("");
      setPickupLocation("Fahrschule");
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

  // Kalenderwoche berechnen
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

  const getDaysForCurrentWeek = () => {
    const now = new Date();
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

  const weekDays = mounted ? getDaysForCurrentWeek() : [];
  const currentKW = weekDays.length > 0 ? getCalendarWeek(weekDays[0]) : 1;

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // Design-Funktion
  const getCardDesign = (carName: string, driveType: string) => {
    let borderStyle = "border-[10px] border-[#3f3f46] shadow-2xl"; 
    if (carName === "Schalter") {
      borderStyle = "border-[10px] border-white shadow-2xl"; 
    }

    let bgStyle = "bg-orange-500 text-white"; 
    let timeTextBg = "bg-black/30 text-white font-bold";

    if (driveType === "Autobahnfahrt") {
      bgStyle = "bg-blue-600 text-white";
    } else if (driveType === "Überlandfahrt") {
      bgStyle = "bg-green-600 text-white";
    } else if (driveType === "Nachtfahrt") {
      bgStyle = "bg-yellow-400 text-black";
      timeTextBg = "bg-black/20 text-black font-bold";
    } else if (driveType === "Prüfung") {
      bgStyle = "bg-red-600 text-white animate-pulse";
    }

    return { borderStyle, bgStyle, timeTextBg };
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-zinc-900 p-4 font-sans pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto mt-6 border-b-4 border-red-600 pb-4 mb-8 flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="Buzziol Fahrschule Logo" 
          className="h-14 object-contain mb-2"
        />
        <p className="text-zinc-600 text-sm">Hallo Max! 👋 Lass uns fahren.</p>
      </div>

      {/* Eingabe-Formular */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-xl border border-zinc-200 mb-8">
        <h2 className="text-lg font-bold mb-6 text-zinc-800 flex items-center gap-2">
          <CalendarDays className="text-yellow-600" size={20} />
          ZEITEN EINTRAGEN
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Schüler auswählen</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-zinc-400" size={18} />
              <select 
                className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-10 text-zinc-800 appearance-none focus:outline-none focus:border-yellow-600"
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
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Fahrzeug</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-zinc-400" size={18} />
              <select 
                className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-10 text-zinc-800 appearance-none focus:outline-none focus:border-yellow-600"
                value={car}
                onChange={(e) => setCar(e.target.value)}
              >
                <option value="Automatik">Automatik</option>
                <option value="Schalter">Schalter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Art der Fahrt</label>
            <div className="relative">
              <Car className="absolute left-3 top-3 text-zinc-400" size={18} />
              <select 
                className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-10 text-zinc-800 appearance-none focus:outline-none focus:border-yellow-600"
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

          {/* Abholort als Auswahlliste (reduziert auf Fahrschule & Bahnhof Netto/Rewe) */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Startpunkt / Abholort</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-zinc-400" size={18} />
              <select 
                className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-10 text-zinc-800 appearance-none focus:outline-none focus:border-yellow-600"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              >
                <option value="Fahrschule">1. Fahrschule</option>
                <option value="Bahnhof (Netto)">2.1 Bahnhof (Netto)</option>
                <option value="Bahnhof (Rewe)">2.2 Bahnhof (Rewe)</option>
                {/* Weitere Orte können hier später ganz einfach als <option> ergänzt werden */}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Datum</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 text-zinc-400" size={18} />
              <input 
                type="date" 
                className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 pl-10 pr-2 text-zinc-800 focus:outline-none focus:border-yellow-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Von</label>
              <div className="grid grid-cols-2 gap-1">
                <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-1 text-zinc-800 text-xs" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-1 text-zinc-800 text-xs text-center" value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Bis</label>
              <div className="grid grid-cols-2 gap-1">
                <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-1 text-zinc-800 text-xs" value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-3 px-1 text-zinc-800 text-xs text-center" value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-3 rounded-lg transition-all active:scale-95 shadow-md">
            ZEITEN SPEICHERN
          </button>

          {status && (
            <p className={`text-center text-sm font-semibold mt-4 ${status.includes('Fehler') || status.includes('Bitte') ? 'text-red-600' : 'text-green-600'}`}>
              {status}
            </p>
          )}
        </div>
      </div>

      {/* Schüler anlegen */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-xl border border-zinc-200 mb-8">
        <h2 className="text-sm font-bold mb-4 text-zinc-800 flex items-center gap-2">
          <UserPlus className="text-zinc-500" size={18} />
          NEUEN SCHÜLER ANLEGEN
        </h2>
        <div className="flex gap-2">
          <input 
            type="text" placeholder="Name des Schülers..."
            className="flex-1 bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:border-yellow-600 text-sm"
            value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
          />
          <button onClick={handleAddStudent} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
            HINZUFÜGEN
          </button>
        </div>
        {studentStatus && (
          <p className={`text-xs font-semibold mt-3 ${studentStatus.includes('Fehler') || studentStatus.includes('Bitte') ? 'text-red-600' : 'text-green-600'}`}>
            {studentStatus}
          </p>
        )}
      </div>

      {/* KALENDER */}
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-xl border border-zinc-200 overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <ListTodo className="text-yellow-600" size={24} />
            <h2 className="text-xl font-bold text-zinc-900">15-MINUTEN KALENDER-RASTER</h2>
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
              KW {currentKW}
            </span>
          </div>
          
          {/* Wochen-Navigation */}
          <div className="flex items-center gap-2 bg-[#f4f2ec] p-1.5 rounded-lg border border-zinc-300">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 hover:bg-zinc-200 rounded text-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold">
              <ChevronLeft size={16} /> Vorherige
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-800 rounded text-xs font-bold transition-colors">
              Aktuelle Woche
            </button>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 hover:bg-zinc-200 rounded text-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold">
              Nächste <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Tabellen-Raster */}
        <div className="min-w-[850px] flex">
          {/* Feste Zeitspalte links */}
          <div className="w-20 shrink-0 flex flex-col">
            <div className="h-[52px] mb-2 bg-[#f0ede6] border border-zinc-300 rounded flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
              Zeit
            </div>

            {timeSlots.map((slotObj, sIdx) => (
              <div 
                key={sIdx} 
                className={`flex items-center justify-center text-center border-r border-b ${
                  slotObj.isFullHour 
                    ? 'bg-[#f0ede6] border-zinc-300 text-zinc-900 font-black text-xs' 
                    : 'bg-[#faf8f5] border-zinc-200 text-zinc-400 font-normal text-[10px]'
                }`}
                style={{ height: '34px' }}
              >
                {slotObj.time}
              </div>
            ))}
          </div>

          {/* 7 Wochentage Spalten */}
          <div className="grid grid-cols-7 flex-1 gap-1">
            {weekDays.map((day, dIdx) => {
              const dateStr = formatDateString(day);
              const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
              const isToday = formatDateString(new Date()) === dateStr;

              return (
                <div key={dIdx} className="flex flex-col">
                  {/* Tageskopf */}
                  <div className={`h-[52px] text-center py-2 mb-2 rounded border flex flex-col justify-center ${isToday ? 'bg-yellow-500/20 border-yellow-500/60' : 'bg-[#f0ede6] border-zinc-300'}`}>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase leading-tight">
                      {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </p>
                    <p className={`text-xs font-black leading-tight ${isToday ? 'text-yellow-800' : 'text-zinc-800'}`}>
                      {day.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>

                  {/* Container für Slots und Termine */}
                  <div className="relative flex flex-col bg-[#faf8f5] border border-zinc-300 rounded">
                    {timeSlots.map((slotObj, sIdx) => (
                      <div 
                        key={sIdx} 
                        className={`w-full border-b ${
                          slotObj.isFullHour 
                            ? 'border-zinc-300 bg-[#f4f2ec]' 
                            : 'border-zinc-200/80 bg-[#faf8f5]'
                        }`}
                        style={{ height: '34px' }}
                      />
                    ))}

                    {dayAppointments.map((apt) => {
                      const startMin = timeToMinutes(apt.start_time);
                      const endMin = timeToMinutes(apt.end_time);

                      const startOffsetMin = startMin - (7 * 60);
                      const slotIndex = startOffsetMin / 15;
                      const durationMin = Math.max(15, endMin - startMin);
                      const slotSpan = durationMin / 15;

                      const topPx = slotIndex * 34;
                      const heightPx = slotSpan * 34 - 2;

                      const design = getCardDesign(apt.car, apt.drive_type);

                      return (
                        <div 
                          key={apt.id} 
                          className={`absolute left-1 right-1 p-2 rounded-lg z-20 overflow-hidden flex flex-col justify-between ${design.borderStyle} ${design.bgStyle}`}
                          style={{ 
                            top: `${topPx}px`, 
                            height: `${heightPx}px` 
                          }}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${design.timeTextBg}`}>
                                {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                              </span>
                              <button onClick={() => handleDelete(apt.id)} className="text-current opacity-70 hover:opacity-100 p-0.5" title="Löschen">
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <p className="font-black text-sm truncate tracking-tight">{apt.students?.name}</p>
                            
                            {/* Abholort mit Pin-Symbol */}
                            {apt.pickup_location && (
                              <div className="inline-flex items-center gap-1 bg-black/30 text-yellow-300 font-bold text-[10px] px-1.5 py-0.5 rounded mt-1 truncate">
                                <MapPin size={11} className="shrink-0 text-yellow-300" />
                                <span className="truncate">{apt.pickup_location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white font-bold">{apt.drive_type}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white font-bold">🚗 {apt.car}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}