import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useEducationalYears,
  useCreateEducationalYear,
  useUpdateEducationalYear,
  useDeleteEducationalYear,
  EducationalYearPayload,
} from "@/hooks/useHierarchy";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Hash,
  BookOpen,
  Languages,
  ArrowRight,
} from "lucide-react";

// ── Arabic → Latin transliteration map ─────────────────────────────────────
const AR_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "e", آ: "aa",
  ب: "b", ت: "t", ث: "th", ج: "j",
  ح: "h", خ: "kh", د: "d", ذ: "dh",
  ر: "r", ز: "z", س: "s", ش: "sh",
  ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q",
  ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y", ى: "a",
  ة: "a", ء: "", ئ: "y", ؤ: "w",
  " ": "-",
};

function autoSlug(arabic: string, english: string): string {
  if (english && english.trim()) {
    return english
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  const transliterated = arabic
    .trim()
    .split("")
    .map((ch) => AR_MAP[ch] ?? "")
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return transliterated || "year";
}

// ───────────────────────────────────────────────────────────────────────────

interface YearRow {
  id: string;
  name_ar: string;
  name: string | null;
  slug: string;
  order_index: number | null;
}

interface FormState {
  name_ar: string;
  name: string;
  order_index: string;
}

const EMPTY_FORM: FormState = { name_ar: "", name: "", order_index: "" };

interface EducationalYearsManagerProps {
  levelId: string;
  levelName: string;
  onBack: () => void;
}

export function EducationalYearsManager({ levelId, levelName, onBack }: EducationalYearsManagerProps) {
  const { data: years, isLoading } = useEducationalYears(levelId);
  const createYear = useCreateEducationalYear();
  const updateYear = useUpdateEducationalYear();
  const deleteYear = useDeleteEducationalYear();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<YearRow | null>(null);
  const [yearToDelete, setYearToDelete] = useState<YearRow | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [nameArError, setNameArError] = useState("");

  const previewSlug = autoSlug(form.name_ar, form.name);

  useEffect(() => {
    if (form.name_ar) setNameArError("");
  }, [form.name_ar]);

  const openAddDialog = () => {
    setEditingYear(null);
    setForm(EMPTY_FORM);
    setNameArError("");
    setDialogOpen(true);
  };

  const openEditDialog = (year: YearRow) => {
    setEditingYear(year);
    setForm({
      name_ar: year.name_ar,
      name: year.name ?? "",
      order_index: year.order_index != null ? String(year.order_index) : "",
    });
    setNameArError("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (year: YearRow) => {
    setYearToDelete(year);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) {
      setNameArError("الاسم العربي مطلوب");
      return;
    }

    const nextOrderIndex = (years && years.length > 0)
      ? Math.max(...years.map(y => y.order_index ?? 0)) + 1
      : 1;

    const payload: EducationalYearPayload = {
      level_id: levelId,
      name_ar: form.name_ar.trim(),
      name: form.name.trim() || "",
      slug: previewSlug,
      order_index: form.order_index ? parseInt(form.order_index) : nextOrderIndex,
    };

    if (editingYear) {
      await updateYear.mutateAsync({ id: editingYear.id, ...payload });
    } else {
      await createYear.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!yearToDelete) return;
    await deleteYear.mutateAsync({ id: yearToDelete.id, levelId });
    setDeleteDialogOpen(false);
    setYearToDelete(null);
  };

  const isMutating = createYear.isPending || updateYear.isPending;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-teal-900/30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <BookOpen className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-white mb-1 flex items-center gap-2"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              السنوات الدراسية <span className="text-teal-500">•</span> {levelName}
            </h2>
            <p className="text-slate-400 text-sm">
              إدارة الصفوف والسنوات الدراسية التابعة لهذه المرحلة.
            </p>
          </div>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-6 h-12 shrink-0"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة سنة جديدة
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-teal-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-slate-400 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
              جاري تحميل السنوات...
            </span>
          </div>
        ) : !years?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-5 bg-slate-800/60 rounded-full border border-slate-700">
              <BookOpen className="w-12 h-12 text-slate-600" />
            </div>
            <p className="text-slate-500 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
              لا توجد سنوات دراسية لهذه المرحلة بعد. ابدأ بإضافة أول سنة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-800/70 bg-slate-900/60">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    الاسم بالعربية
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    الاسم بالإنجليزية
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    المعرّف
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell text-center">
                    الترتيب
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {years.map((year) => (
                  <tr
                    key={year.id}
                    className="group hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20 shrink-0">
                          <BookOpen className="w-4 h-4 text-teal-400" />
                        </div>
                        <span
                          className="font-semibold text-white"
                          style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                          {year.name_ar}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-slate-400 text-sm" dir="ltr">
                        {year.name || <span className="italic text-slate-600">—</span>}
                      </span>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded-md border border-slate-700 font-mono" dir="ltr">
                        {year.slug}
                      </code>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold">
                        {year.order_index ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(year as YearRow)}
                          className="h-9 w-9 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20 transition-all"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(year as YearRow)}
                          className="h-9 w-9 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="حذف"
                          disabled={deleteYear.isPending}
                        >
                          {deleteYear.isPending && yearToDelete?.id === year.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-slate-900 border-slate-700/60 text-white shadow-2xl max-w-lg"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              {editingYear ? "تعديل السنة الدراسية" : "إضافة سنة دراسية جديدة"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingYear
                ? "عدّل بيانات السنة ثم اضغط على حفظ."
                : "أدخل اسم السنة الجديدة ثم اضغط على إضافة."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Languages className="w-4 h-4 text-teal-400" />
                اسم السنة بالعربية <span className="text-rose-400">*</span>
              </Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: الصف الأول"
                className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
              {nameArError && (
                <p className="text-xs text-rose-400">{nameArError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-500" />
                اسم السنة بالإنجليزية{" "}
                <span className="text-slate-500 text-xs">(اختياري — يُحسّن المعرّف التلقائي)</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="First Grade"
                dir="ltr"
                className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                الترتيب في القائمة{" "}
                <span className="text-slate-500 text-xs">(اختياري)</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.order_index}
                onChange={(e) => setForm((f) => ({ ...f, order_index: e.target.value }))}
                placeholder="1"
                dir="ltr"
                className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500/50 w-28"
              />
            </div>

            {(form.name_ar || form.name) && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-500 shrink-0" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  المعرّف التلقائي:
                </span>
                <code className="text-xs text-cyan-400 font-mono bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700" dir="ltr">
                  {previewSlug}
                </code>
              </div>
            )}

            <DialogFooter className="gap-3 pt-2 flex-row-reverse sm:flex-row-reverse justify-start">
              <Button
                type="submit"
                disabled={isMutating}
                className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-8"
              >
                {isMutating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </span>
                ) : editingYear ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة السنة"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isMutating}
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className="bg-slate-900 border-slate-700/60 text-white shadow-2xl"
          dir="rtl"
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <AlertDialogTitle
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                تأكيد الحذف
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 pr-11">
              هل أنت متأكد من حذف السنة{" "}
              <span className="font-bold text-rose-400">
                "{yearToDelete?.name_ar}"
              </span>
              ؟
              <br />
              <span className="text-xs mt-2 block bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-rose-300">
                ⚠️ سيؤدي هذا إلى حذف الدورات والمواد المرتبطة بهذه السنة.
                لا يمكن التراجع عن هذا الإجراء.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row-reverse sm:flex-row-reverse justify-start">
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white border-0 px-8 font-bold"
            >
              {deleteYear.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </span>
              ) : (
                "نعم، احذف السنة"
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 bg-transparent">
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
