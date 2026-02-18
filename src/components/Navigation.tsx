import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Megaphone, Mail, User, Menu, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Handle direction change
  useEffect(() => {
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const NavItems = () => (
    <>
      <Link to="/courses">
        <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto text-gray-300 hover:text-teal-400 hover:bg-slate-800">
          <BookOpen className="mr-2 h-4 w-4" />
          {t('nav.courses')}
        </Button>
      </Link>
      <Link to="/announcements">
        <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto text-gray-300 hover:text-teal-400 hover:bg-slate-800">
          <Megaphone className="mr-2 h-4 w-4" />
          {t('nav.announcements')}
        </Button>
      </Link>
      <Link to="/about">
        <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto text-gray-300 hover:text-teal-400 hover:bg-slate-800">
          {t('nav.about')}
        </Button>
      </Link>
      <Link to="/contact">
        <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto text-gray-300 hover:text-teal-400 hover:bg-slate-800">
          <Mail className="mr-2 h-4 w-4" />
          {t('nav.contact')}
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="border-b border-teal-900/50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/courses" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItems />
          </div>

          {/* Actions (Lang, Profile, Mobile Menu) */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-gray-300 hover:text-teal-400 hover:bg-slate-800"
              title={i18n.language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="h-5 w-5" />
            </Button>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/profile">
                   <Button variant="ghost" size="icon" className="text-gray-300 hover:text-teal-400 hover:bg-slate-800">
                     <User className="h-5 w-5" />
                   </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  {t('nav.login')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-900 border-l border-teal-900/50 w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavItems />
                    {user ? (
                      <>
                        <div className="h-px bg-slate-800 my-2" />
                        <Link to="/profile">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300 hover:text-teal-400 hover:bg-slate-800">
                                <User className="mr-2 h-4 w-4" />
                                {t('nav.profile')}
                            </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogout}
                          className="w-full justify-start border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('nav.logout')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="h-px bg-slate-800 my-2" />
                        <Link to="/login">
                            <Button 
                            size="sm"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                            >
                            {t('nav.login')}
                            </Button>
                        </Link>
                      </>
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
