import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface StudentBalance {
  id: string;
  full_name: string | null;
  wallet_balance: number | null;
}

export function StudentBalances() {
  const [students, setStudents] = useState<StudentBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentBalances();
  }, []);

  const fetchStudentBalances = async () => {
    setLoading(true);
    // Fetch profiles where role = 'customer' (students)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, wallet_balance')
      .eq('role', 'customer')
      .order('wallet_balance', { ascending: false });

    if (error) {
      console.error("Error fetching student balances:", error);
      toast.error("فشل في تحميل أرصدة الطلاب");
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>أرصدة الطلاب</CardTitle>
            <p className="text-slate-400 text-sm">عرض مبسط لأسماء الطلاب وأرصدة محافظهم الحالية</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-slate-400 font-medium font-cairo">جاري تحميل الأرصدة...</p>
          </div>
        ) : (
          <div className="rounded-xl border border-teal-900/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/80">
                <TableRow className="border-teal-900/30">
                  <TableHead className="text-right text-teal-400 py-4 w-1/2">اسم الطالب</TableHead>
                  <TableHead className="text-right text-teal-400 py-4 w-1/2">رصيد المحفظة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-right font-medium text-white py-4">
                      {student.full_name || "اسم غير محدد"}
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-bold py-4">
                      {formatCurrency(student.wallet_balance || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center text-slate-500 bg-slate-900/20">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Users className="h-8 w-8 text-slate-600 mb-2" />
                         <p>لا يوجد طلاب حالياً</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
