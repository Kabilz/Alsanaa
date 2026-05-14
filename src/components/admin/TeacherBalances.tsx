import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Search, Wallet, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TeacherBalance {
  id: string;
  teacher_earnings: number | null;
  profiles: {
    full_name: string | null;
    wallet_balance: number | null;
  } | null;
}

export function TeacherBalances() {
  const [teachers, setTeachers] = useState<TeacherBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeacherBalances();
  }, []);

  const fetchTeacherBalances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teachers')
      .select('id, wallet_balance, profiles(full_name, wallet_balance)')
      .order('wallet_balance', { ascending: false });

    if (error) {
      console.error("Error fetching teacher balances:", error);
      toast.error("فشل في تحميل أرصدة المعلمين");
    } else {
      // Map wallet_balance from teachers table as teacher_earnings
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        teacher_earnings: t.wallet_balance,
        profiles: t.profiles,
      }));
      setTeachers(mapped);
    }
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(teacher =>
    !searchTerm || teacher.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
              أرصدة المعلمين
            </CardTitle>
            <p className="text-slate-400 text-sm">رصيد الحساب الشخصي وأرباح التدريس لكل معلم</p>
          </div>
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="بحث باسم المعلم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-9 w-full bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-lg focus-visible:ring-teal-500"
            />
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
                  <TableHead className="text-right text-teal-400 py-4">اسم المعلم</TableHead>
                  <TableHead className="text-right text-teal-400 py-4">
                    <div className="flex items-center gap-1.5">
                      <span>أرباح التدريس</span>
                      <TrendingUp className="h-3.5 w-3.5" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center text-slate-500 bg-slate-900/20">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-slate-600 mb-2" />
                        <p>{searchTerm ? "لا يوجد معلم بهذا الاسم" : "لا يوجد معلمين حالياً"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="text-right font-medium text-white py-4">
                        {teacher.profiles?.full_name || "اسم غير محدد"}
                      </TableCell>
                      {/* Teacher Earnings */}
                      <TableCell className="text-right py-4">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 font-bold px-3 py-1 rounded-lg border border-emerald-800/40">
                          <TrendingUp className="h-3.5 w-3.5 opacity-70" />
                          {formatCurrency(teacher.teacher_earnings || 0)}
                        </span>
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
