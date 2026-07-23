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
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface RegistrationRecord {
  id: string;
  userType: "student" | "staff";
  staffCategory?: "teaching" | "non-teaching";
  name: string;
  identifier: string; // USN for student, ID Number for staff
  phone: string;
  email: string;
  boardingPoint: string;
  route: string;
  createdAt: string;
}

interface PickupPoint {
  stop: string;
  time: string;
}

interface BusRoute {
  id: string;
  routeNo: string;
  coordinator: string;
  phone: string;
  title: string;
  stops: PickupPoint[];
}

const BUS_ROUTES: BusRoute[] = [
  {
    id: "02",
    routeNo: "Route 02",
    coordinator: "Ms. M D Meena Kumari",
    phone: "9880582039",
    title: "Route 02 — Shanthi Nagar to BMSIT&M (via MG Road, Ulsoor, RT Nagar, Hebbal)",
    stops: [
      { stop: "Shanthi Nagar Bus stop", time: "7:03 AM" },
      { stop: "MG Road (Trinity Circle)", time: "7:13 AM" },
      { stop: "Ulsoor Police Station", time: "7:18 AM" },
      { stop: "Ulsoor Adarsha Theatre", time: "7:23 AM" },
      { stop: "Shanthi Sagar Ulsoor Lake", time: "7:28 AM" },
      { stop: "Thomas Cafe Petrol Bunk", time: "7:31 AM" },
      { stop: "Coles Park", time: "7:33 AM" },
      { stop: "Nandi Durga Road", time: "7:35 AM" },
      { stop: "JC Tower Munireddy Palya (Snow City)", time: "7:38 AM" },
      { stop: "Matadhalli Bus stop (Radhakrishna Theatre)", time: "7:42 AM" },
      { stop: "RT Nagar Post Office", time: "7:46 AM" },
      { stop: "RT Nagar Police Station", time: "7:49 AM" },
      { stop: "CBI Bus Stop", time: "7:51 AM" },
      { stop: "Hebbal Bus Stop", time: "7:53 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "03",
    routeNo: "Route 03",
    coordinator: "Mr. Puttalingaiah",
    phone: "9980587049",
    title: "Route 03 — Devegowda Petrol Bunk to BMSIT&M (via PES College, Rajaji Nagar, Yeshwanthapura)",
    stops: [
      { stop: "Devegowda Petrol Bunk", time: "6:48 AM" },
      { stop: "Kamakya Fashion Factory", time: "6:50 AM" },
      { stop: "Janatha Bazaar", time: "6:54 AM" },
      { stop: "PES College", time: "6:57 AM" },
      { stop: "Nayandahalli Junction", time: "7:00 AM" },
      { stop: "KHB Colony", time: "7:08 AM" },
      { stop: "Pavithra Paradise", time: "7:10 AM" },
      { stop: "Basaveshwara Nagar Water Tank", time: "7:12 AM" },
      { stop: "Shankar mutt", time: "7:18 AM" },
      { stop: "Rajaji Nagar Metro Station", time: "7:20 AM" },
      { stop: "Mahalakshmi Layout Entrance", time: "7:22 AM" },
      { stop: "Mysore sandal soap factory", time: "7:23 AM" },
      { stop: "Govardhan Theatre", time: "7:25 AM" },
      { stop: "Yeshwanthapura fly over", time: "7:28 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "04",
    routeNo: "Route 04",
    coordinator: "Mr. Venkatasubbu Babu",
    phone: "9481473174",
    title: "Route 04 — Uttarahalli Bus Stand to BMSIT&M (via RR Nagar, Naagarabhavi, Laggeri, HMT Auditorium)",
    stops: [
      { stop: "Uttarahalli Bus Stand", time: "6:55 AM" },
      { stop: "Patalamma Temple", time: "7:00 AM" },
      { stop: "Nachiyar Café", time: "7:06 AM" },
      { stop: "Gopalan Mall (RR Nagar)", time: "7:09 AM" },
      { stop: "Jnanabharathi University Gate", time: "7:13 AM" },
      { stop: "Jnanabharathi University Admin block", time: "7:16 AM" },
      { stop: "Naagarabhavi Circle", time: "7:23 AM" },
      { stop: "Maalgala", time: "7:25 AM" },
      { stop: "Summanahalli Bridge", time: "7:28 AM" },
      { stop: "Laggeri Pipeline", time: "7:29 AM" },
      { stop: "Nandini Layout", time: "7:31 AM" },
      { stop: "Rajkumar Memorial", time: "7:33 AM" },
      { stop: "Modern Bakery Gate", time: "7:35 AM" },
      { stop: "IBC Platinum City", time: "7:37 AM" },
      { stop: "HMT Auditorium", time: "7:43 AM" },
      { stop: "Gangamma Circle", time: "7:48 AM" },
      { stop: "MS palya", time: "8:01 AM" },
      { stop: "Sambram College", time: "8:08 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "05",
    routeNo: "Route 05",
    coordinator: "Mr. Shivamallu",
    phone: "9972914945",
    title: "Route 05 — Deepanjali Nagar to BMSIT&M (via Attiguppe, Yeshwanthpur, Ramaiah, Vidyaranyapura)",
    stops: [
      { stop: "Deepanjali Nagar BMTC Bus depot", time: "7:03 AM" },
      { stop: "Attiguppe Metro Station", time: "7:10 AM" },
      { stop: "Manuvana (Magadi Road Tollgate)", time: "7:18 AM" },
      { stop: "Dhobi Ghat", time: "7:20 AM" },
      { stop: "Shivanahalli", time: "7:21 AM" },
      { stop: "Mahalakshmi Layout Entrance", time: "7:25 AM" },
      { stop: "Mysore Sandal Soap Factory", time: "7:28 AM" },
      { stop: "Yeshwanthpur", time: "7:32 AM" },
      { stop: "Ramaiah College (Bombay Dying)", time: "7:36 AM" },
      { stop: "Ramaiah SBI bank", time: "7:38 AM" },
      { stop: "Mathikere Bus stop (Ayyappa Bakery)", time: "7:40 AM" },
      { stop: "Gokula Bus stop", time: "7:43 AM" },
      { stop: "Eachala mara", time: "7:50 AM" },
      { stop: "Vidyaranyapura Last stop", time: "7:53 AM" },
      { stop: "Jelli machine - Masjid", time: "7:58 AM" },
      { stop: "Attur Layout (Hostel Turning)", time: "8:00 AM" },
      { stop: "BMSIT&M Hostel", time: "8:05 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "06",
    routeNo: "Route 06",
    coordinator: "Mr. Chethan Ram L",
    phone: "9844763036",
    title: "Route 06 — BMSCE to BMSIT&M (via Chamarajpet, Malleswaram, BEL Circle, Gangamma Circle)",
    stops: [
      { stop: "BMSCE", time: "6:57 AM" },
      { stop: "Ramakrishna Ashram", time: "6:59 AM" },
      { stop: "Chamarajpet", time: "7:01 AM" },
      { stop: "Goodshed Road", time: "7:04 AM" },
      { stop: "Shantala Silk House", time: "7:08 AM" },
      { stop: "Central Stop", time: "7:10 AM" },
      { stop: "Malleswaram 13th cross", time: "7:13 AM" },
      { stop: "Malleswaram 18th cross", time: "7:15 AM" },
      { stop: "Tata Institute", time: "7:18 AM" },
      { stop: "Sadhashiva Nagar Police Station", time: "7:20 AM" },
      { stop: "MS Ramaiah Hospital", time: "7:22 AM" },
      { stop: "Punjab National Bank", time: "7:26 AM" },
      { stop: "Devasandra Bus Stop", time: "7:32 AM" },
      { stop: "Kanthi Sweets New BEL Road", time: "7:35 AM" },
      { stop: "BEL Circle", time: "7:38 AM" },
      { stop: "HMT Gate (Ramachandra Pura)", time: "7:38 AM" },
      { stop: "Gangamma Circle", time: "7:45 AM" },
      { stop: "Airforce Camp", time: "7:48 AM" },
      { stop: "MS Palya", time: "7:50 AM" },
      { stop: "BMSIT&M Girls Hostel", time: "8:05 AM" },
      { stop: "BMSITM", time: "8:20 AM" }
    ]
  },
  {
    id: "07",
    routeNo: "Route 07",
    coordinator: "Mrs. Swathi K S",
    phone: "7760203107",
    title: "Route 07 — Navaranga Theatre to BMSIT&M (via Malleswaram, Mekhri Circle, Sanjay Nagar, Yelahanka NES)",
    stops: [
      { stop: "Navaranga Theatre", time: "7:08 AM" },
      { stop: "Mariyappana Palya", time: "7:10 AM" },
      { stop: "Harichandra Ghat", time: "7:12 AM" },
      { stop: "Devaiah Park", time: "7:14 AM" },
      { stop: "Malleswaram Circle", time: "7:16 AM" },
      { stop: "Malleswaram 8th cross", time: "7:18 AM" },
      { stop: "Malleswaram 15th cross", time: "7:20 AM" },
      { stop: "Chitramutt / Coffee Day", time: "7:22 AM" },
      { stop: "8th main Ganesh Temple", time: "7:24 AM" },
      { stop: "Malleswaram 18th cross", time: "7:26 AM" },
      { stop: "Shadashiva Nagar Bhashyam Circle", time: "7:28 AM" },
      { stop: "Mekhri Circle", time: "7:30 AM" },
      { stop: "Aswath Nagar Bus Stop", time: "7:32 AM" },
      { stop: "Geddalahalli Bus stop", time: "7:34 AM" },
      { stop: "Sanjay Nagar Bus Stop", time: "7:36 AM" },
      { stop: "Bhadrappa Layout", time: "7:40 AM" },
      { stop: "Kodigehalli Gate", time: "7:48 AM" },
      { stop: "Bydarayanapura (Udupi Kitchen)", time: "7:51 AM" },
      { stop: "GKVK", time: "7:53 AM" },
      { stop: "Aerodrome", time: "7:55 AM" },
      { stop: "Yelahanka NES", time: "8:03 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "08",
    routeNo: "Route 08",
    coordinator: "Mr. Adhinarayana Reddy",
    phone: "8660357519",
    title: "Route 08 — BEL Circle to BMSIT&M (via Doddabommasandra Arch, Vidyaranyapura 1st Block)",
    stops: [
      { stop: "BEL Circle", time: "7:45 AM" },
      { stop: "BEL colony", time: "7:46 AM" },
      { stop: "Doddabommasandra Arch", time: "7:48 AM" },
      { stop: "Chamundeshwari Layout", time: "7:49 AM" },
      { stop: "Nanjappa Circle", time: "7:50 AM" },
      { stop: "Vidyaranyapura 1st Block", time: "7:53 AM" },
      { stop: "Vidyaranyapura Canara Bank", time: "7:54 AM" },
      { stop: "Vidyaranyapura Post Office", time: "7:56 AM" },
      { stop: "BMSIT&M Girls Hostel", time: "8:05 AM" },
      { stop: "BMSIT&M Campus", time: "8:20 AM" }
    ]
  },
  {
    id: "09",
    routeNo: "Route 09",
    coordinator: "Mrs. Divya V",
    phone: "7411233009",
    title: "Route 09 — Sapthagiri Medical College to BMSIT&M (via Nagasandra Metro, Jalahalli Cross, Shettihalli)",
    stops: [
      { stop: "Sapthagiri Medical College", time: "7:08 AM" },
      { stop: "Bagalakunte", time: "7:13 AM" },
      { stop: "Nagasandra Metro Station", time: "7:17 AM" },
      { stop: "8th Mile Bus stop", time: "7:20 AM" },
      { stop: "Dasarahalli Bus stop", time: "7:24 AM" },
      { stop: "Jalahalli Cross", time: "7:28 AM" },
      { stop: "Sri Ayyapa Temple Bus Stop", time: "7:32 AM" },
      { stop: "Shettihalli Bus Stop", time: "7:38 AM" },
      { stop: "KH Halli Railway Bridge", time: "7:41 AM" },
      { stop: "KG Halli (HMT WatchFactory)", time: "7:43 AM" },
      { stop: "BMSIT&M Girls Hostel", time: "8:03 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "10",
    routeNo: "Route 10",
    coordinator: "Mr. Siddalingaswamy",
    phone: "9844981592",
    title: "Route 10 — Hoskote to BMSIT&M (via Budigere Cross, KR Puram, Ramamurthy Nagar, HBR Layout, Manyatha)",
    stops: [
      { stop: "Hoskote before Toll", time: "6:55 AM" },
      { stop: "Budigere Cross", time: "7:00 AM" },
      { stop: "Medahalli RTO Office", time: "7:10 AM" },
      { stop: "TC Palya Signal", time: "7:15 AM" },
      { stop: "KR Puram", time: "7:20 AM" },
      { stop: "ITI Main Gate", time: "7:25 AM" },
      { stop: "Ramamurthy Nagar Church", time: "7:30 AM" },
      { stop: "Ramamurthy Nagar Aladamara", time: "7:32 AM" },
      { stop: "Ramamurthy Nagar Central Bank", time: "7:34 AM" },
      { stop: "Vijaya Bank Colony", time: "7:37 AM" },
      { stop: "Kalyannagar Depot", time: "7:42 AM" },
      { stop: "HBR Layout", time: "7:45 AM" },
      { stop: "Manyatha Techpark", time: "7:48 AM" },
      { stop: "Veeranna Palya", time: "7:52 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "11",
    routeNo: "Route 11",
    coordinator: "Dr. S Saranya",
    phone: "9626707050",
    title: "Route 11 — Marathahalli to BMSIT&M (via Indiranagar, Baiyappanahalli, Horamavu, Hennur Cross)",
    stops: [
      { stop: "Marathahalli", time: "6:45 AM" },
      { stop: "KFC CMH Road Indiranagar", time: "7:05 AM" },
      { stop: "New Thippasandra Main Road", time: "7:10 AM" },
      { stop: "BEML Gate", time: "7:15 AM" },
      { stop: "NGEF", time: "7:20 AM" },
      { stop: "Baiyappanahalli Metro Station", time: "7:22 AM" },
      { stop: "Bennaganahalli", time: "7:25 AM" },
      { stop: "Kasthuri Nagar", time: "7:30 AM" },
      { stop: "Horamavu Signal/Banaswadi Fly Over", time: "7:37 AM" },
      { stop: "Babusapalya", time: "7:39 AM" },
      { stop: "Hennur Cross", time: "7:42 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  },
  {
    id: "12",
    routeNo: "Route 12",
    coordinator: "Mrs. Jayashree",
    phone: "8197126498",
    title: "Route 12 — Kalyan Nagar to BMSIT&M (via Nagawara, Thanisandra, Bhartiya City, Kogilu)",
    stops: [
      { stop: "Kalyan Nagar", time: "7:18 AM" },
      { stop: "Nagawara Signal", time: "7:26 AM" },
      { stop: "Elements Mall", time: "7:30 AM" },
      { stop: "Ashwath Nagar", time: "7:33 AM" },
      { stop: "Thanisandra (Book Factory)", time: "7:35 AM" },
      { stop: "Hegde Nagar", time: "7:38 AM" },
      { stop: "Shoba City", time: "7:40 AM" },
      { stop: "Bhartiya City", time: "7:44 AM" },
      { stop: "KNSIT", time: "7:46 AM" },
      { stop: "Bellahalli Cross", time: "7:48 AM" },
      { stop: "Brick Factory Layout", time: "7:50 AM" },
      { stop: "Srinivasaspura", time: "7:53 AM" },
      { stop: "Kogilu", time: "7:56 AM" },
      { stop: "Sapthagiri Layout", time: "7:57 AM" },
      { stop: "Maruthi Nagar", time: "7:58 AM" },
      { stop: "Santhe Circle (Yelahanka)", time: "8:03 AM" },
      { stop: "BMSIT&M", time: "8:20 AM" }
    ]
  }
];

interface FieldErrors {
  userType?: string;
  staffCategory?: string;
  name?: string;
  identifier?: string;
  phone?: string;
  email?: string;
  route?: string;
  boardingPoint?: string;
}

export default function App() {
  // Category / Role State
  const [userType, setUserType] = useState<"student" | "staff">("student");
  const [staffCategory, setStaffCategory] = useState<"teaching" | "non-teaching">("teaching");

  // Form fields state
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // USN or ID Number
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [route, setRoute] = useState("");

  // UI state
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formErrorSummary, setFormErrorSummary] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Derived selected route object
  const selectedRouteObj = BUS_ROUTES.find(r => r.title === route || r.routeNo === route);

  // Fetch registered list
  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "registrations"));
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userType: data.userType || "student",
          staffCategory: data.staffCategory,
          name: data.studentName || data.name || data.staffName || "",
          identifier: data.usn || data.idNumber || data.identifier || "",
          phone: data.phone || "",
          email: data.email || "",
          boardingPoint: data.boardingPoint || "",
          route: data.routeNo || data.route || "",
          createdAt: data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : data.submittedAt) : ""
        };
      });
      setRegistrations(list);
    } catch (error) {
      console.error("Failed to load registrations from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Comprehensive Field Validation Function
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const errorList: string[] = [];

    // Full Name
    if (!name.trim()) {
      errors.name = userType === "student" ? "Student Name is required." : "Staff Name is required.";
      errorList.push(errors.name);
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
      errorList.push(errors.name);
    }

    // USN / Staff ID Number Validation
    if (userType === "student") {
      const cleanUsn = identifier.trim().toUpperCase();
      if (!cleanUsn) {
        errors.identifier = "USN Number is required.";
        errorList.push("USN Number is missing.");
      } else if (cleanUsn.length !== 12) {
        errors.identifier = `USN must be exactly 12 characters (currently ${cleanUsn.length} characters). E.g. 1BY26CS00112`;
        errorList.push(`USN is incorrect length (${cleanUsn.length}/12 chars).`);
      }
    } else {
      const cleanId = identifier.trim();
      if (!cleanId) {
        errors.identifier = "Staff ID Number is required.";
        errorList.push("Staff ID Number is missing.");
      } else if (cleanId.length < 3) {
        errors.identifier = "Staff ID Number must be at least 3 characters.";
        errorList.push("Staff ID Number is too short.");
      }
    }

    // Phone Number Validation (At least 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errors.phone = "Phone Number is required.";
      errorList.push("Phone Number is missing.");
    } else if (phoneDigits.length < 10) {
      errors.phone = `Phone Number must contain at least 10 digits (found ${phoneDigits.length}).`;
      errorList.push(`Phone number has only ${phoneDigits.length} digits (min 10).`);
    }

    // Email Address Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email Address is required.";
      errorList.push("Email Address is missing.");
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@domain.com).";
      errorList.push("Email format is invalid.");
    }

    // Route Selection
    if (!route) {
      errors.route = "Please select a transport route.";
      errorList.push("Route selection is required.");
    }

    // Boarding Point
    if (!boardingPoint.trim()) {
      errors.boardingPoint = "Please select or specify your boarding point.";
      errorList.push("Boarding Point is missing.");
    }

    setFieldErrors(errors);

    if (errorList.length > 0) {
      setFormErrorSummary(`Please fix the following: ${errorList.join(" | ")}`);
      return false;
    }

    setFormErrorSummary(null);
    return true;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        userType,
        phone: phone.trim(),
        email: email.trim(),
        boardingPoint: boardingPoint.trim(),
        routeNo: route,
        status: "Pending",
        submittedAt: serverTimestamp()
      };

      if (userType === "student") {
        payload.studentName = name.trim();
        payload.usn = identifier.trim().toUpperCase();
      } else {
        payload.staffName = name.trim();
        payload.idNumber = identifier.trim();
        payload.staffCategory = staffCategory;
      }

      await addDoc(collection(db, "registrations"), payload);

      setSubmitSuccess(true);
      // Reset form fields
      setName("");
      setIdentifier("");
      setPhone("");
      setEmail("");
      setBoardingPoint("");
      setRoute("");
      setFieldErrors({});
      setFormErrorSummary(null);
      // Refresh records list
      fetchRegistrations();
    } catch (error) {
      console.error("Submission error details:", error);
      setFormErrorSummary(error instanceof Error ? `Failed to submit: ${error.message}` : "Failed to submit registration. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete registration handler
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "registrations", id));
      setRegistrations(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete registration", error);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink py-12 px-4 md:px-8">
      <div className="max-w-[850px] mx-auto space-y-8" id="main-container">

        {/* Simple Page Header */}
        <header className="pb-6 border-b border-hairline" id="app-header">
          <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-ink">
            Wayline Registration
          </h1>
          <p className="text-xs text-body mt-1">
            Submit bus route registration for BMSIT&M Students and Staff members.
          </p>
        </header>

        {/* Success Pop-up Modal */}
        <AnimatePresence initial={false}>
          {submitSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" id="success-modal-overlay">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setSubmitSuccess(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className="bg-white rounded-2xl border border-hairline shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 text-center space-y-6"
                id="success-modal-content"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-ink tracking-tight">
                    Registration Confirmed!
                  </h3>
                  <p className="text-xs text-muted">
                    Your {userType === "student" ? "student" : `staff (${staffCategory})`} route registration details have been saved.
                  </p>
                </div>

                <div className="p-4 bg-surface-soft border border-hairline rounded-xl text-center">
                  <p className="text-sm font-medium text-ink leading-relaxed">
                    We will contact you about the further steps via email shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-active text-white font-medium rounded-lg text-sm transition-transform duration-100 active:scale-[0.96] cursor-pointer shadow-xs focus:outline-none min-h-[44px]"
                  id="success-modal-close-btn"
                >
                  Great, thank you!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Registration Form Card */}
        <section className="bg-white rounded-2xl border border-hairline shadow-xs p-6 md:p-8 relative" id="registration-form-card">

          <div className="mb-6 space-y-4">
            <div>
              <h2 className="text-lg font-medium text-ink">
                {userType === "student" ? "Student Registration Form" : "Staff Registration Form"}
              </h2>
              <p className="text-xs text-body mt-0.5">
                Select your category and fill out your details to request campus bus route access.
              </p>
            </div>

            {/* Role Selection Switcher (Student vs Staff - Segmented Toggle, NOT a dropdown) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                Registration Category
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-soft border border-hairline rounded-xl" id="role-selector">
                <button
                  type="button"
                  onClick={() => {
                    setUserType("student");
                    setFieldErrors({});
                    setFormErrorSummary(null);
                  }}
                  className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    userType === "student"
                      ? "bg-white text-primary shadow-xs border border-hairline"
                      : "text-body hover:text-ink"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserType("staff");
                    setFieldErrors({});
                    setFormErrorSummary(null);
                  }}
                  className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    userType === "staff"
                      ? "bg-white text-primary shadow-xs border border-hairline"
                      : "text-body hover:text-ink"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Staff</span>
                </button>
              </div>
            </div>

            {/* Staff Category Options (Teaching vs Non-Teaching) */}
            <AnimatePresence initial={false}>
              {userType === "staff" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 pt-1 overflow-hidden"
                  id="staff-category-selector"
                >
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Staff Designation Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-surface-strong/60 border border-hairline rounded-xl">
                    <button
                      type="button"
                      onClick={() => setStaffCategory("teaching")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        staffCategory === "teaching"
                          ? "bg-white text-ink shadow-xs border border-hairline"
                          : "text-body hover:text-ink"
                      }`}
                    >
                      Teaching Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaffCategory("non-teaching")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        staffCategory === "non-teaching"
                          ? "bg-white text-ink shadow-xs border border-hairline"
                          : "text-body hover:text-ink"
                      }`}
                    >
                      Non-Teaching Staff
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation Alert Summary */}
          <AnimatePresence initial={false}>
            {formErrorSummary && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mb-6 p-4 bg-semantic-down/5 border border-semantic-down/40 rounded-xl flex items-start gap-3 text-sm text-semantic-down shadow-xs"
                id="error-banner"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-semantic-down" />
                <div>
                  <span className="font-bold block">Action Required</span>
                  <p className="text-xs text-semantic-down/90 mt-0.5 leading-relaxed">{formErrorSummary}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6" id="registration-entry-form" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="user-name" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {userType === "student" ? "Student Name" : "Staff Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder={userType === "student" ? "Enter student full name" : "Enter staff full name"}
                    className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                      fieldErrors.name ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                    } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* USN Number for Student vs ID Number for Staff */}
              <div className="space-y-1.5">
                <label htmlFor="user-identifier" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {userType === "student" ? "USN No (12 Characters)" : "Staff ID Number"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="user-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: undefined }));
                    }}
                    placeholder={userType === "student" ? "e.g. 1BY26CS00112" : "Enter Staff ID Number"}
                    className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                      userType === "student" ? "uppercase tabular-nums" : ""
                    } ${
                      fieldErrors.identifier ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                    } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                  />
                </div>
                {fieldErrors.identifier && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.identifier}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1.5">
                <label htmlFor="user-phone" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Phone Number (Min 10 Digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="user-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                      fieldErrors.phone ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                    } focus:outline-none transition-colors duration-100 tabular-nums min-h-[44px]`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="user-email" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Enter email address (e.g. user@bmsit.in)"
                    className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                      fieldErrors.email ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                    } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Route Dropdown Menu */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="user-route" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Transport Route
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <select
                    id="user-route"
                    value={route}
                    onChange={(e) => {
                      setRoute(e.target.value);
                      setBoardingPoint("");
                      if (fieldErrors.route) setFieldErrors(prev => ({ ...prev, route: undefined }));
                    }}
                    className={`w-full bg-white text-ink rounded-lg pl-10 pr-10 py-2.5 text-sm border ${
                      fieldErrors.route ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                    } focus:outline-none appearance-none cursor-pointer transition-colors duration-100 min-h-[44px]`}
                  >
                    <option value="" disabled>-- Select a route from the BMSIT&M route schedule --</option>
                    {BUS_ROUTES.map((r) => (
                      <option key={r.id} value={r.title}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-ink">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {fieldErrors.route && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.route}
                  </p>
                )}
                {selectedRouteObj && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 p-3 bg-surface-soft rounded-xl border border-hairline flex flex-col sm:flex-row sm:items-center justify-between text-xs text-body gap-1.5"
                  >
                    <span><strong>Coordinator:</strong> {selectedRouteObj.coordinator}</span>
                    <span className="tabular-nums"><strong>Contact:</strong> {selectedRouteObj.phone}</span>
                  </motion.div>
                )}
              </div>

              {/* Boarding Point */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="user-boarding" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Boarding Point
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {selectedRouteObj ? (
                    <select
                      id="user-boarding"
                      value={boardingPoint}
                      onChange={(e) => {
                        setBoardingPoint(e.target.value);
                        if (fieldErrors.boardingPoint) setFieldErrors(prev => ({ ...prev, boardingPoint: undefined }));
                      }}
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-10 py-2.5 text-sm border ${
                        fieldErrors.boardingPoint ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                      } focus:outline-none appearance-none cursor-pointer transition-colors duration-100 min-h-[44px]`}
                    >
                      <option value="">-- Select your pickup stop --</option>
                      {selectedRouteObj.stops.map((stopItem, idx) => (
                        <option key={idx} value={`${stopItem.stop} (${stopItem.time})`}>
                          {stopItem.stop} — Pickup: {stopItem.time}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="user-boarding"
                      type="text"
                      value={boardingPoint}
                      onChange={(e) => {
                        setBoardingPoint(e.target.value);
                        if (fieldErrors.boardingPoint) setFieldErrors(prev => ({ ...prev, boardingPoint: undefined }));
                      }}
                      placeholder="Select a route above to choose your pickup point or type here"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.boardingPoint ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                      } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                    />
                  )}
                  {selectedRouteObj && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-ink">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {fieldErrors.boardingPoint && (
                  <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.boardingPoint}
                  </p>
                )}
              </div>

            </div>

            <div className="pt-6 border-t border-hairline flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary-active text-white rounded-pill px-6 py-2.5 text-sm font-semibold transition-[transform,opacity,background-color] duration-150 active:scale-[0.96] disabled:opacity-50 cursor-pointer text-center min-h-[44px] min-w-[140px] flex items-center justify-center shadow-xs"
                id="submit-button"
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>

          </form>
        </section>

        {/* Spacing after section */}
        <div className="pb-12" />

      </div>
    </div>
  );
}

