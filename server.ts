import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import crypto from "crypto";
import { db } from "./src/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

dotenv.config();

const ENCRYPTION_KEY = crypto.createHash("sha256").update("nomi_secret_salt_dunyapur_2026").digest(); // AES-256 requires 32-bytes, sha256 produces exactly that
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  if (!text) return "";
  try {
    const textParts = text.split(":");
    const ivStr = textParts.shift();
    if (!ivStr) return "";
    const iv = Buffer.from(ivStr, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return text;
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Chat/Tech Academic Advisor API route
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const { message, chatHistory, userBudget, userRole, purposeFilter } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Nomi Smart Advisor is in demo mode. Please set your GEMINI_API_KEY in Settings > Secrets." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const sysInstruction = `
You are the elite "Nomi Smart Advisor" of Nomi Computers located in Dunyapur, Pakistan.
Your role is to guide prospective students, laptop customers, and tech enthusiasts in Dunyapur with professional friendly advice.

Key Store Information to reinforce:
- Name: Nomi Computers
- Location: Ajmery City Mobile Plaza, Railway Road, near Kazmi Chowk, Dunyapur, Punjab, Pakistan, 59120.
- Phone/WhatsApp: 0300 7303000 (Local cell: 0300-7303000)
- Rating: 4.2 Stars over 100 positive Google reviews.
- Highlights: "A place to learn computer applications", "Best Selection of Laptops", "Always outstanding service".
- Working Hours: Open 24 Hours / Always open! We fit your schedules.

When recommending:
1. LAPTOPS: We carry student budgets (Rs. 25,000 - 45,000), executive business notebooks (Rs. 50,000 - 85,000), and ultimate coding/gaming machines (Rs. 90,000+). Major brands: HP, Dell, Lenovo, Apple MacBook, Asus. We offer free RAM/SSD customization upon booking!
2. COURSES Offered:
  - CIT (Certificate in Information Technology - 3 Months): Microsoft Word, Excel, PowerPoint, Internet concepts. Great for job applications!
  - DIT (Diploma in Information Technology - 6 Months): Deep hardware support, networks engineering, database, CIT core.
  - Web Development (3 Months): Modern programming HTML5, CSS3, Tailwind, JavaScript, React.js, Node.js.
  - Graphic Design & UI/UX (3 Months): Master Adobe Photoshop, Illustrator, Figma, Canva design.
  - Freelancing & Digital Marketing (2 Months): Fiber, Upwork, SEO optimization, social commerce.

Formulate your response:
- Be highly friendly, motivational, encouraging, and clear.
- Encourage them to visit our Kazmi Chowk branch or submit our web deposit form!
- Keep response formatting clean: use bullet points or elegant line breaks. Avoid raw markdown headings (###) unless they fit neatly.
`;

      const contents = [];
      
      // Assemble dialogue history correctly to preserve context
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contents.push({
            role: turn.sender === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Inject context criteria as user prompt wrapping 
      const contextPrompt = `
[User Profile Context]
- Budget interest: ${userBudget || "Flexible"}
- Academic role: ${userRole || "Prospective Student"}
- Purpose target: ${purposeFilter || "Laptops & Courses info"}

User Inquiry: "${message}"
`;
      contents.push({ role: "user", parts: [{ text: contextPrompt }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.85,
        }
      });

      const responseText = response.text || "I apologize, Nomi Computers Advisor encountered a tiny issue formulating advice. Can you ask again?";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini Advisor Route Error:", error);
      res.status(500).json({ error: error.message || "An advisor connection glitch occurred." });
    }
  });

  // Real server-side relative JSON storage backing laps, courses, and bookings
  const DB_FILE = path.join(process.cwd(), "db_local.json");

  const DEFAULT_DB = {
    laptops: [
      {
        id: "LP-101",
        brand: "HP",
        model: "EliteBook 840 G8",
        processor: "Intel Core i5 11th Gen (Quad-Core)",
        ram: "16 GB DDR4 (Upgradable)",
        ssd: "512 GB PCIe NVMe SSD",
        screen: "14.1\" FHD IPS Anti-Glare (1920x1080)",
        gpu: "Intel Iris Xe Graphics",
        battery: "Up to 5-6 Hours Backup",
        pricePKR: 85000,
        condition: "Like New",
        category: "Coding & Office",
        warranty: "6 Months Local Warranty + 1 Year Support",
        popular: true,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
        details: "Premium aluminum aluminum structure, backlit keyboard, smart fingerprint sensor, and supreme speeds. Best recommended choice for remote programmers, academic students, and office environments in Dunyapur."
      },
      {
        id: "LP-102",
        brand: "Lenovo",
        model: "ThinkPad T14 Gen 2 (AMD)",
        processor: "AMD Ryzen 5 PRO 5650U (6 Cores / 12 Threads)",
        ram: "16 GB DDR4 Dual-Channel",
        ssd: "512 GB NVMe Ultra-Fast SSD",
        screen: "14.0\" FHD Wide-View (1920x1080)",
        gpu: "AMD Radeon RX Vega 7 (Integrated)",
        battery: "Up to 6-7 Hours Backup",
        pricePKR: 92000,
        condition: "A+ Grade",
        category: "Coding & Office",
        warranty: "3 Months Checking Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&auto=format&fit=crop&q=80",
        details: "The ultimate programmer's laptop. Famous matte-black layout, tactical feel keyboard, extreme multi-tasking Ryzen processor, and rugged durability (military drop tested). Perfect for web coding and software compilations."
      },
      {
        id: "LP-103",
        brand: "Dell",
        model: "Victus Gaming 15-fa",
        processor: "Intel Core i5 12th Gen (12-Cores)",
        ram: "16 GB DDR4 high speed",
        ssd: "512 GB PCIe Gen4 NVMe SSD",
        screen: "15.6\" FHD 144Hz IPS High Refresh Rate",
        gpu: "NVIDIA GeForce RTX 3050 (4GB Dedicated)",
        battery: "Up to 3-4 Hours (Gaming layout)",
        pricePKR: 178000,
        condition: "Brand New",
        category: "Gaming",
        warranty: "1 Year Official HP Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
        details: "Stunning entry-level gaming laptop. Features a dedicated RTX 3050 graphics card for heavy video editing, Autodesk rendering, Blender 3D modeling, and premium high-FPS gaming inside Pakistan."
      },
      {
        id: "LP-104",
        brand: "Apple",
        model: "MacBook Air M1",
        processor: "Apple M1 Chip (8-Core CPU / 7-Core GPU)",
        ram: "8 GB Unified Memory",
        ssd: "256 GB Super-Fast SSD",
        screen: "13.3\" Retina Display with True Tone (2560x1600)",
        gpu: "Apple Integrated 7-Core GPU",
        battery: "Up to 12-15 Hours Exceptional Backup",
        pricePKR: 195000,
        condition: "A+ Grade",
        category: "Graphic Design",
        warranty: "1 Month Workspace Safety Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
        details: "Incredibly light, completely silent fanless design, with jaw-dropping battery backup. Ideal machine for graphic designers, digital marketers, UI/UX conceptualists, and students looking for high-end color accuracy."
      },
      {
        id: "LP-105",
        brand: "Dell",
        model: "Latitude 5410",
        processor: "Intel Core i5 10th Gen (Quad-Core)",
        ram: "8 GB DDR4 (Upgradable to 32GB)",
        ssd: "256 GB PCIe SSD (Upgradable)",
        screen: "14.1\" HD Anti-Glare WLED",
        gpu: "Intel UHD Graphics 620",
        battery: "Up to 4-5 Hours Backup",
        pricePKR: 62000,
        condition: "Imported Refurbished",
        category: "Student Budget",
        warranty: "3 Months Checking Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
        details: "Affordable and highly durable choice for local students in Dunyapur. Excellent for attending virtual classes, MS Office data entries, social media management, and fundamental computer systems lessons."
      },
      {
        id: "LP-106",
        brand: "HP",
        model: "ProBook 450 G8",
        processor: "Intel Core i7 11th Gen Turbo",
        ram: "16 GB DDR4 High-Frequency",
        ssd: "512 GB SSD PCIe NVMe M.2",
        screen: "15.6\" FHD Micro-Edge IPS",
        gpu: "Intel Iris Xe Integrated",
        battery: "Up to 5 Hours Backup",
        pricePKR: 125000,
        condition: "Like New",
        category: "Coding & Office",
        warranty: "6 Months Local Support Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
        details: "High-performance business model featuring a spacious 15.6-inch screen with a full numeric keypad, ideal for accountants, Excel dashboard managers, database administrators, and graphic design enthusiasts."
      },
      {
        id: "LP-107",
        brand: "Lenovo",
        model: "IdeaPad 3 15",
        processor: "AMD Ryzen 3 5300U (Quad-Core)",
        ram: "8 GB DDR4 RAM",
        ssd: "256 GB NVMe SSD",
        screen: "15.6\" FHD Touchscreen Display",
        gpu: "AMD Radeon Graphics",
        battery: "Up to 4 Hours Backup",
        pricePKR: 54000,
        condition: "Imported Refurbished",
        category: "Student Budget",
        warranty: "1 Month Checking Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=80",
        details: "The best low-budget option for students getting started with computer applications. Under Rs. 55,000, you get a premium touchscreen, thin-and-light chassis, and fast NVMe storage for effortless daily tasks."
      }
    ],
    courses: [
      {
        id: "CR-1",
        title: "CIT (Certificate in Information Technology)",
        code: "CIT-101",
        duration: "3 Months (Daily 1.5 Hours)",
        level: "Basic",
        feePKR: 3500,
        schedule: "Morning & Evening Batches",
        certificate: "Nomi Computers Certified + Govt recognized Board option available",
        description: "Our hallmark computer applications course. Essential training for basic office jobs, school applications, and administrative careers in Pakistan.",
        syllabus: [
          "Introduction to Information Technology & Computer Operating Systems (Windows)",
          "Microsoft Word (Pro drafting, formatting letters, Urdu writing typing setups)",
          "Microsoft Excel (Data entries, business ledgers, basic accounting, equations)",
          "Microsoft PowerPoint (Crafting professional slides & digital project briefs)",
          "InPage Urdu (Keyboards layouts, typesetting newspapers and thesis papers)",
          "Internet Basics, secure email writing, safety concepts, and search engine usage"
        ],
        skillsGained: [
          "Speed Typing (English & Urdu InPage)",
          "Microsoft Office Specialist",
          "Administrative Office Handling",
          "Spreadsheet Management",
          "Urdu Drafting Specialist"
        ],
        popular: true,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "CR-2",
        title: "DIT (Diploma in Information Technology)",
        code: "DIT-201",
        duration: "6 Months (Daily 2 Hours)",
        level: "Intermediate",
        feePKR: 5000,
        schedule: "Flexible Hours (Morning, Juma Batch, Custom Evening)",
        certificate: "Punjab Board of Technical Education (PBTE) / Nomi Academy Certified Diploma",
        description: "An advanced comprehensive technical program covering soft applications, computer network infrastructure, system hardware assembly, and professional internet setups.",
        syllabus: [
          "All modules of CIT (Word, Excel, PowerPoint, Urdu InPage)",
          "Computer Hardware Engineering (Assembling PC parts, upgrading RAM/SSD, virus removal)",
          "Operating Systems administration (Windows server commands, partition tables)",
          "Basic Graphic Designing foundations (Business cards, local banners, image editing)",
          "Computer Networking Essentials (Setting up routers, LAN cabling, Wi-Fi optimization)",
          "Introduction to Relational Databases (Ms Access & Structured Query basics)"
        ],
        skillsGained: [
          "Computer Maintenance & Assembly",
          "Enterprise Networks Design",
          "Windows Server Handling",
          "Advanced Database Entries",
          "Practical Hardware diagnosis"
        ],
        popular: true,
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "CR-3",
        title: "Elite Web Development Mastery",
        code: "CR-WEB",
        duration: "3 Months (Mon-Thu, 2 Hours)",
        level: "Professional",
        feePKR: 8500,
        schedule: "Evening Only (04:00 PM - 06:00 PM)",
        certificate: "Nomi Computers Professional Full-Stack Dev Certification",
        description: "Craft premium websites from scratch. Go from zero logic to building real full-stack React.js and Express portals. Highly valued for online remote working.",
        syllabus: [
          "Modern HTML5, Semantic Elements, CSS3, Flexbox & CSS Grid layouts",
          "Tailwind CSS Utility-First Framework workflow and mobile-first responsiveness",
          "JavaScript Fundamentals & Advanced ES6+ (Variables, Arrays, Async-Await, API fetching)",
          "ReactJS Framework: Component Architecture, hooks (State, Effects, Memo), custom interfaces",
          "Backend basics: Node.js ecosystem, Express framework rest-endpoints, and storage",
          "Git & GitHub deployment workflow to Vercel/Render, hosting configurations"
        ],
        skillsGained: [
          "Responsive Frontend Design",
          "React JS Architecture",
          "Tailwind CSS Layout Mastery",
          "Asynchronous JS API Consumptions",
          "Git & GitHub Version Systems"
        ],
        popular: true,
        image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "CR-4",
        title: "Advanced Graphic Design & UI/UX",
        code: "CR-GRPH",
        duration: "3 Months (Daily 1.5 Hours)",
        level: "Professional",
        feePKR: 6000,
        schedule: "Afternoon Batch (02:00 PM - 03:30 PM)",
        certificate: "Professional Graphic & UI Designer Diploma",
        description: "Unlock visual creativity. Plan, layout, and deliver stunning social media graphics, local billboards, branding kits, catalog layouts, and high-quality web-app layouts using industry standards.",
        syllabus: [
          "Elements and Principles of Visual Design: Space, balance, colors theories",
          "Adobe Photoshop: Advanced photo manipulation, compositing, product mockups, background removal",
          "Adobe Illustrator: Vector illustration, logo designs, custom typography, brand identities",
          "Figma UI/UX: Layout frames, mobile application wires, vector grids, interactive flow prototypes",
          "Canva Pro workflow for fast social commerce templates, banners, and video shorts",
          "Export profiles, prepress configurations, packaging outputs"
        ],
        skillsGained: [
          "Vector Branding & Logo Creation",
          "Premium Photo Manipulations",
          "Figma Mobile App Mockups",
          "Social Commerce Ads Design",
          "Prepress Proofing & Packaging"
        ],
        popular: false,
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "CR-5",
        title: "Global Freelancing & Digital Marketing",
        code: "CR-FREE",
        duration: "2 Months (Weekend Special - Fri/Sat)",
        level: "Professional",
        feePKR: 4500,
        schedule: "Weekends Only (03:00 PM - 06:00 PM)",
        certificate: "Nomi Computers Certified Digital Marketer & Freelancing Expert",
        description: "Learn how to monetize your tech skills internationally. Create high-converting profiles on Fiverr, Upwork, and manage social business engines inside Dunyapur.",
        syllabus: [
          "Introduction to Freelancing Platforms: Understanding Gig rankings, search engines algorithms",
          "Fiverr Mastery: Creating Gigs, SEO titles, pricing packaging tierings, client chat communication",
          "Upwork Mastery: Writing winning cover proposals, bid strategies, hourly contracts safety",
          "Social Media Marketing: Meta/Facebook Pages creation, targeting demographics ads, local lead maps",
          "Content Copywriting: Leveraging AI and SEO techniques for high-click blogs & descriptions",
          "International payment wire setups (Payoneer, local bank withdrawals)"
        ],
        skillsGained: [
          "Fiverr Gig SEO Optimization",
          "Upwork Cover Letter Draftings",
          "Meta Demographics Ads Targeting",
          "SEO Content Composition",
          "Client Relationship Handling"
        ],
        popular: false,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
      }
    ],
    bookings: [],
    jobs: [
      {
        id: "JB-201",
        title: "Senior IT Instructor",
        department: "Education Academy",
        location: "Dunyapur Branch",
        type: "Full-Time",
        salaryRange: "Rs. 30,000 - 50,000 / month",
        description: "We are seeking a skilled and passionate Senior IT Instructor to join our Dunyapur branch. You will lead lectures and hands-on laboratory exercises for our CIT, DIT, and Web Development Mastery programs.",
        requirements: [
          "Bachelor's degree in Computer Science, IT, or equivalent practical experience.",
          "Proficient in Microsoft Office suite, hardware maintenance, and HTML/CSS/React.",
          "Excellent local language communication skills (Urdu & Punjabi) to convey tech concepts.",
          "Prior experience teaching or training at an academy or institute."
        ],
        responsibilities: [
          "Deliver daily lectures and coordinate lab sessions for CIT/DIT students.",
          "Assist students with individual final development projects.",
          "Prepare exam sheets, evaluate practical exercises, and record student grades.",
          "Ensure laboratory equipment and laptops remain healthy and configured."
        ],
        postedDate: "2026-07-01",
        active: true
      },
      {
        id: "JB-202",
        title: "Hardware Support Technician",
        department: "Laptops & Repair Office",
        location: "Ajmery Plaza, Dunyapur",
        type: "Part-Time",
        salaryRange: "Rs. 15,000 - 25,000 / month",
        description: "Nomi Computers is looking for a part-time Hardware Support Technician to manage client diagnostic repair setups and incoming stock customization (RAM & SSD upgrades).",
        requirements: [
          "Proven experience diagnosing motherboard, thermal paste, and display faults.",
          "Adept at upgrading laptop RAM and PCIe SSD storages.",
          "Strong troubleshooting skills for Windows operating system setups.",
          "Punctual and capable of working in evening/night shifts."
        ],
        responsibilities: [
          "Upgrade and install custom hardware components based on customer preorder requests.",
          "Diagnose and repair customer devices brought to the Kazmi Chowk branch.",
          "Maintain clean catalog details and register items for system deliveries."
        ],
        postedDate: "2026-07-03",
        active: true
      }
    ],
    accessories: [
      {
        id: "AC-201",
        name: "Redragon M601 RGB Cobra Gaming Mouse",
        brand: "Redragon",
        category: "Mice",
        pricePKR: 2800,
        condition: "Brand New",
        warranty: "6 Months Local Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
        details: "High-precision 7200 DPI gaming mouse with custom breathing RGB profiles, 5 programmable buttons, and an ergonomic structure optimized for long programming or gaming sessions at Kazmi Chowk."
      },
      {
        id: "AC-202",
        name: "Lenovo ThinkPad Compact Wireless Keyboard",
        brand: "Lenovo",
        category: "Keyboards",
        pricePKR: 5500,
        condition: "Like New",
        warranty: "3 Months Checking Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        details: "Legendary tactile keys. Bring the legendary comfort of ThinkPad typing to any computer. Features quiet keys, scissor-switch action, and standard 2.4GHz wireless connection."
      },
      {
        id: "AC-203",
        name: "HP Smart Universal 90W Blue-Pin Charger",
        brand: "HP",
        category: "Chargers",
        pricePKR: 3500,
        condition: "Brand New",
        warranty: "6 Months Replacement Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        details: "Premium official HP power adapter with 4.5mm blue-pin barrel connector. Built-in smart protection prevents damage from voltage surges and short circuits in high-temperature climates."
      },
      {
        id: "AC-204",
        name: "Dany 10-in-1 Premium USB-C Multi-Hub",
        brand: "Dany",
        category: "Cables",
        pricePKR: 4800,
        condition: "Brand New",
        warranty: "6 Months Local Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=80",
        details: "Expand your thin-and-light laptop's connectivity. Adds 4K HDMI, Gigabit Ethernet, 3x USB 3.0 ports, SD/MicroSD card slots, and USB-C pass-through Power Delivery."
      },
      {
        id: "AC-205",
        name: "Kingston DataTraveler 128GB USB 3.2 Flash Drive",
        brand: "Kingston",
        category: "Storage",
        pricePKR: 2200,
        condition: "Brand New",
        warranty: "1 Year Replacement Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1562975078-0a69f2f2157e?w=600&auto=format&fit=crop&q=80",
        details: "High-speed USB 3.2 Gen 1 performance for fast transfers of class assignments, InPage drafts, software setups, and Windows installation files. Sleek and durable metal casing."
      },
      {
        id: "AC-206",
        name: "Samsung T7 Touch Portable 1TB External SSD",
        brand: "Samsung",
        category: "Storage",
        pricePKR: 24500,
        condition: "Brand New",
        warranty: "1 Year Official Warranty",
        popular: true,
        image: "https://images.unsplash.com/photo-1601524909162-be87252be298?w=600&auto=format&fit=crop&q=80",
        details: "Ultra-fast read/write speeds of up to 1050 MB/s. Features a built-in fingerprint scanner for military-grade data security. Shock-resistant, lightweight, and perfect for remote developers."
      },
      {
        id: "AC-207",
        name: "Dell original 4-Cell High-Capacity Battery",
        brand: "Dell",
        category: "Chargers",
        pricePKR: 6000,
        condition: "Brand New",
        warranty: "6 Months Replacement Warranty",
        popular: false,
        image: "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=600&auto=format&fit=crop&q=80",
        details: "Original high-performance battery for Dell Latitude and Inspiron systems. Guarantees 4-5 hours of solid portable coding and spreadsheet work during local power shedding hours."
      }
    ],
    applications: [],
    admissions: [],
    admission_requests: [],
    users: []
  };

  const readDB = () => {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
        return DEFAULT_DB;
      }
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(raw);
      let changed = false;
      if (!db.accessories) {
        db.accessories = DEFAULT_DB.accessories;
        changed = true;
      }
      if (!db.admission_requests) {
        db.admission_requests = [];
        changed = true;
      }
      if (!db.users) {
        db.users = [];
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      }
      return db;
    } catch (e) {
      console.error("Local database read mismatch, falling back:", e);
      return DEFAULT_DB;
    }
  };

  const writeDB = (dbState: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
    } catch (e) {
      console.error("Local database write error:", e);
    }
  };

  // Auth validator helper for headers
  const requireAdminAuth = (req: any, res: any, next: any) => {
    const emailStr = req.headers["x-admin-email"] || req.query.adminEmail;
    const passStr = req.headers["x-admin-password"] || req.query.adminPassword;
    
    if (emailStr === "bhindersame48@gmail.com" && passStr === "DrLaibaTariq928!") {
      next();
    } else {
      res.status(401).json({ error: "Access Denied: Unauthenticated requests are rejected. Admin permissions required!" });
    }
  };

  // Public/Admin endpoint: GET laptops list
  app.get("/api/laptops", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "laptops"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: ADD laptop
  app.post("/api/laptops", requireAdminAuth, async (req, res) => {
    try {
      const product = req.body;
      if (!product.model || !product.brand) {
        return res.status(400).json({ error: "Brand and Model details are required." });
      }
      const customId = "LP-" + Math.floor(100 + Math.random() * 900);
      const newLaptop = {
        id: customId,
        brand: product.brand,
        model: product.model,
        processor: product.processor || "Standard Edition",
        ram: product.ram || "8 GB DDR4",
        ssd: product.ssd || "256 GB NVMe",
        screen: product.screen || "14.1\" FHD Display",
        gpu: product.gpu || "Integrated GPU",
        battery: product.battery || "4-5 Hours Backup",
        pricePKR: Number(product.pricePKR) || 50000,
        condition: product.condition || "A+ Grade",
        category: product.category || "Student Budget",
        warranty: product.warranty || "1 Month Support Support",
        popular: !!product.popular,
        image: product.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600",
        details: product.details || "Custom system checked in Dunyapur branch."
      };
      await setDoc(doc(db, "laptops", customId), newLaptop);
      res.status(201).json({ success: true, laptop: newLaptop });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: UPDATE laptop details
  app.put("/api/laptops/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "laptops", targetId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Laptop record not found." });
      }
      const updated = {
        ...docSnap.data(),
        ...req.body,
        id: targetId
      };
      await setDoc(ref, updated);
      res.json({ success: true, laptop: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: DELETE laptop
  app.delete("/api/laptops/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      await deleteDoc(doc(db, "laptops", targetId));
      res.json({ success: true, message: "Laptop deleted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public/Admin endpoint: GET accessories list
  app.get("/api/accessories", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "accessories"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: ADD accessory
  app.post("/api/accessories", requireAdminAuth, async (req, res) => {
    try {
      const item = req.body;
      if (!item.name || !item.brand) {
        return res.status(400).json({ error: "Brand and Name details are required." });
      }
      const customId = "AC-" + Math.floor(200 + Math.random() * 800);
      const newAccessory = {
        id: customId,
        name: item.name,
        brand: item.brand,
        category: item.category || "Other",
        pricePKR: Number(item.pricePKR) || 2000,
        condition: item.condition || "Brand New",
        warranty: item.warranty || "6 Months Local Warranty",
        popular: !!item.popular,
        image: item.image || "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600",
        details: item.details || "Custom computer accessory checked at Nomi Computers."
      };
      await setDoc(doc(db, "accessories", customId), newAccessory);
      res.status(201).json({ success: true, accessory: newAccessory });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: UPDATE accessory details
  app.put("/api/accessories/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "accessories", targetId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Accessory record not found." });
      }
      const updated = {
        ...docSnap.data(),
        ...req.body,
        id: targetId
      };
      await setDoc(ref, updated);
      res.json({ success: true, accessory: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: DELETE accessory
  app.delete("/api/accessories/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      await deleteDoc(doc(db, "accessories", targetId));
      res.json({ success: true, message: "Accessory deleted from catalog." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public/Admin endpoint: GET courses list
  app.get("/api/courses", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "courses"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: ADD course
  app.post("/api/courses", requireAdminAuth, async (req, res) => {
    try {
      const course = req.body;
      if (!course.title || !course.code) {
        return res.status(400).json({ error: "Title and ID Code are required." });
      }
      const customId = "CR-" + Math.floor(10 + Math.random() * 90);
      const newCourse = {
        id: customId,
        title: course.title,
        code: course.code,
        duration: course.duration || "3 Months (Daily)",
        level: course.level || "Basic",
        feePKR: Number(course.feePKR) || 3000,
        schedule: course.schedule || "Morning & Evening Slots",
        certificate: course.certificate || "Nomi Certified Academy",
        description: course.description || "Tech education curriculum",
        syllabus: Array.isArray(course.syllabus) ? course.syllabus : [course.description || "Core foundations"],
        skillsGained: Array.isArray(course.skillsGained) ? course.skillsGained : ["Basic computing skills"],
        popular: !!course.popular,
        image: course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"
      };
      await setDoc(doc(db, "courses", customId), newCourse);
      res.status(201).json({ success: true, course: newCourse });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: UPDATE course
  app.put("/api/courses/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "courses", targetId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Course record not found." });
      }
      const updated = {
        ...docSnap.data(),
        ...req.body,
        id: targetId
      };
      await setDoc(ref, updated);
      res.json({ success: true, course: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: DELETE course
  app.delete("/api/courses/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      await deleteDoc(doc(db, "courses", targetId));
      res.json({ success: true, message: "Course deleted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public/Admin endpoint: ADD user booking reservation
  app.post("/api/bookings", async (req, res) => {
    try {
      const data = req.body;
      if (!data.name || !data.phone) {
        return res.status(400).json({ error: "Student name and phone are required to reserve." });
      }
      const bookingId = "NC-" + Math.floor(1000 + Math.random() * 9000);
      const bookingPayload = {
        id: bookingId,
        name: data.name,
        phone: data.phone,
        cnic: data.cnic ? data.cnic.replace(/\D/g, "") : "",
        password: data.password ? hashPassword(data.password) : "",
        type: data.type || "laptop",
        item: data.item || "HP EliteBook Setup",
        details: data.details || "",
        status: "Pending VerifiedAtOffice",
        date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      const docRef = await addDoc(collection(db, "bookings"), bookingPayload);
      const safeBooking = { firestoreId: docRef.id, ...bookingPayload };
      delete (safeBooking as any).password;
      res.status(201).json({ success: true, booking: safeBooking });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public endpoint: Track orders by CNIC number
  app.get("/api/track-cnic", async (req, res) => {
    try {
      const cnicParam = req.query.cnic as string;
      if (!cnicParam) {
        return res.status(400).json({ error: "CNIC query parameter is required." });
      }
      const cleanSearch = cnicParam.replace(/\D/g, "");
      if (!cleanSearch) {
        return res.json([]);
      }
      const q = query(collection(db, "bookings"), where("cnic", "==", cleanSearch));
      const snap = await getDocs(q);
      const results: any[] = [];
      snap.forEach(docSnap => {
        const item = docSnap.data();
        const { password, ...rest } = item as any;
        results.push({ ...rest, firestoreId: docSnap.id });
      });
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public endpoint: Track admission status by ID or Student Mobile
  app.get("/api/track-admission", async (req, res) => {
    try {
      const queryParam = req.query.query as string;
      if (!queryParam) {
        return res.status(400).json({ error: "Query parameter (Admission ID or Mobile) is required." });
      }
      const cleanQuery = queryParam.trim().toLowerCase();
      const cleanMobile = queryParam.replace(/\D/g, "");

      const snap = await getDocs(collection(db, "admissions"));
      let found: any = null;
      snap.forEach(docSnap => {
        const adm = docSnap.data();
        const idLower = (adm.id || "").toLowerCase();
        const idMatch = idLower === cleanQuery || idLower.replace("ad-", "") === cleanQuery.replace("ad-", "");
        let mobileMatch = false;
        if (adm.studentMobile) {
          mobileMatch = adm.studentMobile.replace(/\D/g, "") === cleanMobile && cleanMobile.length > 5;
        }
        if (idMatch || mobileMatch) {
          found = { ...adm, firestoreId: docSnap.id };
        }
      });

      if (!found) {
        return res.status(404).json({ error: "No admission registry record found for this query." });
      }

      res.json({
        success: true,
        admission: {
          id: found.id,
          status: found.status || "pending",
          name: found.name,
          courseName: found.courseName,
          dob: found.dob,
          dated: found.dated,
          submittedAt: found.submittedAt,
          receiptNo: found.receiptNo,
          receiptDate: found.receiptDate,
          monthlyFees: found.monthlyFees,
          officeCourseName: found.officeCourseName,
          admittedToGrade: found.admittedToGrade,
          registrationNo: found.registrationNo,
          registrarName: found.registrarName,
          vicePrincipalName: found.vicePrincipalName,
          principalName: found.principalName
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public endpoint: Customer login with CNIC and password
  app.post("/api/customer-login", async (req, res) => {
    try {
      const { cnic, password } = req.body;
      if (!cnic || !password) {
        return res.status(400).json({ error: "CNIC and password are required." });
      }
      const cleanCnic = cnic.replace(/\D/g, "");
      const hashedSearch = hashPassword(password);

      const q = query(collection(db, "bookings"), where("cnic", "==", cleanCnic));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), firestoreId: docSnap.id });
      });

      if (list.length === 0) {
        return res.status(401).json({ error: "Invalid CNIC or Password" });
      }

      const validBooking = list.find((b: any) => b.password === hashedSearch);
      if (!validBooking) {
        return res.status(401).json({ error: "Invalid CNIC or Password" });
      }

      // Map to safe format (strip password)
      const safeBookings = list.map(({ password, ...rest }: any) => ({
        ...rest,
        cnic: rest.cnic || ""
      }));

      res.json({
        success: true,
        customer: {
          name: validBooking.name,
          phone: validBooking.phone,
          cnic: validBooking.cnic || ""
        },
        bookings: safeBookings
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Admin-Only: GET all bookings
  app.get("/api/bookings", requireAdminAuth, async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), firestoreId: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Admin-Only: DELETE booking
  app.delete("/api/bookings/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "bookings", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await deleteDoc(ref);
        res.json({ success: true, message: "Booking deleted." });
      } else {
        const q = query(collection(db, "bookings"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(snap.docs[0].ref);
          res.json({ success: true, message: "Booking deleted." });
        } else {
          res.status(404).json({ error: "Booking record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Admin-Only: UPDATE booking status
  app.put("/api/bookings/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "bookings", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await updateDoc(ref, req.body);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "bookings"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, req.body);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Booking record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Verification Login API
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (email === "bhindersame48@gmail.com" && password === "DrLaibaTariq928!") {
      res.json({ success: true, message: "Welcome back Admin." });
    } else {
      res.status(401).json({ error: "Unauthorized: Invalid Admin Gmail or Security Key!" });
    }
  });

  // ==================== JOBS & APPLICATIONS API ====================

  // Public: GET all active jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "jobs"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: POST a new job opening
  app.post("/api/jobs", requireAdminAuth, async (req, res) => {
    try {
      const job = req.body;
      if (!job.title || !job.department) {
        return res.status(400).json({ error: "Job title and department are required." });
      }
      const customId = "JB-" + Math.floor(200 + Math.random() * 800);
      const newJob = {
        id: customId,
        title: job.title,
        department: job.department,
        location: job.location || "Dunyapur Branch",
        type: job.type || "Full-Time",
        salaryRange: job.salaryRange || "Competitive",
        description: job.description || "",
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        postedDate: new Date().toISOString().split("T")[0],
        active: job.active !== undefined ? !!job.active : true
      };
      await setDoc(doc(db, "jobs", customId), newJob);
      res.status(201).json({ success: true, job: newJob });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: PUT update a job opening
  app.put("/api/jobs/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "jobs", targetId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Job opening not found." });
      }
      const updated = {
        ...docSnap.data(),
        ...req.body,
        id: targetId
      };
      await setDoc(ref, updated);
      res.json({ success: true, job: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: DELETE a job opening
  app.delete("/api/jobs/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      await deleteDoc(doc(db, "jobs", targetId));
      res.json({ success: true, message: "Job opening deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public: POST submit job application
  app.post("/api/jobs/applications", async (req, res) => {
    try {
      const data = req.body;
      if (!data.jobId || !data.name || !data.email || !data.phone || !data.cnic) {
        return res.status(400).json({ error: "Job ID, name, email, phone, and CNIC are required." });
      }
      const customId = "JA-" + Math.floor(1000 + Math.random() * 9000);
      const newApp = {
        id: customId,
        jobId: data.jobId,
        jobTitle: data.jobTitle || "Job Opening",
        name: data.name,
        email: data.email,
        phone: data.phone,
        cnic: data.cnic ? data.cnic.replace(/\D/g, "") : "",
        experience: data.experience || "",
        coverLetter: data.coverLetter || "",
        status: "Pending",
        appliedDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      const docRef = await addDoc(collection(db, "applications"), newApp);
      res.status(201).json({ success: true, application: { firestoreId: docRef.id, ...newApp } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: GET all job applications
  app.get("/api/jobs/applications", requireAdminAuth, async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "applications"));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), firestoreId: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: PUT update job application status
  app.put("/api/jobs/applications/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "applications", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await updateDoc(ref, req.body);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "applications"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, req.body);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Job application not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: DELETE job application
  app.delete("/api/jobs/applications/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "applications", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await deleteDoc(ref);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "applications"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(snap.docs[0].ref);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Job application not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public logic helper for submitting online student admission forms
  const processAdmissionSubmission = async (req: any, res: any) => {
    try {
      const data = req.body;
      if (!data.name || !data.courseName || !data.studentMobile) {
        return res.status(400).json({ error: "Student Name, Course Name, and Mobile Number are required." });
      }
      const customId = "AD-" + Math.floor(1000 + Math.random() * 9000);
      const newAdmission = {
        id: customId,
        status: "pending",
        name: data.name,
        religion: data.religion || "",
        dob: data.dob || "",
        hobbies: data.hobbies || "",
        courseName: data.courseName,
        homeAddress: data.homeAddress || "",
        studentPhone: data.studentPhone || "",
        studentMobile: data.studentMobile || "",
        studentEmail: data.studentEmail || "",
        fatherName: data.fatherName || "",
        guardianName: data.guardianName || "",
        parentOccupation: data.parentOccupation || "",
        parentMonthlyIncome: data.parentMonthlyIncome || "",
        parentPhoneOffice: data.parentPhoneOffice || "",
        parentPhone: data.parentPhone || "",
        parentBusinessAddress: data.parentBusinessAddress || "",
        parentEmail: data.parentEmail || "",
        rulesAccepted: !!data.rulesAccepted,
        dated: data.dated || new Date().toISOString().split("T")[0],
        signStudent: data.signStudent || "",
        signParent: data.signParent || "",
        submittedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        receiptNo: data.receiptNo || "",
        receiptDate: data.receiptDate || "",
        monthlyFees: data.monthlyFees || "",
        officeCourseName: data.officeCourseName || data.courseName,
        admittedToGrade: data.admittedToGrade || "",
        registrationNo: data.registrationNo || "",
        registrarName: data.registrarName || "",
        vicePrincipalName: data.vicePrincipalName || "",
        principalName: data.principalName || ""
      };
      const docRef = await addDoc(collection(db, "admissions"), newAdmission);
      res.status(201).json({ 
        success: true, 
        admission: { firestoreId: docRef.id, ...newAdmission } 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // Register public routes for admissions/registrations explicitly
  app.post("/api/admissions", processAdmissionSubmission);
  app.post("/api/admission-requests", processAdmissionSubmission);
  app.post("/api/registrations", processAdmissionSubmission);

  // Admin endpoint: GET all pending admission requests
  app.get("/api/admission-requests", requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, "admissions"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), firestoreId: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: UPDATE/APPROVE admission request
  app.put("/api/admission-requests/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "admissions", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await updateDoc(ref, req.body);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "admissions"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, req.body);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Admission record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: DELETE admission request
  app.delete("/api/admission-requests/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "admissions", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await deleteDoc(ref);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "admissions"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(snap.docs[0].ref);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Admission record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: GET all approved admissions
  app.get("/api/admissions", requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, "admissions"), where("status", "==", "approved"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), firestoreId: docSnap.id });
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: UPDATE approved admission details
  app.put("/api/admissions/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "admissions", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await updateDoc(ref, req.body);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "admissions"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, req.body);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Admission record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint: DELETE approved admission
  app.delete("/api/admissions/:id", requireAdminAuth, async (req, res) => {
    try {
      const targetId = req.params.id;
      const ref = doc(db, "admissions", targetId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await deleteDoc(ref);
        res.json({ success: true });
      } else {
        const q = query(collection(db, "admissions"), where("id", "==", targetId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(snap.docs[0].ref);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Admission record not found." });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== SIMPLE AUTHENTICATION SYSTEM ENDPOINTS ====================

  // REGISTER USER (Simple: Name + Gmail + Password)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, Gmail, and Password are required." });
      }
      const cleanEmail = email.trim().toLowerCase();
      const userRef = doc(db, "users", cleanEmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return res.status(400).json({ error: "This Gmail address is already registered." });
      }

      const newUser = {
        id: "USR-" + Math.floor(1000 + Math.random() * 9000),
        name: name.trim(),
        email: cleanEmail,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newUser);

      console.log(`[Nomi Auth] Registered User: ${newUser.name} | ${newUser.email}`);
      const sessionToken = crypto.randomBytes(32).toString("hex");
      res.cookie("nomi_session", sessionToken, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.status(201).json({ 
        success: true, 
        message: "Registration successful! Redirecting...",
        user: { name: newUser.name, email: newUser.email },
        session: sessionToken
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // USER LOGIN (Simple: Gmail + Password)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Gmail and Password are required." });
      }
      const cleanEmail = email.trim().toLowerCase();
      const userRef = doc(db, "users", cleanEmail);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return res.status(401).json({ error: "Invalid Gmail address or password." });
      }

      const user = userSnap.data();
      const hashedInput = hashPassword(password);
      if (user.password !== hashedInput) {
        return res.status(401).json({ error: "Invalid Gmail address or password." });
      }

      const sessionToken = crypto.randomBytes(32).toString("hex");
      res.cookie("nomi_session", sessionToken, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.json({
        success: true,
        message: "Login successful. Redirecting...",
        user: { name: user.name, email: user.email },
        session: sessionToken
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed database from db_local.json if Firestore is empty
  const seedDatabaseIfNeeded = async () => {
    console.log("Checking if Firestore database seeding is needed...");
    try {
      // 1. Check laptops
      const laptopsCol = collection(db, "laptops");
      const laptopsSnap = await getDocs(laptopsCol);
      if (laptopsSnap.empty) {
        console.log("Seeding laptops to Firestore...");
        const dbLocal = JSON.parse(fs.readFileSync("./db_local.json", "utf-8"));
        for (const item of dbLocal.laptops || []) {
          await setDoc(doc(db, "laptops", item.id), item);
        }
      }

      // 2. Check accessories
      const accsCol = collection(db, "accessories");
      const accsSnap = await getDocs(accsCol);
      if (accsSnap.empty) {
        console.log("Seeding accessories to Firestore...");
        const dbLocal = JSON.parse(fs.readFileSync("./db_local.json", "utf-8"));
        for (const item of dbLocal.accessories || []) {
          await setDoc(doc(db, "accessories", item.id), item);
        }
      }

      // 3. Check courses
      const coursesCol = collection(db, "courses");
      const coursesSnap = await getDocs(coursesCol);
      if (coursesSnap.empty) {
        console.log("Seeding courses to Firestore...");
        const dbLocal = JSON.parse(fs.readFileSync("./db_local.json", "utf-8"));
        for (const item of dbLocal.courses || []) {
          await setDoc(doc(db, "courses", item.id), item);
        }
      }

      // 4. Check jobs
      const jobsCol = collection(db, "jobs");
      const jobsSnap = await getDocs(jobsCol);
      if (jobsSnap.empty) {
        console.log("Seeding jobs to Firestore...");
        const dbLocal = JSON.parse(fs.readFileSync("./db_local.json", "utf-8"));
        for (const item of dbLocal.jobs || []) {
          await setDoc(doc(db, "jobs", item.id), item);
        }
      }
      console.log("Firestore database checks and seeding completed successfully.");
    } catch (err) {
      console.error("Error during Firestore database seeding:", err);
    }
  };

  await seedDatabaseIfNeeded();

  // Integrates Vite production or development server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nomi Computers Server is active on port ${PORT}`);
  });
}

startServer();
