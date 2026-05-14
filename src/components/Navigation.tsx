import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Megaphone, Mail, User, Menu, Home, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartSheet } from "./CartSheet";

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Always enforce Arabic RTL
  useEffect(() => {
    document.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `w-full justify-start md:w-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-teal-500/15 text-teal-400 border border-teal-500/30"
        : "text-gray-300 hover:text-teal-400 hover:bg-slate-800"
    }`;

  const NavLinks = () => (
    <>
      <Link to="/" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/")}>
          <Home className="h-4 w-4 shrink-0" />
          الرئيسية
        </button>
      </Link>
      <Link to="/courses" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/courses")}>
          <BookOpen className="h-4 w-4 shrink-0" />
          {t("nav.courses")}
        </button>
      </Link>
      <Link to="/browse" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/browse")}>
          <BookOpen className="h-4 w-4 shrink-0" />
          تصفح
        </button>
      </Link>
      <Link to="/announcements" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/announcements")}>
          <Megaphone className="h-4 w-4 shrink-0" />
          {t("nav.announcements")}
        </button>
      </Link>
      <Link to="/about" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/about")}>
          {t("nav.about")}
        </button>
      </Link>
      <Link to="/contact" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/contact")}>
          <Mail className="h-4 w-4 shrink-0" />
          {t("nav.contact")}
        </button>
      </Link>
      <Link to="/install" onClick={() => setIsOpen(false)}>
        <button className={navLinkClass("/install")}>
          <Smartphone className="h-4 w-4 shrink-0 text-teal-400" />
          التطبيق
        </button>
      </Link>
    </>
  );

  return (
    <nav className="border-b border-teal-900/50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — links to home */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              السناء
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <CartSheet />
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-teal-400 hover:bg-slate-800">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
                >
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-900 border-r border-teal-900/50 w-[280px]">
                  <div className="flex flex-col gap-2 mt-8">
                    <NavLinks />
                    <div className="h-px bg-slate-800 my-2" />
                    {user ? (
                      <>
                        <Link to="/profile" onClick={() => setIsOpen(false)}>
                          <button className={navLinkClass("/profile")}>
                            <User className="h-4 w-4 shrink-0" />
                            {t("nav.profile")}
                          </button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav.logout")}
                        </Button>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold"
                        >
                          {t("nav.login")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
