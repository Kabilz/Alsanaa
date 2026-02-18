import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { CardManagement } from "@/components/admin/CardManagement";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Megaphone,
  BookOpen,
  BarChart3,
  Plus
} from "lucide-react";
import { CourseList } from "@/components/CourseList";
import { CourseForm } from "@/components/CourseForm";
import { QuizManager } from "@/components/QuizManager";
import { Button } from "@/components/ui/button";

export function EnhancedAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
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
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage the Academy platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="finances" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Finances</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-4">
              <FinancialDashboard />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="finances">
              <FinancialDashboard />
            </TabsContent>

            <TabsContent value="cards">
              <CardManagement />
            </TabsContent>

            <TabsContent value="announcements">
              <AnnouncementManagement />
            </TabsContent>

            <TabsContent value="courses">
              {courseView === "list" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
                      <p className="text-muted-foreground">
                        Manage your courses, teachers, and quizzes
                      </p>
                    </div>
                    <Button onClick={handleAddCourse} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </div>
                  <CourseList
                    onEditCourse={handleEditCourse}
                    onManageQuiz={handleManageQuiz}
                  />
                </div>
              )}

              {(courseView === "add" || courseView === "edit") && (
                <CourseForm
                  courseId={selectedCourseId || undefined}
                  onSuccess={handleBackToCourses}
                  onCancel={handleBackToCourses}
                />
              )}

              {courseView === "quiz" && selectedCourseId && (
                <QuizManager
                  courseId={selectedCourseId}
                  onBack={handleBackToCourses}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
