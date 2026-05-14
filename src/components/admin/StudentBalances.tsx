import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Search, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface StudentBalance {
  id: string;
  full_name: string | null;
  wallet_balance: number | null;
  max_wallet_balance?: number | null;
}

export function StudentBalances() {
  const [students, setStudents] = useState<StudentBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit limit state
  const [editingStudent, setEditingStudent] = useState<StudentBalance | null>(null);
  const [newMaxLimit, setNewMaxLimit] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  // Bulk edit limit state
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkMaxLimit, setBulkMaxLimit] = useState("");
  const [savingBulkLimit, setSavingBulkLimit] = useState(false);

  useEffect(() => {
    fetchStudentBalances();
  }, []);

  const fetchStudentBalances = async () => {
    setLoading(true);
    // Fetch profiles where role = 'customer' (students)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, wallet_balance, max_wallet_balance')
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

  const filteredStudents = students.filter(student => 
    !searchTerm || student.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditLimit = (student: StudentBalance) => {
    setEditingStudent(student);
    setNewMaxLimit(student.max_wallet_balance ? student.max_wallet_balance.toString() : "");
  };

  const handleSaveLimit = async () => {
    if (!editingStudent) return;
    setSavingLimit(true);
    
    // If empty string, set to null (fallback to global limit)
    const val = newMaxLimit.trim() === "" ? null : parseFloat(newMaxLimit);
    
    if (val !== null && (isNaN(val) || val < 0)) {
        toast.error("يرجى إدخال مبلغ صحيح (أو اتركه فارغاً لاستخدام الحد العام)");
        setSavingLimit(false);
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ max_wallet_balance: val } as any)
      .eq('id', editingStudent.id);

    if (error) {
      toast.error("فشل في تحديث الحد الأقصى");
    } else {
      toast.success("تم تحديث الحد الأقصى بنجاح");
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, max_wallet_balance: val } : s));
      setEditingStudent(null);
    }
    setSavingLimit(false);
  };

  const handleBulkSaveLimit = async () => {
    setSavingBulkLimit(true);
    
    // If empty string, set to null (fallback to global limit)
    const val = bulkMaxLimit.trim() === "" ? null : parseFloat(bulkMaxLimit);
    
    if (val !== null && (isNaN(val) || val < 0)) {
        toast.error("يرجى إدخال مبلغ صحيح (أو اتركه فارغاً لاستخدام الحد العام)");
        setSavingBulkLimit(false);
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ max_wallet_balance: val } as any)
      .eq('role', 'customer');

    if (error) {
      toast.error("فشل في تحديث الحد الأقصى للجميع");
    } else {
      toast.success("تم تحديث الحد الأقصى لجميع الطلاب بنجاح");
      setStudents(students.map(s => ({ ...s, max_wallet_balance: val })));
      setIsBulkEditing(false);
      setBulkMaxLimit("");
    }
    setSavingBulkLimit(false);
  };

  return (
    <>
    <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>أرصدة الطلاب</CardTitle>
            <p className="text-slate-400 text-sm">إدارة وعرض أرصدة الطلاب والحدود القصوى</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
                onClick={() => setIsBulkEditing(true)}
                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50"
            >
                <Users className="w-4 h-4 ml-2" />
                تعديل الحد للجميع
            </Button>
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="بحث باسم الطالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-9 w-full bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-lg focus-visible:ring-teal-500"
              />
            </div>
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
                  <TableHead className="text-right text-teal-400 py-4 w-1/3">اسم الطالب</TableHead>
                  <TableHead className="text-right text-teal-400 py-4 w-1/4">رصيد المحفظة</TableHead>
                  <TableHead className="text-right text-teal-400 py-4 w-1/4">الحد الأقصى للرصيد</TableHead>
                  <TableHead className="text-left text-teal-400 py-4 w-auto">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500 bg-slate-900/20">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Users className="h-8 w-8 text-slate-600 mb-2" />
                         <p>{searchTerm ? "لا يوجد طالب بهذا الاسم" : "لا يوجد طلاب حالياً"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="text-right font-medium text-white py-4">
                        {student.full_name || "اسم غير محدد"}
                      </TableCell>
                      <TableCell className="text-right text-emerald-400 font-bold py-4">
                        {formatCurrency(student.wallet_balance || 0)}
                      </TableCell>
                      <TableCell className="text-right text-slate-300 py-4">
                        {student.max_wallet_balance !== null && student.max_wallet_balance !== undefined ? (
                          <span className="font-bold text-amber-400">{formatCurrency(student.max_wallet_balance)}</span>
                        ) : (
                          <span className="text-slate-500 text-sm italic">الافتراضي (حسب النظام)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-left py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLimit(student)}
                          className="hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 ml-1" />
                          تعديل الحد
                        </Button>
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

    <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="bg-slate-900 border-teal-900/50 text-white sm:max-w-md" dir="rtl">
            <DialogHeader className="text-right">
                <DialogTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    تعديل الحد الأقصى للرصيد
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-1">
                    الطالب: <strong className="text-slate-200">{editingStudent?.full_name || "غير محدد"}</strong>
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 block">الحد الأقصى (اتركه فارغاً لاستخدام الحد العام للنظام):</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">د.ل</span>
                        <Input
                            type="number"
                            placeholder="مثال: 200 (أو اترك فارغاً)"
                            value={newMaxLimit}
                            onChange={(e) => setNewMaxLimit(e.target.value)}
                            className="pl-12 bg-slate-950 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 text-left"
                            min="0"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>
            
            <DialogFooter className="gap-3 sm:gap-2 flex-col sm:flex-row">
                <Button
                    variant="outline"
                    onClick={() => setEditingStudent(null)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
                >
                    إلغاء
                </Button>
                <Button
                    onClick={handleSaveLimit}
                    disabled={savingLimit}
                    className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold w-full sm:w-auto shadow-lg shadow-teal-500/20"
                >
                    {savingLimit ? (
                        <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</>
                    ) : (
                        "حفظ التغييرات"
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isBulkEditing} onOpenChange={(open) => !open && setIsBulkEditing(false)}>
        <DialogContent className="bg-slate-900 border-amber-900/50 text-white sm:max-w-md" dir="rtl">
            <DialogHeader className="text-right">
                <DialogTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    تعديل الحد الأقصى لجميع الطلاب
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-1">
                    سيتم تطبيق هذا الحد على <strong className="text-amber-400">جميع الطلاب</strong> في النظام.
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 block">الحد الأقصى (اتركه فارغاً لاستخدام الحد العام للنظام):</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">د.ل</span>
                        <Input
                            type="number"
                            placeholder="مثال: 200 (أو اترك فارغاً)"
                            value={bulkMaxLimit}
                            onChange={(e) => setBulkMaxLimit(e.target.value)}
                            className="pl-12 bg-slate-950 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500/20 text-left"
                            min="0"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>
            
            <DialogFooter className="gap-3 sm:gap-2 flex-col sm:flex-row">
                <Button
                    variant="outline"
                    onClick={() => setIsBulkEditing(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
                >
                    إلغاء
                </Button>
                <Button
                    onClick={handleBulkSaveLimit}
                    disabled={savingBulkLimit}
                    className="bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold w-full sm:w-auto shadow-lg shadow-amber-500/20"
                >
                    {savingBulkLimit ? (
                        <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</>
                    ) : (
                        "تطبيق للجميع"
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
