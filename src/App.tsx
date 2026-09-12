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
  Info,
  GraduationCap,
  Calendar,
  MessageSquare,
  Home,
  HeartPulse,
  Users,
  PhoneCall,
  QrCode,
  FileText
} from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, onSnapshot, serverTimestamp } from "firebase/firestore";
import paymentQrCode from "./assets/payment-qr.png";

interface RegistrationRecord {
  id: string;
  userType: "student" | "staff";
  staffCategory?: "teaching" | "non-teaching";
  name: string;
  identifier: string; // USN for student, ID Number for staff
  phone: string;
  whatsappNumber?: string;
  email: string;
  semester?: string;
  batch?: string;
  presentAddress?: string;
  guardianPhone?: string;
  guardianRelation?: "Father" | "Mother" | "Guardian";
  emergencyContact?: string;
  bloodGroup?: string;
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
  whatsappNumber?: string;
  email?: string;
  semester?: string;
  batch?: string;
  presentAddress?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
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
  const [semester, setSemester] = useState("");
  const [batch, setBatch] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isWhatsappSame, setIsWhatsappSame] = useState(true);
  const [email, setEmail] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState<"Father" | "Mother" | "Guardian">("Father");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [route, setRoute] = useState("");

  // Payment fields
  const [transactionId, setTransactionId] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
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

  // Helper parser for Firestore document data
  const parseRegistrationDoc = (id: string, data: any): RegistrationRecord => {
    const isApproved =
      data.seatStatus === "Approved" ||
      data.seatStatus === "Confirmed" ||
      data.status === "Approved" ||
      data.status === "approved" ||
      data.isApproved === true ||
      data.approved === true ||
      data.approvalStatus === "Approved" ||
      data.verificationStatus === "Approved";

    const isPaymentVerified =
      data.paymentStatus === "Verified" ||
      data.paymentStatus === "Approved" ||
      data.paymentStatus === "Paid" ||
      data.paymentStatus === "Success" ||
      data.paymentVerified === true ||
      isApproved;

    return {
      id,
      userType: data.userType || "student",
      staffCategory: data.staffCategory,
      name: data.studentName || data.name || data.staffName || "",
      identifier: data.usn || data.idNumber || data.identifier || "",
      phone: data.phone || "",
      whatsappNumber: data.whatsappNumber || data.whatsapp || data.phone || "",
      email: data.email || "",
      semester: data.semester || "",
      batch: data.batch || "",
      presentAddress: data.presentAddress || data.address || "",
      guardianPhone: data.guardianPhone || data.guardianContact || "",
      guardianRelation: data.guardianRelation || "Father",
      emergencyContact: data.emergencyContact || data.emergencyPhone || "",
      bloodGroup: data.bloodGroup || "",
      boardingPoint: data.boardingPoint || "",
      route: data.routeNo || data.route || "",
      busNo: data.busNo || "",
      transactionId: data.transactionId || "",
      paymentMode: data.paymentMode || "UPI",
      feeAmount: data.feeAmount || 28000,
      seatStatus: isApproved ? "Approved" : (data.seatStatus || "Seat Blocked"),
      paymentStatus: isPaymentVerified ? "Verified" : (data.paymentStatus || "Payment Initiated"),
      createdAt: data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : data.submittedAt) : (data.createdAt || "")
    };
  };

  // Real-time Firestore sync: updates instantly whenever an admin approves or modifies any registration
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(db, "registrations"), (snapshot) => {
      const list = snapshot.docs.map(doc => parseRegistrationDoc(doc.id, doc.data()));
      setRegistrations(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to sync registrations in real-time from Firestore", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Automatically update the displayed status result as soon as approval occurs in Firestore
  useEffect(() => {
    if (statusResult && statusResult !== "not_found") {
      const match = registrations.find(r =>
        (statusResult.id && r.id === statusResult.id) ||
        (statusResult.identifier && r.identifier.toLowerCase() === statusResult.identifier.toLowerCase()) ||
        (statusResult.transactionId && r.transactionId.toLowerCase() === statusResult.transactionId.toLowerCase())
      );
      if (match && (match.seatStatus !== statusResult.seatStatus || match.paymentStatus !== statusResult.paymentStatus || match.id !== statusResult.id)) {
        setStatusResult(match);
      }
    }
  }, [registrations, statusResult]);

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
        errors.identifier = `USN must be exactly 12 characters (currently ${cleanUsn.length} characters).`;
        errorList.push(`USN is incorrect length (${cleanUsn.length}/12 chars).`);
      }

      // Semester
      if (!semester.trim()) {
        errors.semester = "Please select your semester.";
        errorList.push("Semester is missing.");
      }

      // Batch
      if (!batch.trim()) {
        errors.batch = "Please enter your batch.";
        errorList.push("Batch is missing.");
      }

      // Guardian Mobile Number
      const guardianDigits = guardianPhone.replace(/\D/g, "");
      if (!guardianPhone.trim()) {
        errors.guardianPhone = "Guardian mobile number is required.";
        errorList.push("Guardian phone number is missing.");
      } else if (guardianDigits.length < 10) {
        errors.guardianPhone = `Guardian phone number must have at least 10 digits (found ${guardianDigits.length}).`;
        errorList.push("Guardian phone number must be at least 10 digits.");
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

    // Student / User Phone Number Validation (At least 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errors.phone = "Phone Number is required.";
      errorList.push("Phone Number is missing.");
    } else if (phoneDigits.length < 10) {
      errors.phone = `Phone Number must contain at least 10 digits (found ${phoneDigits.length}).`;
      errorList.push(`Phone number has only ${phoneDigits.length} digits (min 10).`);
    }

    // Student WhatsApp Number
    const effectiveWhatsapp = isWhatsappSame ? phone : whatsappNumber;
    const waDigits = effectiveWhatsapp.replace(/\D/g, "");
    if (!effectiveWhatsapp.trim()) {
      errors.whatsappNumber = "WhatsApp Number is required.";
      errorList.push("WhatsApp Number is missing.");
    } else if (waDigits.length < 10) {
      errors.whatsappNumber = `WhatsApp Number must contain at least 10 digits (found ${waDigits.length}).`;
      errorList.push(`WhatsApp number has only ${waDigits.length} digits (min 10).`);
    }

    // Email Address Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email Address is required.";
      errorList.push("Email Address is missing.");
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
      errorList.push("Email format is invalid.");
    }

    // Present Address
    if (!presentAddress.trim()) {
      errors.presentAddress = "Present residential address is required.";
      errorList.push("Present address is missing.");
    } else if (presentAddress.trim().length < 5) {
      errors.presentAddress = "Please provide complete present address.";
      errorList.push("Present address is too short.");
    }

    // Blood Group
    if (!bloodGroup.trim()) {
      errors.bloodGroup = "Please select blood group.";
      errorList.push("Blood group is missing.");
    }

    // Emergency Contact Number
    const emergencyDigits = emergencyContact.replace(/\D/g, "");
    if (!emergencyContact.trim()) {
      errors.emergencyContact = "Emergency Contact Number is required.";
      errorList.push("Emergency contact number is missing.");
    } else if (emergencyDigits.length < 10) {
      errors.emergencyContact = `Emergency Contact must have at least 10 digits (found ${emergencyDigits.length}).`;
      errorList.push("Emergency contact number must be at least 10 digits.");
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
      const finalWhatsapp = isWhatsappSame ? phone.trim() : (whatsappNumber.trim() || phone.trim());

      const payload: any = {
        userType,
        phone: phone.trim(),
        whatsappNumber: finalWhatsapp,
        email: email.trim(),
        presentAddress: presentAddress.trim(),
        bloodGroup: bloodGroup.trim(),
        emergencyContact: emergencyContact.trim(),
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
        payload.semester = semester.trim();
        payload.batch = batch.trim();
        payload.guardianPhone = guardianPhone.trim();
        payload.guardianRelation = guardianRelation;
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
        whatsappNumber: finalWhatsapp,
        email: email.trim(),
        semester: semester.trim(),
        batch: batch.trim(),
        presentAddress: presentAddress.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianRelation: guardianRelation,
        emergencyContact: emergencyContact.trim(),
        bloodGroup: bloodGroup.trim(),
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
      setSemester("");
      setBatch("");
      setPhone("");
      setWhatsappNumber("");
      setIsWhatsappSame(true);
      setEmail("");
      setPresentAddress("");
      setGuardianPhone("");
      setEmergencyContact("");
      setBloodGroup("");
      setBoardingPoint("");
      setRoute("");
      setTransactionId("");
      setHasVisitedPortal(false);
      setFieldErrors({});
      setFormErrorSummary(null);

      // Refresh records list is handled automatically in real-time via onSnapshot
    } catch (error) {
      console.error("Submission error details:", error);
      setFormErrorSummary(error instanceof Error ? `Failed to submit: ${error.message}` : "Failed to submit registration. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Lookup Handler with flexible matching
  const handleStatusLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const rawQuery = statusSearchQuery.trim();
    const query = rawQuery.toLowerCase();
    const cleanDigits = rawQuery.replace(/\D/g, "");
    if (!query) return;

    const match = registrations.find(r => 
      r.identifier.toLowerCase() === query || 
      (cleanDigits && cleanDigits.length >= 8 && r.phone.replace(/\D/g, "").includes(cleanDigits)) ||
      (cleanDigits && cleanDigits.length >= 8 && (r.whatsappNumber || "").replace(/\D/g, "").includes(cleanDigits)) ||
      (cleanDigits && cleanDigits.length >= 8 && (r.guardianPhone || "").replace(/\D/g, "").includes(cleanDigits)) ||
      r.transactionId.toLowerCase() === query ||
      r.id.toLowerCase() === query
    );

    if (match) {
      setStatusResult(match);
    } else {
      setStatusResult("not_found");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink py-6 sm:py-10 px-3 sm:px-6 md:px-8 font-sans antialiased">
      <div className="max-w-[860px] mx-auto space-y-6" id="main-container">

        {/* App Title & Tabs Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-hairline" id="app-header">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink flex items-baseline">
              <span>Wayline</span><span className="text-primary text-3xl font-black leading-none">.</span>
              <span className="font-medium text-body text-xl md:text-2xl ml-2">Bus Registration Form</span>
            </h1>
            <p className="text-xs text-body mt-1">
              Select your route, verify live seat availability on dedicated buses, and initiate payment.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl self-start sm:self-auto" role="tablist" aria-label="Registration Navigation">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "register"}
              onClick={() => setActiveTab("register")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                activeTab === "register"
                  ? "bg-white text-primary shadow-xs border border-hairline"
                  : "text-body hover:text-ink"
              }`}
            >
              <Bus className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Register & Block Seat</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "status"}
              onClick={() => setActiveTab("status")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                activeTab === "status"
                  ? "bg-white text-primary shadow-xs border border-hairline"
                  : "text-body hover:text-ink"
              }`}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
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
                    {lastSubmitted.semester && (
                      <div>
                        <span className="text-muted block text-[11px]">Semester & Batch:</span>
                        <span className="font-medium text-ink truncate block">{lastSubmitted.semester} ({lastSubmitted.batch})</span>
                      </div>
                    )}
                    {lastSubmitted.bloodGroup && (
                      <div>
                        <span className="text-muted block text-[11px]">Blood Group:</span>
                        <span className="font-bold text-primary truncate block">{lastSubmitted.bloodGroup}</span>
                      </div>
                    )}
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
                    <strong>Next Step:</strong> Your seat is reserved. The transport administrator will verify your Transaction ID and issue final approval.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setActiveTab("status");
                      setStatusSearchQuery(lastSubmitted.identifier);
                      setStatusResult(lastSubmitted);
                    }}
                    className="flex-1 py-2.5 px-4 bg-surface-strong hover:bg-hairline text-ink font-semibold rounded-xl text-xs active:scale-[0.96] transition-transform duration-100 cursor-pointer text-center min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    View Status Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-active text-white font-semibold rounded-xl text-xs active:scale-[0.96] transition-transform duration-100 cursor-pointer shadow-xs text-center min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <section className="bg-white rounded-2xl border border-hairline shadow-xs p-4 sm:p-6 md:p-8 relative" id="registration-form-card">

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
                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-soft border border-hairline rounded-xl" id="role-selector" role="group" aria-label="Registration Category">
                  <button
                    type="button"
                    onClick={() => {
                      setUserType("student");
                      setFieldErrors({});
                      setFormErrorSummary(null);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      userType === "student"
                        ? "bg-white text-primary shadow-xs border border-hairline"
                        : "text-body hover:text-ink"
                    }`}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserType("staff");
                      setFieldErrors({});
                      setFormErrorSummary(null);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      userType === "staff"
                        ? "bg-white text-primary shadow-xs border border-hairline"
                        : "text-body hover:text-ink"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
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
                    <div className="grid grid-cols-2 gap-2 p-1 bg-surface-strong/60 border border-hairline rounded-xl" role="group" aria-label="Staff Designation Category">
                      <button
                        type="button"
                        onClick={() => setStaffCategory("teaching")}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
                        className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer active:scale-[0.96] transition-transform duration-100 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
                    {userType === "student" ? "Student Name" : "Staff Name"} <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="user-name"
                      type="text"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? "name-error" : undefined}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder={userType === "student" ? "Enter student full name" : "Enter staff full name"}
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.name ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p id="name-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* USN Number for Student vs ID Number for Staff */}
                <div className="space-y-1.5">
                  <label htmlFor="user-identifier" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    {userType === "student" ? "USN No (12 Characters)" : "Staff ID Number"} <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      id="user-identifier"
                      type="text"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.identifier}
                      aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: undefined }));
                      }}
                      placeholder={userType === "student" ? "Enter 12-character USN" : "Enter Staff ID number"}
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        userType === "student" ? "uppercase tabular-nums" : ""
                      } ${
                        fieldErrors.identifier ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p id="identifier-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                {/* Semester & Batch (Student Only) */}
                {userType === "student" && (
                  <>
                    {/* Semester Dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="user-semester" className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Semester <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <select
                          id="user-semester"
                          aria-required="true"
                          aria-invalid={!!fieldErrors.semester}
                          aria-describedby={fieldErrors.semester ? "semester-error" : undefined}
                          value={semester}
                          onChange={(e) => {
                            setSemester(e.target.value);
                            if (fieldErrors.semester) setFieldErrors(prev => ({ ...prev, semester: undefined }));
                          }}
                          className={`w-full bg-white text-ink rounded-lg pl-10 pr-10 py-2.5 text-sm border ${
                            fieldErrors.semester ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                          } focus:outline-none appearance-none cursor-pointer transition-colors duration-100 min-h-[44px]`}
                        >
                          <option value="">-- Select Semester --</option>
                          <option value="1st Semester">1st Semester</option>
                          <option value="2nd Semester">2nd Semester</option>
                          <option value="3rd Semester">3rd Semester</option>
                          <option value="4th Semester">4th Semester</option>
                          <option value="5th Semester">5th Semester</option>
                          <option value="6th Semester">6th Semester</option>
                          <option value="7th Semester">7th Semester</option>
                          <option value="8th Semester">8th Semester</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-ink">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                      {fieldErrors.semester && (
                        <p id="semester-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.semester}
                        </p>
                      )}
                    </div>

                    {/* Batch (Manual Input) */}
                    <div className="space-y-1.5">
                      <label htmlFor="user-batch" className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Batch <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          id="user-batch"
                          type="text"
                          aria-required="true"
                          aria-invalid={!!fieldErrors.batch}
                          aria-describedby={fieldErrors.batch ? "batch-error" : undefined}
                          value={batch}
                          onChange={(e) => {
                            setBatch(e.target.value);
                            if (fieldErrors.batch) setFieldErrors(prev => ({ ...prev, batch: undefined }));
                          }}
                          placeholder="Enter batch year or range"
                          className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border tabular-nums ${
                            fieldErrors.batch ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                          } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                        />
                      </div>
                      {fieldErrors.batch && (
                        <p id="batch-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.batch}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Blood Group (Manual Input) */}
                <div className="space-y-1.5">
                  <label htmlFor="user-blood-group" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Blood Group <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary min-w-[40px] justify-center">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <input
                      id="user-blood-group"
                      type="text"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.bloodGroup}
                      aria-describedby={fieldErrors.bloodGroup ? "bloodgroup-error" : undefined}
                      value={bloodGroup}
                      onChange={(e) => {
                        setBloodGroup(e.target.value);
                        if (fieldErrors.bloodGroup) setFieldErrors(prev => ({ ...prev, bloodGroup: undefined }));
                      }}
                      placeholder="Enter blood group"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm uppercase border ${
                        fieldErrors.bloodGroup ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.bloodGroup && (
                    <p id="bloodgroup-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.bloodGroup}
                    </p>
                  )}
                </div>

                {/* Calling Phone Number Field */}
                <div className="space-y-1.5">
                  <label htmlFor="user-phone" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Phone Number (Calling) <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="user-phone"
                      type="tel"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.phone ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 tabular-nums min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p id="phone-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Student WhatsApp Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="user-whatsapp" className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Student WhatsApp Number <span className="text-primary">*</span>
                    </label>
                    <label className="text-[11px] text-primary flex items-center gap-1.5 cursor-pointer font-medium select-none py-0.5">
                      <input
                        type="checkbox"
                        checked={isWhatsappSame}
                        onChange={(e) => {
                          setIsWhatsappSame(e.target.checked);
                          if (e.target.checked) {
                            setWhatsappNumber("");
                            if (fieldErrors.whatsappNumber) setFieldErrors(prev => ({ ...prev, whatsappNumber: undefined }));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span>Same as Calling No</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary min-w-[40px] justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <input
                      id="user-whatsapp"
                      type="tel"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.whatsappNumber}
                      aria-describedby={fieldErrors.whatsappNumber ? "whatsapp-error" : undefined}
                      disabled={isWhatsappSame}
                      value={isWhatsappSame ? phone : whatsappNumber}
                      onChange={(e) => {
                        setWhatsappNumber(e.target.value);
                        if (fieldErrors.whatsappNumber) setFieldErrors(prev => ({ ...prev, whatsappNumber: undefined }));
                      }}
                      placeholder="Enter 10-digit WhatsApp number"
                      className={`w-full text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        isWhatsappSame ? "bg-surface-soft/80 cursor-not-allowed opacity-90" : "bg-white"
                      } ${
                        fieldErrors.whatsappNumber ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 tabular-nums min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.whatsappNumber && (
                    <p id="whatsapp-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.whatsappNumber}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="user-email" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Student Mail ID <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="user-email"
                      type="email"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="Enter student email address"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.email ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Guardian Mobile Number (M/F) (Student Only) */}
                {userType === "student" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="user-guardian" className="text-xs font-bold text-ink uppercase tracking-wider block">
                        Guardian Mobile Number (M/F) <span className="text-primary">*</span>
                      </label>
                      <div className="flex items-center gap-1 text-[11px]" role="group" aria-label="Guardian Relation">
                        <button
                          type="button"
                          onClick={() => setGuardianRelation("Father")}
                          className={`px-2.5 py-1 rounded-md cursor-pointer text-xs font-semibold active:scale-[0.96] transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${guardianRelation === "Father" ? "bg-primary text-white shadow-xs" : "bg-surface-strong text-body hover:text-ink"}`}
                        >
                          Father
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuardianRelation("Mother")}
                          className={`px-2.5 py-1 rounded-md cursor-pointer text-xs font-semibold active:scale-[0.96] transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${guardianRelation === "Mother" ? "bg-primary text-white shadow-xs" : "bg-surface-strong text-body hover:text-ink"}`}
                        >
                          Mother
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuardianRelation("Guardian")}
                          className={`px-2.5 py-1 rounded-md cursor-pointer text-xs font-semibold active:scale-[0.96] transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${guardianRelation === "Guardian" ? "bg-primary text-white shadow-xs" : "bg-surface-strong text-body hover:text-ink"}`}
                        >
                          Guardian
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <input
                        id="user-guardian"
                        type="tel"
                        aria-required="true"
                        aria-invalid={!!fieldErrors.guardianPhone}
                        aria-describedby={fieldErrors.guardianPhone ? "guardian-error" : undefined}
                        value={guardianPhone}
                        onChange={(e) => {
                          setGuardianPhone(e.target.value);
                          if (fieldErrors.guardianPhone) setFieldErrors(prev => ({ ...prev, guardianPhone: undefined }));
                        }}
                        placeholder={`Enter 10-digit ${guardianRelation.toLowerCase()}'s mobile number`}
                        className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                          fieldErrors.guardianPhone ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                        } focus:outline-none transition-colors duration-100 tabular-nums min-h-[44px]`}
                      />
                    </div>
                    {fieldErrors.guardianPhone && (
                      <p id="guardian-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.guardianPhone}
                      </p>
                    )}
                  </div>
                )}

                {/* Emergency Contact Number */}
                <div className="space-y-1.5">
                  <label htmlFor="user-emergency" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Emergency Contact Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary min-w-[40px] justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <input
                      id="user-emergency"
                      type="tel"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.emergencyContact}
                      aria-describedby={fieldErrors.emergencyContact ? "emergency-error" : undefined}
                      value={emergencyContact}
                      onChange={(e) => {
                        setEmergencyContact(e.target.value);
                        if (fieldErrors.emergencyContact) setFieldErrors(prev => ({ ...prev, emergencyContact: undefined }));
                      }}
                      placeholder="Enter 10-digit emergency contact number"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.emergencyContact ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 tabular-nums min-h-[44px]`}
                    />
                  </div>
                  {fieldErrors.emergencyContact && (
                    <p id="emergency-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.emergencyContact}
                    </p>
                  )}
                </div>

                {/* Present Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="user-address" className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Present Address <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <Home className="w-4 h-4" />
                    </div>
                    <textarea
                      id="user-address"
                      rows={2}
                      aria-required="true"
                      aria-invalid={!!fieldErrors.presentAddress}
                      aria-describedby={fieldErrors.presentAddress ? "address-error" : undefined}
                      value={presentAddress}
                      onChange={(e) => {
                        setPresentAddress(e.target.value);
                        if (fieldErrors.presentAddress) setFieldErrors(prev => ({ ...prev, presentAddress: undefined }));
                      }}
                      placeholder="Enter present residential address"
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                        fieldErrors.presentAddress ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      } focus:outline-none transition-colors duration-100 min-h-[60px]`}
                    />
                  </div>
                  {fieldErrors.presentAddress && (
                    <p id="address-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.presentAddress}
                    </p>
                  )}
                </div>

                {/* Route Dropdown Menu */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="user-route" className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Select Transport Route
                    </label>
                    <a
                      href="https://bmsit.ac.in/pdf/busRoutes.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Official Routes PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <select
                      id="user-route"
                      aria-required="true"
                      aria-invalid={!!fieldErrors.route}
                      aria-describedby={fieldErrors.route ? "route-error" : undefined}
                      value={route}
                      onChange={(e) => {
                        setRoute(e.target.value);
                        setBoardingPoint("");
                        if (fieldErrors.route) setFieldErrors(prev => ({ ...prev, route: undefined }));
                      }}
                      className={`w-full bg-white text-ink rounded-lg pl-10 pr-10 py-2.5 text-sm border ${
                        fieldErrors.route ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        aria-required="true"
                        aria-invalid={!!fieldErrors.boardingPoint}
                        aria-describedby={fieldErrors.boardingPoint ? "boarding-error" : undefined}
                        value={boardingPoint}
                        onChange={(e) => {
                          setBoardingPoint(e.target.value);
                          if (fieldErrors.boardingPoint) setFieldErrors(prev => ({ ...prev, boardingPoint: undefined }));
                        }}
                        className={`w-full bg-white text-ink rounded-lg pl-10 pr-10 py-2.5 text-sm border ${
                          fieldErrors.boardingPoint ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        aria-required="true"
                        aria-invalid={!!fieldErrors.boardingPoint}
                        aria-describedby={fieldErrors.boardingPoint ? "boarding-error" : undefined}
                        value={boardingPoint}
                        onChange={(e) => {
                          setBoardingPoint(e.target.value);
                          if (fieldErrors.boardingPoint) setFieldErrors(prev => ({ ...prev, boardingPoint: undefined }));
                        }}
                        placeholder="Select a route above to choose your pickup point or type here"
                        className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border ${
                          fieldErrors.boardingPoint ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                    <p id="boarding-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.boardingPoint}
                    </p>
                  )}
                </div>

              </div>

              {/* PAYMENT SECTION */}
              <div className="mt-8 pt-6 border-t border-hairline space-y-4" id="payment-initiation-section">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-primary/10 text-primary rounded-md">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                      Payment Mode & Seat Confirmation
                    </h3>
                  </div>
                  <p className="text-xs text-body mt-0.5">
                    Select your payment method and submit your transaction ID to block your seat.
                  </p>
                </div>

                {/* Payment Card */}
                <div className="p-4 sm:p-5 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  {/* Payment Mode Selector */}
                  <div className="space-y-1.5">
                    <label htmlFor="payment-mode" className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Payment Mode
                    </label>
                    <div className="relative">
                      <select
                        id="payment-mode"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full bg-white text-ink rounded-lg px-3.5 py-2.5 text-sm border border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none cursor-pointer transition-colors duration-100 min-h-[44px]"
                      >
                        <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                        <option value="Net Banking / NEFT">Net Banking / NEFT / RTGS</option>
                        <option value="Cash / Bank Challan">Cash / Bank Challan</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section (Displayed when UPI is selected) */}
                  {paymentMode === "UPI" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 sm:p-5 bg-white rounded-xl border border-hairline flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left shadow-2xs"
                      id="upi-qr-card"
                    >
                      {/* QR Box */}
                      <div className="w-40 h-40 bg-surface-soft rounded-xl border border-hairline flex flex-col items-center justify-center p-2 flex-shrink-0 relative overflow-hidden group shadow-2xs">
                        <img
                          src={paymentQrCode}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain rounded-lg outline outline-1 outline-black/10"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const fallback = target.parentElement?.querySelector(".qr-placeholder-ui");
                            if (fallback) (fallback as HTMLElement).style.display = "flex";
                          }}
                        />
                        <div className="qr-placeholder-ui hidden w-full h-full flex-col items-center justify-center text-primary bg-primary/5 rounded-lg p-2">
                          <QrCode className="w-16 h-16 text-primary stroke-[1.5]" />
                          <span className="text-[11px] font-bold text-ink mt-1">UPI QR Code</span>
                          <span className="text-[9px] text-muted">Scan to Pay</span>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-emerald-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          <span>UPI QR Payment</span>
                        </div>
                        <h4 className="text-sm font-bold text-ink">Scan & Pay using any UPI App</h4>
                        <p className="text-xs text-body leading-relaxed">
                          Open <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or your mobile banking UPI app to scan and complete payment.
                        </p>
                        <p className="text-[11px] text-muted">
                          After successful payment, please copy your <strong>12-digit UPI Reference / UTR Number</strong> and enter it below.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Transaction ID / UTR Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="transaction-id" className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Transaction ID / UTR Number <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted min-w-[40px] justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        id="transaction-id"
                        type="text"
                        aria-required="true"
                        aria-invalid={!!fieldErrors.transactionId}
                        aria-describedby={fieldErrors.transactionId ? "transaction-error" : undefined}
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          if (fieldErrors.transactionId) setFieldErrors(prev => ({ ...prev, transactionId: undefined }));
                        }}
                        placeholder="Enter 12-digit UTR or transaction number"
                        className={`w-full bg-white text-ink rounded-lg pl-10 pr-4 py-2.5 text-sm border font-mono ${
                          fieldErrors.transactionId ? "border-semantic-down focus:border-semantic-down ring-1 ring-semantic-down/30" : "border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20"
                        } focus:outline-none transition-colors duration-100 min-h-[44px]`}
                      />
                    </div>
                    {fieldErrors.transactionId && (
                      <p id="transaction-error" className="text-xs text-semantic-down mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 inline flex-shrink-0" /> {fieldErrors.transactionId}
                      </p>
                    )}
                  </div>

                  {/* Seat Blocking Assurance Banner */}
                  <div className="p-3 bg-[#fff9ea] border border-[#f5df9e] rounded-xl flex items-start gap-2 text-xs text-[#8a5d00]">
                    <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-yellow" />
                    <p className="leading-relaxed">
                      <strong>Seat Reservation:</strong> Submitting instantly blocks your seat on bus <strong>{selectedRouteObj ? selectedRouteObj.busNo : "selected route"}</strong>. Final approval is issued after admin verification.
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
          <section className="bg-white rounded-2xl border border-hairline shadow-xs p-4 sm:p-6 md:p-8 space-y-6" id="status-tracker-section">
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
                  aria-label="Search status by USN, Mobile Number, or Transaction ID"
                  value={statusSearchQuery}
                  onChange={(e) => setStatusSearchQuery(e.target.value)}
                  placeholder="Enter USN, mobile number, or transaction ID"
                  className="w-full bg-white text-ink rounded-xl pl-10 pr-4 py-3 text-sm border border-hairline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors duration-100 min-h-[46px]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-active text-white rounded-xl text-sm font-semibold active:scale-[0.96] transition-transform duration-100 flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[46px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                        Paid via {statusResult.paymentMode}
                      </span>
                    </div>
                  </div>

                  {/* Registered Contact & Profile Details */}
                  <div className="p-4 bg-surface-soft/60 rounded-xl border border-hairline space-y-2.5 text-xs">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Student & Contact Profile Summary
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <span className="text-muted block text-[11px]">Semester & Batch</span>
                        <span className="font-semibold text-ink">
                          {statusResult.semester ? `${statusResult.semester} (${statusResult.batch})` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Blood Group</span>
                        <span className="font-bold text-primary">
                          {statusResult.bloodGroup || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">WhatsApp Number</span>
                        <span className="font-medium text-ink tabular-nums">
                          {statusResult.whatsappNumber || statusResult.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Emergency Contact</span>
                        <span className="font-medium text-ink tabular-nums">
                          {statusResult.emergencyContact || "N/A"}
                        </span>
                      </div>
                      {statusResult.guardianPhone && (
                        <div className="col-span-2">
                          <span className="text-muted block text-[11px]">Guardian Phone ({statusResult.guardianRelation || "Parent"})</span>
                          <span className="font-medium text-ink tabular-nums">{statusResult.guardianPhone}</span>
                        </div>
                      )}
                      {statusResult.presentAddress && (
                        <div className="col-span-2">
                          <span className="text-muted block text-[11px]">Present Address</span>
                          <span className="font-medium text-ink block truncate">{statusResult.presentAddress}</span>
                        </div>
                      )}
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
        <footer className="pt-4 pb-12 text-center text-xs text-muted border-t border-hairline space-y-1.5">
          <p>© {new Date().getFullYear()} BMS Institute of Technology & Management • Campus Transport Office</p>
          <p>
            <a
              href="https://bmsit.ac.in/pdf/busRoutes.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official BMSIT Bus Routes & Timings (PDF Reference)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-[11px]">For bus coordination queries, please reach out to your respective route coordinator.</p>
        </footer>

      </div>
    </div>
  );
}
