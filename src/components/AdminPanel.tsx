import React, { useState, useEffect } from "react";
import { Laptop, Course, Booking, Job, JobApplication, Admission, Accessory } from "../types";
import { 
  Lock, Unlock, Settings, Trash2, Edit3, Plus, X, 
  Laptop as LaptopIcon, BookOpen, ClipboardList, CheckCircle2, 
  Trash, DollarSign, Image as ImageIcon, Save, LogOut, Check, RefreshCw,
  Briefcase, Users, Mail, Phone, FileText, Tag
} from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface AdminPanelProps {
  onClose: () => void;
  onRefreshCatalog: () => void;
}

export default function AdminPanel({ onClose, onRefreshCatalog }: AdminPanelProps) {
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"laptops" | "accessories" | "courses" | "bookings" | "jobs" | "applications" | "admissions">("bookings");

  // Dynamic lists from backend
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [admissionRequests, setAdmissionRequests] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);

  // Add/Edit Modals or Forms
  const [laptopForm, setLaptopForm] = useState<Partial<Laptop> | null>(null);
  const [accessoryForm, setAccessoryForm] = useState<Partial<Accessory> | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<Course> | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job> | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Read saved session
  useEffect(() => {
    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");
    if (savedEmail === "bhindersame48@gmail.com" && savedPass === "DrLaibaTariq928!") {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch lists
  const fetchAllData = async () => {
    const savedEmail = localStorage.getItem("nomi_admin_email") || email;
    const savedPass = localStorage.getItem("nomi_admin_pass") || password;

    if (!savedEmail || !savedPass) return;

    setLoading(true);
    try {
      // Fetch laptops, accessories, courses, and jobs in parallel (admissions, bookings, and applications are real-time synced)
      const [resLaps, resAccs, resCourses, resJobs] = await Promise.all([
        fetch("/api/laptops"),
        fetch("/api/accessories"),
        fetch("/api/courses"),
        fetch("/api/jobs")
      ]);

      if (resLaps.ok) {
        const data = await resLaps.json();
        setLaptops(data);
      }
      if (resAccs.ok) {
        const data = await resAccs.json();
        setAccessories(data);
      }
      if (resCourses.ok) {
        const data = await resCourses.json();
        setCourses(data);
      }
      if (resJobs.ok) {
        const data = await resJobs.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to load admin data state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn]);

  // Real-time Firestore synchronizer for Admissions list
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = onSnapshot(
      collection(db, "admissions"),
      (snapshot) => {
        const allAdmissions: Admission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Admission, "id" | "firestoreId">;
          allAdmissions.push({
            firestoreId: docSnap.id,
            ...data,
          } as Admission);
        });

        // Debugging logging as requested
        console.log("Data:", allAdmissions);

        // Split admissions into Pending Requests and Enrolled Database
        const pending = allAdmissions.filter((adm) => adm.status === "pending");
        const approved = allAdmissions.filter((adm) => adm.status !== "pending");

        setAdmissionRequests(pending);
        setAdmissions(approved);
      },
      (error) => {
        console.error("Error listening to admissions:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, "admissions");
        } catch (innerErr) {
          // Log handled error
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  // Real-time Firestore synchronizer for Bookings list
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const allBookings: Booking[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Booking, "id" | "firestoreId">;
          allBookings.push({
            firestoreId: docSnap.id,
            ...data,
          } as Booking);
        });

        // Debugging logging as requested
        console.log("Data:", allBookings);
        setBookings(allBookings);
      },
      (error) => {
        console.error("Error listening to bookings:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, "bookings");
        } catch (innerErr) {
          // Log handled error
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  // Real-time Firestore synchronizer for Job Applications list
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = onSnapshot(
      collection(db, "applications"),
      (snapshot) => {
        const allApps: JobApplication[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<JobApplication, "id" | "firestoreId">;
          allApps.push({
            firestoreId: docSnap.id,
            ...data,
          } as JobApplication);
        });

        // Debugging logging as requested
        console.log("Data:", allApps);
        setApplications(allApps);
      },
      (error) => {
        console.error("Error listening to applications:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, "applications");
        } catch (innerErr) {
          // Log handled error
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("nomi_admin_email", email);
        localStorage.setItem("nomi_admin_pass", password);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || "Invalid Security Email or Key parameter.");
      }
    } catch (err) {
      setLoginError("Offline backend simulation mismatch. Retry.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nomi_admin_email");
    localStorage.removeItem("nomi_admin_pass");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  // ---------------- LAPTOP CRUD ACTIONS ----------------
  const handleSaveLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laptopForm) return;

    setActionLoading(true);
    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    const isEdit = !!laptopForm.id;
    const url = isEdit ? `/api/laptops/${laptopForm.id}` : "/api/laptops";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        },
        body: JSON.stringify(laptopForm),
      });

      if (response.ok) {
        setLaptopForm(null);
        await fetchAllData();
        onRefreshCatalog();
      } else {
        const errData = await response.json();
        alert(`Error executing laptop database save: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLaptop = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this laptop from stock?")) return;

    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    try {
      const response = await fetch(`/api/laptops/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        }
      });

      if (response.ok) {
        await fetchAllData();
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- ACCESSORY CRUD ACTIONS ----------------
  const handleSaveAccessory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessoryForm) return;

    setActionLoading(true);
    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    const isEdit = !!accessoryForm.id;
    const url = isEdit ? `/api/accessories/${accessoryForm.id}` : "/api/accessories";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        },
        body: JSON.stringify(accessoryForm),
      });

      if (response.ok) {
        setAccessoryForm(null);
        await fetchAllData();
        onRefreshCatalog();
      } else {
        const errData = await response.json();
        alert(`Error executing accessory database save: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccessory = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this accessory item from catalog?")) return;

    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    try {
      const response = await fetch(`/api/accessories/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        }
      });

      if (response.ok) {
        await fetchAllData();
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- COURSE CRUD ACTIONS ----------------
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm) return;

    setActionLoading(true);
    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    const isEdit = !!courseForm.id;
    const url = isEdit ? `/api/courses/${courseForm.id}` : "/api/courses";
    const method = isEdit ? "PUT" : "POST";

    // Format fields
    const syllabusArray = typeof courseForm.syllabus === "string" 
      ? (courseForm.syllabus as string).split(",").map(s => s.trim()).filter(Boolean) 
      : courseForm.syllabus;

    const skillsArray = typeof courseForm.skillsGained === "string" 
      ? (courseForm.skillsGained as string).split(",").map(s => s.trim()).filter(Boolean) 
      : courseForm.skillsGained;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        },
        body: JSON.stringify({
          ...courseForm,
          syllabus: syllabusArray,
          skillsGained: skillsArray
        }),
      });

      if (response.ok) {
        setCourseForm(null);
        await fetchAllData();
        onRefreshCatalog();
      } else {
        const errData = await response.json();
        alert(`Error executing course database save: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course from the academy catalog?")) return;

    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        }
      });

      if (response.ok) {
        await fetchAllData();
        onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- BOOKING ACTIONS ----------------
  const handleUpdateBookingStatus = async (booking: Booking, nextStatus: string) => {
    if (!booking.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      return;
    }
    try {
      await updateDoc(doc(db, "bookings", booking.firestoreId), { status: nextStatus });
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to update status in Firestore.");
      try {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!confirm("Are you sure you want to discard this booking registry entry? This cannot be undone.")) return;
    if (!booking.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      return;
    }
    try {
      await deleteDoc(doc(db, "bookings", booking.firestoreId));
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to delete booking in Firestore.");
      try {
        handleFirestoreError(err, OperationType.DELETE, `bookings/${booking.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  // ---------------- ADMISSIONS ACTIONS ----------------
  const handleSaveAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setActionLoading(true);

    if (!selectedAdmission.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      setActionLoading(false);
      return;
    }

    const isPending = selectedAdmission.status === "pending";
    const updatedStatus = isPending ? "approved" : selectedAdmission.status || "approved";

    try {
      const { firestoreId, ...dataToSave } = selectedAdmission;
      const payload = {
        ...dataToSave,
        status: updatedStatus
      };

      await updateDoc(doc(db, "admissions", firestoreId), payload);
      setSelectedAdmission(null);
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to save admission record to Firestore.");
      try {
        handleFirestoreError(err, OperationType.UPDATE, `admissions/${selectedAdmission.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmission = async (adm: Admission, isPending: boolean) => {
    if (!confirm(`Are you sure you want to completely discard this ${isPending ? "pending " : ""}student admission form record? This action cannot be undone.`)) return;

    if (!adm.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      return;
    }

    try {
      await deleteDoc(doc(db, "admissions", adm.firestoreId));
      if (selectedAdmission?.firestoreId === adm.firestoreId) {
        setSelectedAdmission(null);
      }
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to discard admission record from Firestore.");
      try {
        handleFirestoreError(err, OperationType.DELETE, `admissions/${adm.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  // ---------------- JOBS CRUD ACTIONS ----------------
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm) return;

    setActionLoading(true);
    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    const isEdit = !!jobForm.id;
    const url = isEdit ? `/api/jobs/${jobForm.id}` : "/api/jobs";
    const method = isEdit ? "PUT" : "POST";

    const requirementsArray = typeof jobForm.requirements === "string"
      ? (jobForm.requirements as string).split("\n").map(r => r.trim()).filter(Boolean)
      : jobForm.requirements || [];

    const responsibilitiesArray = typeof jobForm.responsibilities === "string"
      ? (jobForm.responsibilities as string).split("\n").map(r => r.trim()).filter(Boolean)
      : jobForm.responsibilities || [];

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        },
        body: JSON.stringify({
          ...jobForm,
          requirements: requirementsArray,
          responsibilities: responsibilitiesArray
        }),
      });

      if (response.ok) {
        setJobForm(null);
        await fetchAllData();
      } else {
        const errData = await response.json();
        alert(`Error executing job database save: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this job opening?")) return;

    const savedEmail = localStorage.getItem("nomi_admin_email");
    const savedPass = localStorage.getItem("nomi_admin_pass");

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": savedEmail || "",
          "x-admin-password": savedPass || "",
        }
      });

      if (response.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- APPLICATIONS ACTIONS ----------------
  const handleUpdateAppStatus = async (app: JobApplication, nextStatus: string) => {
    if (!app.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      return;
    }
    try {
      await updateDoc(doc(db, "applications", app.firestoreId), { status: nextStatus });
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to update status in Firestore.");
      try {
        handleFirestoreError(err, OperationType.UPDATE, `applications/${app.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  const handleDeleteApp = async (app: JobApplication) => {
    if (!confirm("Are you sure you want to discard this application? This cannot be undone.")) return;
    if (!app.firestoreId) {
      alert("Error: Missing Firestore document ID.");
      return;
    }
    try {
      await deleteDoc(doc(db, "applications", app.firestoreId));
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to delete application in Firestore.");
      try {
        handleFirestoreError(err, OperationType.DELETE, `applications/${app.firestoreId}`);
      } catch (innerErr) {
        // Log handled error
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        
        {/* Header Ribbon bar */}
        <div className="bg-gradient-to-r from-amber-500 via-slate-900 to-slate-950 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center font-bold shadow-sm">
              👑
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none">NOMI COMPUTERS ADMIN OFFICE</h2>
              <p className="text-[10px] text-amber-305 font-mono mt-1 font-bold">Authenticated Command Station</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LOG IN FORM GATING SYSTEM */}
        {!isLoggedIn ? (
          <div className="p-8 max-w-md mx-auto w-full my-12 text-left space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto mb-2 shadow-sm animate-pulse">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Admin Authentication Gateway</h3>
              <p className="text-xs text-slate-500">Kindly enter the private administrator credentials below to access catalogs and student reservations.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-sans">Administrator Email</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bhindersame48@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-amber-450"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-sans">Security Password Key</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-amber-450"
                />
              </div>

              {loginError && (
                <p className="p-3 bg-red-50 text-red-650 text-[11px] font-semibold rounded-lg border border-red-100">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-350 to-yellow-500 hover:from-amber-350 hover:to-yellow-405 text-amber-950 text-xs font-black rounded-xl shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? "Authorizing terminal..." : "Authorize Portal Access"}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED REAL-TIME PANEL LAYOUT */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Control bar with golden color accent buttons */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "bookings"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  📥 Secure Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("laptops")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "laptops"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  💻 Laptops ({laptops.length})
                </button>
                <button
                  onClick={() => setActiveTab("accessories")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "accessories"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🔌 Accessories ({accessories.length})
                </button>
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "courses"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  🎓 Courses ({courses.length})
                </button>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "jobs"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  💼 Jobs ({jobs.length})
                </button>
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "applications"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  👥 Applications ({applications.length})
                </button>
                <button
                  onClick={() => setActiveTab("admissions")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    activeTab === "admissions"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  📝 Admission/Verification ({admissionRequests.length + admissions.length})
                </button>
              </div>

              <div className="flex gap-1.5 items-center justify-end">
                <button
                  onClick={fetchAllData}
                  disabled={loading}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Reload lists"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
                </button>
                
                {activeTab === "laptops" && (
                  <button
                    onClick={() => setLaptopForm({ brand: "HP", condition: "Like New", category: "Student Budget", pricePKR: 55000, popular: false })}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-450 to-amber-500 hover:from-amber-350 hover:to-amber-450 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Plus className="h-4.5 w-4.5" /> Stock Laptop
                  </button>
                )}

                {activeTab === "accessories" && (
                  <button
                    onClick={() => setAccessoryForm({ brand: "Redragon", name: "", category: "Mice", condition: "Brand New", pricePKR: 2500, warranty: "6 Months Local Warranty", popular: false, details: "", image: "" })}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-450 to-amber-500 hover:from-amber-350 hover:to-amber-450 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Plus className="h-4.5 w-4.5" /> Stock Accessory
                  </button>
                )}

                {activeTab === "courses" && (
                  <button
                    onClick={() => setCourseForm({ title: "", code: "", feePKR: 4000, duration: "3 Months", level: "Basic", popular: false })}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-450 to-amber-500 hover:from-amber-350 hover:to-amber-450 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Plus className="h-4.5 w-4.5" /> Program Course
                  </button>
                )}

                {activeTab === "jobs" && (
                  <button
                    onClick={() => setJobForm({ title: "", department: "Education Academy", location: "Dunyapur Branch", type: "Full-Time", salaryRange: "", description: "", requirements: [], responsibilities: [], active: true })}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-450 to-amber-500 hover:from-amber-350 hover:to-amber-450 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Plus className="h-4.5 w-4.5" /> Post Job
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Main Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {loading ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Synchronizing database indices...</p>
                </div>
              ) : (
                <>
                  {/* BOOKING RESERVATION MANAGEMENT */}
                  {activeTab === "bookings" && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-left">
                        <span className="text-xl">🔒</span>
                        <div className="text-xs text-amber-850">
                          <strong className="block text-amber-900 font-extrabold leading-loose">Secure Registry Ledger Invariants</strong>
                          These booking sessions are strictly private and visible only to authenticated administrators. No guest users or students can query this bookings list.
                        </div>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-2">
                          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
                          <p className="font-extrabold text-slate-800">No Web Reservation Bookings Yet</p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">When customers place orders or enroll in academy courses, they will appear right here.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bookings.map((booking) => (
                            <div 
                              key={booking.id}
                              className="bg-white border border-slate-200 hover:border-amber-400/40 p-5 rounded-2xl text-left flex flex-col justify-between gap-4 shadow-sm transition-all"
                            >
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">{booking.id}</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ml-1.5 uppercase font-mono ${
                                      booking.type === "laptop" ? "bg-cyan-50 text-cyan-700 border border-cyan-155" : "bg-violet-50 text-violet-755 border border-violet-155"
                                    }`}>
                                      {booking.type}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                                    booking.status?.includes("Pending") 
                                      ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse" 
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs font-extrabold text-slate-905">{booking.name}</p>
                                  <p className="text-[11px] font-mono text-slate-500 font-bold">Contact: <a href={`tel:${booking.phone}`} className="text-indigo-600 hover:underline">{booking.phone}</a></p>
                                  <p className="text-xs text-slate-600 pt-1.5 leading-relaxed bg-[#f8fafc] p-2.5 rounded-xl border border-slate-150 border-dashed">
                                    <strong className="text-slate-805 block mb-1">Involved Object: {booking.item}</strong>
                                    {booking.details || "No additional configuration requested."}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 justify-between items-center">
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono font-bold">{booking.date}</span>
                                <div className="flex gap-1.5">
                                  {booking.status?.includes("Pending") && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(booking, "Verified & Scheduled")}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                                    >
                                      ✓ Verify
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteBooking(booking)}
                                    className="p-1 px-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                                    title="Discard booking"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* LAPTOP DATABASE STOCK EDITING */}
                  {activeTab === "laptops" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {laptops.map((lap) => (
                          <div 
                            key={lap.id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-left"
                          >
                            <div className="h-36 bg-slate-100 relative">
                              <img src={lap.image} alt={lap.model} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold font-semibold uppercase">
                                {lap.id}
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{lap.brand}</p>
                                <h4 className="text-xs font-black text-slate-900 line-clamp-1">{lap.model}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{lap.details}</p>
                                <p className="text-[11px] font-mono font-bold text-emerald-650 pt-2">Rs. {lap.pricePKR.toLocaleString()}</p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-1.5">
                                <button
                                  onClick={() => setLaptopForm(lap)}
                                  className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Modify
                                </button>
                                <button
                                  onClick={() => handleDeleteLaptop(lap.id)}
                                  className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMPUTER & LAPTOP ACCESSORIES SHOWCASE */}
                  {activeTab === "accessories" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accessories.map((acc) => (
                          <div 
                            key={acc.id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-left"
                          >
                            <div className="h-32 bg-slate-100 relative">
                              <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                                {acc.id}
                              </div>
                              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <span className="bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                  {acc.condition}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-emerald-650 uppercase tracking-wider">{acc.brand} • {acc.category}</p>
                                <h4 className="text-xs font-black text-slate-900 line-clamp-1">{acc.name}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{acc.details}</p>
                                <p className="text-[11px] font-mono font-bold text-slate-805 pt-2">Rs. {acc.pricePKR.toLocaleString()}</p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-1.5">
                                <button
                                  onClick={() => setAccessoryForm(acc)}
                                  className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Modify
                                </button>
                                <button
                                  onClick={() => handleDeleteAccessory(acc.id)}
                                  className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IT ACADEMY PROGRAM EDITING */}
                  {activeTab === "courses" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                          <div 
                            key={course.id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-left"
                          >
                            <div className="h-32 bg-slate-100 relative">
                              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                                {course.id}
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">{course.code}</span>
                                <h4 className="text-xs font-black text-slate-900 line-clamp-1 mt-1.5">{course.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                                <p className="text-[11px] font-mono font-bold text-violet-700 pt-2">Fee: Rs. {course.feePKR.toLocaleString()} / month</p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex justify-end gap-1.5">
                                <button
                                  onClick={() => setCourseForm(course)}
                                  className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Modify
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* JOB OPENINGS LIST Tab */}
                  {activeTab === "jobs" && (
                    <div className="space-y-4 text-left">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl">💼</span>
                        <div className="text-xs text-amber-850">
                          <strong className="block text-amber-900 font-extrabold leading-loose">Job Openings Management</strong>
                          Create, modify, or archive available job roles at Nomi Computers Dunyapur. Active openings are immediately displayed on the website for visitors to apply.
                        </div>
                      </div>

                      {jobs.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-2">
                          <Briefcase className="h-12 w-12 text-slate-300 mx-auto" />
                          <p className="font-extrabold text-slate-800">No Job Openings Posted</p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">Click "Post Job" above to list your first available career opening.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {jobs.map((job) => (
                            <div 
                              key={job.id}
                              className="bg-white border border-slate-200 hover:border-amber-450 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">{job.id}</span>
                                    <h4 className="text-sm font-black text-slate-900 mt-1">{job.title}</h4>
                                    <p className="text-[11px] text-amber-600 font-bold mt-0.5">{job.department} • {job.location}</p>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    job.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {job.type} {job.active ? "(Active)" : "(Draft)"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{job.description}</p>
                                {job.salaryRange && (
                                  <p className="text-[11px] font-semibold text-slate-700">Salary: <span className="text-indigo-650 font-bold">{job.salaryRange}</span></p>
                                )}
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                  onClick={() => setJobForm(job)}
                                  className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Modify Specs
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-semibold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Delete Role
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* JOB APPLICATIONS LIST Tab */}
                  {activeTab === "applications" && (
                    <div className="space-y-4 text-left">
                      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
                        <span className="text-xl">📥</span>
                        <div className="text-xs text-indigo-850">
                          <strong className="block text-indigo-900 font-extrabold leading-loose">Secure Job Applications Center</strong>
                          Review received credentials, CNIC numbers, contact details, and career profiles. You can change application state badges or delete old profiles.
                        </div>
                      </div>

                      {applications.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-2">
                          <Users className="h-12 w-12 text-slate-300 mx-auto" />
                          <p className="font-extrabold text-slate-800">No Applications Received Yet</p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">When candidates submit their details for posted job vacancies, they will appear here instantly.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {applications.map((app) => (
                            <div 
                              key={app.id}
                              className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono font-bold">{app.id}</span>
                                    <h4 className="text-sm font-black text-slate-900 mt-1">{app.name}</h4>
                                    <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Applied for: <span className="text-slate-800 font-black">{app.jobTitle}</span></p>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                    app.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                    app.status === "Reviewed" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                    app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold animate-pulse" :
                                    app.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                    "bg-purple-50 text-purple-700 border-purple-100"
                                  }`}>
                                    {app.status || "Pending"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                                  <p className="flex items-center gap-1 text-slate-600"><Mail className="h-3 w-3" /> {app.email}</p>
                                  <p className="flex items-center gap-1 text-slate-600"><Phone className="h-3 w-3" /> {app.phone}</p>
                                  <p className="col-span-2 text-slate-600">CNIC: <span className="text-slate-900 font-bold">{app.cnic}</span></p>
                                </div>

                                {app.experience && (
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FileText className="h-3 w-3" /> Experience & Education Summary</p>
                                    <p className="text-xs text-slate-700 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50 italic whitespace-pre-line">{app.experience}</p>
                                  </div>
                                )}

                                {app.coverLetter && (
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Pitch / Cover Note</p>
                                    <p className="text-xs text-slate-600 bg-slate-50/30 p-2 rounded-lg italic whitespace-pre-line leading-relaxed">"{app.coverLetter}"</p>
                                  </div>
                                )}

                                <p className="text-[9px] text-slate-400 font-mono">Submitted on: {app.appliedDate}</p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex gap-1 items-center">
                                  <span className="text-[10px] text-slate-450 font-bold uppercase">Update:</span>
                                  {["Reviewed", "Shortlisted", "Rejected"].map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => handleUpdateAppStatus(app, st)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[9px] cursor-pointer"
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>

                                <button
                                  onClick={() => handleDeleteApp(app)}
                                  className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-bold cursor-pointer uppercase flex items-center gap-0.5"
                                >
                                  <Trash className="h-2.5 w-2.5" /> Discard
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STUDENT ADMISSIONS LIST Tab */}
                  {activeTab === "admissions" && (
                    <div className="space-y-8 text-left animate-fade-in">
                      
                      {/* Section 1: Pending Admission Requests */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Pending Admission Requests ({admissionRequests.length})</h3>
                          </div>
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 font-bold uppercase tracking-wider animate-pulse">Action Required</span>
                        </div>
                        
                        <p className="text-xs text-slate-500 leading-normal">
                          These are prospective students who have submitted the public admission form online. Review their details, click on "Review & Verify" to fill in the For Office Use details, and click "Verify & Approve" to officially enroll them.
                        </p>

                        {admissionRequests.length === 0 ? (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-12 text-center space-y-2">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                            <p className="font-extrabold text-slate-700 text-sm">No Pending Admission Requests</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">All submitted requests have been verified and processed. Good job!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {admissionRequests.map((adm) => {
                              return (
                                <div 
                                  key={adm.id}
                                  className="bg-amber-50/30 border border-amber-200 hover:border-amber-400 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-mono font-bold">{adm.id}</span>
                                        <h4 className="text-sm font-black text-slate-900 mt-1">{adm.name}</h4>
                                        <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Course: <span className="text-slate-800 font-black">{adm.courseName}</span></p>
                                      </div>
                                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-150 animate-pulse uppercase">
                                        ● Pending
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-150 font-mono">
                                      <p className="text-slate-650">DOB: <span className="text-slate-900 font-bold">{adm.dob}</span></p>
                                      <p className="text-slate-650">Religion: <span className="text-slate-900 font-bold">{adm.religion}</span></p>
                                      <p className="text-slate-650 col-span-2">Mobile: <span className="text-slate-900 font-bold">{adm.studentMobile}</span></p>
                                      <p className="col-span-2 text-slate-650 truncate">Email: <span className="text-slate-900 font-bold">{adm.studentEmail || "None"}</span></p>
                                      <p className="col-span-2 text-slate-650">Address: <span className="text-slate-900 font-bold">{adm.homeAddress}</span></p>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Guardian Info</p>
                                      <p className="text-slate-800 font-medium">
                                        Father/Guardian: <strong>{adm.fatherName || adm.guardianName}</strong> ({adm.parentOccupation || "No Occupation listed"})
                                      </p>
                                      <p className="text-slate-600 font-mono text-[11px]">
                                        Guardian Phone: {adm.parentPhone} | Income: Rs. {adm.parentMonthlyIncome || "N/A"}
                                      </p>
                                    </div>

                                    <p className="text-[9px] text-slate-400 font-mono">Form dated: {adm.dated} | Submitted: {adm.submittedAt}</p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-100 flex justify-between gap-2 items-center">
                                    <button
                                      onClick={() => setSelectedAdmission(adm)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-350 hover:to-amber-450 text-slate-950 font-bold rounded-xl text-[10px] uppercase cursor-pointer"
                                    >
                                      Review & Verify
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAdmission(adm, true)}
                                      className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-bold cursor-pointer uppercase flex items-center gap-0.5"
                                    >
                                      <Trash className="h-2.5 w-2.5" /> Discard
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Approved Student Registry */}
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Enrolled Students Database ({admissions.length})</h3>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold uppercase tracking-wider">Approved Registry</span>
                        </div>

                        <p className="text-xs text-slate-500 leading-normal">
                          These records have been approved, stamped, and cataloged into the main students database. You can edit their office settings or review their original forms here.
                        </p>

                        {admissions.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center space-y-2">
                            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                            <p className="font-extrabold text-slate-800">No Enrolled Students Registered</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">Approved students will display in this database with their active office stamp.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {admissions.map((adm) => {
                              return (
                                <div 
                                  key={adm.id}
                                  className="bg-white border border-slate-200 hover:border-emerald-400 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono font-bold">{adm.id}</span>
                                        <h4 className="text-sm font-black text-slate-900 mt-1">{adm.name}</h4>
                                        <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Course: <span className="text-slate-800 font-black">{adm.courseName}</span></p>
                                      </div>
                                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-750 border-emerald-200 uppercase">
                                        ✓ Approved
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-mono">
                                      <p className="text-slate-650">DOB: <span className="text-slate-900 font-bold">{adm.dob}</span></p>
                                      <p className="text-slate-650">Religion: <span className="text-slate-900 font-bold">{adm.religion}</span></p>
                                      <p className="text-slate-650 col-span-2">Mobile: <span className="text-slate-900 font-bold">{adm.studentMobile}</span></p>
                                      <p className="col-span-2 text-slate-650 truncate">Email: <span className="text-slate-900 font-bold">{adm.studentEmail || "None"}</span></p>
                                      <p className="col-span-2 text-slate-650">Address: <span className="text-slate-900 font-bold">{adm.homeAddress}</span></p>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Guardian Info</p>
                                      <p className="text-slate-800 font-medium">
                                        Father/Guardian: <strong>{adm.fatherName || adm.guardianName}</strong> ({adm.parentOccupation || "No Occupation listed"})
                                      </p>
                                      <p className="text-slate-600 font-mono text-[11px]">
                                        Guardian Phone: {adm.parentPhone} | Income: Rs. {adm.parentMonthlyIncome || "N/A"}
                                      </p>
                                    </div>

                                    {/* Office Use summary */}
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl space-y-1">
                                      <p className="text-[10px] font-extrabold text-emerald-850 uppercase tracking-wider">For Office Use Ledger</p>
                                      <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-700 font-mono">
                                        <p>Receipt No: <strong>{adm.receiptNo || "-"}</strong></p>
                                        <p>Reg No: <strong>{adm.registrationNo || "-"}</strong></p>
                                        <p>Admitted Grade: <strong>{adm.admittedToGrade || "-"}</strong></p>
                                        <p>Monthly Fees: <strong>{adm.monthlyFees || "-"}</strong></p>
                                      </div>
                                    </div>

                                    <p className="text-[9px] text-slate-400 font-mono">Form dated: {adm.dated} | Submitted: {adm.submittedAt}</p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-100 flex justify-between gap-2 items-center">
                                    <button
                                      onClick={() => setSelectedAdmission(adm)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-450 hover:to-emerald-550 text-white font-bold rounded-xl text-[10px] uppercase cursor-pointer"
                                    >
                                      Review & Edit Office Fields
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAdmission(adm, false)}
                                      className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-bold cursor-pointer uppercase flex items-center gap-0.5"
                                    >
                                      <Trash className="h-2.5 w-2.5" /> Discard
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ACCESSORY ADD/EDIT DIALOG BOX */}
        {accessoryForm && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 py-6 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-600" />
                  {accessoryForm.id ? `Modify Accessory Stock (${accessoryForm.id})` : "Add Premium Accessory Stock"}
                </h3>
                <button onClick={() => setAccessoryForm(null)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAccessory} className="space-y-4 text-xs block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Manufacturer</label>
                    <input 
                      type="text" required
                      value={accessoryForm.brand || ""}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, brand: e.target.value })}
                      placeholder="e.g. Redragon, Lenovo, HP"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Accessory Name</label>
                    <input 
                      type="text" required
                      value={accessoryForm.name || ""}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                      placeholder="e.g. Cobra Gaming Mouse"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category Slot</label>
                    <select
                      value={accessoryForm.category || "Other"}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                    >
                      <option value="Mice">Mice</option>
                      <option value="Keyboards">Keyboards</option>
                      <option value="Chargers">Chargers</option>
                      <option value="Cables">Cables</option>
                      <option value="Storage">Storage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Condition Badge</label>
                    <select
                      value={accessoryForm.condition || "Brand New"}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, condition: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="A+ Grade">A+ Grade</option>
                      <option value="Imported Refurbished">Imported Refurbished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Price (PKR)</label>
                    <input 
                      type="number" required
                      value={accessoryForm.pricePKR || 0}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, pricePKR: Number(e.target.value) })}
                      placeholder="PKR Amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Checking Warranty</label>
                    <input 
                      type="text" required
                      value={accessoryForm.warranty || ""}
                      onChange={(e) => setAccessoryForm({ ...accessoryForm, warranty: e.target.value })}
                      placeholder="e.g. 6 Months Replacement"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Showcase Image JPG Link URL</label>
                  <input 
                    type="text"
                    value={accessoryForm.image || ""}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Description</label>
                  <textarea 
                    value={accessoryForm.details || ""}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, details: e.target.value })}
                    placeholder="Provide performance checks, materials used, adapter pins..."
                    rows={2.5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="checkbox"
                    id="pop-accessory"
                    checked={!!accessoryForm.popular}
                    onChange={(e) => setAccessoryForm({ ...accessoryForm, popular: e.checked ? true : false })}
                    className="h-4 w-4 text-emerald-600 rounded accent-emerald-600"
                  />
                  <label htmlFor="pop-accessory" className="text-[11px] font-extrabold text-slate-705 cursor-pointer">Feature on catalog with Hot badge!</label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    type="button" onClick={() => setAccessoryForm(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-650 text-white font-black rounded-xl cursor-pointer hover:shadow"
                  >
                    {actionLoading ? "Saving stock..." : "Save Accessory Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LAPTOP ADD/EDIT DIALOG BOX */}
        {laptopForm && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 py-6 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <LaptopIcon className="h-5 w-5 text-amber-500" />
                  {laptopForm.id ? `Modify System Specs (${laptopForm.id})` : "Add Custom System Stock"}
                </h3>
                <button onClick={() => setLaptopForm(null)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLaptop} className="space-y-4 text-xs block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Manufacturer</label>
                    <input 
                      type="text" required
                      value={laptopForm.brand || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, brand: e.target.value })}
                      placeholder="e.g. HP, Lenovo, Dell"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Model Specification</label>
                    <input 
                      type="text" required
                      value={laptopForm.model || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, model: e.target.value })}
                      placeholder="e.g. EliteBook 840 G8"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Processor Model</label>
                    <input 
                      type="text"
                      value={laptopForm.processor || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, processor: e.target.value })}
                      placeholder="e.g. Intel Core i5 11th Gen"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Display Area Size</label>
                    <input 
                      type="text"
                      value={laptopForm.screen || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, screen: e.target.value })}
                      placeholder='e.g. 14.1" FHD IPS'
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Standard RAM</label>
                    <input 
                      type="text"
                      value={laptopForm.ram || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, ram: e.target.value })}
                      placeholder="8 GB DDR4"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">SSD High Speed</label>
                    <input 
                      type="text"
                      value={laptopForm.ssd || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, ssd: e.target.value })}
                      placeholder="512 GB SSD"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">GPU Device</label>
                    <input 
                      type="text"
                      value={laptopForm.gpu || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, gpu: e.target.value })}
                      placeholder="Integrated Iris"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Condition Grade</label>
                    <input 
                      type="text"
                      value={laptopForm.condition || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, condition: e.target.value })}
                      placeholder="e.g. Like New, A+ Grade"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category Placement</label>
                    <select
                      value={laptopForm.category || "Student Budget"}
                      onChange={(e) => setLaptopForm({ ...laptopForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    >
                      <option value="Coding & Office">Coding & Office</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Student Budget">Student Budget</option>
                      <option value="Graphic Design">Graphic Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Price (PKR)</label>
                    <input 
                      type="number" required
                      value={laptopForm.pricePKR || 0}
                      onChange={(e) => setLaptopForm({ ...laptopForm, pricePKR: Number(e.target.value) })}
                      placeholder="PKR Amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Checking Warranty</label>
                    <input 
                      type="text"
                      value={laptopForm.warranty || ""}
                      onChange={(e) => setLaptopForm({ ...laptopForm, warranty: e.target.value })}
                      placeholder="e.g. 1 Month Checking"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Showcase Image JPG Link URL</label>
                  <input 
                    type="text"
                    value={laptopForm.image || ""}
                    onChange={(e) => setLaptopForm({ ...laptopForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Specs & Location Description</label>
                  <textarea 
                    value={laptopForm.details || ""}
                    onChange={(e) => setLaptopForm({ ...laptopForm, details: e.target.value })}
                    placeholder="Provide thermal checks, body condition..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="checkbox"
                    id="pop-laptop"
                    checked={!!laptopForm.popular}
                    onChange={(e) => setLaptopForm({ ...laptopForm, popular: e.target.checked })}
                    className="h-4 w-4 text-amber-500 rounded accent-amber-500"
                  />
                  <label htmlFor="pop-laptop" className="text-[11px] font-extrabold text-slate-705 cursor-pointer">Feature on homepage with Hot badge!</label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    type="button" onClick={() => setLaptopForm(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-350 to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer hover:shadow"
                  >
                    {actionLoading ? "Saving stock..." : "Save Laptop Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COURSE ADD/EDIT DIALOG BOX */}
        {courseForm && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 py-6 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  {courseForm.id ? `Modify Class Program (${courseForm.code})` : "Configure IT Course Program"}
                </h3>
                <button onClick={() => setCourseForm(null)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4 text-xs block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Title of program</label>
                    <input 
                      type="text" required
                      value={courseForm.title || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. Graphic Designing & UI/UX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Class Code (Unique)</label>
                    <input 
                      type="text" required
                      value={courseForm.code || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      placeholder="e.g. CR-GRPH"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Program Duration</label>
                    <input 
                      type="text"
                      value={courseForm.duration || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      placeholder="e.g. 3 Months (Daily 1.5 hrs)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target Skill level</label>
                    <input 
                      type="text"
                      value={courseForm.level || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      placeholder="e.g. Professional / Basic"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Tuition Fee (PKR)</label>
                    <input 
                      type="number" required
                      value={courseForm.feePKR || 0}
                      onChange={(e) => setCourseForm({ ...courseForm, feePKR: Number(e.target.value) })}
                      placeholder="PKR Fee/m"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Shift Timing Slots</label>
                    <input 
                      type="text"
                      value={courseForm.schedule || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
                      placeholder="Morning & Evening Slots"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Certificate Board validation details</label>
                  <input 
                    type="text"
                    value={courseForm.certificate || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, certificate: e.target.value })}
                    placeholder="PBTE Technical certification..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Main banner Image URL</label>
                  <input 
                    type="text"
                    value={courseForm.image || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Curriculum Modules (Separated with commas)</label>
                  <input 
                    type="text"
                    value={
                      Array.isArray(courseForm.syllabus) 
                        ? (courseForm.syllabus as string[]).join(", ") 
                        : (courseForm.syllabus as string) || ""
                    }
                    onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
                    placeholder="Module 1: Basic OS, Module 2: Adobe Photoshop..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Key Gained Careers Skills (Separated with commas)</label>
                  <input 
                    type="text"
                    value={
                      Array.isArray(courseForm.skillsGained) 
                        ? (courseForm.skillsGained as string[]).join(", ") 
                        : (courseForm.skillsGained as string) || ""
                    }
                    onChange={(e) => setCourseForm({ ...courseForm, skillsGained: e.target.value })}
                    placeholder="Figma Prototype, SEO writing, Ms Excel specialty..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Detailed Academy description</label>
                  <textarea 
                    value={courseForm.description || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Explain job outcomes and learning methodologies..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="checkbox"
                    id="pop-course"
                    checked={!!courseForm.popular}
                    onChange={(e) => setCourseForm({ ...courseForm, popular: e.target.checked })}
                    className="h-4 w-4 text-amber-500 rounded accent-amber-500"
                  />
                  <label htmlFor="pop-course" className="text-[11px] font-extrabold text-slate-705 cursor-pointer">Feature on homepage with Hot badge!</label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    type="button" onClick={() => setCourseForm(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-305 to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer hover:shadow"
                  >
                    {actionLoading ? "Saving program..." : "Save Course Program"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* JOB ADD/EDIT DIALOG BOX */}
        {jobForm && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 py-6 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-500" />
                  {jobForm.id ? `Modify Job Specs (${jobForm.id})` : "Configure New Job Opening"}
                </h3>
                <button onClick={() => setJobForm(null)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4 text-xs block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                    <input 
                      type="text" required
                      value={jobForm.title || ""}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. IT Instructor / Repair Tech"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                    <input 
                      type="text" required
                      value={jobForm.department || ""}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                      placeholder="e.g. Education Academy"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                    <input 
                      type="text"
                      value={jobForm.location || ""}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      placeholder="e.g. Dunyapur Branch"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Job Type</label>
                    <select
                      value={jobForm.type || "Full-Time"}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-none"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Salary Range / Budget</label>
                  <input 
                    type="text"
                    value={jobForm.salaryRange || ""}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    placeholder="e.g. Rs. 25,000 - 45,000 / month"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Job Description</label>
                  <textarea 
                    value={jobForm.description || ""}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Provide overview of role, expectations, and ideal candidate details..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Candidate Requirements (One requirement per line)</label>
                  <textarea 
                    value={
                      Array.isArray(jobForm.requirements) 
                        ? (jobForm.requirements as string[]).join("\n") 
                        : (jobForm.requirements as string) || ""
                    }
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    placeholder="Must have 1+ year teaching experience&#10;Proficient in MS Word and Urdu typing..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Key Responsibilities (One responsibility per line)</label>
                  <textarea 
                    value={
                      Array.isArray(jobForm.responsibilities) 
                        ? (jobForm.responsibilities as string[]).join("\n") 
                        : (jobForm.responsibilities as string) || ""
                    }
                    onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                    placeholder="Deliver lectures daily on CIT curriculum&#10;Prepare and upgrade system configurations..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="checkbox"
                    id="job-active"
                    checked={!!jobForm.active}
                    onChange={(e) => setJobForm({ ...jobForm, active: e.target.checked })}
                    className="h-4 w-4 text-amber-500 rounded accent-amber-500"
                  />
                  <label htmlFor="job-active" className="text-[11px] font-extrabold text-slate-705 cursor-pointer">Publish and accept applications immediately</label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    type="button" onClick={() => setJobForm(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-350 to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer hover:shadow"
                  >
                    {actionLoading ? "Saving vacancy..." : "Save Job Opening"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMISSION REVIEW & OFFICE FILL DIALOG BOX */}
        {selectedAdmission && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 py-6 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Review Admission Form & Office Processing
                </h3>
                <button onClick={() => setSelectedAdmission(null)} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdmission} className="space-y-4 text-xs block">
                {/* Visual form representation header (just like physical PDF form) */}
                <div className="border border-emerald-600/30 bg-emerald-50/25 p-4 rounded-2xl space-y-3">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Nomi Computers Center - Dunyapur</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Official Admission Registry Record (ID: {selectedAdmission.id})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <p className="text-slate-450 uppercase font-bold text-[9px] tracking-wider">DETAILS OF STUDENT</p>
                      <ul className="space-y-1 mt-1 text-slate-800">
                        <li>Name: <strong className="text-slate-900">{selectedAdmission.name}</strong></li>
                        <li>DOB: <strong>{selectedAdmission.dob}</strong></li>
                        <li>Religion: <strong>{selectedAdmission.religion || "-"}</strong></li>
                        <li>Course Choice: <strong>{selectedAdmission.courseName}</strong></li>
                        <li>Hobbies/Interests: <strong>{selectedAdmission.hobbies || "-"}</strong></li>
                        <li>Home Address: <strong>{selectedAdmission.homeAddress}</strong></li>
                        <li>Phone: <strong>{selectedAdmission.studentPhone || "-"}</strong></li>
                        <li>Mobile: <strong>{selectedAdmission.studentMobile}</strong></li>
                        <li>Email: <span className="underline">{selectedAdmission.studentEmail || "-"}</span></li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-slate-450 uppercase font-bold text-[9px] tracking-wider">DETAILS OF PARENTS / GUARDIANS</p>
                      <ul className="space-y-1 mt-1 text-slate-800">
                        <li>Father's Name: <strong>{selectedAdmission.fatherName}</strong></li>
                        <li>Guardian Name: <strong>{selectedAdmission.guardianName || "-"}</strong></li>
                        <li>Occupation: <strong>{selectedAdmission.parentOccupation}</strong></li>
                        <li>Monthly Income: <strong>{selectedAdmission.parentMonthlyIncome}</strong></li>
                        <li>Phone Office: <strong>{selectedAdmission.parentPhoneOffice || "-"}</strong></li>
                        <li>Phone: <strong>{selectedAdmission.parentPhone}</strong></li>
                        <li>Business Address: <strong>{selectedAdmission.parentBusinessAddress || "-"}</strong></li>
                        <li>Email Address: <span className="underline">{selectedAdmission.parentEmail || "-"}</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-white border border-slate-150 p-2.5 rounded-xl">
                    <p className="italic leading-normal">
                      "I understood that the above particulars are correct and accept the Rules and Policies of Nomi Computers Center, pertinent to admission of my ward given the prospectus."
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[9px] text-slate-700">
                      <p>Dated: <strong>{selectedAdmission.dated}</strong></p>
                      <p>Student Sign: <strong>{selectedAdmission.signStudent || "Verified Check"}</strong></p>
                      <p>Parent Sign: <strong>{selectedAdmission.signParent || "Verified Check"}</strong></p>
                    </div>
                  </div>
                </div>

                {/* For Office Use - Managed purely by Administrator */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">For Office Use Only (Admin Controls)</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-none">The fields below represent official Nomi Computers registry records. Students do not see or edit these fields.</p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Receipt No.</label>
                      <input 
                        type="text"
                        value={selectedAdmission.receiptNo || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, receiptNo: e.target.value })}
                        placeholder="e.g. REC-928"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550 font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Receipt Date</label>
                      <input 
                        type="date"
                        value={selectedAdmission.receiptDate || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, receiptDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550 font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Fees (PKR)</label>
                      <input 
                        type="text"
                        value={selectedAdmission.monthlyFees || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, monthlyFees: e.target.value })}
                        placeholder="e.g. Rs. 4,000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550 font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Course Name</label>
                      <input 
                        type="text"
                        value={selectedAdmission.officeCourseName || selectedAdmission.courseName}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, officeCourseName: e.target.value })}
                        placeholder="e.g. Web Development Mastery"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Admitted to Grade</label>
                      <input 
                        type="text"
                        value={selectedAdmission.admittedToGrade || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, admittedToGrade: e.target.value })}
                        placeholder="e.g. Grade A / Basic"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Registration No.</label>
                      <input 
                        type="text"
                        value={selectedAdmission.registrationNo || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, registrationNo: e.target.value })}
                        placeholder="e.g. NOMI-2026-901"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-550 font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Registrar Signature</label>
                      <input 
                        type="text"
                        value={selectedAdmission.registrarName || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, registrarName: e.target.value })}
                        placeholder="e.g. Muhammad Noman"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Vice Principal Sign</label>
                      <input 
                        type="text"
                        value={selectedAdmission.vicePrincipalName || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, vicePrincipalName: e.target.value })}
                        placeholder="e.g. vice Principal Sign"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Principal Signature</label>
                      <input 
                        type="text"
                        value={selectedAdmission.principalName || ""}
                        onChange={(e) => setSelectedAdmission({ ...selectedAdmission, principalName: e.target.value })}
                        placeholder="e.g. Principal Seal Sign"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    type="button" onClick={() => setSelectedAdmission(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={actionLoading}
                    className={`px-5 py-2 text-white font-black rounded-xl cursor-pointer hover:shadow text-xs uppercase ${
                      selectedAdmission.status === "pending"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-700"
                    }`}
                  >
                    {actionLoading 
                      ? (selectedAdmission.status === "pending" ? "Verifying & Approving..." : "Updating record...") 
                      : (selectedAdmission.status === "pending" ? "✓ VERIFY & APPROVE" : "✓ Update Student Info")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
