import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isTeacher } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, TrendingUp, BookOpen, Eye, FileText, ExternalLink, User, Award, Camera, Upload, ShoppingCart, Users } from "lucide-react";
import { toast } from "sonner";
import { usePdfLectures } from "@/hooks/usePdfLectures";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeacherStats {
  total_earnings: number;
  available_balance: number;
  total_courses: number;
  total_enrollments: number;
}

interface TeacherProfileData {
  id: string;
  bio: string | null;
  bio_ar: string | null;
  specializations: string[] | null;
  is_verified: boolean;
  commission_rate: number;
  profiles: {
    full_name: string | null;
    full_name_ar: string | null;
    avatar_url: string | null;
  };
}

interface Course {
  id: string;
  title: string;
  title_ar?: string | null;
  title_en?: string | null;
  enrollment_count: number;
  view_count: number;
  price: number;
  status: string;
}

const formatNumber = (num: number) => new Intl.NumberFormat('ar-EG').format(num);

const TeacherDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    total_earnings: 0,
    available_balance: 0,
    total_courses: 0,
    total_enrollments: 0
  });
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<{ byCourse: any[]; purchases: any[] }>({ byCourse: [], purchases: [] });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  
  const { data: pdfs, isLoading: loadingPdfs } = usePdfLectures({ teacherId: user?.id });

  useEffect(() => {
    checkTeacherAccess();
  }, [user, authLoading]);

  const checkTeacherAccess = async () => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/login");
      return;
    }

    const teacherStatus = await isTeacher();
    if (!teacherStatus) {
      toast.error("تم رفض الوصول. مطلوب حساب معلم.");
      navigate("/courses");
      return;
    }

    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: teacherData, error: teacherError } = await (supabase
      .from('teachers') as any)
      .select(`
        wallet_balance, 
        bio, 
        bio_ar, 
        specializations, 
        is_verified, 
        commission_rate,
        profiles(full_name, full_name_ar, avatar_url)
      `)
      .eq('id', user.id)
      .single();

    if (teacherError && teacherError.code !== 'PGRST116') {
        console.error("Dashboard: Error fetching teacher data", teacherError);
    }

    if (teacherData) {
      setTeacherProfile(teacherData as TeacherProfileData);
    }

    const { data: coursesData, error: coursesError } = await (supabase
      .from('courses') as any)
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error("Dashboard: Error fetching courses", coursesError);
    }

    const { data: earningsData, error: earningsError } = await (supabase
      .from('teacher_earnings') as any)
      .select('amount, status, created_at, course:courses(title), pdf:pdf_lectures(title, title_ar)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (earningsError) {
      console.error("Dashboard: Error fetching earnings", earningsError);
    }

    const totalEarnings = earningsData?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    const totalEnrollments = coursesData?.reduce((sum: number, c: any) => sum + c.enrollment_count, 0) || 0;

    setStats({
      total_earnings: totalEarnings,
      available_balance: teacherData?.wallet_balance || 0,
      total_courses: coursesData?.length || 0,
      total_enrollments: totalEnrollments
    });

    setCourses(coursesData || []);
    setEarnings(earningsData || []);

    // Fetch purchases for this teacher's courses
    const tCommissionRate = teacherData?.commission_rate || 70;
    const courseIds = (coursesData || []).map((c: any) => c.id);
    let allPurchases: any[] = [];
    const byItemMap: Record<string, { title: string; count: number; revenue: number; type: string }> = {};

    if (courseIds.length > 0) {
      const { data: purchasesData } = await (supabase
        .from('course_purchases') as any)
        .select(`
          id,
          course_id,
          user_id,
          price_paid,
          purchased_at,
          course:courses(title),
          user:profiles(full_name, full_name_ar)
        `)
        .in('course_id', courseIds);
      
      for (const p of purchasesData || []) {
        const earning = (p.price_paid || 0) * (tCommissionRate / 100);
        allPurchases.push({ ...p, earning, type: 'course', item_title: p.course?.title || p.course_id });
        const cid = p.course_id;
        if (!byItemMap[cid]) {
          byItemMap[cid] = { title: p.course?.title || cid, count: 0, revenue: 0, type: 'course' };
        }
        byItemMap[cid].count += 1;
        byItemMap[cid].revenue += earning;
      }
    }

    // Fetch PDF Purchases
    const { data: myPdfs } = await supabase.from('pdf_lectures').select('id, title, title_ar').eq('teacher_id', user.id);
    if (myPdfs && myPdfs.length > 0) {
      const pdfIds = myPdfs.map((p: any) => p.id);
      const { data: pdfPurchasesData } = await (supabase
        .from('pdf_purchases') as any)
        .select(`
          id,
          pdf_id,
          user_id,
          price_paid,
          purchased_at,
          pdf:pdf_lectures(title, title_ar),
          user:profiles(full_name, full_name_ar)
        `)
        .in('pdf_id', pdfIds);

      for (const p of pdfPurchasesData || []) {
        const earning = (p.price_paid || 0) * (tCommissionRate / 100);
        allPurchases.push({ ...p, earning, type: 'pdf', item_title: p.pdf?.title_ar || p.pdf?.title || p.pdf_id });
        const pid = p.pdf_id;
        if (!byItemMap[pid]) {
          byItemMap[pid] = { title: p.pdf?.title_ar || p.pdf?.title || pid, count: 0, revenue: 0, type: 'pdf' };
        }
        byItemMap[pid].count += 1;
        byItemMap[pid].revenue += earning;
      }
    }

    // Sort combined purchases by date descending
    allPurchases.sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());

    setSalesData({
      byCourse: Object.values(byItemMap).sort((a, b) => b.revenue - a.revenue),
      purchases: allPurchases,
    });

    setNewEmail(user.email || "");
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("يجب أن تكون الصورة أقل من 5 ميغابايت");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setTeacherProfile(prev => prev ? {
        ...prev,
        profiles: {
          ...prev.profiles,
          avatar_url: publicUrl
        }
      } : null);

      toast.success("تم التحديث بنجاح!");
    } catch (error: any) {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail && !newPassword) {
      toast.error("يرجى توفير بريد إلكتروني أو كلمة مرور جديدة");
      return;
    }

    setIsUpdatingCredentials(true);
    try {
      const updates: any = {};
      if (newEmail && newEmail !== user?.email) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      toast.success("تم تحديث بيانات الاعتماد بنجاح!");
      if (newPassword) setNewPassword("");
    } catch (error: any) {
      toast.error("فشل تحديث البيانات");
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-300" style={{ fontFamily: "'Cairo', sans-serif" }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
           <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
             لوحة تحكم المعلم
           </h1>
           <p className="text-slate-400 text-lg">إدارة دوراتك ومتابعة أرباحك وإحصائياتك</p>
        </div>

        {/* Profile Card */}
        {teacherProfile && (
          <Card className="mb-10 overflow-hidden border-teal-900/40 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 md:p-8 relative z-10 text-center sm:text-right text-right">
              <Avatar className="h-28 w-28 shrink-0 border-4 border-slate-900 ring-2 ring-teal-500/50 rounded-full shadow-xl shadow-teal-500/20">
                <AvatarImage src={teacherProfile.profiles?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-teal-900 to-slate-800 text-teal-400">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full flex flex-col items-center sm:items-start">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {teacherProfile.profiles?.full_name_ar || teacherProfile.profiles?.full_name || "مُعلم المنصة"}
                  </h2>
                  <div className="flex gap-2">
                    {teacherProfile.is_verified && (
                      <Badge variant="default" className="bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 gap-1.5 px-3">
                        <Award className="w-3.5 h-3.5" /> موثق
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-teal-500/50 text-teal-400 bg-teal-900/30 font-bold px-3">
                      نسبة الأرباح: {teacherProfile.commission_rate ?? 70}%
                    </Badge>
                  </div>
                </div>
                
                {(teacherProfile.bio_ar || teacherProfile.bio) && (
                  <p className="text-slate-300 text-sm md:text-base max-w-2xl mb-5 leading-relaxed">
                    {teacherProfile.bio_ar || teacherProfile.bio}
                  </p>
                )}

                {teacherProfile.specializations && teacherProfile.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {teacherProfile.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-900/20 px-3 py-1 text-sm shadow-sm backdrop-blur-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-900/80 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>إجمالي الأرباح</CardTitle>
              <div className="p-2 bg-teal-500/20 rounded-lg"><DollarSign className="h-4 w-4 text-teal-400" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white flex items-baseline gap-1 mt-2">
                <span className="text-xl text-teal-500">$</span>
                {stats.total_earnings.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">كل الأوقات</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-900/80 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>رصيد المحفظة</CardTitle>
              <div className="p-2 bg-cyan-500/20 rounded-lg"><TrendingUp className="h-4 w-4 text-cyan-400" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white flex items-baseline gap-1 mt-2">
                 <span className="text-xl text-cyan-500">$</span>
                 {stats.available_balance.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">متاح للسحب</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-900/80 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>إجمالي الدورات</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg"><BookOpen className="h-4 w-4 text-blue-400" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
                 {formatNumber(stats.total_courses)} <span className="text-sm font-normal text-slate-400">دورة</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">دورات منشورة</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-900/80 transition-colors shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>الطلاب المسجلين</CardTitle>
              <div className="p-2 bg-indigo-500/20 rounded-lg"><Eye className="h-4 w-4 text-indigo-400" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
                  {formatNumber(stats.total_enrollments)} <span className="text-sm font-normal text-slate-400">طالب</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">إجمالي التسجيلات</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation & Content */}
        <Tabs defaultValue="courses" dir="rtl" className="w-full">
          <TabsList className="bg-slate-900/60 border border-teal-900/30 w-full justify-start p-1.5 rounded-xl mb-8 flex-wrap h-auto gap-2">
             <TabsTrigger value="courses" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-6 grow sm:grow-0 transition-all font-semibold">دوراتي</TabsTrigger>
             <TabsTrigger value="sales" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-6 grow sm:grow-0 transition-all font-semibold">المبيعات</TabsTrigger>
             <TabsTrigger value="pdfs" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-6 grow sm:grow-0 transition-all font-semibold">المذكرات (PDF)</TabsTrigger>
             <TabsTrigger value="earnings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-6 grow sm:grow-0 transition-all font-semibold">الأرباح</TabsTrigger>
             <TabsTrigger value="settings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-6 grow sm:grow-0 transition-all font-semibold">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-0 outline-none animate-slide-up">
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-6 border-b border-slate-800/50">
                <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>الدورات المعينة</CardTitle>
                <CardDescription className="text-slate-400 text-base">استعرض الدورات التي كلفت بها من قبل الإدارة</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {courses.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex mx-auto items-center justify-center mb-5 border border-slate-700">
                        <BookOpen className="h-10 w-10 text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-semibold mb-2 text-lg">لا توجد دورات مسندة إليك</p>
                    <p className="text-slate-500">تواصل مع الإدارة لتعيين دورات جديدة لحسابك</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {courses.map((course) => (
                      <div 
                        key={course.id}
                        className="flex flex-col sm:flex-row items-center justify-between p-5 border border-teal-900/30 rounded-xl hover:bg-slate-800/80 transition-all shadow-sm bg-slate-900/40 gap-4"
                      >
                        <div className="flex-1 w-full text-center sm:text-right">
                          <h3 className="font-bold text-xl text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                              {course.title_ar || course.title}
                          </h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4"/> {formatNumber(course.view_count)} مشاهدة</span>
                            <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {formatNumber(course.enrollment_count)} طالب</span>
                            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-teal-500"/> <span className="text-teal-400 font-semibold">${course.price}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge 
                            variant="outline"
                            className={`px-4 py-1.5 rounded-full font-bold border ${course.status === 'published' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                           >
                              {course.status === 'published' ? 'منشورة' : 'مسودة'}
                           </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════ SALES TAB ══════════════ */}
          <TabsContent value="sales" className="mt-0 outline-none animate-slide-up space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-teal-500/20 rounded-xl shrink-0"><ShoppingCart className="h-5 w-5 text-teal-400" /></div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">إجمالي المبيعات</p>
                    <p className="text-2xl font-extrabold text-white">{formatNumber(salesData.purchases.length)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-xl shrink-0"><DollarSign className="h-5 w-5 text-cyan-400" /></div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">إجمالي الإيرادات</p>
                    <p className="text-2xl font-extrabold text-teal-400">${salesData.purchases.reduce((s, p) => s + (p.earning || 0), 0).toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0"><Users className="h-5 w-5 text-indigo-400" /></div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">العناصر المباعة</p>
                    <p className="text-2xl font-extrabold text-white">{formatNumber(salesData.byCourse.length)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue per course */}
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>الإيرادات لكل عنصر</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {salesData.byCourse.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">لا توجد مبيعات بعد</div>
                ) : (
                  <div className="space-y-3">
                    {salesData.byCourse.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-900/40 border border-teal-900/20 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-400 font-bold text-sm">{i + 1}</div>
                          <p className="text-white font-semibold truncate" style={{ fontFamily: "'Cairo', sans-serif" }}>{item.title}</p>
                        </div>
                        <div className="flex items-center gap-6 shrink-0 mr-4">
                          <div className="text-center">
                            <p className="text-slate-400 text-xs">مشترٍ</p>
                            <p className="text-white font-bold">{formatNumber(item.count)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400 text-xs">الإيرادات</p>
                            <p className="text-teal-400 font-extrabold text-lg">${item.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase history */}
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>سجل المشتريات</CardTitle>
                <CardDescription className="text-slate-400">جميع عمليات الشراء التي تمت على دوراتك ومذكراتك</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {salesData.purchases.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                    <ShoppingCart className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">لا توجد مشتريات بعد</p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-teal-900/30">
                    <table className="w-full text-right text-sm text-slate-300">
                      <thead className="bg-slate-800/80 text-xs uppercase font-bold text-slate-400 border-b border-teal-900/30">
                        <tr>
                          <th className="px-5 py-4">الطالب</th>
                          <th className="px-5 py-4">العنصر</th>
                          <th className="px-5 py-4">التاريخ</th>
                          <th className="px-5 py-4">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-900/20 bg-slate-900/30">
                        {salesData.purchases.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-white font-medium">{(p.user as any)?.full_name_ar || (p.user as any)?.full_name || 'طالب'}</span>
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-700 to-slate-700 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-teal-300" />
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-300 max-w-[180px] truncate">{p.item_title}</td>
                            <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString('ar-EG') : '—'}</td>
                            <td className="px-5 py-4 font-bold text-teal-400 text-base">${(p.earning || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdfs" className="mt-0 outline-none animate-slide-up">
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-6 border-b border-slate-800/50">
                <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>المذكرات والملفات</CardTitle>
                <CardDescription className="text-slate-400 text-base">استعرض المذكرات ومقاطع الـ PDF الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingPdfs ? (
                  <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-teal-500" /></div>
                ) : !pdfs || pdfs.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex mx-auto items-center justify-center mb-5 border border-slate-700">
                      <FileText className="h-10 w-10 text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-semibold mb-2 text-lg">لا توجد مذكرات حاليا</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pdfs.map((pdf) => (
                      <div 
                        key={pdf.id}
                        className="flex flex-col sm:flex-row items-center justify-between p-5 border border-teal-900/30 rounded-xl hover:bg-slate-800/80 transition-all shadow-sm bg-slate-900/40 gap-4"
                      >
                        <div className="flex-1 w-full text-center sm:text-right">
                          <h3 className="font-bold text-xl text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{pdf.title_ar || pdf.title}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-slate-400">
                             <span className={`font-semibold ${pdf.is_free ? 'text-teal-400' : 'text-amber-400'}`}>
                                {pdf.is_free ? "مجاني" : `$${pdf.price}`}
                             </span>
                            <span>{formatNumber(pdf.view_count)} مشاهدة</span>
                            <span>{formatNumber(pdf.download_count)} تحميل</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={`px-3 py-1 rounded-lg border ${pdf.status === 'published' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                          >
                            {pdf.status === 'published' ? 'منشور' : 'مسودة'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => window.open(pdf.pdf_url, "_blank")}
                            className="bg-slate-800 hover:bg-teal-600 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="mt-0 outline-none animate-slide-up">
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-6 border-b border-slate-800/50">
                <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>سجل الأرباح</CardTitle>
                <CardDescription className="text-slate-400 text-base">تابع عمولاتك والمدفوعات السابقة</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {earnings.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex mx-auto items-center justify-center mb-5 border border-slate-700">
                          <DollarSign className="h-10 w-10 text-slate-500" />
                      </div>
                    <p className="text-slate-300 font-semibold mb-2 text-lg">لم يتم تسجيل أي أرباح بعد</p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-teal-900/30">
                     <table className="w-full text-right text-sm text-slate-300">
                        <thead className="bg-slate-800/80 text-xs uppercase font-bold text-slate-400 border-b border-teal-900/30">
                          <tr>
                            <th className="px-6 py-4">التاريخ</th>
                            <th className="px-6 py-4">الدورة</th>
                            <th className="px-6 py-4">القيمة</th>
                            <th className="px-6 py-4">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-teal-900/20 bg-slate-900/30">
                          {earnings.map((earning, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium whitespace-nowrap">
                                {earning.created_at ? new Date(earning.created_at).toLocaleDateString('ar-EG') : '—'}
                              </td>
                              <td className="px-6 py-4 max-w-[200px]">
                                <span className="text-white font-medium truncate block" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                  {(earning.course as any)?.title_ar || (earning.course as any)?.title || '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-teal-400 text-lg">
                                ${earning.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant="outline"
                                  className={`px-3 py-1 font-semibold ${
                                    earning.status === 'available' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                    : earning.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {earning.status === 'available' ? 'متاح' 
                                    : earning.status === 'paid' ? 'مدفوع'
                                    : earning.status === 'pending' ? 'معلق'
                                    : earning.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none animate-slide-up">
            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-xl">
              <CardHeader className="pb-6 border-b border-slate-800/50">
                <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>إعدادات الحساب</CardTitle>
                <CardDescription className="text-slate-400 text-base">تحديث ملفك الشخصي وبيانات الدخول</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-10">
                {/* Avatar Settings */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />
                   <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>الصورة الشخصية</h3>
                   <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                     <Avatar className="h-28 w-28 border-4 border-slate-800 shadow-xl shadow-slate-900/50 ring-2 ring-teal-500/30 rounded-full shrink-0">
                        <AvatarImage src={teacherProfile?.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-slate-800 text-teal-400">
                           <User className="h-12 w-12" />
                        </AvatarFallback>
                     </Avatar>
                     <div className="text-center sm:text-right flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          id="avatar-upload"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className={`cursor-pointer inline-flex items-center justify-center rounded-xl font-bold transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-6 py-3 min-w-[200px] mb-3 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                        >
                           <Camera className="w-5 h-5 ml-2 rtl:mx-0 rtl:ml-2" />
                           تغيير الصورة الشخصية
                        </Label>
                        {uploadingAvatar && (
                           <div className="inline-flex items-center justify-center px-6 py-3 text-teal-500 font-bold border border-teal-500/30 rounded-xl bg-teal-500/10 min-w-[200px] mb-3">
                              <Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري الرفع...
                           </div>
                        )}
                        <p className="text-sm text-slate-500 leading-relaxed">أفضل نتيجة باستخدام صورة مربعة مع تركيز على الوجه الواضح، الحد الأقصى للحجم 5 ميغابايت.</p>
                     </div>
                   </div>
                </div>

                {/* Credentials */}
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                   <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>بيانات الدخول</h3>
                   <form onSubmit={handleUpdateCredentials} className="space-y-5 max-w-lg">
                      <div className="space-y-2">
                         <Label htmlFor="email" className="text-slate-300 font-semibold">البريد الإلكتروني</Label>
                         <Input
                           id="email"
                           type="email"
                           value={newEmail}
                           onChange={(e) => setNewEmail(e.target.value)}
                           dir="ltr"
                           className="bg-slate-950/80 border-slate-700/60 text-white focus:border-teal-500 text-left h-12"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label htmlFor="password" className="text-slate-300 font-semibold">كلمة المرور الجديدة</Label>
                         <Input
                           id="password"
                           type="password"
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           placeholder="اترك الحقل فارغاً للاحتفاظ بكلمة المرور الحالية"
                           dir="ltr"
                           className="bg-slate-950/80 border-slate-700/60 text-white focus:border-teal-500 text-left h-12 placeholder:text-slate-600"
                           minLength={6}
                         />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isUpdatingCredentials}
                        className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 transition-all rounded-xl h-12 px-8 mt-2"
                      >
                         {isUpdatingCredentials ? (
                           <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري الحفظ...</>
                         ) : "حفظ التغييرات"}
                      </Button>
                   </form>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
