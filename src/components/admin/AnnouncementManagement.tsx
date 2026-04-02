import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  title_ar: string | null;
  content: string;
  content_ar: string | null;
  target_audience: string;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
}

export function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    content: "",
    content_ar: "",
    target_audience: "all",
    is_active: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      toast.error("فشل في تحميل الإعلانات");
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title && !formData.title_ar) {
      toast.error("يرجى إدخال العنوان");
      return;
    }
    if (!formData.content && !formData.content_ar) {
      toast.error("يرجى إدخال المحتوى");
      return;
    }

    const payload = {
      ...formData,
      published_at: formData.is_active ? new Date().toISOString() : null
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('announcements')
        .insert([payload]));
    }

    if (error) {
      console.error("Error saving announcement:", error);
      toast.error("فشل في حفظ الإعلان");
    } else {
      toast.success(editingId ? "تم تحديث الإعلان" : "تم إنشاء الإعلان");
      setOpenDialog(false);
      resetForm();
      fetchAnnouncements();
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      title_ar: announcement.title_ar || "",
      content: announcement.content,
      content_ar: announcement.content_ar || "",
      target_audience: announcement.target_audience,
      is_active: announcement.is_active
    });
    setEditingId(announcement.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting announcement:", error);
      toast.error("فشل في حذف الإعلان");
    } else {
      toast.success("تم حذف الإعلان بنجاح");
      fetchAnnouncements();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_ar: "",
      content: "",
      content_ar: "",
      target_audience: "all",
      is_active: true
    });
    setEditingId(null);
  };

  const translateAudience = (audience: string) => {
    switch (audience) {
      case 'all': return 'الجميع';
      case 'students': return 'الطلاب فقط';
      case 'teachers': return 'المعلمين فقط';
      default: return audience;
    }
  };

  return (
    <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                <Megaphone className="w-6 h-6 text-fuchsia-400" />
             </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إدارة الإعلانات</CardTitle>
              <CardDescription className="text-slate-400">إنشاء وإدارة إعلانات المنصة الموجهة للطلاب والمعلمين</CardDescription>
            </div>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-l from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white font-bold shadow-lg shadow-fuchsia-500/20 px-6">
                <Plus className="ml-2 h-4 w-4" />
                إعلان جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-slate-900 border-teal-900/50 text-right" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{editingId ? "تعديل إعلان" : "إنشاء إعلان جديد"}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  قم بصياغة الإعلان باللغتين ليظهر بشكل صحيح للمستخدمين.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="title_ar" className="text-slate-300">العنوان (عربي) *</Label>
                     <Input
                       id="title_ar"
                       value={formData.title_ar}
                       onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                       placeholder="عنوان الإعلان بالعربية..."
                       className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                       dir="rtl"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="title" className="text-slate-300">العنوان (إنجليزي)</Label>
                     <Input
                       id="title"
                       value={formData.title}
                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                       placeholder="Announcement title in English..."
                       className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                       dir="ltr"
                     />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="content_ar" className="text-slate-300">المحتوى (عربي) *</Label>
                     <Textarea
                       id="content_ar"
                       value={formData.content_ar}
                       onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                       placeholder="تفاصيل الإعلان بالعربية..."
                       className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                       dir="rtl"
                       rows={5}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="content" className="text-slate-300">المحتوى (إنجليزي)</Label>
                     <Textarea
                       id="content"
                       value={formData.content}
                       onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                       placeholder="Announcement details in English..."
                       className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                       dir="ltr"
                       rows={5}
                     />
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                   <div className="space-y-2 flex-1 w-full">
                     <Label htmlFor="target" className="text-slate-300">الجمهور المستهدف</Label>
                     <Select
                       value={formData.target_audience}
                       onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                     >
                       <SelectTrigger id="target" className="w-full bg-slate-800 border-slate-700 text-slate-200">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-slate-800 border-slate-700">
                         <SelectItem value="all" className="focus:bg-slate-700">جميع المستخدمين</SelectItem>
                         <SelectItem value="students" className="focus:bg-slate-700">الطلاب فقط</SelectItem>
                         <SelectItem value="teachers" className="focus:bg-slate-700">المعلمين فقط</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex items-center space-x-2 space-x-reverse flex-1 pt-2 sm:pt-6">
                     <Switch
                       id="active"
                       checked={formData.is_active}
                       onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                       className="data-[state=checked]:bg-fuchsia-500"
                     />
                     <Label htmlFor="active" className="text-slate-300 cursor-pointer">حالة الإعلان (نشط ليظهر للمستخدمين)</Label>
                   </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-800 pt-4 mt-2">
                <Button variant="outline" onClick={() => { setOpenDialog(false); resetForm(); }} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  إلغاء
                </Button>
                <Button onClick={handleSubmit} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                  {editingId ? "تحديث التغييرات" : "نشر الإعلان"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-fuchsia-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-slate-400 font-medium font-cairo">جاري تحميل الإعلانات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-right text-slate-400 font-semibold py-4 w-1/3">العنوان</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الجمهور</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الحالة</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">تاريخ النشر</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      لا يوجد إعلانات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-semibold text-slate-200 py-4">
                         {announcement.title_ar || announcement.title}
                      </TableCell>
                      <TableCell className="text-slate-400">
                         {translateAudience(announcement.target_audience)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.is_active ? "default" : "secondary"} className={`px-2 py-1 ${announcement.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}>
                          {announcement.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(announcement.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
