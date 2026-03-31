import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import About from "@/pages/About";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about-rainbow-international-school" component={About} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
