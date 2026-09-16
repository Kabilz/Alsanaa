import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X, Eye, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function BankTransfersAdmin() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const fetchPendingTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles(full_name, phone, wallet_balance)
        `)
        .eq("payment_service", "حوالة مصرفية")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error: any) {
      toast.error("فشل في جلب الحوالات المصرفية");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx: any) => {
    setProcessingId(tx.id);
    try {
      // 1. Get current balance
      const currentBalance = tx.profiles?.wallet_balance || 0;
      const newBalance = currentBalance + tx.amount;

      // 2. Update wallet balance
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance } as any)
        .eq("id", tx.user_id);

      if (profileError) throw profileError;

      // 3. Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: "completed" } as any)
        .eq("id", tx.id);

      if (txError) throw txError;

      toast.success("تم الموافقة وإضافة الرصيد بنجاح");
      fetchPendingTransfers();
    } catch (error: any) {
      toast.error("حدث خطأ أثناء الموافقة");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (txId: string) => {
    setProcessingId(txId);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "rejected" } as any)
        .eq("id", txId);

      if (error) throw error;

      toast.success("تم رفض الحوالة");
      fetchPendingTransfers();
    } catch (error: any) {
      toast.error("حدث خطأ أثناء الرفض");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-12 text-center border border-teal-900/30">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <FileWarning className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
          لا توجد حوالات معلقة
        </h3>
        <p className="text-slate-400">جميع طلبات الحوالات المصرفية تم معالجتها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900/60 rounded-2xl p-6 border border-teal-900/30">
        <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          الحوالات المصرفية المعلقة
        </h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-right text-slate-400">الطالب</TableHead>
                <TableHead className="text-right text-slate-400">التاريخ</TableHead>
                <TableHead className="text-right text-slate-400">المبلغ</TableHead>
                <TableHead className="text-right text-slate-400">الإيصال</TableHead>
                <TableHead className="text-right text-slate-400">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((tx) => (
                <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{tx.profiles?.full_name || "مستخدم غير معروف"}</p>
                      <p className="text-sm text-slate-400">{tx.profiles?.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(tx.created_at).toLocaleDateString('ar-LY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-teal-400">{tx.amount} د.ل</span>
                  </TableCell>
                  <TableCell>
                    {tx.receipt_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(tx.receipt_url)}
                        className="bg-slate-950 border-slate-700 text-slate-300 hover:text-white"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض الإيصال
                      </Button>
                    ) : (
                      <span className="text-rose-400 text-sm">لا يوجد مرفق</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(tx)}
                        disabled={processingId === tx.id}
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900"
                      >
                        {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 ml-1" />}
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(tx.id)}
                        disabled={processingId === tx.id}
                        variant="outline"
                        className="border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white"
                      >
                        {processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 ml-1" />}
                        رفض
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="bg-slate-900 border-teal-900/50 text-white max-w-2xl">
          <DialogHeader className="text-right">
            <DialogTitle style={{ fontFamily: "'Cairo', sans-serif" }}>إيصال الحوالة</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex justify-center mt-4 bg-slate-950/50 rounded-xl p-4">
              <img 
                src={selectedReceipt} 
                alt="إيصال الحوالة" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg border border-slate-800"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
