import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ArrowRight, GraduationCap, PlayCircle } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
  video_url: string | null;
  image_url: string | null;
  teacher_id: string | null;
}

import { useTranslation } from "react-i18next";

const CourseViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, price, video_url, image_url, teacher_id")
          .eq("id", id)
          .single();

        if (courseError || !courseData) {
          toast.error("فشل في تحميل محتوى الدورة");
          setLoading(false);
          return;
        }

        const courseWithTeacher = courseData as any;
        setCourse(courseWithTeacher);

        if (userRole === 'admin' || user.id === courseWithTeacher.teacher_id) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Free courses are open to all logged-in users
        if (courseWithTeacher.price === 0) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        const { data: purchase, error: purchaseError } = await supabase
          .from("course_purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .eq("is_active", true)
          .maybeSingle();

        if (purchaseError) {
          console.error("Error checking purchase:", purchaseError);
        }

        if (purchase) {
          setHasAccess(true);
        } else {
          toast.error("تحتاج إلى شراء هذه الدورة لتتمكن من مشاهدتها.");
          navigate(`/courses/${id}`);
        }

      } catch (error) {
        console.error("Unexpected error in CourseViewer:", error);
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        checkAccessAndFetch();
      }
    }
  }, [id, user, authLoading, navigate, userRole]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-slate-400 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>جاري تحميل الدورة...</p>
      </div>
    );
  }

  if (!course || !hasAccess) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* ═══════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900/50 border-b border-teal-900/30">
        <div className="container py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col items-start gap-2">
               <Button variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 px-0 h-auto gap-2" onClick={() => navigate(`/courses/${id}`)}>
                 <ArrowRight className="h-4 w-4" /> {/* RTL back is right arrow */}
                 {t('course_viewer.back')}
               </Button>
               <h1 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-snug" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {course.title}
               </h1>
            </div>
            
            <Button onClick={() => navigate(`/courses/${id}/quiz`)} className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold gap-2 whitespace-nowrap shadow-lg shadow-teal-500/20">
              <GraduationCap className="h-5 w-5" />
              {t('course_viewer.take_quiz')}
            </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          VIDEO PLAYER
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 container py-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/10 border border-slate-800 relative w-full flex items-center justify-center group animate-fade-in">
            {course.video_url ? (
              <video 
                src={course.video_url} 
                controls 
                className="w-full h-full object-contain bg-black"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                poster={course.image_url || "https://images.unsplash.com/photo-1550439062-609e1531270e?w=1600&h=900&fit=crop&q=80"}
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-900/50">
                  <PlayCircle className="h-20 w-20 text-teal-900/50 mb-6 opacity-50" />
                  <p className="text-xl font-medium text-slate-300 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>الفيديو غير متوفر</p>
                  <p className="text-slate-500">لم يتم إضافة فيديو لهذه الدورة بعد. يرجى مراجعة المعلم.</p>
               </div>
            )}
          </div>
          
          {/* Below video context */}
          <div className="mt-8 bg-slate-900/40 border border-teal-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>ملاحظات هامة:</h3>
              <ul className="list-disc list-inside text-slate-400 space-y-2">
                 <li>يرجى إكمال جميع المحاضرات قبل اختبار تحديد المستوى (الكويز).</li>
                 <li>يمكنك إعادة مشاهدة الدورة في أي وقت حيث أنها متاحة مدى الحياة بحسابك.</li>
                 <li>لتجربة أفضل، ينصح بالاتصال بشبكة Wi-Fi.</li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
