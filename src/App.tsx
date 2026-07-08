import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bus, 
  User, 
  Hash, 
  Phone, 
  Mail, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Search, 
  Clock, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";

interface StudentRegistration {
  id: string;
  name: string;
  usn: string;
  phone: string;
  email: string;
  boardingPoint: string;
  route: string;
  createdAt: string;
}

const BUS_ROUTES = [
  "Route 01 — North Campus Hub (via Central Avenue)",
  "Route 02 — South Plaza & Metro Link",
  "Route 03 — West End Residences & Innovation Park",
  "Route 04 — Eastern Gate & Hilltop Heights",
  "Route 05 — Tech Park Expressway & Lakeview",
  "Route 06 — Downtown Terminal & Central Library",
  "Route 07 — Boulevard Ring Road & Green Gardens",
  "Route 08 — North-West Suburbs & Sports Arena",
  "Route 09 — South-East Corridor & Riverfront",
  "Route 10 — Valley View & IT Zone Bypass",
  "Route 11 — Airport Expressway Link",
  "Route 12 — Heritage Circle & Old Town Square"
];

export default function App() {
  // Form fields state
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [route, setRoute] = useState("");

  // UI state
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch registered list
  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/registrations");
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error("Failed to load registrations from backend", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccess(false);

    // Form fields validation
    if (!name.trim()) return setFormError("Student Name is required.");
    if (!usn.trim()) return setFormError("USN Number is required.");
    if (!phone.trim()) return setFormError("Student Phone Number is required.");
    if (!email.trim()) return setFormError("Student Email is required.");
    if (!boardingPoint.trim()) return setFormError("Boarding Point is required.");
    if (!route) return setFormError("Please select a transport route.");

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          usn: usn.trim().toUpperCase(),
          phone: phone.trim(),
          email: email.trim(),
          boardingPoint: boardingPoint.trim(),
          route
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        // Reset form fields
        setName("");
        setUsn("");
        setPhone("");
        setEmail("");
        setBoardingPoint("");
        setRoute("");
        // Refresh records list from backend
        fetchRegistrations();
      } else {
        setFormError(data.error || "An error occurred while submitting.");
      }
    } catch (error) {
      setFormError("Failed to submit registration. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete registration handler
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete registration", error);
    }
  };

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(reg => {
    const s = searchQuery.toLowerCase();
    return (
      reg.name.toLowerCase().includes(s) ||
      reg.usn.toLowerCase().includes(s) ||
      reg.boardingPoint.toLowerCase().includes(s) ||
      reg.route.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-canvas text-ink py-12 px-4 md:px-8">
      <div className="max-w-[850px] mx-auto space-y-8" id="main-container">
        
        {/* Simple Page Header */}
        <header className="pb-6 border-b border-hairline" id="app-header">
          <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-ink">
            Wayline
          </h1>
          <p className="text-xs text-body mt-1">
            Please fill in your details below to submit a bus route registration request.
          </p>
        </header>

        {/* Success Pop-up Modal */}
        <AnimatePresence>
          {submitSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" id="success-modal-overlay">
              {/* Backdrop with transition */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setSubmitSuccess(false)}
              />
              
              {/* Animated Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-white rounded-2xl border border-hairline shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 text-center space-y-6"
                id="success-modal-content"
              >
                {/* Visual Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle className="w-9 h-9" />
                </div>
                
                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-ink tracking-tight">
                    Registration Confirmed!
                  </h3>
                  <p className="text-xs text-muted">
                    Your route registration details have been securely saved to our transport index.
                  </p>
                </div>

                {/* Highly polished rephrased instructions card */}
                <div className="p-4 bg-surface-soft border border-hairline rounded-xl text-center">
                  <p className="text-sm font-medium text-ink leading-relaxed">
                    We will contact you about the further steps via email shortly.
                  </p>
                </div>

                {/* Done action button */}
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer shadow-sm focus:outline-none"
                  id="success-modal-close-btn"
                >
                  Great, thank you!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Simple One-Page Registration Form */}
        <section className="bg-white rounded-xl border border-hairline shadow-sm p-6 md:p-8 relative" id="registration-form-card">
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-ink">Student Registration Form</h2>
            <p className="text-xs text-body">Provide your contact details and select one of the 12 active campus bus routes.</p>
          </div>

          {/* Validation Alert */}
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-white border border-semantic-down rounded-md flex items-start gap-3 text-sm text-semantic-down"
                id="error-banner"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-semantic-down" />
                <div>
                  <span className="font-bold">Missing Information</span>
                  <p className="text-xs text-semantic-down/90 mt-0.5">{formError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6" id="student-entry-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Student Name */}
              <div className="space-y-1.5">
                <label htmlFor="student-name" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Student Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter student full name"
                    className="w-full bg-white text-ink rounded-md pl-10 pr-4 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-all duration-100"
                  />
                </div>
              </div>

              {/* USN Number */}
              <div className="space-y-1.5">
                <label htmlFor="student-usn" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  USN No
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="student-usn"
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="Enter USN Number (e.g. 1RV21CS001)"
                    className="w-full bg-white text-ink rounded-md pl-10 pr-4 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-all duration-100 uppercase"
                  />
                </div>
              </div>

              {/* Student Phone */}
              <div className="space-y-1.5">
                <label htmlFor="student-phone" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Student Phone No
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="student-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter contact number"
                    className="w-full bg-white text-ink rounded-md pl-10 pr-4 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-all duration-100"
                  />
                </div>
              </div>

              {/* Student Mail */}
              <div className="space-y-1.5">
                <label htmlFor="student-email" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Std Mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email address"
                    className="w-full bg-white text-ink rounded-md pl-10 pr-4 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-all duration-100"
                  />
                </div>
              </div>

              {/* Boarding Point */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="student-boarding" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Boarding Point
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="student-boarding"
                    type="text"
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    placeholder="Specify physical boarding point or landmark"
                    className="w-full bg-white text-ink rounded-md pl-10 pr-4 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-all duration-100"
                  />
                </div>
              </div>

              {/* Route Dropdown Menu (12 Routes available) */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="student-route" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Route No
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <select
                    id="student-route"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full bg-white text-ink rounded-md pl-10 pr-10 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none appearance-none cursor-pointer transition-all duration-100"
                  >
                    <option value="" disabled>-- Click here to select from the 12 available routes --</option>
                    {BUS_ROUTES.map((routeOption, idx) => (
                      <option key={idx} value={routeOption}>
                        {routeOption}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-ink">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-hairline flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary-active text-white rounded-pill px-6 py-2.5 text-sm font-semibold transition-all active:scale-98 disabled:opacity-50 cursor-pointer text-center"
                id="submit-button"
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>

          </form>
        </section>

        {/* Humble system footer */}
        <footer className="text-center text-[11px] text-muted pt-6 pb-12 border-t border-hairline flex flex-col sm:flex-row justify-between gap-2" id="app-footer">
          <div>
            &copy; 2026 Student Transport Services. All rights reserved.
          </div>
          <div className="flex justify-center gap-4 font-semibold text-ink">
            <a href="#" className="hover:underline">System Status</a>
            <span>•</span>
            <a href="#" className="hover:underline">Help & Support</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
