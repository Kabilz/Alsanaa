import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useEducationalLevels, useEducationalYears, useSubjects, useColleges, useDepartments } from "@/hooks/useHierarchy";
import { usePdfLectures } from "@/hooks/usePdfLectures";
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlayCircle, ChevronLeft, ChevronRight, GraduationCap, School, Book, BookOpen, Search, ShoppingCart, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

export default function Browse() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchasingPdfId, setPurchasingPdfId] = useState<string | null>(null);
  const [purchasedPdfIds, setPurchasedPdfIds] = useState<Set<string>>(new Set());

  // Load existing active PDF purchases on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("pdf_purchases")
      .select("pdf_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          setPurchasedPdfIds(new Set(data.map((r: any) => r.pdf_id)));
        }
      });
  }, [user]);
  
  const { data: levels, isLoading: loadingLevels } = useEducationalLevels();
  
  // Selection State
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedLevel = levels?.find(l => l.id === selectedLevelId);

  // Queries based on selection
  const { data: years } = useEducationalYears(selectedLevelId || undefined);
  const { data: colleges } = useColleges();
  const { data: departments } = useDepartments(selectedCollegeId || undefined);
  const { data: subjects } = useSubjects(selectedYearId || undefined);
  
  // Content Queries
  const { data: pdfs, isLoading: loadingPdfs } = usePdfLectures({
    yearId: selectedYearId || undefined,
    subjectId: selectedSubjectId || undefined,
    departmentId: selectedDepartmentId || undefined,
  });

  const { data: courses, isLoading: loadingCourses } = useCourses();

  const handleBuyPdf = async (pdfId: string, price: number) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لشراء المذكرات");
      navigate("/login");
      return;
    }

    setPurchasingPdfId(pdfId);
    try {
      // Get current wallet balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) throw new Error("تعذر جلب بيانات المحفظة");
      
      const balance = (profile as any).wallet_balance || 0;
      if (balance < price) {
        toast.error(`رصيد المحفظة غير كاف. تحتاج إلى ${formatCurrency(price - balance)} إضافية.`);
        return;
      }

      // Deduct from wallet
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: balance - price } as any)
        .eq("id", user.id);

      if (updateError) throw new Error("فشل خصم الرصيد");

      // Record PDF purchase
      const { error: insertPurchasesError } = await supabase
        .from("pdf_purchases")
        .insert({
          user_id: user.id,
          pdf_id: pdfId,
          price_paid: price,
        } as any);

      if (insertPurchasesError) {
        // Rollback wallet
        await supabase
          .from("profiles")
          .update({ wallet_balance: balance } as any)
          .eq("id", user.id);
        throw new Error("فشل في تسجيل عملية الشراء");
      }

      // Record transaction
      const { data: txData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          pdf_id: pdfId,
          amount: price,
          payment_method: 'wallet',
          status: 'completed',
        } as any)
        .select('id')
        .single();

      if (transactionError) {
        console.error("Transaction record error:", transactionError);
      }

      // Credit teacher earnings & wallet via secure RPC
      if (price > 0) {
        try {
          await (supabase.rpc as any)('credit_teacher_earning', {
            p_pdf_id: pdfId,
            p_transaction_id: txData?.id || null,
            p_price_paid: price,
          });
        } catch (err) {
          console.error('Teacher earnings error for PDF:', pdfId, err);
        }
      }

      // Mark as purchased locally
      setPurchasedPdfIds(prev => new Set(prev).add(pdfId));
      toast.success("تم شراء المذكرة بنجاح!");
    } catch (error: any) {
      console.error("PDF purchase error:", error);
      toast.error(error.message || "حدث خطأ أثناء عملية الشراء");
    } finally {
      setPurchasingPdfId(null);
    }
  };

  const renderLevelSelection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {levels?.map((level) => (
        <Card 
          key={level.id} 
          className="cursor-pointer border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-800/80 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/20 group"
          onClick={() => {
            setSelectedLevelId(level.id);
            setSelectedYearId(null);
            setSelectedCollegeId(null);
            setSelectedDepartmentId(null);
            setSelectedSubjectId(null);
          }}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/20 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-8 w-8 text-teal-400" />
            </div>
            <CardTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {level.name_ar || level.name}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              تصفح المراحل التعليمية لـ {level.name_ar || level.name}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const renderPath = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 mb-10 bg-slate-900/50 border border-teal-900/30 p-4 rounded-xl shadow-lg">
        <button onClick={() => setSelectedLevelId(null)} className="hover:text-teal-400 font-semibold transition-colors flex items-center gap-1.5 focus:outline-none">
          <BookOpen className="h-4 w-4" /> التصنيفات
        </button>
        <ChevronLeft className="h-4 w-4 text-teal-500/50" />
        
        <span className={!selectedYearId && !selectedCollegeId ? "text-teal-400 font-bold" : "font-medium"}>
          {selectedLevel.name_ar || selectedLevel.name}
        </span>
        
        {selectedYearId && (
          <>
            <ChevronLeft className="h-4 w-4 text-teal-500/50" />
            <span className={!selectedSubjectId ? "text-teal-400 font-bold" : "font-medium"}>
              {years?.find(y => y.id === selectedYearId)?.name_ar || years?.find(y => y.id === selectedYearId)?.name}
            </span>
          </>
        )}

        {selectedCollegeId && (
          <>
            <ChevronLeft className="h-4 w-4 text-teal-500/50" />
            <span className={!selectedDepartmentId ? "text-teal-400 font-bold" : "font-medium"}>
              {colleges?.find(c => c.id === selectedCollegeId)?.name_ar || colleges?.find(c => c.id === selectedCollegeId)?.name}
            </span>
          </>
        )}

        {selectedDepartmentId && (
          <>
            <ChevronLeft className="h-4 w-4 text-teal-500/50" />
            <span className={!selectedSubjectId ? "text-teal-400 font-bold" : "font-medium"}>
              {departments?.find(d => d.id === selectedDepartmentId)?.name_ar || departments?.find(d => d.id === selectedDepartmentId)?.name}
            </span>
          </>
        )}

        {selectedSubjectId && (
          <>
            <ChevronLeft className="h-4 w-4 text-teal-500/50" />
            <span className="text-teal-400 font-bold">
              {subjects?.find(s => s.id === selectedSubjectId)?.name_ar || subjects?.find(s => s.id === selectedSubjectId)?.name}
            </span>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedLevel) return null;

    if (selectedLevel.slug !== 'university') {
      if (!selectedYearId) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {years?.map(year => (
              <Button 
                key={year.id} 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center gap-3 border-teal-900/40 bg-slate-900/40 hover:bg-slate-800/80 hover:border-teal-500/50 text-white rounded-2xl"
                onClick={() => setSelectedYearId(year.id)}
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
                   <School className="h-6 w-6 text-indigo-400" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {year.name_ar || year.name}
                </span>
              </Button>
            ))}
          </div>
        );
      }

      if (!selectedSubjectId) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects && subjects.length > 0 ? subjects.map(subject => (
              <Button 
                key={subject.id} 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center gap-2 border-teal-900/40 bg-slate-900/40 hover:bg-slate-800/80 hover:border-teal-500/50 text-white rounded-xl"
                onClick={() => setSelectedSubjectId(subject.id)}
              >
                <Book className="h-5 w-5 text-teal-400" />
                <span className="font-semibold text-base">{subject.name_ar || subject.name}</span>
              </Button>
            )) : (
               <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                 <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                 {t('browse.no_subjects')}
               </div>
            )}
          </div>
        );
      }
    }

    if (selectedLevel.slug === 'university') {
      if (!selectedCollegeId) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges?.map(college => (
              <Button 
                key={college.id} 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center gap-3 border-teal-900/40 bg-slate-900/40 hover:bg-slate-800/80 hover:border-teal-500/50 text-white rounded-2xl"
                onClick={() => setSelectedCollegeId(college.id)}
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                   <GraduationCap className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {college.name_ar || college.name}
                </span>
              </Button>
            ))}
          </div>
        );
      }

      if (!selectedDepartmentId) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {departments && departments.length > 0 ? departments.map(dept => (
              <Button 
                key={dept.id} 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center gap-2 border-teal-900/40 bg-slate-900/40 hover:bg-slate-800/80 hover:border-teal-500/50 text-white rounded-xl"
                onClick={() => setSelectedDepartmentId(dept.id)}
              >
                <Book className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-base whitespace-normal text-center leading-tight">
                  {dept.name_ar || dept.name}
                </span>
              </Button>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                <School className="h-12 w-12 mx-auto mb-3 opacity-20" />
                {t('browse.no_departments')}
              </div>
            )}
          </div>
        );
      }
    }

    if (loadingPdfs) {
      return (
        <div className="py-20 flex flex-col items-center justify-center">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-4"></div>
           <p className="text-slate-400">{t('browse.loading')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <FileText className="h-6 w-6 text-teal-400" />
            المحاضرات (PDF)
          </h3>
          {pdfs && pdfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map(pdf => {
                  const isPurchased = pdf.is_free || purchasedPdfIds.has(pdf.id);
                  const isBuying = purchasingPdfId === pdf.id;
                  return (
                <Card key={pdf.id} className="border-teal-900/30 bg-slate-900/50 backdrop-blur hover:bg-slate-800/80 transition-all duration-300 flex flex-col">
                  <CardHeader className="pb-3 border-b border-slate-800/50">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-lg text-teal-300 line-clamp-2 leading-snug">
                        {pdf.title_ar || pdf.title}
                      </CardTitle>
                      {pdf.is_free ? (
                        <Badge className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-0 shrink-0">مجاني</Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
                          {formatCurrency(pdf.price)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2 flex-1">
                    <p className="text-sm text-slate-400 line-clamp-3 mb-4">{pdf.description_ar || pdf.description}</p>
                    <div className="flex items-center text-xs text-slate-500 bg-slate-950/50 p-2 rounded-lg">
                      <span className="font-semibold ml-1 text-slate-400 text-right">المعلم:</span>
                      <span className="truncate">{pdf.teacher?.profiles?.full_name || 'غير محدد'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {isPurchased ? (
                      <Button variant="outline" className="w-full bg-slate-950/50 border-teal-900/40 hover:bg-teal-900/30 hover:text-teal-400 transition-colors gap-2" asChild>
                        <a href={pdf.pdf_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                          عرض المحاضرة
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold gap-2 shadow-lg shadow-amber-500/20"
                        onClick={() => handleBuyPdf(pdf.id, pdf.price)}
                        disabled={isBuying}
                      >
                        {isBuying ? (
                          <span className="animate-pulse">جاري الشراء...</span>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            اشتري مقابل {formatCurrency(pdf.price)}
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
                  );
                })}
            </div>
          ) : (
             <div className="p-12 text-center text-slate-400 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
               <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p className="text-lg mb-2">لا توجد محاضرات PDF متاحة حالياً.</p>
               <p className="text-sm opacity-60">سيتم إضافة محتوى قريباً، يرجى التحقق لاحقاً.</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900/20 via-background to-secondary/10 py-16 animate-fade-in">
        <img
          src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1400&h=400&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="container relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center rounded-2xl bg-teal-500/10 p-4 mb-5 shadow-xl shadow-teal-500/5 border border-teal-500/20">
            <Search className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t('browse.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            {t('browse.subtitle')}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {renderPath()}
          
          <div className="mt-8">
            {loadingLevels ? (
              <div className="py-24 flex flex-col justify-center items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                 <p className="text-slate-400">جاري التحميل...</p>
              </div>
            ) : (
              !selectedLevel ? renderLevelSelection() : renderContent()
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
