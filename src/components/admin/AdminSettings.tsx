import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, Save, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AdminSettings() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [savingName, setSavingName] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.user_metadata?.full_name || "");
            setNewEmail(user.email || "");
        }
    }, [user]);

    const handleSaveName = async () => {
        if (!user || !displayName.trim()) return;
        setSavingName(true);
        try {
            const { error } = await supabase.from('profiles').update({ full_name: displayName.trim() }).eq('id', user.id);
            if (error) throw error;
            await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
            toast.success("تم تحديث الاسم بنجاح!");
        } catch (err: any) {
            toast.error(err.message || "فشل في تحديث الاسم");
        } finally {
            setSavingName(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!user || !newEmail.trim() || newEmail === user.email) return;
        setSavingEmail(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
            if (error) throw error;
            toast.success("تم إرسال رابط التحقق إلى بريدك الجديد. يرجى تأكيده.");
        } catch (err: any) {
            toast.error(err.message || "فشل في تحديث البريد الإلكتروني");
        } finally {
            setSavingEmail(false);
        }
    };

    const handleSavePassword = async () => {
        if (!newPassword || !confirmPassword) return;
        if (newPassword !== confirmPassword) { toast.error("كلمتا المرور غير متطابقتين"); return; }
        if (newPassword.length < 6) { toast.error("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل"); return; }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            toast.success("تم تغيير كلمة المرور بنجاح!");
        } catch (err: any) {
            toast.error(err.message || "فشل في تغيير كلمة المرور");
        } finally {
            setSavingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-4xl animate-slide-up" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <ShieldAlert className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white m-0" style={{ fontFamily: "'Cairo', sans-serif" }}>إعدادات حساب المسؤول</h2>
                    <p className="text-slate-400 text-sm mt-1">تحديث بيانات الدخول الخاصة بالمسؤول</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* ── Display Name ── */}
                    <Card className="bg-slate-900/40 border-teal-900/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <CardTitle className="text-lg text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                <User className="w-5 h-5 text-teal-400" />
                                الاسم المعروض
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-slate-400 text-xs mb-2 block">الاسم الحالي</Label>
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="أدخل اسمك الكامل"
                                        className="bg-slate-950/60 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveName}
                                    disabled={savingName || !displayName.trim()}
                                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium"
                                >
                                    {savingName ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                                    حفظ التغييرات
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Email ── */}
                    <Card className="bg-slate-900/40 border-indigo-900/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <CardTitle className="text-lg text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                <Mail className="w-5 h-5 text-indigo-400" />
                                البريد الإلكتروني
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-slate-400 text-xs mb-2 block">البريد الإلكتروني للوصول</Label>
                                    <Input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="البريد الإلكتروني الجديد"
                                        className="bg-slate-950/60 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                                        dir="ltr"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveEmail}
                                    disabled={savingEmail || !newEmail.trim() || newEmail === user.email}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                                >
                                    {savingEmail ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                                    تحديث البريد الإلكتروني
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* ── Password ── */}
                    <Card className="bg-slate-900/40 border-amber-900/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <CardHeader className="pb-4 border-b border-slate-800/50">
                            <CardTitle className="text-lg text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                <Lock className="w-5 h-5 text-amber-400" />
                                تغيير كلمة المرور
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-slate-400 text-xs mb-2 block">كلمة المرور الجديدة</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-slate-950/60 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500/20"
                                        dir="ltr"
                                    />
                                    <p className="text-slate-500 text-[11px] mt-1.5 pr-1">يجب أن تتكون من 6 أحرف على الأقل.</p>
                                </div>
                                <div>
                                    <Label className="text-slate-400 text-xs mb-2 block">تأكيد كلمة المرور</Label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`bg-slate-950/60 border-slate-700 text-white focus:ring-amber-500/20 ${
                                            confirmPassword && newPassword !== confirmPassword
                                                ? "border-red-500 focus:border-red-500"
                                                : "focus:border-amber-500"
                                        }`}
                                        dir="ltr"
                                    />
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-red-400 text-[11px] mt-1.5 pr-1">كلمتا المرور غير متطابقتين</p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleSavePassword}
                                    disabled={savingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium mt-2"
                                >
                                    {savingPassword ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Lock className="ml-2 h-4 w-4" />}
                                    تغيير كلمة المرور
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
