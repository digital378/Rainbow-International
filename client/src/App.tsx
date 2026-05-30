import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import { initGA, trackPageView } from "@/lib/analytics";
import Home from "@/pages/Home";

const About = lazy(() => import("@/pages/About"));
const WelcomeToRIS = lazy(() => import("@/pages/WelcomeToRIS"));
const ChairpersonsNote = lazy(() => import("@/pages/ChairpersonsNote"));
const VisionMission = lazy(() => import("@/pages/VisionMission"));
const OurPhilosophy = lazy(() => import("@/pages/OurPhilosophy"));
const PrePrimary = lazy(() => import("@/pages/PrePrimary"));
const Primary = lazy(() => import("@/pages/Primary"));
const MiddleSchool = lazy(() => import("@/pages/MiddleSchool"));
const Secondary = lazy(() => import("@/pages/Secondary"));
const SeniorSecondary = lazy(() => import("@/pages/SeniorSecondary"));
const Amenities = lazy(() => import("@/pages/Amenities"));
const Awards = lazy(() => import("@/pages/Awards"));
const StudentAchievements = lazy(() => import("@/pages/StudentAchievements"));
const SafetySecurity = lazy(() => import("@/pages/SafetySecurity"));
const BeyondClassroom = lazy(() => import("@/pages/BeyondClassroom"));
const Extracurriculars = lazy(() => import("@/pages/Extracurriculars"));
const PhotoGallery = lazy(() => import("@/pages/PhotoGallery"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const AcademicCalendar = lazy(() => import("@/pages/AcademicCalendar"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const CbseDisclosures = lazy(() => import("@/pages/CbseDisclosures"));
const SchoolManagingCommittee = lazy(() => import("@/pages/SchoolManagingCommittee"));
const Career = lazy(() => import("@/pages/Career"));
const BookList = lazy(() => import("@/pages/BookList"));
const Declaration = lazy(() => import("@/pages/Declaration"));
const VirtualLearning = lazy(() => import("@/pages/VirtualLearning"));
const AcademicTeam = lazy(() => import("@/pages/AcademicTeam"));
const RainbowPreschool = lazy(() => import("@/pages/RainbowPreschool"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const BrandPartners = lazy(() => import("@/pages/BrandPartners"));
const StudentsLeavingCertificate = lazy(() => import("@/pages/StudentsLeavingCertificate"));
const Curriculum = lazy(() => import("@/pages/Curriculum"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const ApplicationForm = lazy(() => import("@/pages/ApplicationForm"));
const GoogleSchool = lazy(() => import("@/pages/GoogleSchool"));
const MetaSchool = lazy(() => import("@/pages/MetaSchool"));
const ScheduleAppointment = lazy(() => import("@/pages/ScheduleAppointment"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const SchoolReadinessQuiz = lazy(() => import("@/pages/SchoolReadinessQuiz"));
const TopSchools = lazy(() => import("@/pages/TopSchools"));
const TestimonialsPage = lazy(() => import("@/pages/Testimonials"));
const FAQsPage = lazy(() => import("@/pages/FAQs"));
const Admissions = lazy(() => import("@/pages/Admissions"));
const Fees = lazy(() => import("@/pages/Fees"));
const SchoolNearBrahmand = lazy(() => import("@/pages/SchoolNearBrahmand"));
const SchoolNearGhodbunderRoad = lazy(() => import("@/pages/SchoolNearGhodbunderRoad"));
const SchoolNearManpada = lazy(() => import("@/pages/SchoolNearManpada"));
const Marketing = lazy(() => import("@/pages/Marketing"));
const Sales = lazy(() => import("@/pages/Sales"));
const RpsSales = lazy(() => import("@/pages/RpsSales"));
const WalkinForm = lazy(() => import("@/pages/WalkinForm"));
const AdminRAs = lazy(() => import("@/pages/AdminRAs"));
const AdminSubmissions = lazy(() => import("@/pages/AdminSubmissions"));
const QRCard = lazy(() => import("@/pages/QRCard"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));
const RainbowCursor = lazy(() => import("@/components/RainbowCursor"));

function PageFallback() {
  return <div style={{ minHeight: "100vh" }} />;
}

function Router() {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<PageFallback />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about-rainbow-international-school" component={About} />
      <Route path="/welcome-to-ris" component={WelcomeToRIS} />
      <Route path="/chairpersons-note" component={ChairpersonsNote} />
      <Route path="/ris-vision-mission" component={VisionMission} />
      <Route path="/our-philosophy" component={OurPhilosophy} />
      <Route path="/pre-primary-school-thane" component={PrePrimary} />
      <Route path="/primary-section" component={Primary} />
      <Route path="/middle-school-section" component={MiddleSchool} />
      <Route path="/secondary-section" component={Secondary} />
      <Route path="/senior-secondary-section" component={SeniorSecondary} />
      <Route path="/amenities" component={Amenities} />
      <Route path="/awards-achievements" component={Awards} />
      <Route path="/student-achievements" component={StudentAchievements} />
      <Route path="/safety-security" component={SafetySecurity} />
      <Route path="/beyond-the-classroom" component={BeyondClassroom} />
      <Route path="/extracurriculars" component={Extracurriculars} />
      <Route path="/photo-gallery" component={PhotoGallery} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/academic-calendar" component={AcademicCalendar} />
      <Route path="/blogs" component={Blogs} />
      <Route path="/cbse-mandatory-public-disclosures" component={CbseDisclosures} />
      <Route path="/school-managing-committee" component={SchoolManagingCommittee} />
      <Route path="/career" component={Career} />
      <Route path="/book-list" component={BookList} />
      <Route path="/declaration" component={Declaration} />
      <Route path="/virtual-learning" component={VirtualLearning} />
      <Route path="/academic-team" component={AcademicTeam} />
      <Route path="/rainbow-preschool-international" component={RainbowPreschool} />
      <Route path="/privacy-policy-and-cookie-policy" component={PrivacyPolicy} />
      <Route path="/term-of-use" component={TermsOfUse} />
      <Route path="/brand-partners" component={BrandPartners} />
      <Route path="/students-leaving-certificate" component={StudentsLeavingCertificate} />
      <Route path="/curriculum" component={Curriculum} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/application-form" component={ApplicationForm} />
      <Route path="/google-school-2025-26" component={GoogleSchool} />
      <Route path="/meta-school-2025-26" component={MetaSchool} />
      <Route path="/schedule-appointment" component={ScheduleAppointment} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/school-readiness-quiz" component={SchoolReadinessQuiz} />
      <Route path="/top-schools-in-thane" component={TopSchools} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/faqs" component={FAQsPage} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/fee-structure" component={Fees} />
      <Route path="/school-near-brahmand-thane" component={SchoolNearBrahmand} />
      <Route path="/school-near-ghodbunder-road-thane" component={SchoolNearGhodbunderRoad} />
      <Route path="/school-near-manpada-thane" component={SchoolNearManpada} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/sales" component={Sales} />
      <Route path="/rps-sales" component={RpsSales} />
      <Route path="/walkin/:slug" component={WalkinForm} />
      <Route path="/admin/ras/submissions" component={AdminSubmissions} />
      <Route path="/admin/ras/:slug/qr" component={QRCard} />
      <Route path="/admin/ras" component={AdminRAs} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
    </>
  );
}

function PageViewTracker() {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  useEffect(() => {
    initGA();
    trackPageView(location);
  }, []);

  useEffect(() => {
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      trackPageView(location);
    }
  }, [location]);

  return null;
}

function DeferredExtras() {
  const [ready, setReady] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    setIsCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
    const idle = typeof requestIdleCallback === "function"
      ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 3000);
    idle(() => setReady(true));
  }, []);

  const isSalesDashboard = location === "/rps-sales" || location === "/sales";

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      {!isCoarsePointer && <RainbowCursor />}
      {!isSalesDashboard && <ChatBot />}
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PageViewTracker />
        <Router />
        <DeferredExtras />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
