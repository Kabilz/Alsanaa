import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ArrowLeft, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  video_url: string | null;
}

const CourseViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      if (!id || !user) return;

      setLoading(true);

      // Check purchase
      const { data: purchase } = await supabase
        .from("course_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .maybeSingle();

      if (!purchase) {
        toast.error("You need to purchase this course to view it.");
        navigate(`/courses/${id}`);
        return;
      }
      setHasAccess(true);

      // Fetch course content
      const { data: courseData, error } = await supabase
        .from("courses")
        .select("id, title, video_url")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load course content");
      } else {
        setCourse(courseData);
      }
      setLoading(false);
    };

    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        checkAccessAndFetch();
      }
    }
  }, [id, user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 container py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/courses/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Details
        </Button>
        
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <Button onClick={() => navigate(`/courses/${id}/quiz`)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Take Quiz
            </Button>
        </div>

        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
          {course.video_url ? (
            <video 
              src={course.video_url} 
              controls 
              className="w-full h-full object-contain"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-white">
                <p>No video content available.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
