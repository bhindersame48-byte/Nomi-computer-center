import React, { useState, useEffect } from "react";
import { Course, Booking } from "../types";
import { COURSES } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Check, ClipboardList, BookOpen, GraduationCap, Clock, Sparkles, CheckCircle2, X, PhoneCall, Calendar, UserCheck } from "lucide-react";
import studentClassroomUrl from "../assets/images/classroom_light_1781247028758.jpg";

export default function CourseAcademy() {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Courses load failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch((err) => console.warn("Using offline courses list fallback:", err));
  }, []);
  
  // Registration Form States
  const [isRegistering, setIsRegistering] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCnic, setStudentCnic] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [preferredBatch, setPreferredBatch] = useState("Evening Batch");
  const [enrollSuccess, setEnrollSuccess] = useState<Booking | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const toggleSyllabus = (courseId: string) => {
    if (expandedSyllabus === courseId) {
      setExpandedSyllabus(null);
    } else {
      setExpandedSyllabus(courseId);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim() || !enrollCourse) return;

    setEnrollLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          phone: studentPhone,
          cnic: studentCnic,
          password: studentPassword,
          type: "course",
          item: enrollCourse.title,
          details: `Enrolling in course: ${enrollCourse.code}. Preferred hour slot: ${preferredBatch}. Monthly fee quoted: Rs. ${enrollCourse.feePKR.toLocaleString()}`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Save to client storage to enable active bookings checker
        const existingBookings = JSON.parse(localStorage.getItem("nomi_bookings") || "[]");
        existingBookings.push(data.booking);
        localStorage.setItem("nomi_bookings", JSON.stringify(existingBookings));

        setEnrollSuccess(data.booking);
        setStudentName("");
        setStudentPhone("");
        setStudentCnic("");
        setStudentPassword("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div id="section-courses" className="relative py-16 px-4 md:px-8 bg-slate-50/40 border-t border-slate-200/80">
      
      {/* Academy classroom asset showcase banner */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-16 bg-gradient-to-tr from-sky-50 via-violet-50/20 to-white border border-slate-200 p-6 md:p-10 flex flex-col lg:flex-row-reverse gap-8 items-center shadow-sm">
        <div className="lg:w-1/2 space-y-4 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-750 border border-violet-100">
            <GraduationCap className="h-3 w-3" /> DUNYAPUR IT EDUCATION HUB
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Build Hands-On <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-700">Technical Skills</span> for Global Careers
          </h2>
          <p className="text-sm text-slate-650 leading-relaxed font-sans font-normal">
            Our academy is designated as the primary training center in Dunyapur where students acquire corporate-level computer applications, programming expertise, and freelance certifications. We feature separate learning computer workstations for boys and girls with safe, fully Air-Conditioned modern classrooms.
          </p>
          <div className="grid grid-cols-2 gap-y-3 pt-2 text-slate-750">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-violet-600" /> Professional Instructors
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-violet-600" /> Affordable Fee Structures
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-violet-600" /> Punjab Board Recognized
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-violet-600" /> International Freelance support
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <motion.div 
            className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 group shadow-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={studentClassroomUrl} 
              alt="Futuristic Computer Learning Classroom Nomi Computers" 
              className="object-cover h-full w-full group-hover:scale-103 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-6">
              <div className="space-y-1 text-left">
                <p className="text-xs text-violet-300 font-mono font-bold">EDUCATION HUB</p>
                <h4 className="text-sm font-semibold text-white">Nomi Tech Academy Multi-Station Programming Classroom</h4>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Training Programs</h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose a course certified by Nomi computers to jumpstart your career. Practical hands-on curriculum with guaranteed certificates to secure computer applications and programming roles in Pakistan.
          </p>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5 transition-all text-left group"
            >
              {/* Card visual banner */}
              <div className="relative h-40 bg-slate-50 overflow-hidden border-b border-slate-100">
                <img
                  src={course.image}
                  alt={course.title}
                  className="object-cover w-full h-full opacity-95 group-hover:scale-104 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-4 flex gap-2">
                  <span className="bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-violet-750 border border-slate-200 shadow-sm">
                    {course.code}
                  </span>
                  <span className="bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-indigo-750 border border-slate-200 shadow-sm">
                    {course.level}
                  </span>
                </div>
                {course.popular && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-violet-600/15 animate-pulse">
                    <Sparkles className="h-3 w-3" /> Popular
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-605 leading-relaxed font-sans font-normal">{course.description}</p>
                  </div>

                  {/* Summary parameters */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-150">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                      <p className="text-slate-700 font-semibold">{course.duration}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Batch Shifts</span>
                      <p className="text-slate-700 font-semibold">{course.schedule}</p>
                    </div>
                  </div>

                  {/* Curriculum list triggers */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <button
                      onClick={() => toggleSyllabus(course.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-violet-605" /> 
                        {expandedSyllabus === course.id ? "Hide Detailed Syllabus" : "View Academy Syllabus Modules"}
                      </span>
                      <span className="text-[10px] font-mono text-violet-605 font-bold">
                        {expandedSyllabus === course.id ? "▲ COLLAPSE" : "▼ EXPANSE"}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedSyllabus === course.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden bg-slate-50/50 rounded-xl border border-slate-150 p-3 text-xs space-y-2 text-left animate-fade-in"
                        >
                          {course.syllabus.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start text-slate-600 leading-relaxed">
                              <span className="h-4 w-4 rounded-full bg-violet-100 text-violet-750 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                              <p className="font-sans font-normal text-slate-700">{item}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Gained Skills Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Skills Gained</span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.skillsGained.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-[10px] rounded-md text-slate-655 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold tracking-widest">Monthly Tuition Fee</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">Rs. {course.feePKR.toLocaleString()}/m</p>
                  </div>
                  <button
                    onClick={() => {
                      setEnrollCourse(course);
                      setIsRegistering(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-550 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-605/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Fast Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENT REGISTRATION SECURE ENROLLMENT MODAL */}
      <AnimatePresence>
        {isRegistering && enrollCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 border border-violet-150">
                    ACADEMY ONLINE ENROLLMENT
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">Enroll in {enrollCourse.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setEnrollSuccess(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!enrollSuccess ? (
                <form onSubmit={handleEnrollSubmit} className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Academic Certificate</p>
                      <p className="text-slate-700 font-bold mt-0.5">{enrollCourse.code} Certified</p>
                    </div>
                    <div className="text-right">
                      <p className="text-violet-600 font-bold uppercase tracking-wider">Standard Tuition</p>
                      <p className="text-slate-900 font-extrabold font-mono mt-0.5">Rs. {enrollCourse.feePKR.toLocaleString()} / Month</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-sans">Student Information</p>
                    
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Student's Full Name"
                        className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-violet-500 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="WhatsApp / Guardian Phone (e.g., 03007303000)"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-violet-500 placeholder:text-slate-400 ${
                          studentPhone 
                            ? (studentPhone.replace(/\D/g, "").length >= 11 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {studentPhone && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            studentPhone.replace(/\D/g, "").length >= 11 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {studentPhone.replace(/\D/g, "").length >= 11 
                              ? "✓ Complete phone number format" 
                              : `Incomplete: ${studentPhone.replace(/\D/g, "").length}/11 digits entered`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={studentCnic}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 13) {
                            let formatted = val;
                            if (val.length > 5 && val.length <= 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
                            } else if (val.length > 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
                            }
                            setStudentCnic(formatted);
                          }
                        }}
                        placeholder="CNIC (National Identity Card) e.g. 35201-1234567-1"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-violet-500 placeholder:text-slate-400 ${
                          studentCnic 
                            ? (studentCnic.replace(/\D/g, "").length === 13 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {studentCnic && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            studentCnic.replace(/\D/g, "").length === 13 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {studentCnic.replace(/\D/g, "").length === 13 
                              ? "✓ Complete CNIC format" 
                              : `Incomplete: ${studentCnic.replace(/\D/g, "").length}/13 digits entered`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Choose a Secure Password (min 6 characters)"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-violet-500 placeholder:text-slate-400 ${
                          studentPassword 
                            ? (studentPassword.length >= 6 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {studentPassword && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            studentPassword.length >= 6 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {studentPassword.length >= 6 
                              ? "✓ Password is secure" 
                              : `Too short: ${studentPassword.length}/6 characters`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-550 font-semibold block">Preferred Daily Timing</label>
                      <select
                        value={preferredBatch}
                        onChange={(e) => setPreferredBatch(e.target.value)}
                        className="w-full bg-white text-xs text-slate-800 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-violet-500"
                      >
                        <option value="Morning Shift">Morning Shift (09:00 AM - 10:30 AM)</option>
                        <option value="Afternoon Shift">Afternoon Shift (01:00 PM - 02:30 PM)</option>
                        <option value="Evening Shift">Standard Evening Shift (04:00 PM - 05:30 PM)</option>
                        <option value="Juma Weekend Batch">Juma Special Weekend (Friday/Saturday Only)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enrollLoading || studentPhone.replace(/\D/g, "").length < 11 || studentCnic.replace(/\D/g, "").length < 13 || studentPassword.length < 6}
                    className={`w-full py-3 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      (enrollLoading || studentPhone.replace(/\D/g, "").length < 11 || studentCnic.replace(/\D/g, "").length < 13 || studentPassword.length < 6)
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
                        : "bg-gradient-to-r from-violet-600 to-indigo-650 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-violet-605/10 cursor-pointer"
                    }`}
                  >
                    {enrollLoading ? "Registering Student Account..." : "Confirm Enrollment & Call for Seat Verification"}
                  </button>

                  <p className="text-[10px] text-center text-slate-450 leading-normal">
                    *Once registered, your seat is reserved. We will verify registration and timing availability on WhatsApp/Call. No advance fee required online.
                  </p>
                </form>
              ) : (
                <div className="py-6 space-y-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center animate-bounce">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-slate-905 font-sans">Student Registered Successfully!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Assalam-o-Alaikum <strong className="text-slate-700">{studentName || "Student"}</strong>, your reserved seat assignment code is <strong className="text-violet-600 font-mono font-bold">{enrollSuccess.id}</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-left space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between"><span className="text-slate-400">Reserved Course:</span> <span className="font-bold text-slate-800">{enrollCourse.title}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Batch Timing:</span> <span className="text-slate-800 font-medium">{preferredBatch}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Status:</span> <span className="text-emerald-600 font-bold">{enrollSuccess.status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Academic Code:</span> <span className="text-violet-600 font-mono font-bold">{enrollCourse.code}</span></div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/923007303000?text=Assalam-o-Alaikum%20Nomi%20Computers!%20I%20have%20submitted%20academic%20enrollment%20code%20${enrollSuccess.id}%20for%20${enrollCourse.title}.%20Please%20confirm%20my%20seat.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="h-4 w-4" /> Verify on WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setIsRegistering(false);
                        setEnrollCourse(null);
                        setEnrollSuccess(null);
                      }}
                      className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
