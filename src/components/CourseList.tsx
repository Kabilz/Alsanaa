import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Trash2, HelpCircle, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
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

interface CourseListProps {
  onEditCourse: (id: string) => void;
  onManageQuiz: (id: string) => void;
}

export function CourseList({ onEditCourse, onManageQuiz }: CourseListProps) {
  const { data: courses, isLoading } = useCourses();
  const deleteCourse = useDeleteCourse();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50 gradient-card">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-secondary" />
              <Skeleton className="h-4 w-1/2 bg-secondary" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full bg-secondary" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          No courses yet
        </h3>
        <p className="text-muted-foreground">
          Start by adding your first course
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <Card
          key={course.id}
          className="border-border/50 gradient-card hover:border-primary/30 transition-all duration-300 group animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-display truncate group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(course.created_at), "MMM d, yyyy")}
                  {course.teacher?.profiles && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-primary">{course.teacher.profiles.full_name}</span>
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {course.price.toFixed(2)}
                </Badge>
                {course.video_url && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {course.description || "No description provided"}
            </p>

            {course.video_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <video
                  src={course.video_url}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditCourse(course.id)}
                className="flex-1 border-border hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManageQuiz(course.id)}
                className="flex-1 border-border hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Quiz
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{course.title}"? This will also delete all associated quizzes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteCourse.mutate(course.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
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
