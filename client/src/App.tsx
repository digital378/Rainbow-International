import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatBot } from "@/components/ChatBot";
import RainbowCursor from "@/components/RainbowCursor";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import About from "@/pages/About";
import WelcomeToRIS from "@/pages/WelcomeToRIS";
import ChairpersonsNote from "@/pages/ChairpersonsNote";
import VisionMission from "@/pages/VisionMission";
import OurPhilosophy from "@/pages/OurPhilosophy";
import PrePrimary from "@/pages/PrePrimary";
import Primary from "@/pages/Primary";
import MiddleSchool from "@/pages/MiddleSchool";
import Secondary from "@/pages/Secondary";
import SeniorSecondary from "@/pages/SeniorSecondary";
import Amenities from "@/pages/Amenities";
import Awards from "@/pages/Awards";
import StudentAchievements from "@/pages/StudentAchievements";
import SafetySecurity from "@/pages/SafetySecurity";
import BeyondClassroom from "@/pages/BeyondClassroom";
import Extracurriculars from "@/pages/Extracurriculars";
import PhotoGallery from "@/pages/PhotoGallery";
import ContactUs from "@/pages/ContactUs";
import AcademicCalendar from "@/pages/AcademicCalendar";
import Blogs from "@/pages/Blogs";
import CbseDisclosures from "@/pages/CbseDisclosures";
import SchoolManagingCommittee from "@/pages/SchoolManagingCommittee";
import Career from "@/pages/Career";
import BookList from "@/pages/BookList";
import VirtualLearning from "@/pages/VirtualLearning";
import AcademicTeam from "@/pages/AcademicTeam";
import RainbowPreschool from "@/pages/RainbowPreschool";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import GlobalBrandAssociations from "@/pages/GlobalBrandAssociations";
import StudentsLeavingCertificate from "@/pages/StudentsLeavingCertificate";
import Curriculum from "@/pages/Curriculum";
import BlogPost from "@/pages/BlogPost";
import ApplicationForm from "@/pages/ApplicationForm";
import GoogleSchool from "@/pages/GoogleSchool";
import MetaSchool from "@/pages/MetaSchool";
import ScheduleAppointment from "@/pages/ScheduleAppointment";
import ThankYou from "@/pages/ThankYou";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
    <ScrollToTop />
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
      <Route path="/virtual-learning" component={VirtualLearning} />
      <Route path="/academic-team" component={AcademicTeam} />
      <Route path="/rainbow-preschool-international" component={RainbowPreschool} />
      <Route path="/privacy-policy-and-cookie-policy" component={PrivacyPolicy} />
      <Route path="/term-of-use" component={TermsOfUse} />
      <Route path="/global-brand-associations" component={GlobalBrandAssociations} />
      <Route path="/students-leaving-certificate" component={StudentsLeavingCertificate} />
      <Route path="/curriculum" component={Curriculum} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/application-form" component={ApplicationForm} />
      <Route path="/google-school-2025-26" component={GoogleSchool} />
      <Route path="/meta-school-2025-26" component={MetaSchool} />
      <Route path="/schedule-appointment" component={ScheduleAppointment} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RainbowCursor />
        <Router />
        <ChatBot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
