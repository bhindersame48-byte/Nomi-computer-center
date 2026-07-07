import { Laptop, Course, Review, Accessory } from "./types";

export const LAPTOPS: Laptop[] = [
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
];

export const COURSES: Course[] = [
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
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "REV-1",
    author: "Zeeshan Ali",
    rating: 5,
    text: "Excellent services! Best place to learn computer applications. Sir Nomi and teaching staff are highly cooperative and experienced. The best center in Dunyapur area.",
    date: "2026-05-15",
    city: "Dunyapur",
    avatarColor: "bg-teal-500"
  },
  {
    id: "REV-2",
    author: "Sobia Kanwal",
    rating: 5,
    text: "Best Service of Staff. I did my Graphic Design course here. Exceptional separate learning laptops environment for female students which is highly professional and safe.",
    date: "2026-04-10",
    city: "Kazmi Chowk near Dunyapur",
    avatarColor: "bg-purple-500"
  },
  {
    id: "REV-3",
    author: "M. Rizwan",
    rating: 5,
    text: "A genuine place to learn computer applications and buy authentic laptops. I bought an HP EliteBook 840 G8 from Nomi Computers. Price was highly competitive and SSD upgradation was free of charge. 10/10 recommended!",
    date: "2026-06-01",
    city: "Dunyapur",
    avatarColor: "bg-blue-500"
  },
  {
    id: "REV-4",
    author: "Faisal Naeem",
    rating: 4,
    text: "Very reliable place for computer services and software. They also publish local government JOBS advertising and guide youngsters regarding job application form availability.",
    date: "2026-03-24",
    city: "Ajmery City Plaza Dunyapur",
    avatarColor: "bg-emerald-500"
  },
  {
    id: "REV-5",
    author: "Kashif Abbas",
    rating: 5,
    text: "Professional staff and exceptional services. The CIT and DIT practical systems are very high-speed, making learning very smooth. Highly appreciate their dedication.",
    date: "2026-06-08",
    city: "Railway Road Dunyapur",
    avatarColor: "bg-pink-500"
  }
];

export const ACCESSORIES: Accessory[] = [
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
];
