import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Download, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface PrepaidCard {
  id: string;
  serial_number: string;
  secret_code: string;
  value: number;
  status: string;
  used_by_user_id: string | null;
  used_at: string | null;
  created_at: string;
}

export function CardManagement() {
  const [cards, setCards] = useState<PrepaidCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [cardValue, setCardValue] = useState("100");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prepaid_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching cards:", error);
      toast.error("فشل في تحميل بيانات البطاقات");
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  const generateCards = async () => {
    setGenerating(true);
    const qty = parseInt(quantity);
    const value = parseFloat(cardValue);

    if (isNaN(qty) || qty < 1 || qty > 100) {
      toast.error("كمية غير صالحة (1-100)");
      setGenerating(false);
      return;
    }

    if (isNaN(value) || value < 1) {
      toast.error("قيمة البطاقة غير صالحة");
      setGenerating(false);
      return;
    }

    const newCards = [];
    for (let i = 0; i < qty; i++) {
      const serial = `AC-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const secret = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      newCards.push({
        serial_number: serial,
        secret_code: secret,
        value: value,
        status: 'active'
      });
    }

    const { error } = await supabase
      .from('prepaid_cards')
      .insert(newCards);

    if (error) {
      console.error("Error generating cards:", error);
      toast.error("فشل في إنشاء البطاقات");
    } else {
      toast.success(`تم بنجاح إنشاء ${qty} بطاقة / بطاقات`);
      setOpenDialog(false);
      fetchCards();
    }

    setGenerating(false);
  };

  const exportToCSV = () => {
    const csv = [
      ['الرقم التسلسلي', 'الكود السري', 'القيمة', 'الحالة', 'تاريخ الإنشاء'].join(','),
      ...cards.map(card => [
        card.serial_number,
        card.secret_code,
        card.value,
        translateStatus(card.status),
        new Date(card.created_at).toLocaleDateString('ar-EG')
      ].join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `البطاقات_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("تم تصدير البطاقات إلى ملف CSV");
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'used': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'active': return 'فعالة';
      case 'used': return 'مستخدمة';
      case 'expired': return 'منتهية';
      default: return status;
    }
  };

  return (
    <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <CreditCard className="w-6 h-6 text-cyan-400" />
             </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إدارة البطاقات</CardTitle>
              <CardDescription className="text-slate-400">إنشاء وإدارة بطاقات الدفع المسبق لشحن محافظ المستخدمين وشراء الدورات</CardDescription>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={exportToCSV} 
              disabled={cards.length === 0} 
              className="flex-1 md:flex-none border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير CSV
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 md:flex-none bg-gradient-to-l from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold shadow-lg shadow-cyan-500/20">
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء بطاقات
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-900 border-teal-900/50 text-right" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>إنشاء بطاقات دفع مسبق</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    أدخل القيمة والعدد لإنشاء بطاقات شحن جديدة.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="value" className="text-slate-300">قيمة البطاقة</Label>
                    <Input
                      id="value"
                      type="number"
                      value={cardValue}
                      onChange={(e) => setCardValue(e.target.value)}
                      placeholder="100"
                      className="bg-slate-800/50 border-slate-700 text-white text-left placeholder:text-slate-500"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-slate-300">الكمية (1-100)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                      min="1"
                      max="100"
                      className="bg-slate-800/50 border-slate-700 text-white text-left placeholder:text-slate-500"
                      dir="ltr"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setOpenDialog(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    إلغاء
                  </Button>
                  <Button onClick={generateCards} disabled={generating} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                    {generating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    إنشاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-cyan-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-slate-400 font-medium font-cairo">جاري تحميل أرقام البطاقات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الرقم التسلسلي</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الكود السري</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">القيمة</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الحالة</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      لم يتم إنشاء أي بطاقات بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  cards.map((card) => (
                    <TableRow key={card.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-mono text-slate-300 text-left" dir="ltr">{card.serial_number}</TableCell>
                      <TableCell className="font-mono font-bold text-cyan-400 text-left" dir="ltr">{card.secret_code}</TableCell>
                      <TableCell className="font-semibold text-emerald-400" dir="ltr" style={{ textAlign: "right" }}>{formatCurrency(card.value)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(card.status)} className="px-3 py-1 font-semibold">
                          {translateStatus(card.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(card.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
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
