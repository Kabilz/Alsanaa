import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreatePdfLecture, useUpdatePdfLecture, PdfLecture } from "@/hooks/usePdfLectures";
import { useTeachers } from "@/hooks/useCourses";
import { useEducationalLevels, useEducationalYears, useSubjects, useColleges, useDepartments } from "@/hooks/useHierarchy";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface PdfFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  teacherIdOverride?: string | null;
  initialData?: PdfLecture | null; // if provided → edit mode
}

export function PdfForm({ onSuccess, onCancel, teacherIdOverride, initialData }: PdfFormProps) {
  const { user, userRole } = useAuth();
  const isEditMode = !!initialData;
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [titleAr, setTitleAr] = useState(initialData?.title_ar || "");
  const [descriptionAr, setDescriptionAr] = useState(initialData?.description_ar || "");
  const [price, setPrice] = useState(String(initialData?.price ?? "0"));
  const [isFree, setIsFree] = useState(initialData?.is_free ?? true);
  
  // Hierarchy state
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>(initialData?.educational_year_id || "");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(initialData?.department_id || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialData?.subject_id || "");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialData?.teacher_id || "");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const createPdf = useCreatePdfLecture();
  const updatePdf = useUpdatePdfLecture();
  const isPending = createPdf.isPending || updatePdf.isPending;

  // Hierarchy Data
  const { data: levels } = useEducationalLevels();
  const { data: years } = useEducationalYears(selectedLevelId || undefined);
  const { data: colleges } = useColleges();
  const { data: departments } = useDepartments(selectedCollegeId || undefined);
  const { data: subjects } = useSubjects(selectedYearId || undefined);
  const { data: teachers } = useTeachers();

  // Auto-select level based on initialData year/department
  useEffect(() => {
    if (!initialData || !levels) return;
    if (initialData.educational_year_id && years) {
      const matchedYear = years.find(y => y.id === initialData.educational_year_id);
      if (matchedYear) setSelectedLevelId(matchedYear.level_id || "");
    }
  }, [levels, initialData]);

  const selectedLevel = levels?.find(l => l.id === selectedLevelId);
  const isUniversity = selectedLevel?.slug === 'university';

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a valid PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("PDF file must be less than 50MB");
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadFileToStorage = async (): Promise<string | null> => {
    if (!pdfFile) return null;

    setUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const fileExt = pdfFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("pdf-lectures")
        .upload(fileName, pdfFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setUploadProgress(70);

      const { data: urlData } = supabase.storage
        .from("pdf-lectures")
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return urlData.publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload PDF: " + error.message);
      return null;
    } finally {
      if (uploadProgress === 100) {
        setTimeout(() => setUploading(false), 500);
      } else {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleAr) {
      toast.error("Title (Arabic) is required");
      return;
    }

    if (!isEditMode && !pdfFile) {
      toast.error("Please select a PDF file to upload");
      return;
    }

    if (!selectedLevelId) {
      toast.error("Please select an educational level");
      return;
    }

    // Determine final teacher ID
    // Admin can select any teacher; teacher sees their own ID; override takes priority
    const finalTeacherId = teacherIdOverride || (userRole === 'admin' ? selectedTeacherId || null : (userRole === 'teacher' ? user?.id : null));
    
    if (!finalTeacherId) {
      toast.error(userRole === 'admin' ? "Please select a teacher" : "No teacher profile associated");
      return;
    }

    let uploadedUrl = initialData?.pdf_url || "";
    if (pdfFile) {
      const url = await uploadFileToStorage();
      if (!url) return;
      uploadedUrl = url;
    }

    const parsedPrice = parseFloat(price);
    const payload = {
      title: title || titleAr,
      title_ar: titleAr,
      description: null as null,
      description_ar: descriptionAr,
      pdf_url: uploadedUrl,
      thumbnail_url: null as null,
      price: isFree ? 0 : (isNaN(parsedPrice) ? 0 : parsedPrice),
      is_free: isFree,
      status: "published",
      educational_year_id: selectedYearId || null,
      subject_id: selectedSubjectId || null,
      department_id: selectedDepartmentId || null,
      teacher_id: finalTeacherId,
    };

    if (isEditMode && initialData) {
      updatePdf.mutate({ id: initialData.id, ...payload }, { onSuccess });
    } else {
      createPdf.mutate(payload, { onSuccess });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <CardTitle>{isEditMode ? 'تعديل المحاضرة' : 'إضافة محاضرة PDF جديدة'}</CardTitle>
        </div>
        <CardDescription>
          قم برفع ملف PDF وإضافته إلى التصنيف التعليمي المناسب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleAr">عنوان المحاضرة (بالعربية) *</Label>
                <Input
                  id="titleAr"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مذكرة المراجعة النهائية..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title (English) [اختياري]</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Final Revision Notes..."
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">الوصف (بالعربية)</Label>
              <Textarea
                id="descriptionAr"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="تفاصيل المحاضرة وما تحتويه..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isFree">نوع المحاضرة</Label>
                <Select value={isFree ? "free" : "paid"} onValueChange={(val) => setIsFree(val === "free")}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">مجانية</SelectItem>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (EGP)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required={!isFree}
                  />
                </div>
              )}
            </div>
            
            {/* Teacher Selection — Admin only */}
            {userRole === 'admin' && (
              <div className="space-y-2">
                <Label>المدرس *</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدرس" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 text-emerald-600">التصنيف التعليمي</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>المرحلة الدراسية *</Label>
                  <Select value={selectedLevelId} onValueChange={(val) => {
                    setSelectedLevelId(val);
                    setSelectedYearId("");
                    setSelectedSubjectId("");
                    setSelectedCollegeId("");
                    setSelectedDepartmentId("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels?.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name_ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isUniversity ? (
                  <>
                    <div className="space-y-2 animate-in fade-in">
                      <Label>الكلية</Label>
                      <Select value={selectedCollegeId} onValueChange={(val) => {
                        setSelectedCollegeId(val);
                        setSelectedDepartmentId("");
                      }} disabled={!selectedLevelId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الكلية" />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges?.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name_ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 animate-in fade-in">
                      <Label>التخصص / القسم</Label>
                      <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId} disabled={!selectedCollegeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name_ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : selectedLevelId && selectedLevel?.slug !== 'courses' ? (
                  <>
                    <div className="space-y-2 animate-in fade-in">
                      <Label>السنة الدراسية</Label>
                      <Select value={selectedYearId} onValueChange={(val) => {
                        setSelectedYearId(val);
                        setSelectedSubjectId("");
                      }} disabled={!selectedLevelId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          {years?.map(y => (
                            <SelectItem key={y.id} value={y.id}>{y.name_ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 animate-in fade-in">
                      <Label>المادة</Label>
                      <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!selectedYearId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name_ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>ملف المحاضرة (PDF) *</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
                {pdfFile ? (
                  <div className="flex items-center gap-4 w-full justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{pdfFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPdfFile(null)}
                      disabled={uploading}
                    >
                      <X className="h-5 w-5 hover:text-destructive transition-colors" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <Label htmlFor="pdf-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline font-medium">اضغط لاختيار ملف PDF</span>
                      <Input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePdfSelect}
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">Maximum file size: 50MB</p>
                  </div>
                )}
                {uploading && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>جاري الرفع...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploading || createPdf.isPending}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || isPending || (!isEditMode && !pdfFile)}
              className="gap-2"
            >
              {(uploading || isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? 'حفظ التعديلات' : 'حفظ ونشر المحاضرة'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
