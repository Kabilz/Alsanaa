import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { StudentBalances } from "@/components/admin/StudentBalances";
import { TeacherBalances } from "@/components/admin/TeacherBalances";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import { RefundManagement } from "@/components/admin/RefundManagement";
import { BankTransfersAdmin } from "@/components/admin/BankTransfersAdmin";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Megaphone,
  BookOpen,
  BarChart3,
  Plus,
  FileText,
  RotateCcw,
  Banknote,
  GraduationCap,
  Landmark,
  Settings
} from "lucide-react";

import { AdminPdfs } from "@/components/admin/AdminPdfs";
import { RevenueStatement } from "@/components/admin/RevenueStatement";
import { TeacherStatement } from "@/components/admin/TeacherStatement";
import { EducationalLevelsManager } from "@/components/admin/EducationalLevelsManager";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { CourseList } from "@/components/CourseList";
import { CourseForm } from "@/components/CourseForm";
import { QuizManager } from "@/components/QuizManager";
import { Button } from "@/components/ui/button";

export function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [courseView, setCourseView] = useState<"list" | "add" | "edit" | "quiz">("list");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleAddCourse = () => {
    setSelectedCourseId(null);
    setCourseView("add");
  };

  const handleEditCourse = (id: string) => {
    setSelectedCourseId(id);
    setCourseView("edit");
  };

  const handleManageQuiz = (id: string) => {
    setSelectedCourseId(id);
    setCourseView("quiz");
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setCourseView("list");
  };

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      {/* ═══════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div className="border-b border-teal-900/40 bg-slate-900/50 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>لوحة تحكم المسؤول</h1>
              <p className="text-slate-400 text-sm">إدارة محتوى المنصة والمستخدمين والإحصائيات</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
               <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20 shadow-inner">
                  <BarChart3 className="w-6 h-6 text-teal-400" />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Scrollable Tabs List */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="bg-slate-900/60 border border-teal-900/30 w-max min-w-full justify-start p-1.5 rounded-2xl flex-nowrap h-14 gap-2">
              <TabsTrigger value="users" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <Users className="h-4 w-4 ml-2" />
                <span>المستخدمين</span>
              </TabsTrigger>
              <TabsTrigger value="finances" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <DollarSign className="h-4 w-4 ml-2 text-emerald-500/80" />
                <span>المالية</span>
              </TabsTrigger>
              <TabsTrigger value="revenues" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <Banknote className="h-4 w-4 ml-2" />
                <span>كشف الإيرادات</span>
              </TabsTrigger>
              <TabsTrigger value="student_balances" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <CreditCard className="h-4 w-4 ml-2" />
                <span>أرصدة الطلاب</span>
              </TabsTrigger>
              <TabsTrigger value="bank_transfers" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <Landmark className="h-4 w-4 ml-2 text-teal-400/80" />
                <span>الحوالات المصرفية</span>
              </TabsTrigger>
              <TabsTrigger value="teacher_balances" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <CreditCard className="h-4 w-4 ml-2" />
                <span>أرصدة المعلمين</span>
              </TabsTrigger>
              <TabsTrigger value="teacher_statement" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <FileText className="h-4 w-4 ml-2" />
                <span>كشف حساب المعلمين</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <Megaphone className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">الإعلانات</span>
                <span className="sm:hidden">إعلانات</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <BookOpen className="h-4 w-4 ml-2" />
                <span>الدورات</span>
              </TabsTrigger>
              <TabsTrigger value="pdfs" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <FileText className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">المذكرات</span>
                <span className="sm:hidden">PDF</span>
              </TabsTrigger>
              <TabsTrigger value="refunds" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <RotateCcw className="h-4 w-4 ml-2" />
                <span>المبالغ المستردة</span>
              </TabsTrigger>
              <TabsTrigger value="levels" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <GraduationCap className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">المراحل الدراسية</span>
                <span className="sm:hidden">المراحل</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all whitespace-nowrap">
                <Settings className="h-4 w-4 ml-2" />
                <span>الإعدادات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-8 animate-slide-up">
            <TabsContent value="users" className="mt-0 outline-none">
              <UserManagement />
            </TabsContent>

            <TabsContent value="finances" className="mt-0 outline-none">
              <FinancialDashboard />
            </TabsContent>

            <TabsContent value="revenues" className="mt-0 outline-none">
              <RevenueStatement />
            </TabsContent>

            <TabsContent value="student_balances" className="mt-0 outline-none">
              <StudentBalances />
            </TabsContent>

            <TabsContent value="bank_transfers" className="mt-0 outline-none">
              <BankTransfersAdmin />
            </TabsContent>

            <TabsContent value="teacher_balances" className="mt-0 outline-none">
              <TeacherBalances />
            </TabsContent>

            <TabsContent value="teacher_statement" className="mt-0 outline-none">
              <TeacherStatement />
            </TabsContent>

            <TabsContent value="announcements" className="mt-0 outline-none">
              <AnnouncementManagement />
            </TabsContent>

            <TabsContent value="pdfs" className="mt-0 outline-none">
              <AdminPdfs />
            </TabsContent>

            <TabsContent value="refunds" className="mt-0 outline-none">
              <RefundManagement />
            </TabsContent>

            <TabsContent value="levels" className="mt-0 outline-none">
              <EducationalLevelsManager />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 outline-none">
              <AdminSettings />
            </TabsContent>

            <TabsContent value="courses" className="mt-0 outline-none">
              {courseView === "list" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-teal-900/30">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إدارة الدورات التدريبية</h2>
                      <p className="text-slate-400 text-sm">
                        أضف وعدل دوراتك، عين المعلمين، وأدر الاختبارات التقييمية بسهولة.
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddCourse} 
                      className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-6 h-12 w-full sm:w-auto shrink-0"
                    >
                      <Plus className="h-5 w-5 ml-2" />
                      إنشاء دورة جديدة
                    </Button>
                  </div>
                  <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/50">
                    <CourseList
                      onEditCourse={handleEditCourse}
                      onManageQuiz={handleManageQuiz}
                    />
                  </div>
                </div>
              )}

              {(courseView === "add" || courseView === "edit") && (
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-teal-900/30 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
                   <h2 className="text-2xl font-bold text-white mb-8 border-b border-slate-800/50 pb-4 relative z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {courseView === "add" ? "إضافة دورة جديدة" : "تعديل تفاصيل الدورة"}
                   </h2>
                   <div className="relative z-10">
                    <CourseForm
                      courseId={selectedCourseId || undefined}
                      onSuccess={handleBackToCourses}
                      onCancel={handleBackToCourses}
                    />
                   </div>
                </div>
              )}

              {courseView === "quiz" && selectedCourseId && (
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-teal-900/30 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
                   <h2 className="text-2xl font-bold text-white mb-8 border-b border-slate-800/50 pb-4 relative z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      إدارة اختبار الدورة
                   </h2>
                   <div className="relative z-10">
                    <QuizManager
                      courseId={selectedCourseId}
                      onBack={handleBackToCourses}
                    />
                   </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
