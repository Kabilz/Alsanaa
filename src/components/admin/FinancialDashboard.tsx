import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Calendar, Wallet } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  user_id: string | null;
  course_id: string | null;
  amount: number;
  payment_method: string | null;
  payment_service: string | null;
  status: string;
  created_at: string;
  courses?: any;
  profiles?: {
    full_name: string | null;
    full_name_ar: string | null;
  } | null;
}

interface Stats {
  total_revenue: number;
  total_transactions: number;
  pending_transactions: number;
}

export function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({ total_revenue: 0, total_transactions: 0, pending_transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: transactionsData, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        courses (title),
        profiles (full_name, full_name_ar)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transError) {
      console.error("Error fetching transactions:", transError);
      toast.error("فشل في تحميل بيانات المعاملات المالية");
    } else {
      setTransactions(transactionsData || []);

      const total = transactionsData?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const pending = transactionsData?.filter(t => t.status === 'pending').length || 0;

      setStats({
        total_revenue: total,
        total_transactions: transactionsData?.length || 0,
        pending_transactions: pending
      });
    }

    setLoading(false);
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'قيد الانتظار';
      case 'failed': return 'مرفوضة';
      default: return status;
    }
  };
  
  const translateMethod = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'wallet': return 'المحفظة';
      case 'card': return 'بطاقة ائتمان';
      default: return method;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-emerald-500/20" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-300">إجمالي الإيرادات</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
               <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.total_revenue)}</div>
            <p className="text-xs text-slate-500 mt-1">من المعاملات المكتملة</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-cyan-500/20" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-300">إجمالي المعاملات</CardTitle>
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
               <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white">{stats.total_transactions}</div>
            <p className="text-xs text-slate-500 mt-1">في كل الأوقات</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-amber-500/20" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-300">قيد الانتظار</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
               <Calendar className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-amber-400">{stats.pending_transactions}</div>
            <p className="text-xs text-slate-500 mt-1">في انتظار الاكتمال</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <Wallet className="w-6 h-6 text-teal-400" />
             </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>المعاملات الأخيرة</CardTitle>
              <CardDescription className="text-slate-400">أحدث المعاملات المالية المنفذة على المنصة</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 text-teal-500">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p className="text-slate-400 font-medium font-cairo">جاري تحميل المعاملات...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-right text-slate-400 font-semibold py-4">الدورة</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold py-4">الطالب</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold py-4">المبلغ</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold py-4">طريقة الدفع</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold py-4">الحالة</TableHead>
                    <TableHead className="text-right text-slate-400 font-semibold py-4">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        لا توجد معاملات متاحة حالياً
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <TableCell className="font-medium text-slate-200 py-4">
                          {(transaction.courses as any)?.title || 'غير محدد'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {(transaction.profiles as any)?.full_name || 
                           (transaction.profiles as any)?.full_name_ar || 
                           'عميل غير معروف'}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-400" dir="ltr" style={{ textAlign: "right" }}>
                           {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {translateMethod(transaction.payment_method || '') || 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.status)} className="px-3 py-1 font-semibold">
                            {translateStatus(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(transaction.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
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
    </div>
  );
}
