import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Plus, ExternalLink, Trash2, Pencil, Eye, Download } from "lucide-react";
import { usePdfLectures, useDeletePdfLecture, PdfLecture } from "@/hooks/usePdfLectures";
import { PdfForm } from "@/components/PdfForm";
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
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";

export function AdminPdfs() {
  const [isAddingPdf, setIsAddingPdf] = useState(false);
  const [editingPdf, setEditingPdf] = useState<PdfLecture | null>(null);
  const { data: pdfs, isLoading: loadingPdfs } = usePdfLectures();
  const deletePdf = useDeletePdfLecture();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (isAddingPdf) {
    return (
      <div className="bg-slate-900/40 rounded-3xl p-6 border border-teal-900/30 shadow-xl overflow-hidden relative" dir="rtl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800/50 pb-4 relative z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>إضافة مذكرة جديدة</h2>
        <div className="relative z-10">
          <PdfForm 
            onSuccess={() => setIsAddingPdf(false)} 
            onCancel={() => setIsAddingPdf(false)} 
          />
        </div>
      </div>
    );
  }

  if (editingPdf) {
    return (
      <div className="bg-slate-900/40 rounded-3xl p-6 border border-teal-900/30 shadow-xl overflow-hidden relative" dir="rtl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800/50 pb-4 relative z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>تعديل المذكرة: {editingPdf.title_ar || editingPdf.title}</h2>
        <div className="relative z-10">
          <PdfForm
            initialData={editingPdf}
            onSuccess={() => setEditingPdf(null)}
            onCancel={() => setEditingPdf(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-teal-900/30">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>المذكرات (PDF)</h2>
          <p className="text-slate-400 text-sm">
            إدارة جميع ملفات ومذكرات الـ PDF المنشورة على المنصة.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddingPdf(true)} 
          className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-6 h-12 w-full sm:w-auto shrink-0"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة مذكرة PDF
        </Button>
      </div>

      <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/50">
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="p-0">
            {loadingPdfs ? (
              <div className="flex justify-center flex-col items-center py-16 text-teal-500">
                <Loader2 className="animate-spin h-10 w-10 mb-4" />
                <p className="text-slate-400 font-medium font-cairo">جاري تحميل المذكرات...</p>
              </div>
            ) : !pdfs || pdfs.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-800/50 border border-slate-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد مذكرات</h3>
                <p className="text-slate-400">لم يتم العثور على أي ملفات PDF. ابدأ بإضافة مذكرات جديدة للمنصة.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {pdfs.map((pdf) => (
                  <div 
                    key={pdf.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-teal-500/30 hover:bg-slate-800/50 transition-all duration-300 group"
                  >
                    <div className="flex-1 mb-6 lg:mb-0">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 shrink-0">
                           <FileText className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-white group-hover:text-teal-400 transition-colors" style={{ fontFamily: "'Cairo', sans-serif" }}>
                              {isAr ? (pdf.title_ar || pdf.title) : (pdf.title || pdf.title_ar)}
                           </h3>
                           
                           <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-3">
                             <div className="flex items-center gap-1.5 text-sm font-semibold">
                                {pdf.is_free ? (
                                   <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">مجاني</span>
                                ) : (
                                   <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{formatCurrency(pdf.price)}</span>
                                )}
                             </div>
                             
                             <div className="flex items-center gap-1.5 text-sm text-slate-400">
                               <Eye className="w-4 h-4 text-slate-500" />
                               <span>{pdf.view_count} مشاهدة</span>
                             </div>
                             
                             <div className="flex items-center gap-1.5 text-sm text-slate-400">
                               <Download className="w-4 h-4 text-slate-500" />
                               <span>{pdf.download_count} تحميل</span>
                             </div>
                             
                             {pdf.teacher && (
                               <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                  <span className="text-slate-500">بواسطة:</span>
                                  <span className="font-semibold">{pdf.teacher.profiles?.full_name || pdf.teacher.profiles?.full_name_ar || 'غير معروف'}</span>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto border-t border-slate-800 pt-4 lg:pt-0 lg:border-t-0 p-1 lg:p-0">
                      <Badge variant={pdf.status === 'published' ? 'default' : 'secondary'} className={`px-3 py-1 font-semibold ${pdf.status === 'published' ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' : 'bg-slate-700'}`}>
                        {pdf.status === 'published' ? 'منشور' : 'مسودة'}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                         <Button 
                           variant="outline" 
                           size="icon" 
                           onClick={() => window.open(pdf.pdf_url, "_blank")}
                           className="h-10 w-10 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 rounded-lg"
                           title="عرض الملف"
                         >
                           <ExternalLink className="h-4 w-4" />
                         </Button>
                         
                         <Button 
                           variant="outline" 
                           size="icon" 
                           onClick={() => setEditingPdf(pdf)} 
                           className="h-10 w-10 border-slate-700 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 rounded-lg"
                           title="تعديل"
                         >
                           <Pencil className="h-4 w-4" />
                         </Button>
                         
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button 
                               variant="outline" 
                               size="icon"
                               className="h-10 w-10 border-slate-700 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-lg"
                               title="حذف"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="bg-slate-900 border-rose-900/50 text-right" dir="rtl">
                             <AlertDialogHeader>
                               <AlertDialogTitle className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>هل أنت متأكد تماماً من الحذف؟</AlertDialogTitle>
                               <AlertDialogDescription className="text-slate-400">
                                 سوف يتم حذف مذكرة "{isAr ? (pdf.title_ar || pdf.title) : (pdf.title || pdf.title_ar)}" بشكل نهائي من النظام بكل بياناتها المرتبطة. لا يمكن التراجع عن هذا الإجراء أبداً.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                               <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">تراجع</AlertDialogCancel>
                               <AlertDialogAction 
                                 onClick={() => deletePdf.mutate(pdf.id)}
                                 className="bg-rose-600 hover:bg-rose-700 text-white"
                               >
                                 حذف نهائياً
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
