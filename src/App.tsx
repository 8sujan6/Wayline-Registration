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
  Search,
  Clock,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  CreditCard,
  Lock,
  ArrowRight,
  RefreshCw,
  Check,
  Info
} from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

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
  busNo: string;
  transactionId: string;
  paymentMode: string;
  feeAmount: number;
  seatStatus: "Seat Blocked" | "Approved" | "Pending" | "Rejected";
  paymentStatus: "Payment Initiated" | "Verified" | "Pending";
  createdAt: string;
}

interface PickupPoint {
  stop: string;
  time: string;
}

interface BusRoute {
  id: string;
  routeNo: string;
  busNo: string;
  totalSeats: number;
  coordinator: string;
  phone: string;
  title: string;
  stops: PickupPoint[];
}

const BUS_ROUTES: BusRoute[] = [
  {
    id: "02",
    routeNo: "Route 02",
    busNo: "KA-04-F-2002",
    totalSeats: 40,
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
    busNo: "KA-04-F-2003",
    totalSeats: 40,
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
    busNo: "KA-04-F-2004",
    totalSeats: 42,
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
    busNo: "KA-04-F-2005",
    totalSeats: 40,
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
    busNo: "KA-04-F-2006",
    totalSeats: 40,
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
    busNo: "KA-04-F-2007",
    totalSeats: 40,
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
    busNo: "KA-04-F-2008",
    totalSeats: 45,
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
    busNo: "KA-04-F-2009",
    totalSeats: 40,
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
    busNo: "KA-04-F-2010",
    totalSeats: 40,
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
    busNo: "KA-04-F-2011",
    totalSeats: 40,
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
    busNo: "KA-04-F-2012",
    totalSeats: 40,
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
  transactionId?: string;
}

export default function App() {
  // Navigation Mode
  const [activeTab, setActiveTab] = useState<"register" | "status">("register");

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

  // Payment fields
  const [transactionId, setTransactionId] = useState("");
  const [paymentMode, setPaymentMode] = useState("BMSIT Online Fee Portal");
  const [hasVisitedPortal, setHasVisitedPortal] = useState(false);

  // UI & Registration State
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formErrorSummary, setFormErrorSummary] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<RegistrationRecord | null>(null);

  // Status Lookup State
  const [statusSearchQuery, setStatusSearchQuery] = useState("");
  const [statusResult, setStatusResult] = useState<RegistrationRecord | null | "not_found">(null);

  // Derived selected route object
  const selectedRouteObj = BUS_ROUTES.find(r => r.title === route || r.routeNo === route);

  // Calculate live occupied seats for a given route
  const getOccupiedSeats = (routeTitle: string) => {
    return registrations.filter(r => {
      const match = r.route === routeTitle || (routeTitle && r.route && r.route.startsWith(routeTitle.split(" — ")[0]));
      return match && r.seatStatus !== "Rejected";
    }).length;
  };

  const getAvailableSeats = (routeObj: BusRoute) => {
    const occupied = getOccupiedSeats(routeObj.title);
    return Math.max(0, routeObj.totalSeats - occupied);
  };

  const currentAvailableSeats = selectedRouteObj ? getAvailableSeats(selectedRouteObj) : 0;
  const isSelectedBusFull = selectedRouteObj ? currentAvailableSeats <= 0 : false;

  // Fetch registered list from Firestore
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
          busNo: data.busNo || "",
          transactionId: data.transactionId || "",
          paymentMode: data.paymentMode || "BMSIT Online Fee Portal",
          feeAmount: data.feeAmount || 28000,
          seatStatus: data.seatStatus || "Seat Blocked",
          paymentStatus: data.paymentStatus || "Payment Initiated",
          createdAt: data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : data.submittedAt) : ""
        } as RegistrationRecord;
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
      errors.email = "Please enter a valid email address (e.g. user@bmsit.in).";
      errorList.push("Email format is invalid.");
    }

    // Route Selection & Availability Check
    if (!route) {
      errors.route = "Please select a transport route.";
      errorList.push("Route selection is required.");
    } else if (selectedRouteObj && currentAvailableSeats <= 0) {
      errors.route = `Dedicated Bus ${selectedRouteObj.busNo} on this route is full (0 seats available). Please select another route.`;
      errorList.push("Selected bus route is full.");
    }

    // Boarding Point
    if (!boardingPoint.trim()) {
      errors.boardingPoint = "Please select or specify your boarding point.";
      errorList.push("Boarding Point is missing.");
    }

    // Payment Transaction ID / UTR
    if (!transactionId.trim()) {
      errors.transactionId = "Transaction ID / UTR is required to block your seat. Initiate payment via the BMSIT link above.";
      errorList.push("Transaction ID / UTR is required.");
    } else if (transactionId.trim().length < 6) {
      errors.transactionId = "Transaction ID / UTR must be at least 6 characters.";
      errorList.push("Transaction ID is too short.");
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
      const assignedBusNo = selectedRouteObj ? selectedRouteObj.busNo : "Assigned Bus";
      const payload: any = {
        userType,
        phone: phone.trim(),
        email: email.trim(),
        boardingPoint: boardingPoint.trim(),
        routeNo: route,
        busNo: assignedBusNo,
        feeAmount: 28000,
        paymentMode,
        transactionId: transactionId.trim(),
        seatStatus: "Seat Blocked",
        paymentStatus: "Payment Initiated",
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

      const docRef = await addDoc(collection(db, "registrations"), payload);

      const record: RegistrationRecord = {
        id: docRef.id,
        userType,
        staffCategory,
        name: name.trim(),
        identifier: userType === "student" ? identifier.trim().toUpperCase() : identifier.trim(),
        phone: phone.trim(),
        email: email.trim(),
        boardingPoint: boardingPoint.trim(),
        route,
        busNo: assignedBusNo,
        transactionId: transactionId.trim(),
        paymentMode,
        feeAmount: 28000,
        seatStatus: "Seat Blocked",
        paymentStatus: "Payment Initiated",
        createdAt: new Date().toISOString()
      };

      setLastSubmitted(record);
      setSubmitSuccess(true);

      // Reset form fields
      setName("");
      setIdentifier("");
      setPhone("");
      setEmail("");
      setBoardingPoint("");
      setRoute("");
      setTransactionId("");
      setHasVisitedPortal(false);
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

  // Status Lookup Handler
  const handleStatusLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = statusSearchQuery.trim().toLowerCase();
    if (!query) return;

    const match = registrations.find(r => 
      r.identifier.toLowerCase() === query || 
      r.phone.replace(/\D/g, "") === query.replace(/\D/g, "") ||
      r.transactionId.toLowerCase() === query
    );

    if (match) {
      setStatusResult(match);
    } else {
      setStatusResult("not_found");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink py-10 px-4 md:px-8 font-sans">
      <div className="max-w-[860px] mx-auto space-y-6" id="main-container">

        {/* Top BMSIT Official Banner */}
        <div className="bg-surface-soft border border-hairline rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
              BMS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">BMS Institute of Technology & Management</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-pill">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-body">
                Autonomous Institution Affiliated to VTU, Belagavi • Yelahanka, Bengaluru
              </p>
            </div>
          </div>
          <a
            href="https://bmsit.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-white border border-hairline hover:bg-surface-soft rounded-lg transition-colors shadow-2xs min-h-[38px]"
            id="bmsit-official-link-header"
          >
            <span>Visit BMSIT Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* App Title & Tabs Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-hairline" id="app-header">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-ink flex items-center gap-2.5">
              <Bus className="w-7 h-7 text-primary" />
              <span>Wayline Bus Registration</span>
            </h1>
            <p className="text-xs text-body mt-1">
              Select your route, verify live seat availability on dedicated buses, and initiate payment.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-primary shadow-xs border border-hairline"
                  : "text-body hover:text-ink"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Register & Block Seat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "status"
                  ? "bg-white text-primary shadow-xs border border-hairline"
                  : "text-body hover:text-ink"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Check Seat Status</span>
            </button>
          </div>
        </header>

        {/* Confirmation Modal */}
        <AnimatePresence initial={false}>
          {submitSuccess && lastSubmitted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="success-modal-overlay">
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
                className="bg-white rounded-2xl border border-hairline shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 space-y-6 my-8"
                id="success-modal-content"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto w-14 h-14 rounded-full bg-accent-yellow/20 text-[#b37400] flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink tracking-tight">
                    Seat Provisionally Blocked!
                  </h3>
                  <p className="text-xs text-muted">
                    Payment details received. Your seat on dedicated bus is blocked and held for you.
                  </p>
                </div>

                {/* Status Badges Card */}
                <div className="p-4 bg-surface-soft border border-hairline rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                    <span className="text-xs text-muted font-medium">Seat Reservation Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fff8e6] text-[#996500] border border-[#f0d075]">
                      <span className="w-2 h-2 rounded-full bg-accent-yellow animate-pulse" />
                      SEAT BLOCKED
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                    <span className="text-xs text-muted font-medium">Payment Verification:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
                      <Clock className="w-3 h-3" />
                      Pending Admin Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-muted block text-[11px]">Dedicated Bus Plate:</span>
                      <span className="font-semibold text-ink tabular-nums">{lastSubmitted.busNo}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]">Transaction / UTR ID:</span>
                      <span className="font-mono font-medium text-ink truncate block">{lastSubmitted.transactionId}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted block text-[11px]">Pickup Stop & Route:</span>
                      <span className="font-medium text-ink truncate block">{lastSubmitted.boardingPoint}</span>
                    </div>
                  </div>
                </div>

                {/* Important notice on final approval */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Next Step:</strong> Your seat is blocked so that no other student can take it. The transport administrator will verify your Transaction ID with BMSIT payment records and issue <strong>final approval</strong>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setActiveTab("status");
                      setStatusSearchQuery(lastSubmitted.identifier);
                      setStatusResult(lastSubmitted);
                    }}
                    className="flex-1 py-2.5 px-4 bg-surface-strong hover:bg-hairline text-ink font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    View Status Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-active text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs text-center"
                    id="success-modal-close-btn"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* TAB 1: REGISTRATION & SEAT BLOCKING FORM */}
        {activeTab === "register" && (
          <section className="bg-white rounded-2xl border border-hairline shadow-xs p-6 md:p-8 relative" id="registration-form-card">

            <div className="mb-6 space-y-4">
              <div>
                <h2 className="text-lg font-medium text-ink">
                  {userType === "student" ? "Student Bus Registration & Seat Booking" : "Staff Bus Registration"}
                </h2>
                <p className="text-xs text-body mt-0.5">
                  Select your route to automatically check and block a seat on the dedicated campus bus.
                </p>
              </div>

              {/* Role Selection Switcher */}
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

              {/* Staff Category Options */}
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

                {/* Route Dropdown Menu with Live Seat Check */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="user-route" className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Select Transport Route
                    </label>
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-primary" : ""}`} />
                      Live Dedicated Bus Capacity
                    </span>
                  </div>

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
                      <option value="" disabled>-- Select a route from BMSIT&M schedule --</option>
                      {BUS_ROUTES.map((r) => {
                        const avail = getAvailableSeats(r);
                        return (
                          <option key={r.id} value={r.title}>
                            {r.title} — ({r.busNo} • {avail > 0 ? `${avail} seats available` : "BUS FULL"})
                          </option>
                        );
                      })}
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

                  {/* Real-Time Dedicated Bus Seat Availability Card (Appears as soon as route is selected) */}
                  {selectedRouteObj && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 p-4 bg-surface-soft rounded-xl border border-hairline space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-hairline">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Bus className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs font-bold text-ink">Dedicated Bus: {selectedRouteObj.busNo}</span>
                            <span className="text-[11px] text-body block">{selectedRouteObj.routeNo}</span>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <div>
                          {currentAvailableSeats > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-emerald-700 border border-green-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              {currentAvailableSeats} of {selectedRouteObj.totalSeats} Seats Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-semantic-down border border-red-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Dedicated Bus Full (0 Seats Left)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Live Seat Blocking Notice */}
                      {currentAvailableSeats > 0 ? (
                        <div className="p-2.5 bg-white rounded-lg border border-hairline flex items-start gap-2 text-xs text-body">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-ink">Seat Available — Instant Reservation Active:</span>
                            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                              A seat on dedicated bus <strong>{selectedRouteObj.busNo}</strong> is provisionally held for your session. Initiating payment below will officially block the seat.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-red-50/70 rounded-lg border border-red-200 flex items-start gap-2 text-xs text-semantic-down">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">All seats on this bus are already booked/blocked.</span>
                            <p className="text-[11px] mt-0.5">Please choose another route or contact the coordinator below for assistance.</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-body gap-1.5 pt-0.5">
                        <span><strong>Coordinator:</strong> {selectedRouteObj.coordinator}</span>
                        <span className="tabular-nums"><strong>Contact:</strong> {selectedRouteObj.phone}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Boarding Point */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="user-boarding" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Boarding Point / Pickup Stop
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
                        <option value="">-- Select your pickup stop along the route --</option>
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

              {/* PAYMENT INITIATION SECTION */}
              <div className="mt-8 pt-6 border-t border-hairline space-y-4" id="payment-initiation-section">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-primary/10 text-primary rounded-md">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                      Transport Fee & Payment Initiation
                    </h3>
                  </div>
                  <p className="text-xs text-body mt-0.5">
                    Click the official BMSIT link to complete payment, then enter your transaction ID to immediately block your seat.
                  </p>
                </div>

                {/* BMSIT Official Payment Portal Action Card */}
                <div className="p-5 bg-gradient-to-br from-surface-soft via-white to-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-muted block font-medium">Annual Transport Fee</span>
                      <span className="text-2xl font-bold text-ink tracking-tight tabular-nums">₹28,000</span>
                      <span className="text-xs text-body ml-1.5">/ Academic Year</span>
                    </div>

                    {/* Official Link Button */}
                    <a
                      href="https://bmsit.ac.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setHasVisitedPortal(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-active text-white font-semibold text-xs rounded-pill shadow-xs transition-transform duration-100 active:scale-[0.97] min-h-[42px]"
                      id="pay-via-bmsit-btn"
                    >
                      <span>Pay via Official BMSIT Web Page</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-hairline text-xs text-body flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>Payment Procedure:</strong> Click the button above to access the official BMSIT portal. Pay using your student USN / application number. Once the transaction succeeds, copy the <strong>Transaction ID / UTR Number</strong> from your payment receipt and enter it below.
                    </p>
                  </div>

                  {/* Payment Details Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Payment Mode Selector */}
                    <div className="space-y-1.5">
                      <label htmlFor="payment-mode" className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Payment Mode Used
                      </label>
                      <div className="relative">
                        <select
                          id="payment-mode"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="w-full bg-white text-ink rounded-lg px-3.5 py-2.5 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none appearance-none cursor-pointer transition-colors min-h-[44px]"
                        >
                          <option value="BMSIT Online Fee Portal">BMSIT Online Fee Portal Gateway</option>
                          <option value="UPI / QR Code">UPI (Google Pay / PhonePe / Paytm)</option>
                          <option value="Net Banking / NEFT">Net Banking / NEFT / RTGS</option>
                          <option value="College Bank Challan">Official College Bank Challan</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Transaction ID / UTR */}
                    <div className="space-y-1.5">
                      <label htmlFor="transaction-id" className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Transaction ID / UTR Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                          id="transaction-id"
                          type="text"
                          value={transactionId}
                          onChange={(e) => {
                            setTransactionId(e.target.value);
                            if (fieldErrors.transactionId) setFieldErrors(prev => ({ ...prev, transactionId: undefined }));
                          }}
                          placeholder="e.g. UTR240987654321 or Bank Ref No"
                          className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                            fieldErrors.transactionId ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-2 focus:border-primary"
                          } focus:outline-none font-mono transition-colors min-h-[44px]`}
                        />
                      </div>
                      {fieldErrors.transactionId && (
                        <p className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 inline" /> {fieldErrors.transactionId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Seat Blocking Assurance Banner */}
                  <div className="p-3 bg-[#fff9ea] border border-[#f5df9e] rounded-xl flex items-start gap-2 text-xs text-[#8a5d00]">
                    <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-yellow" />
                    <p className="leading-relaxed">
                      <strong>Immediate Seat Blocking:</strong> As soon as you enter your details and submit, your seat on dedicated bus <strong>{selectedRouteObj ? selectedRouteObj.busNo : "(Selected Route)"}</strong> will be <strong>BLOCKED</strong> so no other student can claim it. Final approval is granted once the admin verifies the Transaction ID.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted">
                  {selectedRouteObj && !isSelectedBusFull && (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Dedicated bus {selectedRouteObj.busNo} is ready to be blocked for you.
                    </span>
                  )}
                  {isSelectedBusFull && (
                    <span className="text-semantic-down font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Cannot submit: Selected bus has no available seats.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSelectedBusFull}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-active text-white rounded-pill px-8 py-3 text-sm font-semibold transition-[transform,opacity,background-color] duration-150 active:scale-[0.96] disabled:opacity-50 cursor-pointer text-center min-h-[46px] min-w-[170px] flex items-center justify-center gap-2 shadow-xs"
                  id="submit-button"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Blocking Seat...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Submit & Block Seat</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </section>
        )}

        {/* TAB 2: CHECK SEAT STATUS TRACKER */}
        {activeTab === "status" && (
          <section className="bg-white rounded-2xl border border-hairline shadow-xs p-6 md:p-8 space-y-6" id="status-tracker-section">
            <div>
              <h2 className="text-lg font-medium text-ink flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <span>Check My Bus Seat Status</span>
              </h2>
              <p className="text-xs text-body mt-0.5">
                Enter your USN, Staff ID, or Registered Mobile Number to view live seat reservation and payment verification status.
              </p>
            </div>

            {/* Status Lookup Form */}
            <form onSubmit={handleStatusLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={statusSearchQuery}
                  onChange={(e) => setStatusSearchQuery(e.target.value)}
                  placeholder="Enter USN (e.g. 1BY26CS00112) or Mobile No"
                  className="w-full bg-white text-ink rounded-xl pl-10 pr-4 py-3 text-sm border border-hairline focus:border-2 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-active text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[46px]"
              >
                <span>Check Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Result Display */}
            {statusResult === "not_found" && (
              <div className="p-6 bg-surface-soft border border-hairline rounded-xl text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-muted mx-auto" />
                <h4 className="text-sm font-semibold text-ink">No Registration Found</h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  We could not find any bus booking matching "{statusSearchQuery}". Please check your USN / mobile number or submit a registration first.
                </p>
              </div>
            )}

            {statusResult && statusResult !== "not_found" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-hairline rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Header Badge */}
                <div className="p-5 bg-surface-soft border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-muted block uppercase tracking-wider font-semibold">
                      {statusResult.userType === "student" ? "Student Transport Pass" : "Staff Transport Pass"}
                    </span>
                    <h3 className="text-lg font-bold text-ink mt-0.5">{statusResult.name}</h3>
                    <span className="text-xs font-mono text-muted">{statusResult.identifier}</span>
                  </div>

                  {/* Seat Status Badge */}
                  <div>
                    {statusResult.seatStatus === "Approved" ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-emerald-800 border border-green-300">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        SEAT APPROVED & CONFIRMED
                      </span>
                    ) : statusResult.seatStatus === "Seat Blocked" ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#fff8e6] text-[#996500] border border-[#f0d075]">
                        <span className="w-2 h-2 rounded-full bg-accent-yellow animate-pulse" />
                        SEAT BLOCKED (Provisional)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                        <Clock className="w-4 h-4" />
                        {statusResult.seatStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-surface-soft/60 rounded-xl border border-hairline">
                      <span className="text-muted block text-[11px]">Assigned Dedicated Bus</span>
                      <span className="text-sm font-bold text-ink mt-0.5 block tabular-nums">
                        {statusResult.busNo || "Route Dedicated Bus"}
                      </span>
                      <span className="text-[11px] text-body mt-0.5 block truncate">{statusResult.route}</span>
                    </div>

                    <div className="p-3 bg-surface-soft/60 rounded-xl border border-hairline">
                      <span className="text-muted block text-[11px]">Boarding Stop</span>
                      <span className="text-sm font-bold text-ink mt-0.5 block truncate">
                        {statusResult.boardingPoint}
                      </span>
                      <span className="text-[11px] text-muted mt-0.5 block">Campus Arrival: 8:20 AM</span>
                    </div>

                    <div className="p-3 bg-surface-soft/60 rounded-xl border border-hairline">
                      <span className="text-muted block text-[11px]">Payment Transaction ID</span>
                      <span className="text-sm font-mono font-bold text-ink mt-0.5 block truncate">
                        {statusResult.transactionId || "N/A"}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                        ₹{statusResult.feeAmount?.toLocaleString() || "28,000"} Paid via {statusResult.paymentMode}
                      </span>
                    </div>
                  </div>

                  {/* 3-Step Approval Timeline */}
                  <div className="p-4 bg-surface-soft rounded-xl border border-hairline space-y-3">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Verification & Approval Journey
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Step 1 */}
                      <div className="p-3 bg-white rounded-lg border border-hairline flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <span className="font-bold text-ink block">1. Form Submitted</span>
                          <p className="text-[11px] text-muted mt-0.5">Route & pickup stop details registered.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 bg-white rounded-lg border border-hairline flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <span className="font-bold text-ink block">2. Bus Seat Blocked</span>
                          <p className="text-[11px] text-muted mt-0.5">Seat blocked on bus {statusResult.busNo}.</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                        statusResult.seatStatus === "Approved"
                          ? "bg-white border-emerald-300"
                          : "bg-amber-50/70 border-amber-200"
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs ${
                          statusResult.seatStatus === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-accent-yellow/30 text-[#8f5d00]"
                        }`}>
                          {statusResult.seatStatus === "Approved" ? "✓" : "⏳"}
                        </div>
                        <div>
                          <span className="font-bold text-ink block">3. Final Admin Approval</span>
                          <p className="text-[11px] text-muted mt-0.5">
                            {statusResult.seatStatus === "Approved"
                              ? "Payment verified! Seat officially confirmed."
                              : "Under admin verification with BMSIT bank records."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* Footer info */}
        <footer className="pt-4 pb-12 text-center text-xs text-muted border-t border-hairline">
          <p>© {new Date().getFullYear()} BMS Institute of Technology & Management • Campus Transport Office</p>
          <p className="mt-1">For bus coordination queries, please reach out to your respective route coordinator.</p>
        </footer>

      </div>
    </div>
  );
}
