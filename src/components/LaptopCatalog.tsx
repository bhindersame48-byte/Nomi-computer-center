import React, { useState, useEffect } from "react";
import { Laptop, Booking } from "../types";
import { LAPTOPS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, Laptop as LaptopIcon, Sparkles, CheckCircle2, ChevronRight, X, PhoneCall, Info, ShoppingCart } from "lucide-react";
import laptopShowroomUrl from "../assets/images/showroom_light_1781247007589.jpg";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function LaptopCatalog() {
  const [laptops, setLaptops] = useState<Laptop[]>(LAPTOPS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(220000);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);

  useEffect(() => {
    fetch("/api/laptops")
      .then((res) => {
        if (!res.ok) throw new Error("Catalog load failed");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLaptops(data);
        }
      })
      .catch((err) => console.warn("Using offline laptop catalog context fallback:", err));
  }, []);
  
  // Booking Form States
  const [isBooking, setIsBooking] = useState(false);
  const [bookingLaptop, setBookingLaptop] = useState<Laptop | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingCnic, setBookingCnic] = useState("");
  const [bookingPassword, setBookingPassword] = useState("");
  const [selectedRamUpgrade, setSelectedRamUpgrade] = useState<string>("Default");
  const [selectedSsdUpgrade, setSelectedSsdUpgrade] = useState<string>("Default");
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Filter lists
  const categories = ["All", "Coding & Office", "Gaming", "Student Budget", "Graphic Design"];
  const brands = ["All", "HP", "Dell", "Lenovo", "Apple"];

  const filteredLaptops = laptops.filter((laptop) => {
    const matchesSearch = 
      laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laptop.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laptop.processor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || laptop.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || laptop.brand === selectedBrand;
    const matchesPrice = laptop.pricePKR <= maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingLaptop) return;

    setBookingLoading(true);
    const upgradeDetails = `RAM: ${selectedRamUpgrade}, Storage: ${selectedSsdUpgrade}`;

    const generatedId = "NC-" + Math.floor(1000 + Math.random() * 9000);
    const bookingPayload = {
      id: generatedId,
      name: bookingName,
      phone: bookingPhone,
      cnic: bookingCnic ? bookingCnic.replace(/\D/g, "") : "",
      password: bookingPassword || "",
      type: "laptop" as const,
      item: `${bookingLaptop.brand} ${bookingLaptop.model}`,
      details: `Requested spec modifications: ${upgradeDetails}. Quoted Price: Rs. ${laptopPriceCalculated(bookingLaptop).toLocaleString()}`,
      status: "Pending VerifiedAtOffice",
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
      const docRef = await addDoc(collection(db, "bookings"), bookingPayload);
      const bookingWithId = { firestoreId: docRef.id, ...bookingPayload };
      
      console.log("Data:", bookingWithId);

      // Save to client storage to enable active bookings checker
      const existingBookings = JSON.parse(localStorage.getItem("nomi_bookings") || "[]");
      existingBookings.push(bookingWithId);
      localStorage.setItem("nomi_bookings", JSON.stringify(existingBookings));

      setBookingSuccess(bookingWithId);
      setBookingName("");
      setBookingPhone("");
      setBookingCnic("");
      setBookingPassword("");
    } catch (err: any) {
      console.error(err);
      alert("Error submitting booking: " + (err?.message || String(err)));
    } finally {
      setBookingLoading(false);
    }
  };

  const laptopPriceCalculated = (laptop: Laptop) => {
    let basePrice = laptop.pricePKR;
    if (selectedRamUpgrade === "Upgrade to 16GB") basePrice += 4500;
    if (selectedRamUpgrade === "Upgrade to 32GB") basePrice += 9500;
    if (selectedSsdUpgrade === "Upgrade to 512GB SSD") basePrice += 4000;
    if (selectedSsdUpgrade === "Upgrade to 1TB SSD") basePrice += 8000;
    return basePrice;
  };

  return (
    <div id="section-laptops" className="relative py-12 px-4 md:px-8 bg-white border-t border-slate-200/80">
      
      {/* Showroom visual asset card */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-12 bg-gradient-to-tr from-sky-50 via-indigo-50/20 to-white border border-slate-200 p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-center shadow-sm">
        <div className="lg:w-1/2 space-y-4 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            <Sparkles className="h-3 w-3" /> NOMI SHOWROOM VIBE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Explore Handpicked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-850">Customized</span> Laptops
          </h2>
          <p className="text-sm text-slate-650 leading-relaxed font-sans font-normal">
            All our laptops are rigorously checked, thermal-repasted for hot climates like Punjab, and customized in-house with high-speed SSDs and dual-channel RAM. Buy with absolute confidence in Dunyapur!
          </p>
          <div className="flex flex-col gap-2 pt-2 text-slate-700">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Imported Refurbished & Sealed Packs
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Free Windows installation
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Backed by Local Warranty
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
              src={laptopShowroomUrl} 
              alt="Luxury Laptop Showroom Nomi Computers" 
              className="object-cover h-full w-full group-hover:scale-103 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-6">
              <div className="space-y-1 text-left">
                <p className="text-xs text-cyan-300 font-mono font-bold">LIVE SNAPSHOT</p>
                <h4 className="text-sm font-semibold text-white">Nomi Computers Physical Display Glass Counter</h4>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Interactive Filter Panel */}
        <div className="bg-[#f8fafc] rounded-2xl border border-slate-205 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 text-left">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="laptop-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search specs, brand (e.g. Ryzen 16GB, HP)..."
                className="w-full bg-white text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-450"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600 self-center mr-2 hidden sm:block" />
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-650 border border-slate-200 hover:border-slate-350"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-200/80">
            {/* Category tabs */}
            <div className="md:col-span-3 space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-505 uppercase tracking-wider block">Usage Category</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/15"
                        : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-505 uppercase tracking-wider">Max Budget (PKR)</span>
                <span className="text-xs font-mono font-semibold text-indigo-650">Rs. {maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="40000"
                max="220000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>40,000</span>
                <span>220,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Laptops Grid */}
        <AnimatePresence mode="popLayout">
          {filteredLaptops.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredLaptops.map((laptop) => (
                <motion.div
                  key={laptop.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-50">
                    <img
                      src={laptop.image}
                      alt={`${laptop.brand} ${laptop.model}`}
                      className="object-cover w-full h-full group-hover:scale-104 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 border border-slate-200 shadow-sm animate-pulse">
                        {laptop.condition}
                      </span>
                      {laptop.popular && (
                        <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <Sparkles className="h-2.5 w-2.5" /> HOT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono font-bold text-indigo-600">{laptop.brand.toUpperCase()} WORKSPACE</p>
                      <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{laptop.model}</h3>
                      
                      {/* Short spec list */}
                      <ul className="text-xs text-slate-600 space-y-1 pt-1.5 font-sans font-normal">
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {laptop.processor}</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {laptop.ram} / {laptop.ssd} NVMe</li>
                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {laptop.screen}</li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Guaranteed Price</p>
                        <p className="text-base font-bold text-slate-900 font-mono">Rs. {laptop.pricePKR.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedLaptop(laptop)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                          title="View detailed specs"
                        >
                          <Info className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => {
                            setBookingLaptop(laptop);
                            setIsBooking(true);
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Order
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8"
            >
              <LaptopIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-800 font-semibold">No systems found matching filters</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Try lowering the budget, selecting a broader brand, or clearing searching filters to locate available laptops.</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                  setMaxPrice(220000);
                }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-750 cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAILED SPECIFICATIONS MODAL */}
      <AnimatePresence>
        {selectedLaptop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border border-slate-250 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="md:w-5/12 h-48 md:h-auto bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-200">
                <img
                  src={selectedLaptop.image}
                  alt={selectedLaptop.model}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-100/30 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white font-bold px-2 py-1 rounded text-[10px] shadow">
                    {selectedLaptop.condition}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-none">
                <div className="space-y-4 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-indigo-600 font-bold font-mono">{selectedLaptop.brand.toUpperCase()}</p>
                      <h3 className="text-lg font-extrabold text-slate-900">{selectedLaptop.model}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedLaptop(null)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">{selectedLaptop.details}</p>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-2">Technical Matrix</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 whitespace-nowrap">Processor:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.processor}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Screen Layout:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.screen}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Storage / ROM:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.ssd}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">System RAM:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.ram}</p>
                      </div>
                      {selectedLaptop.gpu && (
                        <div>
                          <span className="text-slate-400">GPU Unit:</span>
                          <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.gpu}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Battery Performance:</span>
                        <p className="text-slate-700 mt-0.5 font-medium">{selectedLaptop.battery}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 border-dashed text-xs text-slate-600 flex items-start gap-2">
                    <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-800">Checking Warranty:</strong> Includes {selectedLaptop.warranty}. All spare modifications can be requested inside Dunyapur Kazmi Chowk branch.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Standard Price</span>
                    <span className="text-lg font-bold text-slate-850 font-mono">Rs. {selectedLaptop.pricePKR.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setBookingLaptop(selectedLaptop);
                      setSelectedLaptop(null);
                      setIsBooking(true);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.01] transition-all"
                  >
                    Configure & Book
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMIZE & BOOK INQUIRY MODAL */}
      <AnimatePresence>
        {isBooking && bookingLaptop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-150">
                    LAPTOP SECURE BOOKING
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">Book {bookingLaptop.brand} {bookingLaptop.model}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsBooking(false);
                    setBookingSuccess(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!bookingSuccess ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Standard Base Price</p>
                      <p className="text-slate-600 text-xs font-mono font-medium">Rs. {bookingLaptop.pricePKR.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Estimated Quote</p>
                      <p className="text-slate-900 text-base font-extrabold font-mono">Rs. {laptopPriceCalculated(bookingLaptop).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* SPECIFICATION UPGRADATION */}
                  <div className="space-y-3 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-550 tracking-wider uppercase">Optional Spec Customization</p>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 font-semibold block">RAM Upgrade</label>
                      <select
                        value={selectedRamUpgrade}
                        onChange={(e) => setSelectedRamUpgrade(e.target.value)}
                        className="w-full bg-white text-xs text-slate-800 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Default">Keep standard RAM ({bookingLaptop.ram})</option>
                        <option value="Upgrade to 16GB">Upgrade RAM to 16GB DDR4 (+ Rs. 4,500)</option>
                        <option value="Upgrade to 32GB">Upgrade RAM to 32GB DDR4 (+ Rs. 9,500)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 font-semibold block">SSD Upgrade</label>
                      <select
                        value={selectedSsdUpgrade}
                        onChange={(e) => setSelectedSsdUpgrade(e.target.value)}
                        className="w-full bg-white text-xs text-slate-800 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Default">Keep standard Storage ({bookingLaptop.ssd})</option>
                        <option value="Upgrade to 512GB SSD">Upgrade to 512GB High-Speed SSD (+ Rs. 4,000)</option>
                        <option value="Upgrade to 1TB SSD">Upgrade to 1TB Extreme-Speed SSD (+ Rs. 8,000)</option>
                      </select>
                    </div>
                  </div>

                  {/* CUSTOMER CONTACT DETAILS */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-550 tracking-wider uppercase">Your Contact Information</p>
                    
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="WhatsApp / Phone (e.g., 03007303000)"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 ${
                          bookingPhone 
                            ? (bookingPhone.replace(/\D/g, "").length >= 11 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {bookingPhone && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            bookingPhone.replace(/\D/g, "").length >= 11 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {bookingPhone.replace(/\D/g, "").length >= 11 
                              ? "✓ Complete phone number format" 
                              : `Incomplete: ${bookingPhone.replace(/\D/g, "").length}/11 digits entered`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={bookingCnic}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 13) {
                            let formatted = val;
                            if (val.length > 5 && val.length <= 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
                            } else if (val.length > 12) {
                              formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
                            }
                            setBookingCnic(formatted);
                          }
                        }}
                        placeholder="CNIC (National Identity Card) e.g. 35201-1234567-1"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 ${
                          bookingCnic 
                            ? (bookingCnic.replace(/\D/g, "").length === 13 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {bookingCnic && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            bookingCnic.replace(/\D/g, "").length === 13 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {bookingCnic.replace(/\D/g, "").length === 13 
                              ? "✓ Complete CNIC format" 
                              : `Incomplete: ${bookingCnic.replace(/\D/g, "").length}/13 digits entered`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={bookingPassword}
                        onChange={(e) => setBookingPassword(e.target.value)}
                        placeholder="Choose a Secure Password (min 6 characters)"
                        className={`w-full bg-slate-50 text-xs border rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 ${
                          bookingPassword 
                            ? (bookingPassword.length >= 6 ? "border-emerald-300 focus:border-emerald-500 bg-emerald-50/10" : "border-amber-300 focus:border-amber-500") 
                            : "border-slate-200"
                        }`}
                      />
                      {bookingPassword && (
                        <div className="flex items-center justify-between px-1 mt-1">
                          <span className={`text-[10px] font-medium ${
                            bookingPassword.length >= 6 ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {bookingPassword.length >= 6 
                              ? "✓ Password is secure" 
                              : `Too short: ${bookingPassword.length}/6 characters`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading || bookingPhone.replace(/\D/g, "").length < 11 || bookingCnic.replace(/\D/g, "").length < 13 || bookingPassword.length < 6}
                    className={`w-full py-3 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      (bookingLoading || bookingPhone.replace(/\D/g, "").length < 11 || bookingCnic.replace(/\D/g, "").length < 13 || bookingPassword.length < 6)
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
                        : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-850 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-600/10 cursor-pointer"
                    }`}
                  >
                    {bookingLoading ? "Registering secure booking..." : "Confirm Booking - Free RAM/SSD Install"}
                  </button>

                  <p className="text-[10px] text-center text-slate-450 leading-normal">
                    *Upon submitting, we check inventory. We will contact you on WhatsApp/Phone immediately once setup is ready for pickup or localized COD.
                  </p>
                </form>
              ) : (
                <div className="py-6 space-y-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-slate-900">Booking Allocated Successfully!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Congratulations <strong className="text-slate-700">{bookingName || "Sir/Madam"}</strong>, your request has been cataloged under code <strong className="text-indigo-600 font-mono font-bold">{bookingSuccess.id}</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-left space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between"><span className="text-slate-400">System model:</span> <span className="font-semibold text-slate-800">{bookingLaptop.model}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Client cell:</span> <span className="font-mono text-slate-800">{bookingSuccess.phone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Status:</span> <span className="text-emerald-600 font-bold">{bookingSuccess.status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Upgrade request:</span> <span className="text-indigo-600 italic">RAM Upgrade & Storage customizations applied</span></div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/923007303000?text=Assalam-o-Alaikum%20Nomi%20Computers!%20I%20have%20submitted%20booking%20ID%20${bookingSuccess.id}%20on%20your%20website%20for%20${bookingLaptop.brand}%20${bookingLaptop.model}.%20Please%20verify.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="h-4 w-4" /> Message WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setIsBooking(false);
                        setBookingLaptop(null);
                        setBookingSuccess(null);
                      }}
                      className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer transition-all"
                    >
                      Done
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
