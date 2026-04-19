import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Search, Filter, Loader2, Banknote, Receipt } from "lucide-react";
import { toast } from "sonner";

export const RevenueStatement = () => {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");

    const { data: revenues, isLoading } = useQuery({
        queryKey: ["admin-revenues", dateFrom, dateTo, serviceFilter],
        queryFn: async () => {
            let query = supabase
                .from("transactions")
                .select(`
                    id, amount, payment_service, created_at, status,
                    profiles(id, full_name, phone)
                `)
                .eq("payment_method", "topup")
                .order("created_at", { ascending: false });

            if (dateFrom) {
                query = query.gte("created_at", new Date(dateFrom).toISOString());
            }
            if (dateTo) {
                const endOfDay = new Date(dateTo);
                endOfDay.setHours(23, 59, 59, 999);
                query = query.lte("created_at", endOfDay.toISOString());
            }
            if (serviceFilter !== "all") {
                query = query.eq("payment_service", serviceFilter);
            }

            const { data, error } = await query;
            if (error) {
                console.error("Error fetching revenues:", error);
                toast.error("فشل في تحميل بيانات الإيرادات");
                return [];
            }
            return data;
        }
    });

    const totalRevenue = revenues?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    const downloadReport = () => {
        if (!revenues || revenues.length === 0) {
            toast.error("لا توجد بيانات لتنزيلها");
            return;
        }

        const headers = ["رقم الحركة", "التاريخ", "القيمة", "اسم الخدمة", "اسم الطالب", "رقم الهاتف", "الحالة"];
        const rows = revenues.map(tx => [
            tx.id,
            new Date(tx.created_at).toLocaleDateString('ar-EG'),
            tx.amount.toString(),
            tx.payment_service || 'غير محدد',
            tx.profiles?.full_name || 'غير محدد',
            tx.profiles?.phone || 'غير محدد',
            tx.status === 'completed' ? 'مكتملة' : tx.status
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `كشف_الإيرادات_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>كشف الإيرادات</h2>
                        <p className="text-slate-400 text-sm mt-1">تتبع الأموال التي تم شحنها للمنصة عبر بوابات الدفع</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div>
                        <p className="text-slate-400 text-xs mb-1">إجمالي الإيرادات (المفلترة)</p>
                        <p className="text-3xl font-black text-emerald-400">
                            {totalRevenue.toFixed(2)} <span className="text-sm text-slate-500">د.ل</span>
                        </p>
                    </div>
                    <Button onClick={downloadReport} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" disabled={isLoading || !revenues?.length}>
                        <FileDown className="ml-2 h-4 w-4" />
                        تنزيل (Excel)
                    </Button>
                </div>
            </div>

            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-slate-400 font-medium">من تاريخ</label>
                            <Input 
                                type="date" 
                                value={dateFrom} 
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-slate-400 font-medium">إلى تاريخ</label>
                            <Input 
                                type="date" 
                                value={dateTo} 
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-slate-400 font-medium">بوابة الدفع (اسم المصرف)</label>
                            <Select value={serviceFilter} onValueChange={setServiceFilter} dir="rtl">
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                    <SelectValue placeholder="الكل" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="موبي كاش">موبي كاش</SelectItem>
                                    <SelectItem value="مصرفي بلس">مصرفي بلس</SelectItem>
                                    <SelectItem value="يسر باي">يسر باي</SelectItem>
                                    <SelectItem value="ادفع لي">ادفع لي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(dateFrom || dateTo || serviceFilter !== "all") && (
                            <Button 
                                variant="outline" 
                                onClick={() => { setDateFrom(""); setDateTo(""); setServiceFilter("all"); }}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                <Filter className="ml-2 h-4 w-4" />
                                مسح الفلاتر
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-900/80 text-slate-400 text-sm border-b border-slate-800">
                                <tr>
                                    <th className="p-4 font-medium whitespace-nowrap">رقم الحركة</th>
                                    <th className="p-4 font-medium whitespace-nowrap">التاريخ</th>
                                    <th className="p-4 font-medium whitespace-nowrap">اسم الطالب</th>
                                    <th className="p-4 font-medium whitespace-nowrap">بوابة الدفع</th>
                                    <th className="p-4 font-medium whitespace-nowrap">القيمة</th>
                                    <th className="p-4 font-medium whitespace-nowrap">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> جاري التحميل...</td></tr>
                                ) : revenues && revenues.length > 0 ? (
                                    revenues.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors text-slate-300">
                                            <td className="p-4 text-xs font-mono text-slate-500">{tx.id.split('-')[0]}</td>
                                            <td className="p-4 whitespace-nowrap text-sm" dir="ltr">{new Date(tx.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-200">{tx.profiles?.full_name || 'غير محدد'}</div>
                                                <div className="text-xs text-slate-500">{tx.profiles?.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                    {tx.payment_service || 'غير محدد'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-emerald-400 whitespace-nowrap">{tx.amount.toFixed(2)} د.ل</td>
                                            <td className="p-4">
                                                {tx.status === 'completed' ? (
                                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">مكتملة</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">{tx.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-16 text-center text-slate-500">
                                            <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                <Search className="h-8 w-8 text-slate-600" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-400">لا توجد إيرادات مسجلة</p>
                                            <p className="text-sm mt-1">حاول تغيير فلاتر البحث أو النطاق الزمني</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
