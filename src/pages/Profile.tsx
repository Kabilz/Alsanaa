import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Settings, CreditCard, Plus, Award, Loader2, Camera, User, Mail, Lock, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const Profile = () => {
    const { user, userRole } = useAuth();
    const { t } = useTranslation();
    const [balance, setBalance] = useState<number>(0);
    const [isAddingBalance, setIsAddingBalance] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(25);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [globalMaxWalletBalance, setGlobalMaxWalletBalance] = useState<number | null>(null);
    const [userMaxWalletBalance, setUserMaxWalletBalance] = useState<number | null>(null);

    // ── Settings state ──
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [savingName, setSavingName] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const formatRole = (role: string) => {
        switch(role) {
            case 'admin': return 'مسؤول النظام';
            case 'teacher': return 'معلم';
            case 'customer': return 'طالب';
            default: return 'مستخدم';
        }
    };

    const fetchBalance = async () => {
        if (!user) return;

        // Fetch settings
        try {
            const { data: settingsData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'max_wallet_balance')
                .maybeSingle();
            if (settingsData && settingsData.value) {
                setGlobalMaxWalletBalance(parseFloat(settingsData.value));
            }
        } catch (err) {
            console.error("Error fetching site settings:", err);
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('wallet_balance, full_name, avatar_url, max_wallet_balance')
            .eq('id', user.id)
            .maybeSingle();

        if (error) { console.error('Error fetching user profile:', error); return; }

        if (!data) {
            await supabase.from('profiles')
                .insert({ id: user.id, role: 'customer', wallet_balance: 0 } as any)
                .select().maybeSingle();
            setBalance(0);
            return;
        }

        setBalance((data as any).wallet_balance ?? 0);
        setDisplayName((data as any).full_name ?? user.user_metadata?.full_name ?? "");
        setAvatarUrl((data as any).avatar_url ?? user.user_metadata?.avatar_url ?? "");
        setNewEmail(user.email ?? "");
        setUserMaxWalletBalance((data as any).max_wallet_balance ?? null);
    };

    useEffect(() => { fetchBalance(); }, [user]);

    // ── Handlers ──
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        if (file.size > 2 * 1024 * 1024) { toast.error("حجم الصورة يجب أن يكون أقل من 2 ميغابايت"); return; }

        setUploadingAvatar(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `avatars/${user.id}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
            await supabase.from('profiles').update({ avatar_url: publicUrl } as any).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            setAvatarUrl(publicUrl);
            toast.success("تم تحديث الصورة الشخصية بنجاح!");
        } catch (err: any) {
            toast.error(err.message || "فشل في رفع الصورة");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveName = async () => {
        if (!user || !displayName.trim()) return;
        setSavingName(true);
        try {
            const { error } = await supabase.from('profiles').update({ full_name: displayName.trim() } as any).eq('id', user.id);
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

    const handleAddBalance = async () => {
        const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
        if (!amount || amount <= 0) { toast.error("يرجى إدخال مبلغ صحيح"); return; }
        if (!user) return;

        const effectiveMaxLimit = userMaxWalletBalance !== null ? userMaxWalletBalance : globalMaxWalletBalance;

        if (effectiveMaxLimit !== null && (balance + amount) > effectiveMaxLimit) {
            toast.error(`لا يمكن أن يتجاوز الرصيد الحد الأقصى المسموح به (${effectiveMaxLimit} د.ل)`);
            return;
        }

        setIsAddingBalance(true);
        try {
            const newBalance = balance + amount;
            const { error } = await supabase.from('profiles')
                .upsert({ id: user.id, wallet_balance: newBalance } as any, { onConflict: 'id' })
                .eq('id', user.id);
            if (error) throw error;
            setBalance(newBalance);
            toast.success(`تم إضافة ${amount.toFixed(2)} د.ل إلى محفظتك بنجاح!`);
            setDialogOpen(false); setCustomAmount(""); setSelectedAmount(25);
        } catch (err) {
            toast.error("فشل في شحن الرصيد. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsAddingBalance(false);
        }
    };

    const { data: purchasedCourses, isLoading } = useQuery({
        queryKey: ["purchased-courses", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("course_purchases")
                .select(`*, course:courses(*)`)
                .eq("user_id", user.id)
                .eq("is_active", true);
            if (error) { console.error("Error fetching purchased courses:", error); return []; }
            return data;
        },
        enabled: !!user,
    });

    if (!user) {
        return <Layout><div className="container py-24 text-center text-slate-400 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>يرجى تسجيل الدخول للوصول إلى ملفك الشخصي...</div></Layout>;
    }

    const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* ═════════════════════════════════════════════════
                        SIDEBAR
                    ═════════════════════════════════════════════════ */}
                    <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-6">
                        <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CardHeader className="text-center pb-4 relative z-10">
                                {/* Avatar with upload overlay */}
                                <div className="relative w-28 h-28 mx-auto mb-4">
                                    <Avatar className="h-28 w-28 border-4 border-slate-900 ring-2 ring-teal-500/50 shadow-xl shadow-teal-500/10">
                                        <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-gradient-to-br from-teal-900 to-slate-800 text-teal-300 text-3xl font-bold">
                                            {user.email?.[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 hover:bg-teal-400 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-slate-900"
                                    >
                                        {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 text-slate-900 animate-spin" /> : <Camera className="h-3.5 w-3.5 text-slate-900" />}
                                    </button>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </div>
                                <CardTitle className="text-2xl text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    {displayName || user.user_metadata?.full_name || "مستخدم جديد"}
                                </CardTitle>
                                <div className="inline-flex items-center justify-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm px-3 py-1 rounded-full mb-2">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>{formatRole(userRole || 'customer')}</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">{user.email}</p>
                            </CardHeader>
                            <CardContent className="relative z-10 px-6 pb-8">
                                <div className="bg-gradient-to-br from-teal-900/40 to-slate-800/60 rounded-2xl p-5 border border-teal-800/30 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-teal-500/20 rounded-lg shrink-0">
                                            <CreditCard className="h-5 w-5 text-teal-400" />
                                        </div>
                                        <span className="text-slate-300 text-sm font-medium">{t('profile.wallet_balance')}</span>
                                    </div>
                                    <div className="text-4xl font-extrabold text-white mb-1 flex items-baseline gap-1">
                                        <span className="text-xl text-teal-500">د.ل</span>
                                        {balance.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-5">الرصيد المتاح حالياً</p>
                                    <div className="relative z-50">
                                        <Button
                                            onClick={() => setDialogOpen(true)}
                                            className="w-full bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                                        >
                                            <Plus className="ml-2 h-4 w-4" />
                                            {t('profile.add_balance')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ═════════════════════════════════════════════════
                        MAIN CONTENT (Tabs)
                    ═════════════════════════════════════════════════ */}
                    <div className="flex-1 w-full min-w-0">
                        <Tabs defaultValue="courses" className="w-full">
                            <TabsList className="bg-slate-900/60 border border-teal-900/30 w-full justify-start p-1.5 rounded-xl mb-8 flex-wrap h-auto gap-2">
                                <TabsTrigger value="courses" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 grow sm:grow-0 transition-all">
                                    <BookOpen className="ml-2 h-4 w-4" />
                                    {t('profile.my_courses')}
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 grow sm:grow-0 transition-all">
                                    <Settings className="ml-2 h-4 w-4" />
                                    {t('profile.settings')}
                                </TabsTrigger>
                            </TabsList>

                            {/* ── Courses Tab ── */}
                            <TabsContent value="courses" className="mt-0 outline-none animate-slide-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex flex-shrink-0 items-center justify-center">
                                       <BookOpen className="h-4 w-4 text-teal-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white m-0" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('profile.enrolled_courses')}</h2>
                                </div>
                                
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
                                        <p className="text-slate-400">{t('common.loading')}</p>
                                    </div>
                                ) : purchasedCourses?.length === 0 ? (
                                    <Card className="bg-slate-900/30 border border-slate-800/50 border-dashed p-10 text-center">
                                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <BookOpen className="h-10 w-10 text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-300 mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('profile.no_courses')}</h3>
                                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t('profile.start_journey')}</p>
                                        <Link to="/courses">
                                            <Button className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold px-8">
                                                تصفح الدورات المتوفرة
                                            </Button>
                                        </Link>
                                    </Card>
                                ) : (
                                    <div className="grid gap-5">
                                        {purchasedCourses?.map((item: any) => (
                                            <Card key={item.id} className="bg-slate-900/40 border-teal-900/30 overflow-hidden hover:border-teal-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                                                <div className="flex flex-col sm:flex-row gap-5 p-5">
                                                    <div className="h-40 sm:h-36 w-full sm:w-48 bg-slate-800 rounded-xl overflow-hidden shrink-0 relative">
                                                        {item.course?.image_url ? (
                                                            <img src={item.course?.image_url} alt={item.course?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900/50 to-slate-900">
                                                                <BookOpen className="h-10 w-10 text-teal-600/50" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-xs text-white px-2 py-1 rounded">دورة مشتراة</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col min-w-0">
                                                        <h3 className="text-xl font-bold text-white mb-2 truncate" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                                            {item.course?.title_ar || item.course?.title}
                                                        </h3>
                                                        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                            {item.course?.description_ar || item.course?.description}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                                                            <span className="text-slate-500 text-sm flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
                                                                {t('profile.enrolled_on')} {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '—'}
                                                            </span>
                                                            <Link to={`/courses/${item.course_id}/learn`}>
                                                                <Button size="sm" className="bg-slate-800 hover:bg-teal-600 text-white font-medium transition-colors gap-2">
                                                                    متابعة التعلم
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* ── Settings Tab ── */}
                            <TabsContent value="settings" className="mt-0 outline-none animate-slide-up space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                       <Settings className="h-4 w-4 text-teal-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white m-0" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('profile.account_settings')}</h2>
                                </div>

                                {/* ── Display Name ── */}
                                <Card className="bg-slate-900/40 border-teal-900/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-teal-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>الاسم المعروض</h3>
                                                <p className="text-slate-500 text-xs mt-0.5">يظهر هذا الاسم في ملفك وعلى الدورات</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Input
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="أدخل اسمك الكامل"
                                                className="bg-slate-950/60 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 text-right flex-1"
                                                dir="rtl"
                                            />
                                            <Button
                                                onClick={handleSaveName}
                                                disabled={savingName || !displayName.trim()}
                                                className="bg-teal-600 hover:bg-teal-500 text-white font-medium shrink-0"
                                            >
                                                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                <span className="mr-2">حفظ</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ── Email ── */}
                                <Card className="bg-slate-900/40 border-teal-900/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                                <Mail className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>البريد الإلكتروني</h3>
                                                <p className="text-slate-500 text-xs mt-0.5">سيتم إرسال رابط تأكيد إلى البريد الجديد</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="البريد الإلكتروني الجديد"
                                                className="bg-slate-950/60 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20 flex-1"
                                                dir="ltr"
                                            />
                                            <Button
                                                onClick={handleSaveEmail}
                                                disabled={savingEmail || !newEmail.trim() || newEmail === user.email}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shrink-0"
                                            >
                                                {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                <span className="mr-2">تغيير</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ── Password ── */}
                                <Card className="bg-slate-900/40 border-teal-900/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                                                <Lock className="h-4 w-4 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>تغيير كلمة المرور</h3>
                                                <p className="text-slate-500 text-xs mt-0.5">يجب أن تكون 6 أحرف على الأقل</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-slate-400 text-xs mb-1.5 block">كلمة المرور الجديدة</Label>
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="bg-slate-950/60 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500/20"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-400 text-xs mb-1.5 block">تأكيد كلمة المرور</Label>
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
                                                    <p className="text-red-400 text-xs mt-1">كلمتا المرور غير متطابقتين</p>
                                                )}
                                            </div>
                                            <Button
                                                onClick={handleSavePassword}
                                                disabled={savingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium mt-1"
                                            >
                                                {savingPassword ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Lock className="ml-2 h-4 w-4" />}
                                                تغيير كلمة المرور
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                ADD BALANCE DIALOG
            ═══════════════════════════════════════════════════════════ */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-teal-900/50 text-white sm:max-w-md">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('profile.add_funds_title')}</DialogTitle>
                        <DialogDescription className="text-slate-400 mt-1">
                            {t('profile.add_funds_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 block">اختر مبلغاً أو أدخل قيمة مخصصة:</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                        className={`py-3 px-2 rounded-xl border text-base font-bold transition-all duration-200 ${
                                            selectedAmount === amt && !customAmount
                                                ? "bg-teal-500/20 border-teal-500 text-teal-400 shadow-md shadow-teal-500/10 scale-105"
                                                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-teal-500/50 hover:bg-slate-800"
                                        }`}
                                    >
                                        {amt} د.ل
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <Input
                                    type="number"
                                    placeholder="مبلغ مخصص..."
                                    value={customAmount}
                                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                                    className="pr-8 pl-4 bg-slate-950 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 h-12 text-lg text-left"
                                    min="1"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        
                        {effectiveAmount > 0 && (
                            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                                <span className="text-slate-300 font-medium">سيتم شحن رصيدك بقيمة:</span>
                                <span className="text-teal-400 font-extrabold text-2xl">{effectiveAmount.toFixed(2)} د.ل</span>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="gap-3 sm:gap-2 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
                        >
                            {t('profile.cancel')}
                        </Button>
                        <Button
                            onClick={handleAddBalance}
                            disabled={isAddingBalance || effectiveAmount <= 0}
                            className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold w-full sm:w-auto shadow-lg shadow-teal-500/20"
                        >
                            {isAddingBalance ? (
                                <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري المعالجة...</>
                            ) : (
                                t('profile.confirm')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Profile;
