export interface Laptop {
  id: string;
  brand: string;
  model: string;
  processor: string;
  ram: string;
  ssd: string;
  screen: string;
  gpu?: string;
  battery: string;
  pricePKR: number;
  condition: "Brand New" | "Like New" | "A+ Grade" | "Imported Refurbished";
  category: "Gaming" | "Coding & Office" | "Student Budget" | "Graphic Design";
  warranty: string;
  popular: boolean;
  image: string;
  details: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  duration: string;
  level: "Basic" | "Intermediate" | "Advanced" | "Professional";
  feePKR: number;
  schedule: string;
  certificate: string;
  description: string;
  syllabus: string[];
  skillsGained: string[];
  popular: boolean;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  city: string;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
}

export interface Booking {
  firestoreId?: string;
  id?: string;
  name: string;
  phone: string;
  cnic?: string;
  password?: string;
  type: "laptop" | "course" | "accessory";
  item: string;
  details?: string;
  status?: string;
  date?: string;
}

export interface Accessory {
  id: string;
  name: string;
  brand: string;
  category: "Mice" | "Keyboards" | "Chargers" | "Cables" | "Storage" | "Other";
  pricePKR: number;
  condition: "Brand New" | "Like New" | "A+ Grade" | "Imported Refurbished";
  warranty: string;
  popular: boolean;
  image: string;
  details: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Internship";
  salaryRange?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate?: string;
  active: boolean;
}

export interface JobApplication {
  firestoreId?: string;
  id?: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  experience?: string;
  coverLetter?: string;
  status?: "Pending" | "Reviewed" | "Shortlisted" | "Rejected" | "Hired";
  appliedDate?: string;
}

export interface Admission {
  firestoreId?: string;
  id?: string;
  status?: string;
  name: string;
  religion: string;
  dob: string;
  hobbies: string;
  courseName: string;
  homeAddress: string;
  studentPhone: string;
  studentMobile: string;
  studentEmail: string;

  // Parents / Guardians
  fatherName: string;
  guardianName: string;
  parentOccupation: string;
  parentMonthlyIncome: string;
  parentPhoneOffice: string;
  parentPhone: string;
  parentBusinessAddress: string;
  parentEmail: string;

  // Rules & policies acceptance
  rulesAccepted: boolean;
  dated: string;
  signStudent: string;
  signParent: string;
  submittedAt?: string;

  // Office Use
  receiptNo?: string;
  receiptDate?: string;
  monthlyFees?: string;
  officeCourseName?: string;
  admittedToGrade?: string;
  registrationNo?: string;
  registrarName?: string;
  vicePrincipalName?: string;
  principalName?: string;
}
