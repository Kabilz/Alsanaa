import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCourse, useUpdateCourse, useCourse, useTeachers } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, Video, ArrowRight, UploadCloud, ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEducationalLevels, useEducationalYears, useSubjects, useColleges, useDepartments } from "@/hooks/useHierarchy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseFormProps {
  courseId?: string;
  fixedTeacherId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CourseForm({ courseId, fixedTeacherId, onSuccess, onCancel }: CourseFormProps) {
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState("0.00");
  const [teacherId, setTeacherId] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Hierarchy state
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const { data: course, isLoading: loadingCourse } = useCourse(courseId || "");
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const { data: teachers, isLoading: loadingTeachers } = useTeachers();

  // Hierarchy Data
  const { data: levels } = useEducationalLevels();
  const { data: years } = useEducationalYears(selectedLevelId || undefined);
  const { data: colleges } = useColleges();
  const { data: departments } = useDepartments(selectedCollegeId || undefined);
  const { data: subjects } = useSubjects(selectedYearId || undefined);

  const selectedLevel = levels?.find(l => l.id === selectedLevelId);
  const isUniversity = selectedLevel?.slug === 'university';

  useEffect(() => {
    if (course) {
      setTitle(course.title || course.title_en || "");
      setTitleAr(course.title_ar || "");
      setDescription(course.description || course.description_en || "");
      setDescriptionAr(course.description_ar || "");
      setPrice(course.price.toFixed(2));
      setVideoUrl(course.video_url);
      setImageUrl(course.image_url || null);
      setTeacherId(course.teacher_id || "");
      
      if (course.educational_years?.level_id) {
        setSelectedLevelId(course.educational_years.level_id);
      } else if (course.departments?.college_id) {
        // If there's a department, we need to find the university level ID
        const uniLevel = levels?.find(l => l.slug === 'university');
        if (uniLevel) setSelectedLevelId(uniLevel.id);
        setSelectedCollegeId(course.departments.college_id);
      }
      setSelectedYearId(course.educational_year_id || "");
      setSelectedSubjectId(course.subject_id || "");
      setSelectedDepartmentId(course.department_id || "");
    }
  }, [course, levels]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("يجب أن يكون حجم ملف الفيديو أقل من ١٠٠ ميجابايت");
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
      toast.error("فشل رفع الفيديو: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("يجب أن يكون حجم الصورة أقل من ٥ ميجابايت");
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl;

    setUploadingImage(true);
    setImageUploadProgress(0);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      setImageUploadProgress(100);
      return urlData.publicUrl;
    } catch (error: any) {
      toast.error("فشل رفع الصورة: " + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleAr && !title) {
       toast.error("مطلوب إدخال عنوان الدورة");
       return;
    }

    const uploadedVideoUrl = await uploadVideo();
    const uploadedImageUrl = await uploadImage();

    const courseData = {
      title: title || titleAr,
      description: description || descriptionAr,
      video_url: uploadedVideoUrl || undefined,
      image_url: uploadedImageUrl || undefined,
      price: parseFloat(price) || 0,
      teacher_id: fixedTeacherId || teacherId || undefined,
      educational_year_id: selectedYearId || null,
      subject_id: selectedSubjectId || null,
      department_id: selectedDepartmentId || null,
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

  const removeImage = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  const isSubmitting = createCourse.isPending || updateCourse.isPending || uploading || uploadingImage;

  if (courseId && loadingCourse) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-slate-400 font-medium font-cairo">جاري تحميل بيانات الدورة...</p>
      </div>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl overflow-hidden relative" dir="rtl">
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -ml-32 -mt-32 opacity-50 pointer-events-none" />
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40 relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-white drop-shadow-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {courseId ? "تعديل الدورة التعليمية" : "إضافة دورة تعليمية جديدة"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title_ar" className="text-slate-300">عنوان الدورة (بالعربية) *</Label>
              <Input
                id="title_ar"
                placeholder="أدخل عنوان الدورة بالعربية..."
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">عنوان الدورة (بالإنجليزية) <span className="text-slate-500 text-xs">(اختياري)</span></Label>
              <Input
                id="title"
                placeholder="Enter course title in English..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description_ar" className="text-slate-300">الوصف (بالعربية) *</Label>
              <Textarea
                id="description_ar"
                placeholder="أدخل وصف الدورة بالعربية..."
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={4}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">الوصف (بالإنجليزية) <span className="text-slate-500 text-xs">(اختياري)</span></Label>
              <Textarea
                id="description"
                placeholder="Enter course description in English..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-800/20 rounded-xl border border-slate-800">
             <div className="space-y-2">
               <Label htmlFor="price" className="text-slate-300">السعر (بالجنيه)</Label>
               <Input
                 id="price"
                 type="number"
                 step="0.01"
                 min="0"
                 placeholder="0.00"
                 value={price}
                 onChange={(e) => setPrice(e.target.value)}
                 required
                 className="bg-slate-800/80 border-slate-700 text-white"
               />
               <p className="text-xs text-slate-500">أدخل (0) لجعل الدورة مجانية.</p>
             </div>

             {!fixedTeacherId && (
               <div className="space-y-2">
                 <Label htmlFor="teacher" className="text-slate-300">المعلم المسؤول</Label>
                 <Select value={teacherId} onValueChange={setTeacherId}>
                   <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200">
                     <SelectValue placeholder="اختر المعلم الذي يقدم هذه الدورة..." />
                   </SelectTrigger>
                   <SelectContent className="bg-slate-800 border-slate-700 text-right" dir="rtl">
                     {teachers?.map((teacher) => (
                       <SelectItem key={teacher.id} value={teacher.id} className="focus:bg-slate-700 cursor-pointer">
                         {teacher.full_name || (teacher as any).full_name_ar}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             )}
          </div>

          <div className="border-t border-slate-800/50 pt-6 mt-6">
            <h3 className="font-semibold mb-4 text-teal-500">التصنيف التعليمي للدورة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-slate-800/20 rounded-xl border border-slate-800">
              <div className="space-y-2">
                <Label className="text-slate-300">المرحلة الدراسية</Label>
                <Select value={selectedLevelId} onValueChange={(val) => {
                  setSelectedLevelId(val);
                  setSelectedYearId("");
                  setSelectedSubjectId("");
                  setSelectedCollegeId("");
                  setSelectedDepartmentId("");
                }}>
                  <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-right" dir="rtl">
                    {levels?.map(l => (
                      <SelectItem key={l.id} value={l.id} className="focus:bg-slate-700 cursor-pointer">{l.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isUniversity ? (
                <>
                  <div className="space-y-2 animate-in fade-in">
                    <Label className="text-slate-300">الكلية</Label>
                    <Select value={selectedCollegeId} onValueChange={(val) => {
                      setSelectedCollegeId(val);
                      setSelectedDepartmentId("");
                    }} disabled={!selectedLevelId}>
                      <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200">
                        <SelectValue placeholder="اختر الكلية" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-right" dir="rtl">
                        {colleges?.map(c => (
                          <SelectItem key={c.id} value={c.id} className="focus:bg-slate-700 cursor-pointer">{c.name_ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 animate-in fade-in">
                    <Label className="text-slate-300">التخصص / القسم</Label>
                    <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId} disabled={!selectedCollegeId}>
                      <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-right" dir="rtl">
                        {departments?.map(d => (
                          <SelectItem key={d.id} value={d.id} className="focus:bg-slate-700 cursor-pointer">{d.name_ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : selectedLevelId && selectedLevel?.slug !== 'courses' ? (
                <>
                  <div className="space-y-2 animate-in fade-in">
                    <Label className="text-slate-300">السنة الدراسية</Label>
                    <Select value={selectedYearId} onValueChange={(val) => {
                      setSelectedYearId(val);
                      setSelectedSubjectId("");
                    }} disabled={!selectedLevelId}>
                      <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200">
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-right" dir="rtl">
                        {years?.map(y => (
                          <SelectItem key={y.id} value={y.id} className="focus:bg-slate-700 cursor-pointer">{y.name_ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
             <Label className="text-slate-300">صورة الدورة (صورة مصغرة) <span className="text-slate-500 text-xs">(اختياري)</span></Label>
             {imageUrl ? (
               <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 group max-w-sm">
                 <img
                   src={imageUrl}
                   alt="Course Thumbnail"
                   className="w-full aspect-video object-cover"
                 />
                 <Button
                   type="button"
                   variant="destructive"
                   size="icon"
                   className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600 hover:bg-rose-500 text-white border-0 z-10"
                   onClick={removeImage}
                 >
                   <X className="w-4 h-4" />
                 </Button>
               </div>
             ) : (
               <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-2xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-800/50 transition-all group">
                 <div className="p-4 bg-slate-800 rounded-full mb-3 group-hover:scale-110 group-hover:bg-slate-700 transition-transform">
                    <ImageIcon className="w-8 h-8 text-teal-500" />
                 </div>
                 <span className="text-sm text-slate-300 font-medium">
                   انقر لرفع صورة مصغرة للدورة
                 </span>
                 <span className="text-xs text-slate-500 mt-2">
                   يدعم صيغ JPG, PNG, WebP (الحد الأقصى ٥ ميجابايت)
                 </span>
                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleImageSelect}
                   className="hidden"
                 />
               </label>
             )}
            
             {uploadingImage && (
               <div className="space-y-2 pt-2">
                 <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">جاري الرفع...</span>
                    <span className="text-teal-400 font-medium">{Math.round(imageUploadProgress)}%</span>
                 </div>
                 <Progress value={imageUploadProgress} className="h-2 bg-slate-800 [&>div]:bg-teal-500" />
               </div>
             )}
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300">الفيديو التوضيحي للدورة <span className="text-slate-500 text-xs">(اختياري)</span></Label>
            {videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900 group">
                <video
                  src={videoUrl}
                  className="w-full aspect-video object-cover"
                  controls
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600 hover:bg-rose-500 text-white border-0 z-10"
                  onClick={removeVideo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-2xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-800/50 transition-all group">
                <div className="p-4 bg-slate-800 rounded-full mb-3 group-hover:scale-110 group-hover:bg-slate-700 transition-transform">
                   <UploadCloud className="w-8 h-8 text-teal-500" />
                </div>
                <span className="text-sm text-slate-300 font-medium">
                  انقر لرفع مقطع فيديو توضيحي
                </span>
                <span className="text-xs text-slate-500 mt-2">
                  يدعم صيغ MP4, WebM (الحد الأقصى ١٠٠ ميجابايت)
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
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-400">جاري الرفع...</span>
                   <span className="text-teal-400 font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-slate-800 [&>div]:bg-teal-500" />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-slate-800/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 py-6"
              disabled={isSubmitting}
            >
              إلغاء التغييرات
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 py-6 text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>جاري المعالجة...</span>
                </div>
              ) : (
                courseId ? "تحديث التغييرات" : "نشر الدورة"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
