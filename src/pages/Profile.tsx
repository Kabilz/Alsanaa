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
import { User, LogOut, Banknote, Shield, Award, Edit, Smartphone, Loader2, ArrowRight, Save, X, Phone, Lock, Upload, Landmark, CreditCard, BookOpen, Settings, FileDown, Receipt, Camera, Mail, Plus } from "lucide-react";
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
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [paymentRef, setPaymentRef] = useState<string>("");
    const [edfaliStep, setEdfaliStep] = useState<"phone" | "pin">("phone");
    const [smsPin, setSmsPin] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");
    // يسر باي
    const [yusrStep, setYusrStep] = useState<"card" | "otp">("card");
    const [yusrOtp, setYusrOtp] = useState<string>("");
    const [yusrSessionId, setYusrSessionId] = useState<string>("");
    
    // حوالة مصرفية
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);

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
        if (!paymentMethod) { toast.error("يرجى اختيار وسيلة الدفع"); return; }
        if (!paymentRef && paymentMethod !== "حوالة مصرفية") { toast.error("يرجى إدخال رقم البطاقة/الهاتف"); return; }
        if (paymentMethod === "ادفع لي" && (paymentRef.length < 9 || paymentRef.length > 10)) {
            toast.error("رقم الهاتف لخدمة ادفع لي يجب أن يكون 9 أو 10 أرقام");
            return;
        }
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
            if (paymentMethod === "ادفع لي") {
                const response = await fetch("https://alsanaa.alsanact.com/edfali.php?action=init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customerPhone: paymentRef.trim(), amount: amount }),
                });
                
                if (!response.ok) throw new Error("فشل الاتصال بالخادم الوسيط");
                const data = await response.json();
                
                if (data?.error) throw new Error(data.error);

                setSessionId(data.sessionId);
                setEdfaliStep("pin");
                toast.success("تم إرسال رمز التأكيد إلى هاتفك عبر الرسائل القصيرة");
                setIsAddingBalance(false);
                return;
            }

            if (paymentMethod === "يسر باي") {
                const response = await fetch("https://alsanaa.alsanact.com/yusrpay.php?action=init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identityCard: paymentRef.trim(), amount: amount }),
                });
                if (!response.ok) throw new Error("فشل الاتصال بخدمة يسر باي");
                const data = await response.json();
                if (data?.error) throw new Error(data.error);
                setYusrSessionId(data.sessionId);
                setYusrStep("otp");
                toast.success("تم إرسال رمز التأكيد (OTP) إلى هاتفك");
                setIsAddingBalance(false);
                return;
            }

            if (paymentMethod === "حوالة مصرفية") {
                if (!receiptFile) {
                    toast.error("يرجى إرفاق صورة إيصال الحوالة");
                    setIsAddingBalance(false);
                    return;
                }
                setUploadingReceipt(true);
                try {
                    const fileExt = receiptFile.name.split('.').pop();
                    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('receipts')
                        .upload(fileName, receiptFile);
                    
                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
                    const receiptUrl = publicUrlData.publicUrl;

                    const { error: txError } = await supabase.from('transactions').insert({
                        user_id: user.id,
                        amount: amount,
                        payment_method: 'topup',
                        payment_service: 'حوالة مصرفية',
                        status: 'pending',
                        receipt_url: receiptUrl
                    } as any);

                    if (txError) throw txError;

                    toast.success("تم إرسال طلب الشحن بنجاح، يرجى انتظار موافقة الإدارة");
                    resetDialog();
                } catch (err: any) {
                    toast.error(err.message || "فشل رفع الإيصال");
                } finally {
                    setUploadingReceipt(false);
                    setIsAddingBalance(false);
                }
                return;
            }

            // Normal flow for other methods - Disabled for production
            toast.error("هذه الخدمة قيد التطوير حالياً، يرجى استخدام خدمة أدفع لي أو يسر باي.");
            setIsAddingBalance(false);
            return;
        } catch (err: any) {
            toast.error(err.message || "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.");
            setIsAddingBalance(false);
        }
    };

    const handleEdfaliConfirm = async () => {
        if (!smsPin.trim() || smsPin.trim().length !== 4) {
            toast.error("يرجى إدخال رمز التأكيد المكون من 4 أرقام");
            return;
        }

        setIsAddingBalance(true);
        const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
        try {
            const response = await fetch("https://alsanaa.alsanact.com/edfali.php?action=confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerPhone: paymentRef.trim(), smsPin: smsPin.trim(), sessionId }),
            });
            
            if (!response.ok) throw new Error("فشل الاتصال بالخادم الوسيط");
            const data = await response.json();
            
            if (data?.error) throw new Error(data.error);
            if (!data?.ok) throw new Error("فشل تأكيد الدفع");

            await completeBalanceTopup(amount);
        } catch (err: any) {
            toast.error(err.message || "فشل تأكيد الدفع");
            setIsAddingBalance(false);
        }
    };

    const handleYusrConfirm = async () => {
        if (!yusrOtp.trim() || yusrOtp.trim().length < 4) {
            toast.error("يرجى إدخال رمز OTP الصحيح");
            return;
        }
        setIsAddingBalance(true);
        const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
        try {
            const response = await fetch("https://alsanaa.alsanact.com/yusrpay.php?action=confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ smsPin: yusrOtp.trim(), sessionId: yusrSessionId }),
            });
            if (!response.ok) throw new Error("فشل الاتصال بخدمة يسر باي");
            const data = await response.json();
            if (data?.error) throw new Error(data.error);
            if (!data?.ok) throw new Error("فشل تأكيد الدفع");
            await completeBalanceTopup(amount);
        } catch (err: any) {
            toast.error(err.message || "فشل تأكيد الدفع عبر يسر باي");
            setIsAddingBalance(false);
        }
    };

    const completeBalanceTopup = async (amount: number) => {
        if (!user) return;
        const newBalance = balance + amount;
        const { error } = await supabase.from('profiles')
            .upsert({ id: user.id, wallet_balance: newBalance } as any, { onConflict: 'id' })
            .eq('id', user.id);
        if (error) throw error;
        
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: user.id,
            amount: amount,
            payment_method: 'topup',
            payment_service: paymentMethod,
            status: 'completed',
        } as any);
        
        if (txError) {
            console.error("Tx error", txError);
            await supabase.from('profiles').update({ wallet_balance: balance } as any).eq('id', user.id);
            throw txError;
        }

        setBalance(newBalance);
        toast.success(`تم الشحن عبر ${paymentMethod} بنجاح!`);
        resetDialog();
    };

    const resetDialog = () => {
        setDialogOpen(false);
        setCustomAmount("");
        setSelectedAmount(25);
        setPaymentMethod(null);
        setPaymentRef("");
        setEdfaliStep("phone");
        setSmsPin("");
        setSessionId("");
        setYusrStep("card");
        setYusrOtp("");
        setYusrSessionId("");
        setReceiptFile(null);
        setUploadingReceipt(false);
        setIsAddingBalance(false);
    };

    const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ["transactions", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (error) { console.error("Error fetching transactions:", error); return []; }
            return data;
        },
        enabled: !!user,
    });
    
    const downloadStatement = () => {
        if (!transactions || transactions.length === 0) {
            toast.error("لا توجد حركات مالية لتنزيلها");
            return;
        }
        
        const headers = ["رقم الحركة", "التاريخ", "القيمة", "نوع الحركة", "اسم الخدمة", "الحالة"];
        const rows = transactions.map(tx => [
            tx.id,
            new Date(tx.created_at).toLocaleDateString('ar-EG'),
            tx.amount.toString(),
            tx.payment_method === 'topup' ? 'شراء رصيد' : (tx.payment_method === 'course_purchase' ? 'شراء دورة' : tx.payment_method),
            tx.payment_service || 'محفظة الموقع',
            tx.status === 'completed' ? 'مكتملة' : tx.status
        ]);
        
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `كشف_حساب_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                <TabsTrigger value="statement" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:shadow-sm rounded-lg py-2.5 px-4 grow sm:grow-0 transition-all">
                                    <Receipt className="ml-2 h-4 w-4" />
                                    كشف الحساب
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

                            {/* ── Statement Tab ── */}
                            <TabsContent value="statement" className="mt-0 outline-none animate-slide-up">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex flex-shrink-0 items-center justify-center">
                                           <Receipt className="h-4 w-4 text-teal-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white m-0" style={{ fontFamily: "'Cairo', sans-serif" }}>كشف حساب الطالب</h2>
                                    </div>
                                    <Button onClick={downloadStatement} className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-teal-500/20">
                                        <FileDown className="ml-2 h-4 w-4" />
                                        تنزيل كشف الحساب (Excel)
                                    </Button>
                                </div>
                                
                                <Card className="bg-slate-900/40 border-teal-900/30 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-800/50 text-slate-300 text-sm">
                                                <tr>
                                                    <th className="p-4 font-semibold">ت</th>
                                                    <th className="p-4 font-semibold">التاريخ</th>
                                                    <th className="p-4 font-semibold">القيمة</th>
                                                    <th className="p-4 font-semibold">اسم الخدمة</th>
                                                    <th className="p-4 font-semibold">نوع الحركة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {isLoadingTransactions ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">جاري التحميل...</td></tr>
                                                ) : transactions && transactions.length > 0 ? (
                                                    transactions.map((tx, idx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors text-slate-300">
                                                            <td className="p-4">{idx + 1}</td>
                                                            <td className="p-4" dir="ltr">{new Date(tx.created_at).toLocaleDateString('ar-EG')}</td>
                                                            <td className="p-4 font-bold text-white">{tx.amount.toFixed(2)} د.ل</td>
                                                            <td className="p-4">{tx.payment_service || '-'}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tx.payment_method === 'topup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                    {tx.payment_method === 'topup' ? 'شراء رصيد' : (tx.payment_method === 'course_purchase' ? 'شراء دورة' : tx.payment_method)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">لا توجد حركات مالية مسجلة</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
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
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                if (!open) resetDialog();
                else setDialogOpen(true);
            }}>
                <DialogContent className="bg-slate-900 border-teal-900/50 text-white sm:max-w-md">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('profile.add_funds_title')}</DialogTitle>
                        <DialogDescription className="text-slate-400 mt-1">
                            {t('profile.add_funds_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {!paymentMethod ? (
                        <div className="space-y-6 py-4">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/20">
                                    <Banknote className="h-8 w-8 text-teal-400" />
                                </div>
                                <h3 className="text-white text-lg font-bold">إشحن محفظتك</h3>
                                <p className="text-slate-400 text-sm mt-1">إختر وسيلة الدفع أدناه وإتبع الخطوات للشحن</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'يسر باي', name: 'يسر باي', icon: CreditCard, color: 'text-teal-400' },
                                    { id: 'ادفع لي', name: 'إدفع لي', icon: Smartphone, color: 'text-emerald-400' },
                                    { id: 'حوالة مصرفية', name: 'حوالة مصرفية', icon: Landmark, color: 'text-amber-400' },
                                ].map((pm) => (
                                    <button
                                        key={pm.id}
                                        onClick={() => {
                                            setPaymentMethod(pm.id);
                                            setEdfaliStep("phone");
                                            setSmsPin("");
                                            setSessionId("");
                                            setYusrStep("card");
                                            setYusrOtp("");
                                            setYusrSessionId("");
                                            setReceiptFile(null);
                                        }}
                                        className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-slate-900 group"
                                    >
                                        <div className={`p-3 rounded-full bg-slate-900 group-hover:bg-slate-800 ${pm.color}`}>
                                            <pm.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-slate-300 font-bold text-sm">{pm.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="text-center mb-6">
                                <h3 className="text-teal-400 text-lg font-bold">الشحن بخدمة {paymentMethod}</h3>
                            </div>
                            <div className="space-y-4">
                                {paymentMethod === 'حوالة مصرفية' && (
                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-900/30 text-sm space-y-2 mb-4 text-right">
                                        <p><span className="text-slate-400 ml-2">المصرف:</span> <span className="text-white font-bold">التجارة والتنمية - فرع الفروسية</span></p>
                                        <p><span className="text-slate-400 ml-2">الاسم:</span> <span className="text-white font-bold">شركة السناء للاستشارات والتدريب</span></p>
                                        <p><span className="text-slate-400 ml-2">رقم الحساب:</span> <span className="text-white font-bold tracking-wider" dir="ltr">0012.789285.001</span></p>
                                        <p><span className="text-slate-400 ml-2">IBAN:</span> <span className="text-white font-bold tracking-wider" dir="ltr">LY51 0100 1200 0012 7892 8500 1</span></p>
                                    </div>
                                )}
                                
                                {paymentMethod !== 'حوالة مصرفية' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 block mb-2">
                                            {paymentMethod === "ادفع لي"
                                                ? "رقم الهاتف (10 أرقام)"
                                                : paymentMethod === "يسر باي"
                                                ? "رقم بطاقة العميل (9 أو 10 أرقام)"
                                                : "رقم البطاقة"}
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder={
                                                paymentMethod === "ادفع لي"
                                                    ? "09X XXX XXXX"
                                                    : paymentMethod === "يسر باي"
                                                    ? "XXXXXXXXX"
                                                    : "أدخل رقم البطاقة..."
                                            }
                                            value={paymentRef}
                                            onChange={(e) => setPaymentRef(e.target.value)}
                                            className="bg-slate-950 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 h-12 text-center text-lg tracking-widest"
                                            dir="ltr"
                                            maxLength={paymentMethod === "ادفع لي" ? 10 : paymentMethod === "يسر باي" ? 10 : 20}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">القيمة (د.ل)</label>
                                    <Input
                                        type="number"
                                        placeholder="أدخل القيمة..."
                                        value={customAmount}
                                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                                        className="bg-slate-950 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 h-12 text-center text-lg font-bold"
                                        min="1"
                                        dir="ltr"
                                    />
                                </div>

                                {paymentMethod === 'حوالة مصرفية' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-300 block mb-2">صورة إيصال الحوالة</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                            className="bg-slate-950 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 h-12 pt-2 file:text-teal-400 file:bg-teal-500/10 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-teal-500/20 cursor-pointer"
                                        />
                                    </div>
                                )}
                                {customAmount && parseFloat(customAmount) > 0 && (
                                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                                        <span className="text-slate-300 font-medium">سيتم شحن رصيدك بقيمة:</span>
                                        <span className="text-teal-400 font-extrabold text-xl">{parseFloat(customAmount).toFixed(2)} د.ل</span>
                                    </div>
                                )}
                            </div>
                            
                            <DialogFooter className="gap-3 sm:gap-2 flex-col sm:flex-row mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (edfaliStep === "pin") {
                                            setEdfaliStep("phone"); setSmsPin(""); setSessionId("");
                                        } else if (yusrStep === "otp") {
                                            setYusrStep("card"); setYusrOtp(""); setYusrSessionId("");
                                        } else {
                                            setPaymentMethod(null); setPaymentRef(""); setCustomAmount("");
                                        }
                                    }}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
                                >
                                    رجوع
                                </Button>

                                {/* ── ادفع لي: خطوة OTP ── */}
                                {edfaliStep === "pin" && paymentMethod === "ادفع لي" ? (
                                    <div className="flex-1 w-full flex gap-3">
                                        <Input
                                            type="text" inputMode="numeric" placeholder="XXXX"
                                            value={smsPin}
                                            onChange={(e) => setSmsPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            className="bg-slate-950 border-amber-500/50 text-white focus:border-amber-500 h-10 text-center tracking-[0.5em] text-xl font-bold w-full"
                                            maxLength={4} dir="ltr"
                                        />
                                        <Button
                                            onClick={handleEdfaliConfirm}
                                            disabled={isAddingBalance || smsPin.length !== 4}
                                            className="bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold shrink-0 shadow-lg shadow-amber-500/20"
                                        >
                                            {isAddingBalance ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "تأكيد"}
                                        </Button>
                                    </div>

                                ) : yusrStep === "otp" && paymentMethod === "يسر باي" ? (
                                    /* ── يسر باي: خطوة OTP ── */
                                    <div className="flex-1 w-full space-y-3">
                                        <p className="text-slate-400 text-sm text-center">أدخل رمز OTP الذي وصلك على هاتفك</p>
                                        <div className="flex gap-3">
                                            <Input
                                                type="text" inputMode="numeric" placeholder="XXXXXX"
                                                value={yusrOtp}
                                                onChange={(e) => setYusrOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className="bg-slate-950 border-teal-500/50 text-white focus:border-teal-500 h-10 text-center tracking-[0.4em] text-xl font-bold w-full"
                                                maxLength={6} dir="ltr"
                                            />
                                            <Button
                                                onClick={handleYusrConfirm}
                                                disabled={isAddingBalance || yusrOtp.length < 4}
                                                className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shrink-0 shadow-lg shadow-teal-500/20"
                                            >
                                                {isAddingBalance ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : "تأكيد"}
                                            </Button>
                                        </div>
                                    </div>

                                ) : (
                                    /* ── زر الإرسال الافتراضي ── */
                                    <Button
                                        onClick={handleAddBalance}
                                        disabled={
                                            isAddingBalance || 
                                            uploadingReceipt ||
                                            (!paymentRef && paymentMethod !== 'حوالة مصرفية') || 
                                            !customAmount || 
                                            parseFloat(customAmount) <= 0 ||
                                            (paymentMethod === 'حوالة مصرفية' && !receiptFile)
                                        }
                                        className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold w-full sm:w-auto shadow-lg shadow-teal-500/20"
                                    >
                                        {isAddingBalance || uploadingReceipt ? (
                                            <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري المعالجة...</>
                                        ) : "ارسال"}
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Profile;
