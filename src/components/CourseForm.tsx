import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCourse, useUpdateCourse, useCourse } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Video, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeachers } from "@/hooks/useCourses";

interface CourseFormProps {
  courseId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CourseForm({ courseId, onSuccess, onCancel }: CourseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [teacherId, setTeacherId] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const { data: course, isLoading: loadingCourse } = useCourse(courseId || "");
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const { data: teachers, isLoading: loadingTeachers } = useTeachers();

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || "");
      setPrice(course.price.toFixed(2));
      setVideoUrl(course.video_url);
      setTeacherId(course.teacher_id || "");
    }
  }, [course]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file must be less than 100MB");
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return videoUrl;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(fileName, videoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("course-videos")
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return urlData.publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload video: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const uploadedVideoUrl = await uploadVideo();

    const courseData = {
      title,
      description,
      video_url: uploadedVideoUrl || undefined,
      price: parseFloat(price) || 0,
      teacher_id: teacherId || undefined,
    };

    if (courseId) {
      await updateCourse.mutateAsync({ id: courseId, ...courseData });
    } else {
      await createCourse.mutateAsync(courseData);
    }

    onSuccess();
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl(null);
  };

  const isSubmitting = createCourse.isPending || updateCourse.isPending || uploading;

  if (courseId && loadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/50 gradient-card max-w-2xl mx-auto animate-scale-in">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl font-display">
            {courseId ? "Edit Course" : "Add New Course"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Assigned Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Course Video</Label>
            {videoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                <video
                  src={videoUrl}
                  className="w-full aspect-video object-cover"
                  controls
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeVideo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <span className="text-sm text-muted-foreground">
                  Click to upload video
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Max 100MB
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading video...
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-border"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gradient-primary text-primary-foreground font-semibold hover:opacity-90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {courseId ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
