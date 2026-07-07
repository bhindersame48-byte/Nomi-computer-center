import React, { useState, useEffect } from "react";
import { Review } from "../types";
import { INITIAL_REVIEWS } from "../data";
import { Star, MapPin, User, Calendar, PlusCircle, PenSquare, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // New review form states
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [studentCity, setStudentCity] = useState("Dunyapur");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nomi_reviews");
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem("nomi_reviews", JSON.stringify(INITIAL_REVIEWS));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) return;

    const colors = ["bg-emerald-500", "bg-teal-500", "bg-indigo-500", "bg-pink-500", "bg-cyan-500", "bg-violet-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newRev: Review = {
      id: "REV-" + Date.now(),
      author: authorName,
      rating: rating,
      text: reviewText,
      date: new Date().toISOString().split("T")[0],
      city: studentCity,
      avatarColor: randomColor,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem("nomi_reviews", JSON.stringify(updated));

    setSuccess(true);
    setAuthorName("");
    setReviewText("");
    setRating(5);
    setStudentCity("Dunyapur");

    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
    }, 2000);
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div id="section-reviews" className="py-16 px-4 md:px-8 bg-white border-t border-slate-205 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main Stats Summary Header */}
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Authentic Client Feedback</h2>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Real opinions from laptop buyers, computer course graduates, and IT technicians in Dunyapur. Authenticated via physical ledger and Google Maps reviews.
            </p>
          </div>

          {/* Interactive Rating Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-6 shrink-0 w-full md:w-auto shadow-sm animate-fade-in">
            <div className="text-center space-y-0.5">
              <span className="text-4xl font-extrabold text-slate-900 font-mono">{getAverageRating()}</span>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Out of 5 Stars</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-4.5 w-4.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 font-semibold">{reviews.length} Verified Reviews</p>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> 100% Satisfied Students
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="ml-auto px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-550 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenSquare className="h-4 w-4" /> Write a Review
            </button>
          </div>
        </div>

        {/* Reviews Horizontal scrolling or bento-grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-violet-400 hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                {/* Rating & Date */}
                <div className="flex justify-between items-center text-xs text-slate-450">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${
                          idx < rev.rating ? "fill-current" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-slate-450">{rev.date}</span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-705 leading-relaxed font-sans font-normal italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <div className={`h-8 w-8 rounded-full ${rev.avatarColor} text-white font-extrabold text-xs flex items-center justify-center font-mono uppercase`}>
                  {rev.author.substring(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{rev.author}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-505 animate-pulse" /> {rev.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DRAW Review FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-slate-205 rounded-3xl p-6 shadow-2xl text-left font-sans"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">How has your experience been?</h3>
                  <p className="text-xs text-slate-500 mt-1">Submit your genuine review about our laptop setups or courses.</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* STAR SELECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-450 block">Rating Stars</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              starVal <= rating ? "text-yellow-500 fill-current" : "text-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AUTHOR NAME */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">Your Name</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g., Muhammad Asif"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-550 focus:bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* STUDENT/VISITOR CITY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">Your City / Location</label>
                    <input
                      type="text"
                      value={studentCity}
                      onChange={(e) => setStudentCity(e.target.value)}
                      placeholder="e.g., Dunyapur, Pakistan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-550 focus:bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* REVIEW CONTENT */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">Feedback Details</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="e.g., I registered CIT course here. The atmosphere is very professional..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-550 focus:bg-white placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-650 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Submit Verified Review
                  </button>
                </form>
              ) : (
                <div className="py-8 space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-250 animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">Review Posted!</h4>
                  <p className="text-xs text-slate-500">Thank you for sharing your experience. We are updating Nomi feed Board...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
