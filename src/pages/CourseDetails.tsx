import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, PlayCircle, Wallet, User, ArrowRight, Star, ShieldCheck, Clock, BookOpen, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

interface Course {
  id: string;
  title: string;
  title_ar?: string | null;
  title_en?: string | null;
  description: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  video_url: string | null;
  image_url: string | null;
  teacher_id?: string;
  teacher?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, isInCart, removeFromCart } = useCart();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    const fetchCourseAndPurchaseStatus = async () => {
      if (!id) return;

      setLoading(true);
      
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(`
          *,
          teacher:teachers(
            profiles(full_name, avatar_url)
          )
        `)
        .eq("id", id)
        .single();
      
      if (courseError) {
        toast.error("فشل في تحميل تفاصيل الدورة");
        setLoading(false);
        return;
      }

      const flatCourse = {
        ...(courseData as any),
        teacher: (courseData as any)?.teacher?.profiles || null
      };

      setCourse(flatCourse as Course);

      if (user) {
        const { data: purchaseData } = await supabase
          .from("course_purchases")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .maybeSingle();

        setHasPurchased(!!purchaseData);

        const { data: profileData } = await supabase
            .from("profiles")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();
        
        if (profileData) {
            setWalletBalance((profileData as any).wallet_balance || 0);
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchCourseAndPurchaseStatus();
    }
  }, [id, user, authLoading]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول لشراء الدورات");
      navigate("/login");
      return;
    }
    
    if (!course) return;

    if (course.price > walletBalance) {
        toast.error(`رصيد المحفظة غير كافٍ. تحتاج إلى $${(course.price - walletBalance).toFixed(2)} إضافية.`);
        return;
    }

    setPurchasing(true);

    try {
        // 1. Deduct from student wallet
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ wallet_balance: walletBalance - course.price } as any)
            .eq("id", user.id);

        if (updateError) {
            throw new Error("فشل في خصم الرصيد");
        }

        // 2. Record purchase
        const { error: insertError } = await supabase
            .from("course_purchases")
            .insert({
                user_id: user.id,
                course_id: course.id,
                price_paid: course.price,
            } as any);

        if (insertError) {
            await supabase
                .from("profiles")
                .update({ wallet_balance: walletBalance } as any)
                .eq("id", user.id);
            throw new Error("فشل في تسجيل عملية الشراء");
        }

        // 3. Record transaction
        const { data: txData, error: transactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                course_id: course.id,
                amount: course.price,
                payment_method: 'wallet',
                status: 'completed',
            })
            .select('id')
            .single();

        if (transactionError) {
            console.error("Transaction record error:", transactionError);
        }

        // 4. Credit teacher earnings & wallet via secure RPC
        if (course.teacher_id && course.price > 0) {
          try {
            await (supabase.rpc as any)('credit_teacher_earning', {
              p_course_id: course.id,
              p_pdf_id: null,
              p_transaction_id: txData?.id || null,
              p_price_paid: course.price,
            });
          } catch (err) {
            console.error('Teacher earnings error:', err);
          }
        }

        toast.success("تم شراء الدورة بنجاح!");
        setHasPurchased(true);
        setWalletBalance(prev => prev - course.price);

    } catch (error) {
        console.error("Purchase error:", error);
        toast.error("فشل في شراء الدورة. يرجى المحاولة مرة أخرى.");
    } finally {
        setPurchasing(false);
    }
  };

  const startLearning = () => {
    navigate(`/courses/${id}/learn`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
         <p className="text-slate-400 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>جاري تحميل الدورة...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 container flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-20 w-20 text-slate-800 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>الدورة غير موجودة</h2>
          <p className="text-slate-400 mb-8">عذراً، لم نتمكن من العثور على الدورة التي تبحث عنها.</p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
             <Link to="/courses">
               العودة إلى الدورات
               <ArrowRight className="mr-2 h-4 w-4" />
             </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title_ar || course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-teal-900/40 to-cyan-900/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <main className="flex-1 container mx-auto px-4 -mt-32 md:-mt-40 relative z-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
           
           {/* LEFT CONTENT (Course Info) */}
           <div className="lg:col-span-2 space-y-6">
              <div className="animate-slide-up">
                 <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1">
                      دورة مسجلة
                    </Badge>
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1">
                      الوصول مدى الحياة
                    </Badge>
                 </div>
                 <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {course.title_ar || course.title}
                 </h1>
                 <p className="text-lg text-slate-300 leading-relaxed mb-8">
                    {course.description_ar || course.description}
                 </p>
                 
                 <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl w-fit backdrop-blur">
                    <Avatar className="h-14 w-14 border-2 border-teal-500/50">
                      <AvatarImage src={course.teacher?.avatar_url || ""} />
                      <AvatarFallback className="bg-slate-800">
                        <User className="h-6 w-6 text-slate-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-0.5">مقدم الدورة</p>
                      <p className="text-base font-bold text-white">{course.teacher?.full_name || "مدرس متخصص"}</p>
                    </div>
                 </div>
              </div>

              {/* What you will learn mockup section */}
              <div className="bg-slate-900/40 border border-teal-900/30 rounded-3xl p-6 md:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>ماذا ستتعلم في هذه الدورة؟</h3>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      "فهم المبادئ الأساسية بشكل عميق",
                      "تطبيق المفاهيم عملياً من خلال مشاريع حقيقية",
                      "اكتساب مهارات متقدمة مطلوبة في سوق العمل",
                      "الحصول على شهادة إتمام موثقة"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 items-center justify-center">
                           <ShieldCheck className="h-4 w-4 text-teal-400" />
                        </div>
                        <span className="text-slate-300 leading-relaxed">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT CONTENT (Pricing Card) */}
           <div className="lg:col-span-1">
              <Card className="border-teal-900/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl sticky top-24 overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <CardHeader className="pb-0 relative z-10 text-center">
                   <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-slate-800">
                      <span className="text-slate-400 text-sm font-medium mb-2">سعر الدورة</span>
                      <span className="text-4xl font-extrabold text-teal-400">
                          {course.price > 0 ? `$${course.price.toFixed(2)}` : "مجاناً"}
                      </span>
                   </div>
                </CardHeader>
                <CardContent className="pt-6 pb-6 relative z-10 space-y-4">
                   {user && !hasPurchased && (
                       <div className="flex items-center justify-between text-sm bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                           <div className="flex items-center text-slate-300">
                             <Wallet className="w-5 h-5 ml-2 text-indigo-400" />
                             رصيد المحفظة
                           </div>
                           <span className="font-bold text-white">${walletBalance.toFixed(2)}</span>
                       </div>
                   )}
                   
                   <ul className="space-y-3 mt-6">
                      <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Clock className="w-5 h-5 text-teal-500/70" />
                        <span>الوصول الفوري للمحتوى</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <PlayCircle className="w-5 h-5 text-teal-500/70" />
                        <span>محاضرات فيديو عالية الجودة</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Star className="w-5 h-5 text-teal-500/70" />
                        <span>تقييم ممتاز من الطلاب</span>
                      </li>
                   </ul>
                </CardContent>
                <CardFooter className="flex-col gap-3 pb-8 relative z-10">
                   {hasPurchased ? (
                     <Button size="lg" onClick={startLearning} className="w-full bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/25">
                       <PlayCircle className="ml-2 h-5 w-5" />
                       ابدأ التعلم الآن
                     </Button>
                   ) : (
                     <>
                       {isInCart(course.id) ? (
                         <Button 
                            size="lg" 
                            variant="outline"
                            className="w-full border-teal-500 text-teal-400 hover:bg-teal-950/30 font-bold"
                            onClick={() => removeFromCart(course.id)}
                         >
                            <ShoppingCart className="ml-2 h-5 w-5" />
                            إزالة من السلة
                         </Button>
                       ) : (
                         <Button 
                            size="lg" 
                            onClick={() => addToCart({
                              id: course.id,
                              title: course.title_ar || course.title,
                              price: course.price,
                              image_url: course.image_url,
                              teacher_name: course.teacher?.full_name
                            })} 
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700"
                         >
                           <ShoppingCart className="ml-2 h-5 w-5" />
                           أضف إلى السلة
                         </Button>
                       )}

                       <Button 
                          size="lg" 
                          onClick={handlePurchase} 
                          disabled={purchasing || (course.price > walletBalance)} 
                          className={`w-full font-bold shadow-lg ${course.price > walletBalance ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700" : "bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 shadow-teal-500/25"}`}
                       >
                         {purchasing ? (
                           <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                         ) : null}
                         {!purchasing && course.price > 0 ? "شراء الآن" : !purchasing ? "التسجيل مجاناً" : "جاري المعالجة..."}
                       </Button>
                     </>
                   )}
                   
                   {!hasPurchased && course.price > walletBalance && (
                     <p className="text-xs text-red-400 text-center w-full bg-red-500/10 p-2 rounded-lg mt-2">
                       الرصيد غير كافٍ. يرجى شحن محفظتك للمتابعة.
                     </p>
                   )}
                </CardFooter>
              </Card>
           </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;
