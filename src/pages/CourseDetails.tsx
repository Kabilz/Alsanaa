import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, PlayCircle, Lock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  video_url: string | null;
  image_url: string | null;
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchCourseAndPurchaseStatus = async () => {
      if (!id) return;

      setLoading(true);
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
      
      if (courseError) {
        toast.error("Failed to load course details");
        setLoading(false);
        return;
      }

      setCourse(courseData);

      // Check purchase status if user is logged in
      if (user) {
        const { data: purchaseData } = await supabase
          .from("course_purchases")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .maybeSingle(); // Use maybeSingle to avoid error if not found

        setHasPurchased(!!purchaseData);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchCourseAndPurchaseStatus();
    }
  }, [id, user, authLoading]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase courses");
      navigate("/login");
      return;
    }
    
    if (!course) return;

    setPurchasing(true);
    // Mock purchase logic - direct insert
    const { error } = await supabase
      .from("course_purchases")
      .insert({
        user_id: user.id,
        course_id: course.id,
        price_paid: course.price,
      } as any);

    if (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to purchase course");
    } else {
      toast.success("Course purchased successfully!");
      setHasPurchased(true);
    }
    setPurchasing(false);
  };

  const startLearning = () => {
    navigate(`/courses/${id}/learn`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <p>Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {course.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6 overflow-hidden relative">
               {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
               ) : (
                  <PlayCircle className="h-16 w-16 text-muted-foreground opacity-50" />
               )}
            </div>
            
            <div className="flex items-center justify-between">
               <span className="text-2xl font-bold">
                 {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
               </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
             {hasPurchased ? (
               <Button size="lg" onClick={startLearning}>
                 <PlayCircle className="mr-2 h-5 w-5" />
                 Start Learning
               </Button>
             ) : (
               <Button size="lg" onClick={handlePurchase} disabled={purchasing}>
                 {purchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {course.price > 0 ? "Buy Now" : "Enroll for Free"}
               </Button>
             )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default CourseDetails;
