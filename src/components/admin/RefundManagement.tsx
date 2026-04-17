import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Search, RotateCcw, ReceiptText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  user_id: string | null;
  course_id: string | null;
  pdf_id: string | null;
  amount: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  refunded_at: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  courses?: { title: string } | null;
  profiles?: { full_name: string | null } | null;
}

interface RefundState {
  open: boolean;
  transaction: Transaction | null;
  type: "full" | "partial";
  amount: string;
  reason: string;
  loading: boolean;
}

export function RefundManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refund, setRefund] = useState<RefundState>({
    open: false,
    transaction: null,
    type: "full",
    amount: "",
    reason: "",
    loading: false,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id, user_id, course_id, pdf_id, amount, payment_method, status,
        created_at, refunded_at, refund_amount, refund_reason,
        courses (title),
        profiles (full_name)
      `)
      .in("status", ["completed", "refunded"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error loading transactions:", error);
      toast.error("فشل في تحميل المعاملات");
    } else {
      setTransactions((data as any) || []);
    }
    setLoading(false);
  };

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (t.profiles as any)?.full_name?.toLowerCase().includes(term) ||
      (t.courses as any)?.title?.toLowerCase().includes(term)
    );
  });

  const openRefundDialog = (t: Transaction) => {
    setRefund({
      open: true,
      transaction: t,
      type: "full",
      amount: String(t.amount),
      reason: "",
      loading: false,
    });
  };

  const handleTypeChange = (v: "full" | "partial") => {
    setRefund((r) => ({
      ...r,
      type: v,
      amount: v === "full" ? String(r.transaction?.amount ?? "") : "",
    }));
  };

  const handleConfirmRefund = async () => {
    if (!refund.transaction) return;
    const t = refund.transaction;
    const refundAmt = parseFloat(refund.amount);

    if (!refund.reason.trim()) {
      toast.error("يرجى إدخال سبب الاسترداد");
      return;
    }
    if (isNaN(refundAmt) || refundAmt <= 0 || refundAmt > t.amount) {
      toast.error(`يجب أن يكون المبلغ بين 0 و ${formatCurrency(t.amount)}`);
      return;
    }

    setRefund((r) => ({ ...r, loading: true }));

    try {
      // 1. Update transaction status
      const { error: txErr } = await supabase
        .from("transactions")
        .update({
          status: "refunded",
          refunded_at: new Date().toISOString(),
          refund_amount: refundAmt,
          refund_reason: refund.reason.trim(),
        })
        .eq("id", t.id);
      if (txErr) throw txErr;

      // 2. Restore student wallet balance
      if (t.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", t.user_id)
          .single();

        const currentBal = (profile?.wallet_balance as number) || 0;
        const { error: walletErr } = await supabase
          .from("profiles")
          .update({ wallet_balance: currentBal + refundAmt })
          .eq("id", t.user_id);
        if (walletErr) throw walletErr;
      }

      // 3. Deactivate course/PDF access on ANY refund
      if (t.course_id && t.user_id) {
        const { error: courseErr } = await supabase
          .from("course_purchases")
          .update({ is_active: false })
          .eq("user_id", t.user_id)
          .eq("course_id", t.course_id);
        if (courseErr) console.warn("Could not deactivate course purchase:", courseErr);
        else console.log("Course purchase deactivated for user:", t.user_id, "course:", t.course_id);
      }

      if (t.pdf_id && t.user_id) {
        const { error: pdfErr } = await supabase
          .from("pdf_purchases")
          .update({ is_active: false })
          .eq("user_id", t.user_id)
          .eq("pdf_id", t.pdf_id);
        if (pdfErr) console.warn("Could not deactivate pdf purchase:", pdfErr);
        else console.log("PDF purchase deactivated for user:", t.user_id, "pdf:", t.pdf_id);
      }

      // 4. Find & reverse teacher earnings proportionally
      const { data: earningsRows } = await supabase
        .from("teacher_earnings")
        .select("id, amount, teacher_id")
        .eq("transaction_id", t.id);

      if (earningsRows && earningsRows.length > 0) {
        const ratio = refundAmt / t.amount;
        for (const earning of earningsRows) {
          const deductAmt = Number(earning.amount) * ratio;
          // Mark earning as refunded
          await supabase
            .from("teacher_earnings")
            .update({ status: "refunded" })
            .eq("id", earning.id);
          // Deduct from teacher wallet
          const { data: teacherRow } = await supabase
            .from("teachers")
            .select("wallet_balance")
            .eq("id", earning.teacher_id)
            .single();
          const newBal = Math.max(0, (Number(teacherRow?.wallet_balance) || 0) - deductAmt);
          await supabase
            .from("teachers")
            .update({ wallet_balance: newBal })
            .eq("id", earning.teacher_id);
        }
      }

      toast.success(`تم استرداد ${formatCurrency(refundAmt)} بنجاح`);
      setRefund({ open: false, transaction: null, type: "full", amount: "", reason: "", loading: false });
      fetchTransactions();
    } catch (err: any) {
      console.error("Refund error:", err);
      toast.error("فشل في إتمام الاسترداد: " + (err.message || "خطأ غير معروف"));
      setRefund((r) => ({ ...r, loading: false }));
    }
  };

  return (
    <>
      <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl" dir="rtl">
        <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <RotateCcw className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  إدارة الاسترداد
                </CardTitle>
                <CardDescription className="text-slate-400 mt-0.5">
                  استرداد كامل أو جزئي للمعاملات المكتملة
                </CardDescription>
              </div>
            </div>
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="بحث باسم الطالب أو الدورة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 w-full bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-lg focus-visible:ring-rose-500"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 overflow-x-auto p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
              <p className="text-slate-400">جاري تحميل المعاملات...</p>
            </div>
          ) : (
            <div className="rounded-none overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-slate-800/60">
                    <TableHead className="text-right text-teal-400 py-4 px-6">الطالب</TableHead>
                    <TableHead className="text-right text-teal-400 py-4">الدورة / المذكرة</TableHead>
                    <TableHead className="text-right text-teal-400 py-4">المبلغ</TableHead>
                    <TableHead className="text-right text-teal-400 py-4">المُسترد</TableHead>
                    <TableHead className="text-right text-teal-400 py-4">الحالة</TableHead>
                    <TableHead className="text-right text-teal-400 py-4">التاريخ</TableHead>
                    <TableHead className="text-right text-teal-400 py-4 px-6">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-36 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <ReceiptText className="h-8 w-8 text-slate-700 mb-1" />
                          <p>{search ? "لا توجد نتائج لهذا البحث" : "لا توجد معاملات مكتملة"}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <TableCell className="font-medium text-white py-4 px-6">
                          {(t.profiles as any)?.full_name || "غير معروف"}
                        </TableCell>
                        <TableCell className="text-slate-300 py-4 max-w-[180px] truncate">
                          {(t.courses as any)?.title || (t.pdf_id ? "مذكرة PDF" : "—")}
                        </TableCell>
                        <TableCell className="text-emerald-400 font-bold py-4">
                          {formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell className="py-4">
                          {t.refund_amount != null ? (
                            <span className="text-rose-400 font-semibold">
                              {formatCurrency(t.refund_amount)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {t.status === "refunded" ? (
                            <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3">
                              مُسترد
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3">
                              مكتملة
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm py-4">
                          {new Date(t.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {t.status === "refunded" ? (
                            <span className="text-xs text-slate-600 italic">{t.refund_reason || "تم الاسترداد"}</span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openRefundDialog(t)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 gap-1.5 font-semibold transition-colors"
                              variant="outline"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              استرداد
                            </Button>
                          )}
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

      {/* ─── Refund Dialog ──────────────────────────────── */}
      <Dialog
        open={refund.open}
        onOpenChange={(o) => !refund.loading && setRefund((r) => ({ ...r, open: o }))}
      >
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <RotateCcw className="h-5 w-5 text-rose-400" />
              تفاصيل الاسترداد
            </DialogTitle>
          </DialogHeader>

          {refund.transaction && (
            <div className="space-y-5 py-2">
              {/* Summary */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">الطالب</span>
                  <span className="text-white font-medium">
                    {(refund.transaction.profiles as any)?.full_name || "غير معروف"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الدورة</span>
                  <span className="text-white font-medium truncate max-w-[200px]">
                    {(refund.transaction.courses as any)?.title || "مذكرة PDF"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ الكلي</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(refund.transaction.amount)}</span>
                </div>
              </div>

              {/* Refund Type */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">نوع الاسترداد</Label>
                <RadioGroup
                  value={refund.type}
                  onValueChange={(v) => handleTypeChange(v as "full" | "partial")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 cursor-pointer flex-1 hover:border-teal-600/50 transition-colors">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="cursor-pointer text-slate-200">
                      استرداد كامل
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 cursor-pointer flex-1 hover:border-teal-600/50 transition-colors">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="cursor-pointer text-slate-200">
                      استرداد جزئي
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Amount — only editable for partial */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">
                  مبلغ الاسترداد
                  {refund.type === "full" && (
                    <span className="text-slate-500 font-normal mr-2 text-xs">(الكامل)</span>
                  )}
                </Label>
                <Input
                  type="number"
                  min={0.01}
                  max={refund.transaction.amount}
                  step={0.01}
                  value={refund.amount}
                  disabled={refund.type === "full"}
                  onChange={(e) => setRefund((r) => ({ ...r, amount: e.target.value }))}
                  className="bg-slate-800/60 border-slate-700 text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-rose-500"
                  placeholder="أدخل مبلغ الاسترداد"
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">
                  سبب الاسترداد <span className="text-rose-400">*</span>
                </Label>
                <Textarea
                  value={refund.reason}
                  onChange={(e) => setRefund((r) => ({ ...r, reason: e.target.value }))}
                  placeholder="مثال: طلب العميل، مشكلة في المحتوى..."
                  rows={3}
                  className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none focus-visible:ring-rose-500"
                />
              </div>

              {/* Warning for partial */}
              {refund.type === "partial" && (
                <div className="flex gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>الاسترداد الجزئي يُعيد المبلغ المحدد فقط ولا يلغي صلاحية الوصول للدورة.</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRefund((r) => ({ ...r, open: false }))}
              disabled={refund.loading}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmRefund}
              disabled={refund.loading}
              className="flex-1 bg-rose-500/80 hover:bg-rose-500 text-white font-bold gap-2"
            >
              {refund.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {refund.loading ? "جاري المعالجة..." : "تأكيد الاسترداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
