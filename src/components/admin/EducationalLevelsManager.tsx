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
  useEducationalLevels,
  useCreateEducationalLevel,
  useUpdateEducationalLevel,
  useDeleteEducationalLevel,
  EducationalLevelPayload,
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
  List,
} from "lucide-react";
import { EducationalYearsManager } from "./EducationalYearsManager";

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
  // Prefer English name if provided
  if (english && english.trim()) {
    return english
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  // Transliterate Arabic
  const transliterated = arabic
    .trim()
    .split("")
    .map((ch) => AR_MAP[ch] ?? "")
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return transliterated || "level";
}

// ───────────────────────────────────────────────────────────────────────────

interface LevelRow {
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

export function EducationalLevelsManager() {
  const { data: levels, isLoading } = useEducationalLevels();
  const createLevel = useCreateEducationalLevel();
  const updateLevel = useUpdateEducationalLevel();
  const deleteLevel = useDeleteEducationalLevel();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelRow | null>(null);
  const [levelToDelete, setLevelToDelete] = useState<LevelRow | null>(null);
  const [selectedLevelForYears, setSelectedLevelForYears] = useState<LevelRow | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [nameArError, setNameArError] = useState("");

  // Derived live slug preview
  const previewSlug = autoSlug(form.name_ar, form.name);

  // Reset error when name changes
  useEffect(() => {
    if (form.name_ar) setNameArError("");
  }, [form.name_ar]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAddDialog = () => {
    setEditingLevel(null);
    setForm(EMPTY_FORM);
    setNameArError("");
    setDialogOpen(true);
  };

  const openEditDialog = (level: LevelRow) => {
    setEditingLevel(level);
    setForm({
      name_ar: level.name_ar,
      name: level.name ?? "",
      order_index: level.order_index != null ? String(level.order_index) : "",
    });
    setNameArError("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (level: LevelRow) => {
    setLevelToDelete(level);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) {
      setNameArError("الاسم العربي مطلوب");
      return;
    }

    const nextOrderIndex = (levels && levels.length > 0)
      ? Math.max(...levels.map(l => l.order_index ?? 0)) + 1
      : 1;

    const payload: EducationalLevelPayload = {
      name_ar: form.name_ar.trim(),
      name: form.name.trim() || "",
      slug: previewSlug,
      order_index: form.order_index ? parseInt(form.order_index) : nextOrderIndex,
    };

    if (editingLevel) {
      await updateLevel.mutateAsync({ id: editingLevel.id, ...payload });
    } else {
      await createLevel.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!levelToDelete) return;
    await deleteLevel.mutateAsync(levelToDelete.id);
    setDeleteDialogOpen(false);
    setLevelToDelete(null);
  };

  const isMutating = createLevel.isPending || updateLevel.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (selectedLevelForYears) {
    return (
      <EducationalYearsManager 
        levelId={selectedLevelForYears.id} 
        levelName={selectedLevelForYears.name_ar} 
        onBack={() => setSelectedLevelForYears(null)} 
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-teal-900/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <GraduationCap className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              إدارة المراحل الدراسية
            </h2>
            <p className="text-slate-400 text-sm">
              أضف وعدّل وأحذف المراحل التي تظهر في قوائم اختيار الدورات والمذكرات.
            </p>
          </div>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-6 h-12 shrink-0"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة مرحلة جديدة
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-teal-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-slate-400 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
              جاري تحميل المراحل...
            </span>
          </div>
        ) : !levels?.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-5 bg-slate-800/60 rounded-full border border-slate-700">
              <GraduationCap className="w-12 h-12 text-slate-600" />
            </div>
            <p className="text-slate-500 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
              لا توجد مراحل دراسية بعد. ابدأ بإضافة أول مرحلة.
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
                {levels.map((level) => (
                  <tr
                    key={level.id}
                    className="group hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    {/* Arabic Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20 shrink-0">
                          <GraduationCap className="w-4 h-4 text-teal-400" />
                        </div>
                        <span
                          className="font-semibold text-white"
                          style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                          {level.name_ar}
                        </span>
                      </div>
                    </td>

                    {/* English Name */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-slate-400 text-sm" dir="ltr">
                        {level.name || <span className="italic text-slate-600">—</span>}
                      </span>
                    </td>

                    {/* Slug (read-only display) */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded-md border border-slate-700 font-mono" dir="ltr">
                        {level.slug}
                      </code>
                    </td>

                    {/* Order */}
                    <td className="px-6 py-4 hidden lg:table-cell text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold">
                        {level.order_index ?? "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLevelForYears(level as LevelRow)}
                          className="h-9 w-9 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                          title="إدارة السنوات"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(level as LevelRow)}
                          className="h-9 w-9 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20 transition-all"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(level as LevelRow)}
                          className="h-9 w-9 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="حذف"
                          disabled={deleteLevel.isPending}
                        >
                          {deleteLevel.isPending && levelToDelete?.id === level.id ? (
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

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl">
        <BookOpen className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
          المراحل المضافة هنا ستظهر تلقائيًا في قائمة اختيار المرحلة عند إضافة الدورات والمذكرات PDF.
        </p>
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
              {editingLevel ? "تعديل المرحلة الدراسية" : "إضافة مرحلة دراسية جديدة"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingLevel
                ? "عدّل بيانات المرحلة ثم اضغط على حفظ."
                : "أدخل اسم المرحلة الجديدة ثم اضغط على إضافة."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Arabic Name */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Languages className="w-4 h-4 text-teal-400" />
                اسم المرحلة بالعربية <span className="text-rose-400">*</span>
              </Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: المرحلة الابتدائية"
                className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
              {nameArError && (
                <p className="text-xs text-rose-400">{nameArError}</p>
              )}
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-500" />
                اسم المرحلة بالإنجليزية{" "}
                <span className="text-slate-500 text-xs">(اختياري — يُحسّن المعرّف التلقائي)</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Elementary"
                dir="ltr"
                className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>

            {/* Order Index */}
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

            {/* Auto-generated slug preview */}
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
                ) : editingLevel ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة المرحلة"
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
              هل أنت متأكد من حذف المرحلة{" "}
              <span className="font-bold text-rose-400">
                "{levelToDelete?.name_ar}"
              </span>
              ؟
              <br />
              <span className="text-xs mt-2 block bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-rose-300">
                ⚠️ سيؤدي هذا إلى حذف جميع السنوات الدراسية والمواد المرتبطة بها.
                لا يمكن التراجع عن هذا الإجراء.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 flex-row-reverse sm:flex-row-reverse justify-start">
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white border-0 px-8 font-bold"
            >
              {deleteLevel.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </span>
              ) : (
                "نعم، احذف المرحلة"
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
