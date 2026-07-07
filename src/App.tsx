import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, MapPin, Award, BookOpen, Clock, Heart, 
  ChevronRight, ArrowUpRight, CheckCircle2, MessageSquare, 
  FileText, Activity, Send, Star, Compass, MousePointerClick, Smartphone,
  Lock, User, Key, LogOut, Check, Briefcase, Users, X, GraduationCap
} from "lucide-react";

import LaptopCatalog from "./components/LaptopCatalog";
import AccessoryCatalog from "./components/AccessoryCatalog";
import CourseAcademy from "./components/CourseAcademy";
import ReviewSection from "./components/ReviewSection";
import AdvisorChat from "./components/AdvisorChat";
import AdminPanel from "./components/AdminPanel";
import AdmissionFormPaper from "./components/AdmissionFormPaper";
import Logo from "./components/Logo";
import AuthWall from "./components/AuthWall";
import { Booking } from "./types";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

import heroBannerUrl from "./assets/images/nomi_hero_light_1781246989348.jpg";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone?: string; city?: string } | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [searchCode, setSearchCode] = useState("");
  const [trackedBookings, setTrackedBookings] = useState<Booking[]>([]);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Customer portal states
  const [trackerTab, setTrackerTab] = useState<"track" | "login">("track");
  const [loginCnic, setLoginCnic] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isLoggedInCustomer, setIsLoggedInCustomer] = useState(false);
  const [loggedInCustomer, setLoggedInCustomer] = useState<{ name: string; phone: string; cnic: string } | null>(null);
  const [loggedInCustomerBookings, setLoggedInCustomerBookings] = useState<Booking[]>([]);

  // Jobs / Careers section states
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [appForm, setAppForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    experience: "",
    coverLetter: ""
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admissions state variables
  const [admissionForm, setAdmissionForm] = useState({
    name: "",
    dob: "",
    religion: "",
    hobbies: "",
    courseName: "",
    homeAddress: "",
    studentPhone: "",
    studentMobile: "",
    studentEmail: "",
    fatherName: "",
    guardianName: "",
    parentOccupation: "",
    parentMonthlyIncome: "",
    parentPhoneOffice: "",
    parentPhone: "",
    parentBusinessAddress: "",
    parentEmail: "",
    rulesAccepted: false,
    signStudent: "",
    signParent: "",
    dated: new Date().toISOString().split("T")[0]
  });
  const [submittingAdmission, setSubmittingAdmission] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState<any | null>(null);
  const [admissionError, setAdmissionError] = useState("");
  const [trackAdmissionId, setTrackAdmissionId] = useState("");
  const [trackedAdmission, setTrackedAdmission] = useState<any | null>(null);
  const [trackAdmissionSearched, setTrackAdmissionSearched] = useState(false);
  const [trackAdmissionError, setTrackAdmissionError] = useState("");

  // Stats Counters
  const [isHoveredStat, setIsHoveredStat] = useState<number | null>(null);

  const fetchActiveJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        // Only display active job listings to standard users
        setJobs(data.filter((j: any) => j.active));
      }
    } catch (err) {
      console.error("Failed to fetch jobs catalog", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 55) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Restore general user authentication session
    const savedUserSession = localStorage.getItem("nomi_user_session");
    if (savedUserSession) {
      try {
        const parsed = JSON.parse(savedUserSession);
        if (parsed && parsed.user) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.user);
        }
      } catch (err) {
        console.warn("Failed to parse saved user session", err);
      }
    }

    // Restore customer session
    const savedSession = localStorage.getItem("nomi_customer_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.customer) {
          setIsLoggedInCustomer(true);
          setLoggedInCustomer(parsed.customer);
          setLoggedInCustomerBookings(parsed.bookings || []);
        }
      } catch (err) {
        console.warn("Failed to parse saved customer session", err);
      }
    }

    fetchActiveJobs();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCnic = loginCnic.replace(/\D/g, "");
    if (cleanCnic.length < 13) {
      setLoginError("Please enter a valid 13-digit CNIC.");
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters.");
      return;
    }

    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnic: cleanCnic, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedInCustomer(true);
        setLoggedInCustomer(data.customer);
        setLoggedInCustomerBookings(data.bookings || []);
        setLoginPassword("");
        setLoginCnic("");
        localStorage.setItem("nomi_customer_session", JSON.stringify({
          customer: data.customer,
          bookings: data.bookings || []
        }));
      } else {
        setLoginError(data.error || "Invalid CNIC or Password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Login system offline. Please try again in a moment.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCustomerLogout = () => {
    setIsLoggedInCustomer(false);
    setLoggedInCustomer(null);
    setLoggedInCustomerBookings([]);
    localStorage.removeItem("nomi_customer_session");
  };

  const handleTrackInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchCode.replace(/\D/g, "");
    if (!cleanSearch) {
      setTrackError("Please enter a valid CNIC containing digits.");
      return;
    }

    setTrackError("");
    setTrackedBookings([]);
    setTrackSearched(false);

    try {
      // 1. Fetch from Firestore bookings collection
      const q = query(collection(db, "bookings"), where("cnic", "==", cleanSearch));
      const querySnapshot = await getDocs(q);
      const fsBookings: Booking[] = [];
      querySnapshot.forEach((docSnap) => {
        fsBookings.push({ firestoreId: docSnap.id, ...docSnap.data() } as Booking);
      });

      // 2. Fallback / Merge with legacy API tracking (if any legacy entries exist on server)
      const response = await fetch(`/api/track-cnic?cnic=${encodeURIComponent(cleanSearch)}`);
      let legacyList: Booking[] = [];
      if (response.ok) {
        legacyList = await response.json();
      }

      // 3. Fallback / Merge with local storage
      const local = JSON.parse(localStorage.getItem("nomi_bookings") || "[]") as Booking[];
      const localFiltered = local.filter(b => b.cnic && b.cnic.replace(/\D/g, "") === cleanSearch);

      // 4. Combine unique items based on id / firestoreId
      const combined = [...fsBookings];
      for (const item of legacyList) {
        if (!combined.some(b => b.id === item.id)) {
          combined.push(item);
        }
      }
      for (const item of localFiltered) {
        if (!combined.some(b => b.id === item.id || (b.firestoreId && b.firestoreId === item.firestoreId))) {
          combined.push(item);
        }
      }

      setTrackSearched(true);
      if (combined.length > 0) {
        setTrackedBookings(combined);
      } else {
        setTrackError("No order found for this CNIC.");
      }
    } catch (err) {
      console.error(err);
      setTrackError("Tracking system currently offline. Try again in a few moments!");
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    const rawCnic = appForm.cnic.replace(/\D/g, "");
    if (rawCnic.length < 13) {
      setSubmitError("Please enter a valid 13-digit CNIC number.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const generatedId = "JA-" + Math.floor(1000 + Math.random() * 9000);
    const applicationPayload = {
      id: generatedId,
      jobId: applyingJob.id,
      jobTitle: applyingJob.title,
      name: appForm.name,
      email: appForm.email,
      phone: appForm.phone,
      cnic: rawCnic,
      experience: appForm.experience || "",
      coverLetter: appForm.coverLetter || "",
      status: "Pending" as const,
      appliedDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
      const docRef = await addDoc(collection(db, "applications"), applicationPayload);
      const appWithId = { firestoreId: docRef.id, ...applicationPayload };
      
      console.log("Data:", appWithId);

      setSubmitSuccess(true);
      setAppForm({ name: "", email: "", phone: "", cnic: "", experience: "", coverLetter: "" });
      // Auto reload lists for admins if they are logged in, or just fetch active list again
      await fetchActiveJobs();
    } catch (err: any) {
      console.error(err);
      setSubmitError("Error: " + (err?.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionForm.rulesAccepted) {
      setAdmissionError("Please accept the Rules & Policies before submitting.");
      return;
    }

    setIsTransmitting(true);
    setSubmittingAdmission(true);
    setAdmissionError("");
    setAdmissionSuccess(null);

    const generatedId = "AD-" + Math.floor(1000 + Math.random() * 9000);
    const newAdmission = {
      id: generatedId,
      status: "pending",
      name: admissionForm.name.trim(),
      religion: admissionForm.religion.trim() || "",
      dob: admissionForm.dob || "",
      hobbies: admissionForm.hobbies.trim() || "",
      courseName: admissionForm.courseName,
      homeAddress: admissionForm.homeAddress.trim() || "",
      studentPhone: admissionForm.studentPhone.trim() || "",
      studentMobile: admissionForm.studentMobile.trim(),
      studentEmail: admissionForm.studentEmail.trim() || "",
      
      // Parent/Guardian
      fatherName: admissionForm.fatherName.trim() || "",
      guardianName: admissionForm.guardianName.trim() || "",
      parentOccupation: admissionForm.parentOccupation.trim() || "",
      parentMonthlyIncome: admissionForm.parentMonthlyIncome.trim() || "",
      parentPhoneOffice: admissionForm.parentPhoneOffice.trim() || "",
      parentPhone: admissionForm.parentPhone.trim() || "",
      parentBusinessAddress: admissionForm.parentBusinessAddress.trim() || "",
      parentEmail: admissionForm.parentEmail.trim() || "",

      // Rules and metadata
      rulesAccepted: !!admissionForm.rulesAccepted,
      dated: admissionForm.dated || new Date().toISOString().split("T")[0],
      signStudent: admissionForm.signStudent || "",
      signParent: admissionForm.signParent || "",
      submittedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),

      // Office Use fields
      receiptNo: "",
      receiptDate: "",
      monthlyFees: "",
      officeCourseName: admissionForm.courseName,
      admittedToGrade: "",
      registrationNo: "",
      registrarName: "",
      vicePrincipalName: "",
      principalName: ""
    };

    try {
      const docRef = await addDoc(collection(db, "admissions"), newAdmission);
      const admissionWithId = { firestoreId: docRef.id, ...newAdmission };
      
      // Fulfill Debugging log requirement
      console.log("Data:", admissionWithId);

      setAdmissionSuccess(admissionWithId);
      
      // Fulfill Try requirement: alert success
      alert("Success! Admission form submitted successfully.");

      setAdmissionForm({
        name: "",
        dob: "",
        religion: "",
        hobbies: "",
        courseName: "",
        homeAddress: "",
        studentPhone: "",
        studentMobile: "",
        studentEmail: "",
        fatherName: "",
        guardianName: "",
        parentOccupation: "",
        parentMonthlyIncome: "",
        parentPhoneOffice: "",
        parentPhone: "",
        parentBusinessAddress: "",
        parentEmail: "",
        rulesAccepted: false,
        signStudent: "",
        signParent: "",
        dated: new Date().toISOString().split("T")[0]
      });
    } catch (err: any) {
      // Fulfill Catch requirement: console.error and alert error
      console.error("Submission error details:", err);
      const errMsg = err?.message || String(err);
      alert("Error: " + errMsg);
      setAdmissionError("Error: " + errMsg);
      try {
        handleFirestoreError(err, OperationType.CREATE, "admissions");
      } catch (innerErr) {
        // Log handled error
      }
    } finally {
      // Fulfill Finally requirement: always clear transmittings
      setIsTransmitting(false);
      setSubmittingAdmission(false);
    }
  };

  const handleTrackAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = trackAdmissionId.trim();
    if (!queryStr) {
      setTrackAdmissionError("Please enter an Admission ID or mobile number.");
      return;
    }

    setTrackAdmissionError("");
    setTrackedAdmission(null);
    setTrackAdmissionSearched(false);

    try {
      const admissionsRef = collection(db, "admissions");
      let foundDoc: any = null;

      const q1 = query(admissionsRef, where("id", "==", queryStr));
      const s1 = await getDocs(q1);
      if (!s1.empty) {
        foundDoc = { firestoreId: s1.docs[0].id, ...s1.docs[0].data() };
      } else {
        const q2 = query(admissionsRef, where("studentMobile", "==", queryStr));
        const s2 = await getDocs(q2);
        if (!s2.empty) {
          foundDoc = { firestoreId: s2.docs[0].id, ...s2.docs[0].data() };
        } else {
          const q3 = query(admissionsRef, where("studentPhone", "==", queryStr));
          const s3 = await getDocs(q3);
          if (!s3.empty) {
            foundDoc = { firestoreId: s3.docs[0].id, ...s3.docs[0].data() };
          }
        }
      }

      setTrackAdmissionSearched(true);
      if (foundDoc) {
        console.log("Data:", foundDoc);
        setTrackedAdmission(foundDoc);
      } else {
        setTrackAdmissionError("No admission form matching that ID/Mobile was found.");
      }
    } catch (err: unknown) {
      console.error(err);
      setTrackAdmissionError("Tracking system offline. Please check your network connection.");
      try {
        handleFirestoreError(err, OperationType.GET, "admissions");
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render public application layout directly without any mandatory login gate
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Background sunlit glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Fixed Sticky Menu Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-slate-950 text-white border-b border-slate-800 text-xs shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap w-full md:w-auto scroll-smooth py-1">
            <button
              onClick={() => scrollToSection("section-laptops")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>🏠</span> Laptops
            </button>
            <button
              onClick={() => scrollToSection("section-accessories")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>🔌</span> Accessories
            </button>
            <button
              onClick={() => scrollToSection("section-courses")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>📚</span> Courses
            </button>
            <button
              onClick={() => scrollToSection("section-admissions")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>👨‍🎓</span> Students
            </button>
            <button
              onClick={() => scrollToSection("section-careers")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>💼</span> Jobs
            </button>
            <button
              onClick={() => scrollToSection("section-tracker")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-850 text-slate-200 hover:text-white transition-all cursor-pointer text-xs font-bold"
            >
              <span>✅</span> Verification
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider text-emerald-400 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            NOMI COMPUTERS WORKSPACE
          </div>
        </div>
      </div>

      {/* Global Navigation Header */}
      <header 
        className={`fixed top-10 inset-x-0 z-40 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-md" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Logo size={44} className="h-11 w-11 hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-slate-900 via-emerald-800 to-emerald-600 text-transparent bg-clip-text">
                NOMI COMPUTERS
              </h1>
              <span className="text-[10px] text-emerald-600 font-mono font-extrabold tracking-wider">DUNYAPUR</span>
            </div>
          </div>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => { scrollToSection("section-hero"); setActiveTab("home"); }}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("section-laptops")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Custom Laptops
            </button>
            <button 
              onClick={() => scrollToSection("section-accessories")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 hover:bg-emerald-50 text-emerald-700 transition-all cursor-pointer font-bold"
            >
              Accessories
            </button>
            <button 
              onClick={() => scrollToSection("section-courses")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              IT Academy
            </button>
            <button 
              onClick={() => scrollToSection("section-admissions")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer text-emerald-700 font-extrabold"
            >
              Online Admissions
            </button>
            <button 
              onClick={() => scrollToSection("section-careers")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Careers & Jobs
            </button>
            <button 
              onClick={() => scrollToSection("section-tracker")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Order Tracker
            </button>
            <button 
              onClick={() => scrollToSection("section-reviews")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Student Reviews
            </button>
            <button 
              onClick={() => scrollToSection("section-contact")} 
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              Contact Us
            </button>
            {isLoggedInCustomer && loggedInCustomer ? (
              <button 
                onClick={() => { scrollToSection("section-tracker"); setTrackerTab("dashboard"); }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold rounded-lg transition-all cursor-pointer ml-4 shadow-sm flex items-center gap-1.5 border border-indigo-200"
              >
                <User className="h-3 w-3" /> {loggedInCustomer.name.split(" ")[0]}'s Portal
              </button>
            ) : (
              <button 
                onClick={() => { scrollToSection("section-tracker"); setTrackerTab("login"); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all cursor-pointer ml-4 shadow-sm flex items-center gap-1.5"
              >
                <User className="h-3 w-3" /> Client Portal
              </button>
            )}

            {currentUser ? (
              <div className="relative ml-4 shrink-0">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bold text-slate-800 shadow-sm"
                >
                  <span className="h-5.5 w-5.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                    {currentUser.name.charAt(0)}
                  </span>
                  <span className="hidden lg:inline text-slate-500">Welcome, </span>
                  <span className="text-emerald-700 font-extrabold">{currentUser.name.split(" ")[0]}!</span>
                  <span className="text-[9px] text-slate-400">▼</span>
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 space-y-3 z-50 text-xs font-semibold text-slate-700"
                    >
                      <div className="pb-2 border-b border-slate-100">
                        <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">User Profile</p>
                        <h4 className="font-extrabold text-slate-900 mt-0.5 truncate">{currentUser.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-600">
                        {currentUser.phone && (
                          <div className="flex items-center gap-1.5">
                            <span>📞</span> <span>{currentUser.phone}</span>
                          </div>
                        )}
                        {currentUser.city && (
                          <div className="flex items-center gap-1.5">
                            <span>📍</span> <span className="font-bold text-emerald-700">{currentUser.city}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          localStorage.removeItem("nomi_user_session");
                          setIsAuthenticated(false);
                          setCurrentUser(null);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition-all cursor-pointer border border-rose-100 shadow-sm"
                      >
                        <LogOut className="h-3 w-3 stroke-[3px]" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-lg transition-all cursor-pointer ml-4 shadow-sm flex items-center gap-1 text-xs"
              >
                <User className="h-3.5 w-3.5" /> Sign In / Join
              </button>
            )}

            <button 
              onClick={() => setIsAdminOpen(true)} 
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-305 to-yellow-500 hover:from-amber-305 hover:to-yellow-455 text-amber-950 font-black rounded-lg transition-all cursor-pointer ml-3 shadow-md border border-amber-300 flex items-center gap-1"
            >
              <Lock className="h-3 w-3" /> Admin Portal
            </button>
          </nav>

          {/* Micro Status tag with interactive admin portal */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  Hi, {currentUser.name.split(" ")[0]}
                </span>
                <button 
                  onClick={() => {
                    localStorage.removeItem("nomi_user_session");
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                  }}
                  className="p-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-md hover:bg-rose-100 flex items-center justify-center transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5 stroke-[3px]" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[9px] font-black rounded-full shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-slate-200 text-[9px] font-bold text-slate-700 shadow-sm">
              <Clock className="h-2.5 w-2.5 text-emerald-500 animate-pulse" /> Always Open
            </div>
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[9px] font-black rounded-full shadow-sm border border-amber-300 cursor-pointer"
            >
              👑 Admin
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="section-hero" className="relative pt-[164px] md:pt-[176px] pb-20 px-4 md:px-8 text-left max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20 shadow-sm">
              <Compass className="h-3.5 w-3.5" /> G-MAPS RATED 4.2 STAR CENTER
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none bg-gradient-to-br from-slate-900 to-slate-950 bg-clip-text">
              Luxury Tech & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600">
                IT Academy
              </span> <br />
              In Dunyapur
            </h1>

            <p className="text-base text-slate-650 max-w-lg leading-relaxed font-sans font-normal">
              Empowering students near Kazmi Chowk for over a decade. We specialize in high-end customized laptops for coding, gaming, and business, while delivering Punjab's leading computer application diplomas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => scrollToSection("section-laptops")}
                className="px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-305 to-yellow-550 hover:shadow-lg hover:shadow-amber-500/20 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-103 active:scale-97 text-amber-950 border border-amber-300 shadow-sm"
              >
                Browse Laptop Stock <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => scrollToSection("section-courses")}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                Explore IT Courses <BookOpen className="h-4 w-4 text-indigo-505" />
              </button>

              <button 
                onClick={() => scrollToSection("section-admissions")}
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-600/10"
              >
                Online Admission Form <GraduationCap className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Micro Brand Metrics */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4">
              {[
                { val: "100+", label: "Verified Reviews" },
                { val: "24 Hrs", label: "Always Open" },
                { val: "100%", label: "Urdu/Eng Syllabi" }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="space-y-1"
                  onMouseEnter={() => setIsHoveredStat(i)}
                  onMouseLeave={() => setIsHoveredStat(null)}
                >
                  <p className={`text-xl font-extrabold font-mono transition-colors ${isHoveredStat === i ? "text-indigo-600" : "text-slate-900"}`}>
                    {stat.val}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gorgeous Generated Digital Display Box */}
          <div className="lg:col-span-6 w-full relative">
            <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent z-10 rounded-3xl" />
            
            <motion.div 
              className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl aspect-[16/9] lg:h-[380px] w-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={heroBannerUrl} 
                alt="Nomi Computers Storefront Banner" 
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <span className="bg-white/95 backdrop-blur-md text-[10px] text-emerald-700 font-extrabold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPEN 24 HOURS
                </span>
              </div>

              {/* Glowing caption */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-left space-y-1">
                <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest font-mono">DIGITAL CORNERSTONE OUTLET</span>
                <p className="text-lg font-black text-white leading-tight">NOMI COMPUTERS | KAZMI CHOWK</p>
                <p className="text-[11px] text-slate-200 font-medium">The crown destination for local programming hardware & academy admissions.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* BRAND VALUES TRUST BANNER */}
      <section className="py-12 bg-white border-t border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex gap-4 items-start text-left">
            <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100 text-cyan-600 shrink-0 shadow-sm">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">Board Certified Diplomas</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-sans font-normal">Our academic curricula conform to Punjab Board requirements, granting student licenses for premium remote and government desk jobs in Pakistan.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100 text-violet-600 shrink-0 shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">Jobs Forms & Advertising</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-sans font-normal">In sync with "Nomi Computers JOBS Advertising", we support our alumni with local employment applications and real-time form drafting.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 shrink-0 shadow-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">24/7 Academic Support</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-sans font-normal">We stay open 24 hours to accommodate Juma classes and weekend freelance students. Connect anytime with our digital helpdesk.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CORE MODULE 1: LAPTOP COLLECTION SHOWCASE */}
      <LaptopCatalog />

      {/* CORE MODULE 1.5: COMPUTER & LAPTOP ACCESSORIES SECTION */}
      <AccessoryCatalog />

      {/* CORE MODULE 2: ACADEMY COURSES EXPLORER */}
      <CourseAcademy />

      {/* CORE MODULE 2.2: STUDENT ONLINE ADMISSIONS PORTAL */}
      <section id="section-admissions" className="py-20 px-4 md:px-8 bg-slate-50 border-t border-slate-200/80 text-left">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-850 border border-emerald-200/60 shadow-sm uppercase font-mono tracking-wider">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-650" /> Online Admissions Desk
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Student Admission Registration Form
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Fill out our physical registry digitizer form to request a physical laboratory seat at Kazmi Chowk, Dunyapur. Sensitive fields are stored with secure military-grade database encryption.
            </p>
          </div>

          {admissionSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Elegant success banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 shadow-md">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="text-xl font-black text-slate-900">Admission Applied Successfully!</h3>
                <p className="text-xs text-slate-650 max-w-lg mx-auto leading-relaxed">
                  Your physical laboratory seat registration has been transmitted to Nomi Computers Dunyapur registrar desk. Use the registry ID tag <strong className="font-mono text-emerald-750 bg-emerald-100/50 px-2 py-0.5 rounded border border-emerald-200">{admissionSuccess.id}</strong> to track review status.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTrackAdmissionId(admissionSuccess.id);
                      setTrackerTab("admission" as any);
                      scrollToSection("section-tracker");
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    🔍 Track Official Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmissionSuccess(null)}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                  >
                    Fill Another Form
                  </button>
                </div>
              </div>

              {/* Replicate high fidelity paper layout with the success details filled and stamp */}
              <div className="relative">
                {/* Diagonally overlayed Transmitted Stamp */}
                <div className="absolute top-44 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-emerald-600 text-emerald-600 bg-white/90 px-8 py-3 rounded-none font-black text-lg tracking-widest uppercase z-20 pointer-events-none select-none opacity-90 shadow-lg">
                  Transmitted
                </div>
                <AdmissionFormPaper
                  data={admissionSuccess}
                  statusMode="success"
                  onReset={() => setAdmissionSuccess(null)}
                />
              </div>
            </motion.div>
          ) : (
            <AdmissionFormPaper
              data={admissionForm}
              isEditable={true}
              onChange={(updated) => setAdmissionForm(updated)}
              onSubmit={handleSubmitAdmission}
              isSubmitting={isTransmitting || submittingAdmission}
              error={admissionError}
            />
          )}

        </div>
      </section>

      {/* INTERACTIVE TRACKER DASHBOARD */}
      <section id="section-tracker" className="py-20 px-4 md:px-8 bg-[#f8fafc] border-t border-slate-200/80 text-left">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 p-8 rounded-3xl space-y-8 shadow-xl shadow-slate-100/40">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100/50">
                <Activity className="h-3.5 w-3.5" /> SECURE ALUMNI & ORDER GATEWAY
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {isLoggedInCustomer ? "Your Account Dashboard" : "Active Booking & Seat Tracker"}
              </h2>
              <p className="text-xs text-slate-650 leading-relaxed max-w-xl">
                {isLoggedInCustomer 
                  ? "Welcome to your personal Nomi Computers dashboard. View your active laptop preorders, IT diplomas, and physical verification updates below."
                  : "Did you submit a laptop customization preorder or a computer class registration? Track your status using CNIC or log in to view your account dashboard!"
                }
              </p>
            </div>

            {/* Logout button or quick badge if logged in */}
            {isLoggedInCustomer && loggedInCustomer && (
              <button
                onClick={handleCustomerLogout}
                className="px-4 py-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <LogOut className="h-3 w-3" /> Log Out
              </button>
            )}
          </div>

          {/* Tab Selection (only if not logged in) */}
          {!isLoggedInCustomer && (
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTrackerTab("track");
                  setTrackError("");
                }}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  trackerTab === "track"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-850"
                }`}
              >
                🔍 Search & Track Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackerTab("login");
                  setLoginError("");
                }}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  trackerTab === "login"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-850"
                }`}
              >
                🔐 Customer Portal Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackerTab("admission" as any);
                  setTrackAdmissionError("");
                }}
                className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  trackerTab === ("admission" as any)
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-850"
                }`}
              >
                📝 Admissions Status
              </button>
            </div>
          )}

          {isLoggedInCustomer && loggedInCustomer ? (
            <div className="space-y-6">
              {/* Profile Card banner */}
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-sky-50 rounded-2xl border border-indigo-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-600 tracking-wider uppercase">Active Client Member</span>
                  <h3 className="text-xl font-extrabold text-slate-900">As-salamu alaykum, {loggedInCustomer.name}!</h3>
                  <p className="text-xs text-slate-650">Registered CNIC: <strong className="font-mono">{loggedInCustomer.cnic}</strong> | Contact: <strong className="font-mono">{loggedInCustomer.phone}</strong></p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-indigo-100 shadow-sm text-center shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block text-left md:text-center">Total Bookings</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono">{loggedInCustomerBookings.length}</span>
                </div>
              </div>

              {/* List of bookings */}
              <div className="space-y-6">
                {loggedInCustomerBookings.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-sm font-semibold text-slate-500">No active bookings found for your account.</p>
                    <p className="text-xs text-slate-400 mt-1">Please preorder a customized laptop or enroll in our computer courses to get started.</p>
                  </div>
                ) : (
                  loggedInCustomerBookings.map((booking) => {
                    const isPending = booking.status?.toLowerCase().includes("pending");
                    const isDelivered = booking.status?.toLowerCase().includes("delivered") || booking.status?.toLowerCase().includes("completed") || booking.status?.toLowerCase().includes("verified");
                    const isShipped = booking.status?.toLowerCase().includes("shipped") || booking.status?.toLowerCase().includes("scheduled");

                    return (
                      <div
                        key={booking.id}
                        className="bg-slate-50 rounded-2xl border border-slate-200/85 p-6 space-y-6"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">REGISTRATION SOURCE ID</span>
                            <p className="text-sm font-extrabold text-indigo-700 font-mono">{booking.id}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-left">ALLOCATED OBJECT</span>
                            <p className="text-sm font-bold text-violet-700 text-left">{booking.item}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-left md:text-right">DATE SUBMITTED</span>
                            <p className="text-sm font-bold text-slate-800 text-left md:text-right font-mono">{booking.date || "Today"}</p>
                          </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-700">Ledger Verification Checklist</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                              <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-650 flex items-center justify-center text-xs shrink-0 pt-0.5 font-bold animate-pulse">✓</div>
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-slate-800 leading-none">1. Web Receipt</h4>
                                <p className="text-[10px] text-slate-500 mt-1">Successfully logged</p>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 pt-0.5 font-bold ${
                                isPending 
                                  ? "bg-amber-50 border border-amber-500 text-amber-600 animate-pulse" 
                                  : "bg-emerald-50 border border-emerald-500 text-emerald-650"
                              }`}>
                                {isPending ? "●" : "✓"}
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-slate-800 leading-none">2. Office call</h4>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {isPending ? "Pending verification" : "Verification completed"}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                                isDelivered 
                                  ? "bg-emerald-50 border border-emerald-500 text-emerald-650" 
                                  : isShipped 
                                    ? "bg-sky-50 border border-sky-500 text-sky-600 animate-pulse" 
                                    : "bg-slate-100 border border-slate-200 text-slate-450"
                              }`}>
                                {isDelivered ? "✓" : isShipped ? "●" : "3"}
                              </div>
                              <div className="text-left">
                                <h4 className={`text-xs font-bold leading-none ${
                                  isDelivered || isShipped ? "text-slate-800" : "text-slate-400"
                                }`}>
                                  3. Handover / Batch
                                </h4>
                                <p className={`text-[10px] mt-1 ${
                                  isDelivered ? "text-emerald-600 font-medium" : isShipped ? "text-sky-600 font-medium" : "text-slate-400"
                                }`}>
                                  {isDelivered ? "Delivered / Active Student" : isShipped ? "Shipped / Scheduled" : "Awaiting verification"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-xs shadow-sm">
                          <div className="space-y-1.5">
                            <p className="text-slate-600 max-w-lg leading-relaxed"><strong className="text-slate-800 font-bold">Customizations/Diplomas note:</strong> {booking.details || "Inquiry on file."}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">STATUS BADGE:</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${
                                isDelivered 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                  : isShipped 
                                    ? "bg-sky-50 border-sky-200 text-sky-700" 
                                    : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}>
                                {booking.status || "Pending VerifiedAtOffice"}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`https://wa.me/923007303000?text=Assalam-o-Alaikum%20Nomi%20Computers!%20I%20am%20tracking%20my%20order%20ID%20${booking.id}%20from%20your%20website.%20Please%20verify%2520my%20current%20status.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          >
                            Ping WhatsApp Admin
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : trackerTab === "login" ? (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-550 uppercase font-mono block">CNIC Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginCnic}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 13) {
                            let formatted = val;
                            if (val.length > 5 && val.length <= 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
                            } else if (val.length > 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
                            }
                            setLoginCnic(formatted);
                          }
                        }}
                        placeholder="e.g., 35201-1234567-1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                      />
                      {loginCnic && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                          {loginCnic.replace(/\D/g, "").length}/13 Digits
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-550 uppercase font-mono block">Secret Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                    <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading || loginCnic.replace(/\D/g, "").length < 13 || loginPassword.length < 6}
                  className={`w-full py-3.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-white ${
                    loginLoading || loginCnic.replace(/\D/g, "").length < 13 || loginPassword.length < 6
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-850 hover:scale-[1.01] active:scale-[0.99] shadow-indigo-600/10"
                  }`}
                >
                  {loginLoading ? "Verifying Credentials..." : "Sign In to Account"}
                </button>
              </form>

              <p className="text-[11px] text-slate-500 leading-normal text-center">
                *Need an account? Complete a laptop customization preorder or a computer class enrollment on this site. Your CNIC and password will be saved as your credentials.
              </p>
            </div>
          ) : trackerTab === ("admission" as any) ? (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleTrackAdmission} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={trackAdmissionId}
                    onChange={(e) => setTrackAdmissionId(e.target.value)}
                    placeholder="Enter Admission ID (e.g. AD-1234) or Student Mobile No."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Verify Status
                </button>
              </form>

              {trackAdmissionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                  <p className="text-xs text-rose-600 font-semibold">{trackAdmissionError}</p>
                </div>
              )}

              {trackAdmissionSearched && trackedAdmission && (
                <div className="space-y-6 animate-fade-in pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-indigo-50 border border-indigo-150 p-4 rounded-2xl shadow-sm">
                    <div className="text-left">
                      <h4 className="text-xs font-black text-indigo-850 uppercase tracking-wider font-mono">Admission Record Verified</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Below is the digitized physical twin showing official assignments and stamps on the record.</p>
                    </div>
                    <a
                      href={`https://wa.me/923007303000?text=Assalam-o-Alaikum%20Nomi%20Computers!%20I%20am%20inquiring%20about%2520my%20Student%20Admission%20ID%20${trackedAdmission.id}.%20Please%20provide%20academic%20schedule.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <Phone className="h-3 w-3" /> Contact Coordinator
                    </a>
                  </div>

                  {/* Replicate high fidelity paper layout with verified details filled and stamp */}
                  <div className="relative">
                    {/* Status Stamp based on record status */}
                    {(trackedAdmission.status?.toLowerCase() === "approved" || trackedAdmission.status?.toLowerCase() === "verified" || !!trackedAdmission.registrationNo || !!trackedAdmission.receiptNo) ? (
                      <div className="absolute top-44 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-emerald-600 text-emerald-600 bg-white/95 px-6 py-3 rounded-none font-black text-sm tracking-widest uppercase z-20 pointer-events-none select-none opacity-95 shadow-lg text-center leading-tight">
                        ADMISSION APPROVED<br/>
                        <span className="text-[10px] font-bold">ENROLLED</span>
                      </div>
                    ) : (
                      <div className="absolute top-44 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-amber-500 text-amber-600 bg-white/95 px-6 py-3 rounded-none font-black text-sm tracking-widest uppercase z-20 pointer-events-none select-none opacity-95 shadow-lg text-center leading-tight">
                        REVIEWING SEAT<br/>
                        <span className="text-[10px] font-bold">AWAITING OFFICE SIGN</span>
                      </div>
                    )}

                    <AdmissionFormPaper
                      data={trackedAdmission}
                      statusMode="tracked"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleTrackInquiry} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={searchCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 13) {
                        let formatted = val;
                        if (val.length > 5 && val.length <= 12) {
                          formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
                        } else if (val.length > 12) {
                          formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
                        }
                        setSearchCode(formatted);
                      }
                    }}
                    placeholder="Enter CNIC (e.g., 35201-1234567-1)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-450"
                  />
                  {searchCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                      {searchCode.replace(/\D/g, "").length}/13 Digits
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searchCode.replace(/\D/g, "").length < 13}
                  className={`px-6 py-3.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-white ${
                    searchCode.replace(/\D/g, "").length < 13
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:scale-[1.01] active:scale-[0.99] shadow-indigo-600/10"
                  }`}
                >
                  Track Order
                </button>
              </form>

              {trackError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                  <p className="text-xs text-rose-600 font-semibold">{trackError}</p>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC PROGRESS MATRIX */}
          <AnimatePresence>
            {!isLoggedInCustomer && trackerTab === "track" && trackSearched && trackedBookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 animate-fade-in"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                    Found {trackedBookings.length} Active Record{trackedBookings.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    CNIC: {searchCode}
                  </span>
                </div>

                {trackedBookings.map((booking) => {
                  const isPending = booking.status?.toLowerCase().includes("pending");
                  const isDelivered = booking.status?.toLowerCase().includes("delivered") || booking.status?.toLowerCase().includes("completed") || booking.status?.toLowerCase().includes("verified");
                  const isShipped = booking.status?.toLowerCase().includes("shipped") || booking.status?.toLowerCase().includes("scheduled");

                  return (
                    <div
                      key={booking.id}
                      className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">REGISTRATION SOURCE ID</span>
                          <p className="text-sm font-extrabold text-indigo-700 font-mono">{booking.id}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-left md:text-right">CLIENT CONTACT</span>
                          <p className="text-sm font-bold text-slate-800 text-left md:text-right">{booking.name} ({booking.phone})</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-left md:text-right">ALLOCATED OBJECT</span>
                          <p className="text-sm font-bold text-violet-700 text-left md:text-right">{booking.item}</p>
                        </div>
                      </div>

                      {/* Progress Indicators */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-700">Ledger Verification Checklist</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                            <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-650 flex items-center justify-center text-xs shrink-0 pt-0.5 font-bold">✓</div>
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-slate-800 leading-none">1. Web Receipt</h4>
                              <p className="text-[10px] text-slate-500 mt-1">Successfully logged</p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 pt-0.5 font-bold ${
                              isPending 
                                ? "bg-amber-50 border border-amber-500 text-amber-600 animate-pulse" 
                                : "bg-emerald-50 border border-emerald-500 text-emerald-650"
                            }`}>
                              {isPending ? "●" : "✓"}
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-slate-800 leading-none">2. Office call</h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {isPending ? "Pending verification" : "Verification completed"}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                              isDelivered 
                                ? "bg-emerald-50 border border-emerald-500 text-emerald-650" 
                                : isShipped 
                                  ? "bg-sky-50 border border-sky-500 text-sky-600 animate-pulse" 
                                  : "bg-slate-100 border border-slate-200 text-slate-400"
                            }`}>
                              {isDelivered ? "✓" : isShipped ? "●" : "3"}
                            </div>
                            <div className="text-left">
                              <h4 className={`text-xs font-bold leading-none ${
                                isDelivered || isShipped ? "text-slate-800" : "text-slate-400"
                              }`}>
                                3. Handover / Batch
                              </h4>
                              <p className={`text-[10px] mt-1 ${
                                isDelivered ? "text-emerald-600 font-medium" : isShipped ? "text-sky-600 font-medium" : "text-slate-400"
                              }`}>
                                {isDelivered ? "Delivered / Active Student" : isShipped ? "Shipped / Scheduled" : "Awaiting verification"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-xs shadow-sm">
                        <div className="space-y-1.5">
                          <p className="text-slate-600">Logged on date: <span className="font-mono text-slate-800 text-xs">{booking.date || "Today"}</span></p>
                          <p className="text-slate-650 max-w-lg leading-relaxed"><strong className="text-slate-800">Customizations/Diplomas note:</strong> {booking.details || "Inquiry on file."}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">STATUS BADGE:</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${
                              isDelivered 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                : isShipped 
                                  ? "bg-sky-50 border-sky-200 text-sky-700" 
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              {booking.status || "Pending VerifiedAtOffice"}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/923007303000?text=Assalam-o-Alaikum%20Nomi%20Computers!%20I%20am%20tracking%20my%20order%20ID%20${booking.id}%20from%20your%20website.%20Please%20verify%20my%20current%20status.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                        >
                          Ping WhatsApp Admin
                        </a>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* CORE MODULE 2.5: CAREERS & JOB VACANCIES SECTION */}
      <section id="section-careers" className="py-20 px-4 md:px-8 bg-white border-t border-slate-200/85 text-left relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-850 border border-amber-200/50 shadow-sm uppercase font-mono tracking-wider">
              <Briefcase className="h-3.5 w-3.5 text-amber-650" /> JOIN THE NOMI COMPUTERS CREW
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Available Jobs & Careers
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              We are expanding our technical team near Kazmi Chowk Dunyapur! Browse our open positions below, submit your professional credentials, and fast-track your IT career.
            </p>
          </div>

          {loadingJobs ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">Loading active openings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl py-16 text-center space-y-3 max-w-xl mx-auto">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="font-extrabold text-slate-805">No Open Roles At This Second</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">We are currently fully staffed! However, feel free to drop by Ajmery City Plaza with your resume for future consideration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-slate-50 border border-slate-200/80 hover:border-amber-400 hover:bg-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all duration-305"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{job.department}</span>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">{job.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{job.location}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed font-sans">{job.description}</p>

                    {/* Requirements summary */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Job Requirements</h4>
                        <ul className="space-y-1">
                          {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="text-amber-500 shrink-0 font-bold">•</span>
                              <span className="line-clamp-1">{req}</span>
                            </li>
                          ))}
                          {job.requirements.length > 3 && (
                            <li className="text-[10px] text-indigo-600 font-bold italic pl-3">+ {job.requirements.length - 3} more requirements</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {job.salaryRange && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold text-slate-550">Salary: <strong className="text-indigo-600 font-extrabold">{job.salaryRange}</strong></p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setApplyingJob(job);
                      setSubmitSuccess(false);
                      setSubmitError("");
                      setAppForm({ name: "", email: "", phone: "", cnic: "", experience: "", coverLetter: "" });
                      // Smooth scroll down to form
                      setTimeout(() => {
                        const formElem = document.getElementById("job-apply-form");
                        if (formElem) {
                          formElem.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 100);
                    }}
                    className="w-full py-2.5 bg-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-slate-950 text-slate-700 hover:border-transparent border border-slate-250 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    Apply For This Position <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* DYNAMIC APPLICATION FORM CONTAINER */}
          <AnimatePresence>
            {applyingJob && (
              <motion.div
                id="job-apply-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden"
              >
                {/* Visual accent */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />

                <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-200 text-slate-705 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Candidate Portal</span>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-none animate-fade-in">Application: {applyingJob.title}</h3>
                    <p className="text-xs text-slate-500">{applyingJob.department} • {applyingJob.location}</p>
                  </div>
                  <button 
                    onClick={() => setApplyingJob(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl bg-white border border-slate-200 cursor-pointer shadow-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="py-12 text-center space-y-4 animate-fade-in"
                  >
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-200">
                      ✓
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="font-extrabold text-slate-900 text-base">Application Submitted Successfully!</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Thank you for applying for the <strong>{applyingJob.title}</strong> role. Our recruitment desk near Kazmi Chowk Dunyapur will review your credentials and get back to you shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setApplyingJob(null)}
                      className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Close Form
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Your Full Name</label>
                        <input
                          type="text" required
                          value={appForm.name}
                          onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                          placeholder="e.g. Muhammad Ali"
                          className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Email Address</label>
                        <input
                          type="email" required
                          value={appForm.email}
                          onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                          placeholder="e.g. ali@gmail.com"
                          className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Phone / WhatsApp Number</label>
                        <input
                          type="tel" required
                          value={appForm.phone}
                          onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                          placeholder="e.g. 0300-1234567"
                          className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">National Identity (CNIC) Number</label>
                        <div className="relative">
                          <input
                            type="text" required
                            value={appForm.cnic}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              if (val.length <= 13) {
                                let formatted = val;
                                if (val.length > 5 && val.length <= 12) {
                                  formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
                                } else if (val.length > 12) {
                                  formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
                                }
                                setAppForm({ ...appForm, cnic: formatted });
                              }
                            }}
                            placeholder="35201-1234567-1"
                            className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                          />
                          {appForm.cnic && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                              {appForm.cnic.replace(/\D/g, "").length}/13 Digits
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block">Education & Experience Summary</label>
                      <textarea
                        required
                        value={appForm.experience}
                        onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                        placeholder="Detail your degree (e.g. BSCS, DAE) and computer repair or tutoring experience..."
                        rows={3}
                        className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block">Short Candidate Pitch (Why join Nomi Computers?)</label>
                      <textarea
                        value={appForm.coverLetter}
                        onChange={(e) => setAppForm({ ...appForm, coverLetter: e.target.value })}
                        placeholder="Tell us why you are the best fit for our Dunyapur branch tech crew..."
                        rows={2}
                        className="w-full bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-450 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                        <p className="text-xs text-rose-600 font-semibold">{submitError}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setApplyingJob(null)}
                        className="px-5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || appForm.cnic.replace(/\D/g, "").length < 13}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer text-white ${
                          submitting || appForm.cnic.replace(/\D/g, "").length < 13
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-400 via-amber-305 to-yellow-500 hover:from-amber-305 hover:to-yellow-555 text-slate-950 border border-amber-300 shadow-sm animate-pulse-fast"
                        }`}
                      >
                        {submitting ? "Transmitting Profile..." : "Submit Application"}
                      </button>
                    </div>

                  </form>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* CORE MODULE 3: ALUMNI REVIEWS BAR */}
      <ReviewSection />

      {/* CONTACT & MAP CARD SECTION */}
      <section id="section-contact" className="py-16 px-4 md:px-8 bg-slate-100/30 border-t border-slate-200 text-left">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visit Our Showroom & Lab</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
              We are located in Ajmery City Plaza, near Kazmi Chowk, Railway Road in Dunyapur, Pakistan. Stop by anytime for laptop checkups or academy enrollments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Map Representation Card */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">PHYSICAL POSITION DESIGNATION</span>
                <h3 className="text-lg font-bold text-slate-800">Ajmery City Mobile Plaza, Railway Road Dunyapur</h3>
              </div>

              {/* Vectorized custom local Pakistan map render */}
              <div className="relative h-64 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-inner">
                <div className="absolute inset-0 bg-slate-100 opacity-30 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Visual landmark pin chart */}
                <div className="relative space-y-4">
                  <div className="p-3 bg-white border border-slate-250 hover:border-indigo-500/50 rounded-2xl shadow-md flex items-center gap-3 max-w-xs transition-colors">
                    <div className="h-5 w-5 rounded-full bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold text-xs">P</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase text-left leading-none">Railway Road</h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-sans text-left">Connects Dunyapur Bazaar</p>
                    </div>
                  </div>

                  <div className="translate-x-12 p-4 bg-gradient-to-r from-cyan-600 to-indigo-650 text-white rounded-3xl shadow-xl flex items-center gap-3 relative max-w-xs border border-indigo-400/20">
                    <div className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-cyan-400 animate-ping" />
                    <MapPin className="h-5 w-5 text-white shrink-0" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold leading-none">Nomi Computers</h4>
                      <p className="text-[10px] text-cyan-100 mt-1 font-sans">Ajmery City Mobile Plaza</p>
                    </div>
                  </div>

                  <div className="-translate-x-4 p-3 bg-white border border-slate-250 hover:border-indigo-500/50 rounded-2xl shadow-md flex items-center gap-3 max-w-xs transition-colors">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs font-mono">C</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase text-left leading-none">Kazmi Chowk</h4>
                      <p className="text-[9px] text-slate-500 mt-1 text-left">Major intersection milestone</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-200 text-[9px] font-mono font-bold text-slate-500 uppercase shadow-sm">
                  Dunyapur Local Map Guide
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://maps.google.com/?q=Ajmery+city+Mobile+Plaza,+near+Kazmi+Chowk,+Dunyapur,+59120"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-rose-500" /> Open on Google Maps
                </a>
                <a
                  href="https://wa.me/923007303000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15 transition-all"
                >
                  <Phone className="h-4 w-4" /> Message Direct Admin
                </a>
              </div>
            </div>

            {/* Quick Inquiry / Contact numbers Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              
              <div className="bg-white border border-slate-200 p-6 rounded-3xl flex-1 space-y-4 shadow-sm text-left">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">Dunyapur Office Desk</span>
                <h3 className="text-xl font-extrabold text-slate-850">We are Always Open</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
                  Our physical doors are always open Juma weekends as well for freelancers and professionals. Drop a WhatsApp or call for immediate laptop configuration queries or admissions board reservations.
                </p>

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex gap-3 items-center text-xs">
                    <Smartphone className="h-4.5 w-4.5 text-indigo-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Direct Call Hotline</p>
                      <a href="tel:03007303000" className="text-slate-800 hover:text-indigo-600 font-extrabold transition-colors">0300 7303000</a>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center text-xs">
                    <Phone className="h-4.5 w-4.5 text-indigo-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WhatsApp Hotline</p>
                      <a href="https://wa.me/923007303000" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-extrabold transition-colors">+92 300 7303000</a>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center text-xs">
                    <Clock className="h-4.5 w-4.5 text-indigo-600" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard Shifts</p>
                      <p className="text-slate-650">Open 24 Hours (7 Days/Week)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Luxury mini badge card */}
              <div className="bg-gradient-to-r from-violet-50 via-slate-50 to-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                  ★
                </div>
                <div className="text-xs text-left">
                  <h4 className="font-extrabold text-slate-900">Punjab Technical Board Syllabus Available</h4>
                  <p className="text-slate-600 text-[11px] leading-snug mt-0.5">Government valid qualifications certification choices are processed via our Kazmi Chowk board registry.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size={28} className="h-7 w-7" />
            <p className="font-semibold text-slate-700 uppercase tracking-wide">
              NOMI COMPUTERS Dunyapur — Established Workspace
            </p>
          </div>
          <p className="text-[11px] text-slate-505 font-sans font-normal">
            © 2026 Nomi Computers. All Rights Reserved. Near Kazmi Chowk Dunyapur, Pakistan, 59120. Developed in full-stack workspace.
          </p>
        </div>
      </footer>

      {/* Floating AI Smart Advisor Chat Widget */}
      <AdvisorChat />

      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel 
            onClose={() => setIsAdminOpen(false)} 
            onRefreshCatalog={() => {
              // Refresh catalogs on stock change
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all z-50 cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
              
              <div className="max-h-[85vh] overflow-y-auto">
                <AuthWall 
                  onLoginSuccess={(user) => {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                    setShowAuthModal(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

