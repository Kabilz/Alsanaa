import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EnhancedAdminDashboard } from "@/components/admin/EnhancedAdminDashboard";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (userRole !== 'admin') {
        toast.error("تم رفض الوصول: يتطلب صلاحيات مسؤول");
        navigate("/");
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-300 font-semibold" style={{ fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950/20">
        <div className="text-center p-12 bg-slate-900/60 backdrop-blur-xl border border-rose-900/30 rounded-3xl shadow-2xl animate-slide-up">
          <ShieldAlert className="w-20 h-20 text-rose-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
          <h1 className="text-3xl font-bold mb-3 text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>تم رفض الوصول</h1>
          <p className="text-slate-400 text-lg">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  return <EnhancedAdminDashboard />;
};

export default Admin;
