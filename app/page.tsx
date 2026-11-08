"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Clock, CalendarDays, Calendar as CalendarIcon, ListTodo, Car, UserPlus, Trash2, KeyRound, ChevronLeft, ChevronRight, MapPin, Pencil, X, Eye, Phone, Mail, MapPinned, Building2, Calendar, FileText } from "lucide-react";

// 1. Supabase Verbindung
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [students, setStudents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Zustände für neuen Schüler anlegen
  const [newStudentName, setNewStudentName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newSchoolWork, setNewSchoolWork] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newHasGlasses, setNewHasGlasses] = useState(false);
  const [newTheoryExpiry, setNewTheoryExpiry] = useState("");
  const [newLicenseExpiry, setNewLicenseExpiry] = useState("");
  const [newNotes, setNewNotes] = useState("");
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
  const [pickupLocation, setPickupLocation] = useState("Fahrschule");
  const [status, setStatus] = useState("");

  // Zustände für das Termin-Bearbeiten-Modal
  const [editingApt, setEditingApt] = useState<any>(null);
  const [editStudentId, setEditStudentId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartHour, setEditStartHour] = useState("08");
  const [editStartMinute, setEditStartMinute] = useState("00");
  const [editEndHour, setEditEndHour] = useState("09");
  const [editEndMinute, setEditEndMinute] = useState("00");
  const [editDriveType, setEditDriveType] = useState("Übungsfahrt");
  const [editCar, setEditCar] = useState("Automatik");
  const [editPickupLocation, setEditPickupLocation] = useState("Fahrschule");

  // Zustand für das Schüler-Profil-Modal
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [editStudentProfile, setEditStudentProfile] = useState<any>(null);

  // Zustand für die angezeigte Woche
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // 15-Minuten-Slots von 07:00 bis 00:00 Uhr
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

  // 3. Schüler anlegen mit Profil-Daten
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      setStudentStatus("Bitte einen Namen eingeben!");
      return;
    }
    setStudentStatus("Wird gespeichert...");
    const { error } = await supabase.from("students").insert([{ 
      name: newStudentName.trim(),
      address: newAddress.trim() || null,
      school_or_workplace: newSchoolWork.trim() || null,
      phone: newPhone.trim() || null,
      email: newEmail.trim() || null,
      birth_date: newBirthDate || null,
      has_glasses: newHasGlasses,
      theory_exam_expiry: newTheoryExpiry || null,
      license_application_expiry: newLicenseExpiry || null,
      notes: newNotes.trim() || null
    }]);

    if (error) {
      setStudentStatus("Fehler: " + error.message);
    } else {
      setStudentStatus("Schüler hinzugefügt! ✅");
      setNewStudentName("");
      setNewAddress("");
      setNewSchoolWork("");
      setNewPhone("");
      setNewEmail("");
      setNewBirthDate("");
      setNewHasGlasses(false);
      setNewTheoryExpiry("");
      setNewLicenseExpiry("");
      setNewNotes("");
      fetchData();
      setTimeout(() => setStudentStatus(""), 3000);
    }
  };

  // 4. Schüler Profil aktualisieren
  const handleUpdateStudentProfile = async () => {
    if (!editStudentProfile) return;

    const { error } = await supabase
      .from("students")
      .update({
        name: editStudentProfile.name,
        address: editStudentProfile.address,
        school_or_workplace: editStudentProfile.school_or_workplace,
        phone: editStudentProfile.phone,
        email: editStudentProfile.email,
        birth_date: editStudentProfile.birth_date,
        has_glasses: editStudentProfile.has_glasses,
        theory_exam_expiry: editStudentProfile.theory_exam_expiry,
        license_application_expiry: editStudentProfile.license_application_expiry,
        notes: editStudentProfile.notes,
      })
      .eq("id", editStudentProfile.id);

    if (error) {
      alert("Fehler beim Speichern des Profils: " + error.message);
    } else {
      setEditStudentProfile(null);
      fetchData();
    }
  };

  // 5. Schüler löschen
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Schüler "${studentName}" wirklich löschen? (Dabei werden auch alle zugehörigen Termine entfernt)`)) return;

    await supabase.from("availabilities").delete().eq("student_id", studentId);
    const { error } = await supabase.from("students").delete().eq("id", studentId);
    
    if (error) {
      alert("Fehler beim Löschen des Schülers: " + error.message);
    } else {
      fetchData();
    }
  };

  // 6. Termin speichern
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

  // 7. Termin löschen
  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Termin wirklich löschen?")) return;

    const { error } = await supabase.from("availabilities").delete().eq("id", id);
    
    if (error) {
      alert("Fehler beim Löschen: " + error.message);
    } else {
      fetchData();
    }
  };

  // 8. Termin Bearbeiten Modal öffnen
  const openEditModal = (apt: any) => {
    setEditingApt(apt);
    setEditStudentId(apt.student_id);
    setEditDate(apt.date);
    const [sH, sM] = apt.start_time ? apt.start_time.split(":") : ["08", "00"];
    const [eH, eM] = apt.end_time ? apt.end_time.split(":") : ["09", "00"];
    setEditStartHour(sH);
    setEditStartMinute(sM);
    setEditEndHour(eH);
    setEditEndMinute(eM);
    setEditDriveType(apt.drive_type || "Übungsfahrt");
    setEditCar(apt.car || "Automatik");
    setEditPickupLocation(apt.pickup_location || "Fahrschule");
  };

  // 9. Termin aktualisieren
  const handleUpdate = async () => {
    if (!editingApt) return;

    const startTime = `${editStartHour}:${editStartMinute}`;
    const endTime = `${editEndHour}:${editEndMinute}`;

    const { error } = await supabase
      .from("availabilities")
      .update({
        student_id: editStudentId,
        date: editDate,
        start_time: startTime,
        end_time: endTime,
        drive_type: editDriveType,
        car: editCar,
        pickup_location: editPickupLocation,
      })
      .eq("id", editingApt.id);

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message);
    } else {
      setEditingApt(null);
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

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Startpunkt / Abholort</label>
            <div className="relative flex items-center bg-[#f4f2ec] border border-zinc-300 rounded-lg px-3 py-2.5 focus-within:border-yellow-600">
              <div className="w-8 h-6 flex items-center justify-center mr-2 shrink-0 bg-white rounded border border-zinc-200 overflow-hidden">
                <img 
                  src={pickupLocation === "Bahnhof (Netto)" ? "/netto.png" : pickupLocation === "Bahnhof (Rewe)" ? "/rewe.png" : "/logo.png"} 
                  alt="Symbol" 
                  className="max-h-5 max-w-7 object-contain"
                />
              </div>
              <select 
                className="w-full bg-transparent text-zinc-800 appearance-none focus:outline-none font-medium cursor-pointer"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              >
                <option value="Fahrschule">Fahrschule</option>
                <option value="Bahnhof (Netto)">Bahnhof (Netto)</option>
                <option value="Bahnhof (Rewe)">Bahnhof (Rewe)</option>
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

      {/* ERWEITERTE SCHÜLER-VERWALTUNG & PROFIL */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-xl border border-zinc-200 mb-8">
        <h2 className="text-sm font-bold mb-4 text-zinc-800 flex items-center gap-2">
          <UserPlus className="text-zinc-500" size={18} />
          NEUEN SCHÜLER ANLEGEN & PROFIL
        </h2>

        <div className="space-y-3 mb-4">
          <input 
            type="text" placeholder="Name des Schülers *"
            className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2.5 px-3 text-zinc-800 text-sm focus:outline-none focus:border-yellow-600 font-bold"
            value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="date" placeholder="Geburtsdatum"
              className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600"
              value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)}
            />
            <label className="flex items-center gap-2 bg-[#f4f2ec] border border-zinc-300 rounded-lg px-3 py-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                checked={newHasGlasses} onChange={(e) => setNewHasGlasses(e.target.checked)}
              />
              <span className="text-xs font-bold text-zinc-700 flex items-center gap-1"><Eye size={14}/> Sehhilfe</span>
            </label>
          </div>
          <input 
            type="text" placeholder="Adresse (Straße, Hausnr., Ort)"
            className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600"
            value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
          />
          <input 
            type="text" placeholder="Arbeitsort / Schule"
            className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600"
            value={newSchoolWork} onChange={(e) => setNewSchoolWork(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" placeholder="Telefonnummer"
              className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600"
              value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
            />
            <input 
              type="email" placeholder="E-Mail-Adresse"
              className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600"
              value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 bg-[#f7f5f0] p-2 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase">Theorie-Prüfung bis</label>
              <input 
                type="date" 
                className="w-full bg-white border border-zinc-300 rounded py-1 px-1 text-zinc-800 text-xs mt-1"
                value={newTheoryExpiry} onChange={(e) => setNewTheoryExpiry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase">Zulassung bis</label>
              <input 
                type="date" 
                className="w-full bg-white border border-zinc-300 rounded py-1 px-1 text-zinc-800 text-xs mt-1"
                value={newLicenseExpiry} onChange={(e) => setNewLicenseExpiry(e.target.value)}
              />
            </div>
          </div>
          <textarea 
            placeholder="Persönliche Notizen..."
            className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-3 text-zinc-800 text-xs focus:outline-none focus:border-yellow-600 resize-none h-16"
            value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
          />

          <button onClick={handleAddStudent} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
            SCHÜLER ANLEGEN
          </button>
        </div>

        {studentStatus && (
          <p className={`text-xs font-semibold mb-3 text-center ${studentStatus.includes('Fehler') || studentStatus.includes('Bitte') ? 'text-red-600' : 'text-green-600'}`}>
            {studentStatus}
          </p>
        )}

        {/* Liste aller Schüler mit Profil- und Lösch-Button */}
        {students.length > 0 && (
          <div className="border-t border-zinc-200 pt-3 max-h-52 overflow-y-auto space-y-2">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Vorhandene Schüler ({students.length})</p>
            {students.map((student) => (
              <div key={student.id} className="flex justify-between items-center bg-[#f7f5f0] px-3 py-2 rounded-lg border border-zinc-200 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-800">{student.name}</span>
                  {student.has_glasses && <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold" title="Sehhilfe erforderlich">👓 Brille</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setViewingStudent(student)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-900 px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    title="Profil anzeigen"
                  >
                    <User size={13} /> Profil
                  </button>
                  <button 
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Schüler löschen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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

            <div className="h-12 mt-2 bg-[#f0ede6] border border-zinc-300 rounded flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase">
              Gesamt
            </div>
          </div>

          {/* 7 Wochentage Spalten */}
          <div className="grid grid-cols-7 flex-1 gap-1">
            {weekDays.map((day, dIdx) => {
              const dateStr = formatDateString(day);
              const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
              const isToday = formatDateString(new Date()) === dateStr;

              const totalDayMinutes = dayAppointments.reduce((sum, apt) => {
                const sMin = timeToMinutes(apt.start_time);
                const eMin = timeToMinutes(apt.end_time);
                return sum + Math.max(0, eMin - sMin);
              }, 0);

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
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditModal(apt)} className="text-current opacity-70 hover:opacity-100 p-0.5" title="Bearbeiten">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(apt.id)} className="text-current opacity-70 hover:opacity-100 p-0.5" title="Löschen">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="font-black text-sm truncate tracking-tight">{apt.students?.name}</p>
                            
                            {apt.pickup_location === "Fahrschule" ? (
                              <div className="inline-flex items-center bg-white/90 px-2 py-0.5 rounded mt-1 shadow-sm">
                                <img src="/logo.png" alt="Fahrschule Logo" className="h-4 object-contain" />
                              </div>
                            ) : apt.pickup_location === "Bahnhof (Netto)" ? (
                              <div className="inline-flex items-center bg-white/90 px-2 py-0.5 rounded mt-1 shadow-sm">
                                <img src="/netto.png" alt="Netto Logo" className="h-4 object-contain" />
                              </div>
                            ) : apt.pickup_location === "Bahnhof (Rewe)" ? (
                              <div className="inline-flex items-center bg-white/90 px-2 py-0.5 rounded mt-1 shadow-sm">
                                <img src="/rewe.png" alt="Rewe Logo" className="h-4 object-contain" />
                              </div>
                            ) : (
                              apt.pickup_location && (
                                <div className="inline-flex items-center gap-1 bg-black/30 text-yellow-300 font-bold text-[10px] px-1.5 py-0.5 rounded mt-1 truncate">
                                  <MapPin size={11} className="shrink-0 text-yellow-300" />
                                  <span className="truncate">{apt.pickup_location}</span>
                                </div>
                              )
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

                  {/* Fußzeile pro Tag */}
                  <div className="h-12 mt-2 bg-[#f0ede6] border border-zinc-300 rounded flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase leading-none">Arbeitszeit</span>
                    <span className="text-xs font-black text-zinc-900 mt-0.5">
                      {totalDayMinutes} Min.
                      {totalDayMinutes > 0 && ` (${(totalDayMinutes / 60).toFixed(1).replace('.', ',')} Std.)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SCHÜLER PROFIL MODAL (ANSICHT) */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl shadow-2xl border border-zinc-300 relative">
            <button onClick={() => setViewingStudent(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-500/20 text-yellow-800 rounded-full flex items-center justify-center font-black text-xl">
                {viewingStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{viewingStudent.name}</h2>
                {viewingStudent.has_glasses && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">👓 Sehhilfe erforderlich</span>}
              </div>
            </div>

            <div className="space-y-4 text-sm bg-[#f7f5f0] p-4 rounded-xl border border-zinc-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Geburtsdatum</span>
                  <p className="font-semibold text-zinc-800">{viewingStudent.birth_date || "Nicht angegeben"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Telefon</span>
                  <p className="font-semibold text-zinc-800 flex items-center gap-1"><Phone size={13}/> {viewingStudent.phone || "Nicht angegeben"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">E-Mail</span>
                  <p className="font-semibold text-zinc-800 flex items-center gap-1"><Mail size={13}/> {viewingStudent.email || "Nicht angegeben"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Adresse</span>
                  <p className="font-semibold text-zinc-800 flex items-center gap-1"><MapPinned size={13}/> {viewingStudent.address || "Nicht angegeben"}</p>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Arbeitsort / Schule</span>
                <p className="font-semibold text-zinc-800 flex items-center gap-1"><Building2 size={13}/> {viewingStudent.school_or_workplace || "Nicht angegeben"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-zinc-200 pt-3">
                <div>
                  <span className="block text-[10px] font-bold text-red-600 uppercase">Theorie-Prüfung Ablauf</span>
                  <p className="font-bold text-zinc-900">{viewingStudent.theory_exam_expiry || "Kein Datum"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-red-600 uppercase">Zulassung Frist</span>
                  <p className="font-bold text-zinc-900">{viewingStudent.license_application_expiry || "Kein Datum"}</p>
                </div>
              </div>

              {viewingStudent.notes && (
                <div className="border-t border-zinc-200 pt-3">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Notizen</span>
                  <p className="text-zinc-700 text-xs mt-1 whitespace-pre-wrap">{viewingStudent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  setEditStudentProfile(s);
                }} 
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-md"
              >
                Profil bearbeiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHÜLER PROFIL BEARBEITEN MODAL */}
      {editStudentProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-2xl border border-zinc-300 relative">
            <button onClick={() => setEditStudentProfile(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1">
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4 text-zinc-800 flex items-center gap-2">
              <Pencil className="text-yellow-600" size={18} />
              SCHÜLERPROFIL BEARBEITEN
            </h2>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-3 text-zinc-800 text-sm font-bold"
                  value={editStudentProfile.name || ""} 
                  onChange={(e) => setEditStudentProfile({...editStudentProfile, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Geburtsdatum</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-2 text-zinc-800 text-xs"
                    value={editStudentProfile.birth_date || ""} 
                    onChange={(e) => setEditStudentProfile({...editStudentProfile, birth_date: e.target.value})}
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-yellow-600 rounded"
                      checked={editStudentProfile.has_glasses || false} 
                      onChange={(e) => setEditStudentProfile({...editStudentProfile, has_glasses: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-zinc-700">Sehhilfe</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Adresse</label>
                <input 
                  type="text" 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-3 text-zinc-800 text-xs"
                  value={editStudentProfile.address || ""} 
                  onChange={(e) => setEditStudentProfile({...editStudentProfile, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Arbeitsort / Schule</label>
                <input 
                  type="text" 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-3 text-zinc-800 text-xs"
                  value={editStudentProfile.school_or_workplace || ""} 
                  onChange={(e) => setEditStudentProfile({...editStudentProfile, school_or_workplace: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Telefon</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-2 text-zinc-800 text-xs"
                    value={editStudentProfile.phone || ""} 
                    onChange={(e) => setEditStudentProfile({...editStudentProfile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">E-Mail</label>
                  <input 
                    type="email" 
                    className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-2 text-zinc-800 text-xs"
                    value={editStudentProfile.email || ""} 
                    onChange={(e) => setEditStudentProfile({...editStudentProfile, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#f7f5f0] p-2 rounded border border-zinc-200">
                <div>
                  <label className="block text-[10px] font-bold text-red-600 uppercase">Theorie bis</label>
                  <input 
                    type="date" 
                    className="w-full bg-white border border-zinc-300 rounded py-1 px-1 text-zinc-800 text-xs mt-1"
                    value={editStudentProfile.theory_exam_expiry || ""} 
                    onChange={(e) => setEditStudentProfile({...editStudentProfile, theory_exam_expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-600 uppercase">Zulassung bis</label>
                  <input 
                    type="date" 
                    className="w-full bg-white border border-zinc-300 rounded py-1 px-1 text-zinc-800 text-xs mt-1"
                    value={editStudentProfile.license_application_expiry || ""} 
                    onChange={(e) => setEditStudentProfile({...editStudentProfile, license_application_expiry: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Notizen</label>
                <textarea 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded py-2 px-3 text-zinc-800 text-xs resize-none h-16"
                  value={editStudentProfile.notes || ""} 
                  onChange={(e) => setEditStudentProfile({...editStudentProfile, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  onClick={() => setEditStudentProfile(null)} 
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold py-2 rounded-lg text-sm"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleUpdateStudentProfile} 
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-2 rounded-lg text-sm shadow-md"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TERMIN BEARBEITEN MODAL */}
      {editingApt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-2xl border border-zinc-300 relative">
            <button onClick={() => setEditingApt(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1">
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-6 text-zinc-800 flex items-center gap-2">
              <Pencil className="text-yellow-600" size={20} />
              TERMIN BEARBEITEN
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Schüler</label>
                <select 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2.5 px-3 text-zinc-800 text-sm focus:outline-none focus:border-yellow-600"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Fahrzeug</label>
                <select 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2.5 px-3 text-zinc-800 text-sm focus:outline-none focus:border-yellow-600"
                  value={editCar}
                  onChange={(e) => setEditCar(e.target.value)}
                >
                  <option value="Automatik">Automatik</option>
                  <option value="Schalter">Schalter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Art der Fahrt</label>
                <select 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2.5 px-3 text-zinc-800 text-sm focus:outline-none focus:border-yellow-600"
                  value={editDriveType}
                  onChange={(e) => setEditDriveType(e.target.value)}
                >
                  <option value="Übungsfahrt">Übungsfahrt (Standard)</option>
                  <option value="Überlandfahrt">Überlandfahrt (Sonderfahrt)</option>
                  <option value="Autobahnfahrt">Autobahnfahrt (Sonderfahrt)</option>
                  <option value="Nachtfahrt">Nachtfahrt (Sonderfahrt)</option>
                  <option value="Prüfung">Praktische Prüfung</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Startpunkt / Abholort</label>
                <div className="relative flex items-center bg-[#f4f2ec] border border-zinc-300 rounded-lg px-3 py-2">
                  <div className="w-8 h-6 flex items-center justify-center mr-2 shrink-0 bg-white rounded border border-zinc-200 overflow-hidden">
                    <img 
                      src={editPickupLocation === "Bahnhof (Netto)" ? "/netto.png" : editPickupLocation === "Bahnhof (Rewe)" ? "/rewe.png" : "/logo.png"} 
                      alt="Symbol" 
                      className="max-h-5 max-w-7 object-contain"
                    />
                  </div>
                  <select 
                    className="w-full bg-transparent text-zinc-800 appearance-none focus:outline-none font-medium text-sm cursor-pointer"
                    value={editPickupLocation}
                    onChange={(e) => setEditPickupLocation(e.target.value)}
                  >
                    <option value="Fahrschule">Fahrschule</option>
                    <option value="Bahnhof (Netto)">Bahnhof (Netto)</option>
                    <option value="Bahnhof (Rewe)">Bahnhof (Rewe)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Datum</label>
                <input 
                  type="date" 
                  className="w-full bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2.5 px-3 text-zinc-800 text-sm focus:outline-none focus:border-yellow-600"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Von</label>
                  <div className="grid grid-cols-2 gap-1">
                    <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-1 text-zinc-800 text-xs" value={editStartHour} onChange={(e) => setEditStartHour(e.target.value)}>
                      {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-1 text-zinc-800 text-xs text-center" value={editStartMinute} onChange={(e) => setEditStartMinute(e.target.value)}>
                      {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wide">Bis</label>
                  <div className="grid grid-cols-2 gap-1">
                    <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-1 text-zinc-800 text-xs" value={editEndHour} onChange={(e) => setEditEndHour(e.target.value)}>
                      {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="bg-[#f4f2ec] border border-zinc-300 rounded-lg py-2 px-1 text-zinc-800 text-xs text-center" value={editEndMinute} onChange={(e) => setEditEndMinute(e.target.value)}>
                      {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setEditingApt(null)} className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold py-2.5 rounded-lg text-sm">
                  Abbrechen
                </button>
                <button onClick={handleUpdate} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-2.5 rounded-lg text-sm shadow-md">
                  Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}