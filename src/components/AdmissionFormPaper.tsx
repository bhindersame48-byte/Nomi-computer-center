import React from "react";
import { GraduationCap } from "lucide-react";
import Logo from "./Logo";

interface AdmissionFormPaperProps {
  data: {
    name: string;
    dob: string;
    religion: string;
    hobbies: string;
    courseName: string;
    homeAddress: string;
    studentPhone: string;
    studentMobile: string;
    studentEmail: string;
    fatherName: string;
    guardianName: string;
    parentOccupation: string;
    parentMonthlyIncome: string;
    parentPhoneOffice: string;
    parentPhone: string;
    parentBusinessAddress: string;
    parentEmail: string;
    signStudent: string;
    signParent: string;
    dated: string;
    rulesAccepted?: boolean;

    // Office Use fields
    id?: string;
    receiptNo?: string;
    receiptDate?: string;
    monthlyFees?: string;
    officeCourseName?: string;
    admittedToGrade?: string;
    registrationNo?: string;
    registrarName?: string;
    vicePrincipalName?: string;
    principalName?: string;
  };
  isEditable?: boolean;
  onChange?: (updatedData: any) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  error?: string;
  onReset?: () => void;
  statusMode?: "submitting" | "success" | "tracked";
}

export default function AdmissionFormPaper({
  data,
  isEditable = false,
  onChange,
  onSubmit,
  isSubmitting = false,
  error = "",
  onReset,
  statusMode = "submitting",
}: AdmissionFormPaperProps) {
  const handleInputChange = (field: string, value: any) => {
    if (isEditable && onChange) {
      onChange({ ...data, [field]: value });
    }
  };

  // Font style for filled data to look like real handwritten/typed ink
  const inkClass = isEditable
    ? "text-slate-900 font-sans font-bold"
    : "text-emerald-850 font-serif font-black italic tracking-wide text-xs";

  return (
    <div className="space-y-6">
      {/* Outer framing wrapper to resemble physical paper layout */}
      <div className="border border-slate-800 p-1 bg-white shadow-2xl max-w-4xl mx-auto rounded-none relative">
        <div className="border-2 border-slate-800 p-5 sm:p-10 relative overflow-hidden bg-white select-text">
          
          {/* Faint watermark crest exactly in the background center of the page */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10] select-none z-0">
            <Logo variant="watermark" size={460} className="w-[85%] max-w-[460px] aspect-square" />
          </div>

          {/* Form Content starts here */}
          <div className="relative z-10 space-y-8">
            
            {/* 1. Header Area with Logo and Title */}
            <div className="flex flex-col sm:flex-row items-center justify-center border-b border-slate-900 pb-6 gap-6">
              
              {/* Left Logo Emblem */}
              <div className="flex flex-col items-center shrink-0">
                <Logo size={120} className="h-28 w-28" />
              </div>

              {/* Center Printed Typography */}
              <div className="text-center sm:text-left flex-1 space-y-1.5 font-serif max-w-[480px]">
                <h3 className="text-sm font-black tracking-[0.2em] text-slate-800 uppercase text-center sm:text-left">ADMISSION FORM</h3>
                <h1 className="text-2xl sm:text-3xl font-black text-[#007a3e] uppercase underline decoration-2 decoration-[#007a3e] underline-offset-4 tracking-tight leading-none text-center sm:text-left">
                  NOMI COMPUTERS CENTER
                </h1>
                <p className="text-[12px] font-bold text-slate-800 italic leading-snug text-center sm:text-left">
                  Near Kazmi Masjid New Market, Dunya Pur (Lodhran)
                </p>
                <p className="text-[11px] font-bold text-slate-700 tracking-wide font-sans leading-none mt-1 text-center sm:text-left">
                  Mob: 0300-7303000 & 0313-7303000
                </p>
                <p className="text-[10px] text-slate-600 font-bold italic font-sans leading-none mt-0.5 text-center sm:text-left">
                  Email: nomicomputers786@yahoo.com
                </p>
                <div className="pt-2 text-center sm:text-left">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest font-sans">
                    (Note: Names to be printed in block letters)
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-status header for success or tracking views */}
            {statusMode === "success" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center font-bold text-[#007a3e] uppercase text-xs font-mono tracking-wider">
                ✓ Transmitted Successfully — ID: {data.id || "Pending Registry"}
              </div>
            )}
            {statusMode === "tracked" && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-center font-bold text-indigo-700 uppercase text-xs font-mono tracking-wider flex justify-between px-4">
                <span>Verified Registry Record</span>
                <span>System ID: {data.id}</span>
              </div>
            )}

            {/* 2. Form Body */}
            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* DETAILS OF STUDENT */}
              <div className="space-y-4 text-left">
                <div className="border-b border-slate-800 pb-1">
                  <h3 className="text-base font-black text-[#007a3e] italic uppercase tracking-wider font-serif underline underline-offset-2">
                    DETAILS OF STUDENT:
                  </h3>
                </div>

                {/* Name & Religion */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Name:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g. MUHAMMAD AHMAD"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none uppercase transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] uppercase ${inkClass}`}>
                        {data.name || "—"}
                      </span>
                    )}
                  </div>
                  <div className="sm:w-[35%] flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Religion:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.religion}
                        onChange={(e) => handleInputChange("religion", e.target.value)}
                        placeholder="e.g. Islam"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.religion || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date of Birth & Hobbies */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="sm:w-[38%] flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Date of Birth:</span>
                    {isEditable ? (
                      <input
                        type="date"
                        required
                        value={data.dob}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.dob || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Student’s Hobbies / Interests:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        value={data.hobbies}
                        onChange={(e) => handleInputChange("hobbies", e.target.value)}
                        placeholder="e.g. Coding, Cricket, Book Reading"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.hobbies || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Name & Home Address */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="sm:w-[42%] flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Course Name:</span>
                    {isEditable ? (
                      <select
                        required
                        value={data.courseName}
                        onChange={(e) => handleInputChange("courseName", e.target.value)}
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors cursor-pointer ${inkClass}`}
                      >
                        <option value="" className="text-slate-400">Select Course...</option>
                        <option value="Diploma in Information Technology (DIT)">Diploma in Information Technology (DIT)</option>
                        <option value="Office Management / Computer Basics">Office Management / Computer Basics</option>
                        <option value="Graphic Design Certification">Graphic Design Certification</option>
                        <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                        <option value="E-Commerce & Freelancing">E-Commerce & Freelancing</option>
                      </select>
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.courseName || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Home Address:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.homeAddress}
                        onChange={(e) => handleInputChange("homeAddress", e.target.value)}
                        placeholder="Enter permanent address details..."
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.homeAddress || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone No & Mobile No */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Phone No.</span>
                    {isEditable ? (
                      <input
                        type="tel"
                        value={data.studentPhone}
                        onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                        placeholder="e.g. 061-123456"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.studentPhone || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Mobile No.</span>
                    {isEditable ? (
                      <input
                        type="tel"
                        required
                        value={data.studentMobile}
                        onChange={(e) => handleInputChange("studentMobile", e.target.value)}
                        placeholder="e.g. 0300-1234567"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.studentMobile || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* E-mail address */}
                <div className="flex items-end gap-2 font-serif">
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">E-mail address:</span>
                  {isEditable ? (
                    <input
                      type="email"
                      value={data.studentEmail}
                      onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                      placeholder="e.g. student@gmail.com"
                      className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                    />
                  ) : (
                    <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                      {data.studentEmail || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* DETAILS OF PARENTS / GUARDIANS */}
              <div className="space-y-4 text-left pt-6 border-t border-slate-200">
                <div className="border-b border-slate-800 pb-1">
                  <h3 className="text-base font-black text-[#007a3e] italic uppercase tracking-wider font-serif underline underline-offset-2">
                    Details of Parents / Guardians:
                  </h3>
                </div>

                {/* Father's Name & Name of Guardian */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Father’s Name:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.fatherName}
                        onChange={(e) => handleInputChange("fatherName", e.target.value)}
                        placeholder="Father's Full Name"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.fatherName || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Name of Guardian:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        value={data.guardianName}
                        onChange={(e) => handleInputChange("guardianName", e.target.value)}
                        placeholder="Guardian Name if any"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.guardianName || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Occupation & Monthly Income */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Occupation:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.parentOccupation}
                        onChange={(e) => handleInputChange("parentOccupation", e.target.value)}
                        placeholder="e.g. Agriculture / Government Job"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.parentOccupation || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Monthly Income:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.parentMonthlyIncome}
                        onChange={(e) => handleInputChange("parentMonthlyIncome", e.target.value)}
                        placeholder="e.g. 60,000"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.parentMonthlyIncome || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone Office & Phone */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 font-serif">
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Phone Office:</span>
                    {isEditable ? (
                      <input
                        type="tel"
                        value={data.parentPhoneOffice}
                        onChange={(e) => handleInputChange("parentPhoneOffice", e.target.value)}
                        placeholder="e.g. 061-98765"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.parentPhoneOffice || "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Phone:</span>
                    {isEditable ? (
                      <input
                        type="tel"
                        required
                        value={data.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        placeholder="e.g. 0301-1234567"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.parentPhone || "—"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Business Address */}
                <div className="flex items-end gap-2 font-serif">
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Business Address:</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={data.parentBusinessAddress}
                      onChange={(e) => handleInputChange("parentBusinessAddress", e.target.value)}
                      placeholder="e.g. Railway Road Shop, Dunyapur"
                      className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                    />
                  ) : (
                    <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                      {data.parentBusinessAddress || "—"}
                    </span>
                  )}
                </div>

                {/* E-mail address */}
                <div className="flex items-end gap-2 font-serif">
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">E-mail address:</span>
                  {isEditable ? (
                    <input
                      type="email"
                      value={data.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      placeholder="e.g. guardian@gmail.com"
                      className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                    />
                  ) : (
                    <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                      {data.parentEmail || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* RULES, DECLARATION, & SIGNATURES */}
              <div className="space-y-4 text-left pt-6 font-serif">
                <p className="text-[11px] text-slate-800 leading-relaxed font-sans border border-slate-200 p-4 bg-slate-50 rounded shadow-inner">
                  <span className="font-extrabold text-[#007a3e] uppercase block mb-1">Declaration & Acceptance of Policies</span>
                  I understood that the above particulars are correct and accept the Rules and Policies of &ldquo;Nomi Computers Center&rdquo;, pertinent to admission of my ward given the prospectus. I agree to keep lab rules, follow schedule timing, and avoid equipment damage.
                </p>

                {isEditable && (
                  <div className="flex items-start gap-2 text-xs py-1">
                    <input
                      type="checkbox"
                      required
                      id="rulesAccepted"
                      checked={data.rulesAccepted}
                      onChange={(e) => handleInputChange("rulesAccepted", e.target.checked)}
                      className="mt-1 h-4 w-4 text-emerald-650 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="rulesAccepted" className="text-[11px] font-bold text-slate-700 select-none cursor-pointer leading-tight">
                      I have read and agree to follow all physical, laboratory, and tuition billing policies described in the registry rules. *
                    </label>
                  </div>
                )}

                {/* Dated, Student Signature & Parent Signature */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-4">
                  <div className="sm:w-[25%] flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Dated:</span>
                    {isEditable ? (
                      <input
                        type="date"
                        required
                        value={data.dated}
                        onChange={(e) => handleInputChange("dated", e.target.value)}
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] ${inkClass}`}>
                        {data.dated || "—"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Sign. Of Student:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.signStudent}
                        onChange={(e) => handleInputChange("signStudent", e.target.value)}
                        placeholder="Type Full Name"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors font-mono ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] font-mono ${inkClass}`}>
                        {data.signStudent || "—"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-end gap-2">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap mb-0.5">Sign. of Parents/Guardian:</span>
                    {isEditable ? (
                      <input
                        type="text"
                        required
                        value={data.signParent}
                        onChange={(e) => handleInputChange("signParent", e.target.value)}
                        placeholder="Type Full Name"
                        className={`flex-1 border-b border-slate-700 focus:border-[#007a3e] bg-transparent px-2 pb-0.5 text-xs outline-none transition-colors font-mono ${inkClass}`}
                      />
                    ) : (
                      <span className={`flex-1 border-b border-slate-400 px-2 pb-0.5 min-h-[1.5rem] font-mono ${inkClass}`}>
                        {data.signParent || "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dotted Break line representing traditional paper tear-off scissor cut */}
              {statusMode === "tracked" && (
                <>
                  <div className="relative my-8 border-t-2 border-dashed border-slate-400 flex items-center justify-center">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-mono text-slate-500 flex items-center gap-1">
                      <span>✂</span> <span className="uppercase tracking-widest text-[9px] font-bold text-slate-400">Cut here for registry duplicate</span>
                    </div>
                  </div>

                  {/* 3. For Office Use Only Section Grid */}
                  <div className="space-y-4 pt-4 text-center z-10 relative animate-fade-in">
                    <div className="inline-block border border-slate-900 px-5 py-1 bg-slate-150">
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest font-serif leading-none">
                        For Office Use Only
                      </h3>
                    </div>

                    <div className="border border-slate-800 overflow-hidden font-serif text-xs text-left bg-slate-50/40 relative">
                      
                      {/* Grid Rows */}
                      <div className="grid grid-cols-2 border-b border-slate-800">
                        <div className="p-3 border-r border-slate-800 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Receipt No.</span>
                          <span className={`flex-1 italic ${inkClass}`}>
                            {data.receiptNo || "Awaiting registration verification"}
                          </span>
                        </div>
                        <div className="p-3 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Date.</span>
                          <span className={`flex-1 italic ${inkClass}`}>
                            {data.receiptDate || "Awaiting registration verification"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 border-b border-slate-800">
                        <div className="p-3 border-r border-slate-800 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Monthly Fees</span>
                          <span className={`flex-1 font-bold ${inkClass}`}>
                            {data.monthlyFees ? `Rs. ${data.monthlyFees}` : "Assigned shortly after review"}
                          </span>
                        </div>
                        <div className="p-3 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Course Name</span>
                          <span className={`flex-1 font-bold ${inkClass}`}>
                            {data.officeCourseName || data.courseName || "Awaiting evaluation"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 border-b border-slate-800">
                        <div className="p-3 border-r border-slate-800 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Admitted to Grade</span>
                          <span className={`flex-1 ${inkClass}`}>
                            {data.admittedToGrade || "Under Registrar review"}
                          </span>
                        </div>
                        <div className="p-3 flex items-baseline gap-2">
                          <span className="font-bold text-slate-750 whitespace-nowrap">Registration No.</span>
                          <span className={`flex-1 font-mono font-bold ${inkClass}`}>
                            {data.registrationNo || "Assigned shortly after verification"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3">
                        <div className="p-3 border-r border-slate-800 flex flex-col justify-end min-h-[3.5rem] gap-1">
                          <span className={`text-[10px] text-center italic border-b border-slate-300 ${inkClass}`}>
                            {data.registrarName || " "}
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide block font-mono">Registrar</span>
                        </div>
                        <div className="p-3 border-r border-slate-800 flex flex-col justify-end min-h-[3.5rem] gap-1">
                          <span className={`text-[10px] text-center italic border-b border-slate-300 ${inkClass}`}>
                            {data.vicePrincipalName || " "}
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide block font-mono">vice Principal</span>
                        </div>
                        <div className="p-3 flex flex-col justify-end min-h-[3.5rem] gap-1">
                          <span className={`text-[10px] text-center italic border-b border-slate-300 ${inkClass}`}>
                            {data.principalName || " "}
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide block font-mono">Principal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submission CTA or status reset buttons */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-center text-xs text-rose-600 font-bold font-sans">
                  {error}
                </div>
              )}

              {isEditable && (
                <div className="pt-3 border-t border-slate-300 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-none text-xs font-black tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer text-white border-2 border-slate-900 ${
                      isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-[#007a3e] hover:bg-[#006030] active:scale-[0.99] shadow-md"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      "Submit Admission Registry"
                    )}
                  </button>
                </div>
              )}

              {statusMode === "success" && onReset && (
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={onReset}
                    className="px-6 py-2 border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-extrabold text-xs tracking-wider uppercase rounded-none transition-colors"
                  >
                    Submit Another Form
                  </button>
                </div>
              )}
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
