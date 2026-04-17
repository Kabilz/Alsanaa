import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SiteSettings() {
  const [maxWalletBalance, setMaxWalletBalance] = useState<string>("100");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "max_wallet_balance")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setMaxWalletBalance(data.value);
      }
    } catch (err: any) {
      console.error("Error fetching site settings:", err);
      toast.error("فشل في تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const numValue = parseFloat(maxWalletBalance);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة وموجبة");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "max_wallet_balance", 
          value: numValue.toString() 
        }, { onConflict: "key" });

      if (error) throw error;
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (err: any) {
      console.error("Error saving site settings:", err);
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-teal-900/40 shadow-xl" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
              إعدادات النظام
            </CardTitle>
            <p className="text-slate-400 text-sm">
              قم بإدارة الإعدادات العامة للمنصة من هنا
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <Settings className="w-6 h-6 text-teal-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-slate-400 font-medium font-cairo">جاري تحميل الإعدادات...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 h-full"></div>
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
                الحد الأقصى لرصيد الطالب
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                حدد الحد الأقصى للمبلغ الذي يمكن للطالب شحنه في محفظته. هذا يمنع الطلاب من إضافة أرصدة تتجاوز القيمة المحددة.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                  <Input
                    type="number"
                    value={maxWalletBalance}
                    onChange={(e) => setMaxWalletBalance(e.target.value)}
                    placeholder="مثال: 100"
                    className="pl-12 bg-slate-950/60 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 text-lg"
                    dir="ltr"
                    min="1"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">د.ل</span>
                </div>
                
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !maxWalletBalance}
                  className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 w-full sm:w-auto h-11 px-8"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 ml-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
