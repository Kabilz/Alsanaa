import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { CourseList } from "./CourseList";
import { CourseForm } from "./CourseForm";
import { QuizManager } from "./QuizManager";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "courses" | "add" | "edit" | "quiz";

export function AdminDashboard() {
  const [view, setView] = useState<View>("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleAddCourse = () => {
    setSelectedCourseId(null);
    setView("add");
  };

  const handleEditCourse = (id: string) => {
    setSelectedCourseId(id);
    setView("edit");
  };

  const handleManageQuiz = (id: string) => {
    setSelectedCourseId(id);
    setView("quiz");
  };

  const handleBack = () => {
    setSelectedCourseId(null);
    setView("courses");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        onAddCourse={handleAddCourse}
        activeView={view === "courses" ? "courses" : "add"}
      />

      <main className="flex-1 p-8 overflow-auto">
        {view === "courses" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Courses
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your course library
                </p>
              </div>
              <Button
                onClick={handleAddCourse}
                className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 glow-primary-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
            <CourseList
              onEditCourse={handleEditCourse}
              onManageQuiz={handleManageQuiz}
            />
          </div>
        )}

        {(view === "add" || view === "edit") && (
          <CourseForm
            courseId={selectedCourseId || undefined}
            onSuccess={handleBack}
            onCancel={handleBack}
          />
        )}

        {view === "quiz" && selectedCourseId && (
          <QuizManager courseId={selectedCourseId} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}
