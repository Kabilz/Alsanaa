import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Calendar, Search, FileText, ArrowDownRight, ArrowUpRight, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface CombinedTransaction {
  id: string;
  created_at: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'course_earning';
  service_name: string;
}

export function TeacherStatement() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txType, setTxType] = useState<"adjustment" | "withdrawal">("adjustment");
  const [txServiceName, setTxServiceName] = useState("");
  const [txAmount, setTxAmount] = useState("");

  // 1. Fetch Teachers
  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers-for-statement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, wallet_balance, profiles(full_name)");
      if (error) throw error;
      return data || [];
    },
  });

  // 2. Fetch Wallet Transactions and Earnings
  const { data: transactions, isLoading: isLoadingTxs, refetch: refetchTxs } = useQuery({
    queryKey: ["teacher-statement", selectedTeacherId, fromDate, toDate],
    queryFn: async () => {
      if (!selectedTeacherId || selectedTeacherId === "all") return [];
      
      let queryWallet = supabase.from("wallet_transactions").select("*").eq("teacher_id", selectedTeacherId);
      let queryEarnings = supabase.from("teacher_earnings").select("*").eq("teacher_id", selectedTeacherId);

      if (fromDate) {
        queryWallet = queryWallet.gte("created_at", new Date(fromDate).toISOString());
        queryEarnings = queryEarnings.gte("created_at", new Date(fromDate).toISOString());
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        queryWallet = queryWallet.lte("created_at", to.toISOString());
        queryEarnings = queryEarnings.lte("created_at", to.toISOString());
      }

      const [walletRes, earningsRes] = await Promise.all([queryWallet, queryEarnings]);

      if (walletRes.error) throw walletRes.error;
      if (earningsRes.error) throw earningsRes.error;

      const combined: CombinedTransaction[] = [];

      walletRes.data?.forEach(w => {
        combined.push({
          id: w.id,
          created_at: w.created_at,
          amount: w.amount,
          type: w.type === 'withdrawal' ? 'withdrawal' : 'deposit',
          service_name: w.description_ar || w.description || "عملية يدوية"
        });
      });

      earningsRes.data?.forEach(e => {
        combined.push({
          id: e.id,
          created_at: e.created_at,
          amount: e.amount,
          type: 'course_earning',
          service_name: "أرباح مبيعات دورات"
        });
      });

      return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: selectedTeacherId !== "all",
  });

  const selectedTeacher = teachers?.find(t => t.id === selectedTeacherId);

  const handleAddTransaction = async () => {
    if (!selectedTeacherId || selectedTeacherId === "all") {
      toast.error("الرجاء اختيار الأستاذ أولاً");
      return;
    }
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      toast.error("الرجاء إدخال قيمة صحيحة");
      return;
    }
    if (!txServiceName.trim()) {
      toast.error("الرجاء إدخال اسم الخدمة");
      return;
    }

    setIsAddingTx(true);
    try {
      const amount = Number(txAmount);
      
      // Update wallet balance in teachers table
      const currentBalance = selectedTeacher?.wallet_balance || 0;
      const newBalance = txType === 'adjustment' 
        ? currentBalance + amount 
        : currentBalance - amount;

      const { error: updateError } = await supabase
        .from('teachers')
        .update({ wallet_balance: newBalance } as any)
        .eq('id', selectedTeacherId);

      if (updateError) throw updateError;

      // Insert into wallet_transactions
      const { error: insertError } = await supabase
        .from('wallet_transactions')
        .insert({
          teacher_id: selectedTeacherId,
          amount: amount,
          type: txType,
          description_ar: txServiceName,
          description: txServiceName
        } as any);

      if (insertError) {
        // Rollback attempt
        await supabase.from('teachers').update({ wallet_balance: currentBalance } as any).eq('id', selectedTeacherId);
        throw insertError;
      }

      toast.success("تمت إضافة الحركة بنجاح");
      setTxAmount("");
      setTxServiceName("");
      setIsAddTxOpen(false);
      refetchTxs();
      
      // Mutate local teacher state immediately
      if (selectedTeacher) {
        selectedTeacher.wallet_balance = newBalance;
      }

    } catch (err) {
      console.error("Add Tx Error:", err);
      toast.error("حدث خطأ أثناء إضافة الحركة");
    } finally {
      setIsAddingTx(false);
    }
  };

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const headers = ["ت", "التاريخ", "اسم الاستاذ", "القيمة", "اسم الخدمة", "نوع الحركة"];
    const rows = transactions.map((tx, idx) => {
      const type = tx.type === 'course_earning' ? 'أرباح' : tx.type === 'deposit' ? 'إيداع' : 'صرف';
      const date = format(new Date(tx.created_at), "yyyy/MM/dd HH:mm");
      // Wrap strings in quotes to handle commas and Arabic correctly
      return [
        transactions.length - idx,
        `"${date}"`,
        `"${selectedTeacher?.profiles?.full_name || ""}"`,
        tx.amount,
        `"${tx.service_name}"`,
        `"${type}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statement_${selectedTeacher?.profiles?.full_name || "teacher"}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-slate-900/60 p-6 rounded-2xl border border-teal-900/30">
        <div className="w-full lg:w-1/3">
          <label className="block text-sm font-medium text-slate-400 mb-2">اختر الأستاذ</label>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 h-12 text-lg">
              <SelectValue placeholder="اختر المعلم..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- اختر المعلم لعرض كشف الحساب --</SelectItem>
              {teachers?.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.profiles?.full_name || "بدون اسم"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-2">من تاريخ</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
            <Input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="pl-3 pr-10 h-12 bg-slate-800/50 border-slate-700 [color-scheme:dark]" 
            />
          </div>
        </div>

        <div className="w-full lg:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-2">الى تاريخ</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
            <Input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="pl-3 pr-10 h-12 bg-slate-800/50 border-slate-700 [color-scheme:dark]" 
            />
          </div>
        </div>

        <div className="w-full lg:w-auto mt-4 lg:mt-0 flex-1 flex justify-end gap-2">
          <Button 
            onClick={exportToCSV}
            variant="outline"
            disabled={selectedTeacherId === "all" || !transactions?.length}
            className="h-12 px-4 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>

          <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={selectedTeacherId === "all"}
                className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 text-white font-bold"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة حركة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-teal-900/50" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-teal-400" style={{ fontFamily: "'Cairo', sans-serif" }}>إضافة حركة للمحفظة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">نوع الحركة</label>
                  <Select value={txType} onValueChange={(val: any) => setTxType(val)}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adjustment">إيداع (زيادة الرصيد)</SelectItem>
                      <SelectItem value="withdrawal">صرف (سحب من الرصيد)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">اسم الخدمة</label>
                  <Input 
                    placeholder="مثال: يسر باي، كاش، موبي كاش" 
                    value={txServiceName}
                    onChange={(e) => setTxServiceName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">القيمة (دينار)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
                <Button 
                  onClick={handleAddTransaction} 
                  disabled={isAddingTx}
                  className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white"
                >
                  {isAddingTx ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ الحركة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statement Table */}
      {selectedTeacherId !== "all" && (
        <Card className="bg-white text-slate-900 shadow-xl overflow-hidden border-0 rounded-xl" id="printable-statement">
          <CardHeader className="bg-slate-50 border-b pb-6 pt-8 px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center border border-teal-200">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    كشف حساب الاستاذ : {selectedTeacher?.profiles?.full_name || ""}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {fromDate || "بداية"} - {toDate || "اليوم"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm text-center min-w-[200px]">
                <p className="text-slate-500 text-sm font-bold mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-extrabold text-teal-600">
                  {formatCurrency(selectedTeacher?.wallet_balance || 0)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTxs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-slate-500 font-medium">جاري تحميل المعاملات...</p>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-100/50">
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">ت</TableHead>
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">التاريخ</TableHead>
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">اسم الاستاذ</TableHead>
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">القيمة</TableHead>
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">اسم الخدمة</TableHead>
                      <TableHead className="text-right text-slate-600 font-bold py-5 px-6">نوع الحركة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, idx) => (
                      <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell className="text-right font-medium text-slate-500 px-6 py-4">{transactions.length - idx}</TableCell>
                        <TableCell className="text-right text-slate-700 px-6 py-4" dir="ltr">
                          {format(new Date(tx.created_at), "yyyy/MM/dd HH:mm")}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-800 px-6 py-4">
                          {selectedTeacher?.profiles?.full_name || ""}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 px-6 py-4 text-lg">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 font-medium px-6 py-4">
                          {tx.service_name}
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          {tx.type === 'course_earning' ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-emerald-200">
                              <ArrowDownRight className="w-4 h-4" />
                              أرباح
                            </span>
                          ) : tx.type === 'deposit' ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-blue-200">
                              <ArrowDownRight className="w-4 h-4" />
                              إيداع
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-sm border border-rose-200">
                              <ArrowUpRight className="w-4 h-4" />
                              صرف
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 bg-slate-50/50">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-600">لا توجد حركات لهذا الأستاذ في هذه الفترة</p>
              </div>
            )}
            
            {/* Print Footer Summary */}
            <div className="bg-slate-100/50 border-t border-slate-200 p-8 flex justify-center items-center">
                <h3 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الرصيد المتاح: <span className="text-teal-600 ml-2">{formatCurrency(selectedTeacher?.wallet_balance || 0)}</span> دينار
                </h3>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTeacherId === "all" && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-teal-900/30 border-dashed">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-teal-500/50" />
          </div>
          <p className="text-slate-400 font-medium text-lg text-center max-w-md">
            الرجاء اختيار اسم المعلم من القائمة أعلاه لعرض كشف الحساب وتفاصيل الحركات
          </p>
        </div>
      )}
    </div>
  );
}
