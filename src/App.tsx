import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";
import CourseViewer from "./pages/CourseViewer";
import QuizPage from "./pages/QuizPage";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import Contact from "./pages/Contact";
import About from "./pages/About";
import TeacherDashboard from "./pages/TeacherDashboard";
import NotFound from "./pages/NotFound";
import Browse from "./pages/Browse";
import InstallApp from "./pages/InstallApp";
import ScrollToTop from "./components/ScrollToTop";
import BackButtonHandler from "./components/BackButtonHandler";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <BackButtonHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses/:id/learn" element={<CourseViewer />} />
            <Route path="/courses/:id/quiz" element={<QuizPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/install" element={<InstallApp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
