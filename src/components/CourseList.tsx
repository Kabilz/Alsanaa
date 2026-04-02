import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Play, Pencil, Trash2, ShieldQuestion, Calendar, Video, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";

interface CourseListProps {
  onEditCourse: (id: string) => void;
  onManageQuiz: (id: string) => void;
}

export function CourseList({ onEditCourse, onManageQuiz }: CourseListProps) {
  const { data: courses, isLoading } = useCourses();
  const deleteCourse = useDeleteCourse();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" dir="rtl">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800/50 overflow-hidden shadow-lg round-2xl">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-3/4 bg-slate-800 rounded-lg mb-2" />
              <Skeleton className="h-4 w-1/2 bg-slate-800 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full bg-slate-800 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl" dir="rtl">
        <div className="w-20 h-20 mb-6 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <Video className="w-10 h-10 text-teal-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
          لا يوجد دورات بعد
        </h3>
        <p className="text-slate-400">
          ابدأ بإضافة الدورة التعليمية الأولى
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" dir="rtl">
      {courses.map((course, index) => (
        <Card
          key={course.id}
          className="bg-slate-900/40 border-slate-800/60 shadow-xl hover:border-teal-500/40 transition-all duration-300 group overflow-hidden relative flex flex-col"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {course.image_url && (
            <div className="h-40 w-full relative overflow-hidden flex-none">
              <img
                src={course.image_url}
                alt={course.title_ar || course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          )}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-teal-500/10 pointer-events-none" />
          <CardHeader className="pb-4 border-b border-slate-800/50 bg-slate-900/20 relative z-10 flex-none px-5 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? (course.title_ar || course.title) : (course.title_en || course.title)}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                     <Calendar className="w-3.5 h-3.5 text-teal-500" />
                     <span>{new Date(course.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {course.teacher?.profiles && (
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                       <span className="text-fuchsia-400 font-medium truncate max-w-[120px]">{course.teacher.profiles.full_name || (course.teacher.profiles as any).full_name_ar}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col flex-1 relative z-10">
            <div className="flex justify-between items-center mb-4">
               <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 font-semibold text-base">
                 {course.price === 0 ? "مجاني" : formatCurrency(course.price)}
               </Badge>
               {course.video_url && (
                 <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                   <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/50" />
                 </div>
               )}
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-4 flex-1">
              {isAr ? (course.description_ar || course.description) : (course.description_en || course.description) || "لم يتم توفير وصف لهذه الدورة"}
            </p>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-800/50">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManageQuiz(course.id)}
                className="flex-1 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/40"
              >
                <ShieldQuestion className="w-4 h-4 ml-1.5" />
                الاختبارات
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditCourse(course.id)}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex-1"
              >
                <Pencil className="w-4 h-4 ml-1.5" />
                تعديل
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 px-3 shrink-0"
                    title="حذف الدورة"
                  >
                    {deleteCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-rose-900/50 text-right" dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>حذف الدورة التعليمية</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      هل أنت متأكد أنك تريد حذف "{isAr ? (course.title_ar || course.title) : (course.title_en || course.title)}"؟ سيؤدي هذا إلى حذف الدورة وجميع الدروس والاختبارات المرتبطة بها نهائياً.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteCourse.mutate(course.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                      disabled={deleteCourse.isPending}
                    >
                      حذف نهائياً
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
