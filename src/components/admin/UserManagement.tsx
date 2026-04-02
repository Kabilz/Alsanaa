import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCircle, Shield, GraduationCap, Plus, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  id: string;
  role: 'customer' | 'teacher' | 'admin';
  full_name: string | null;
  full_name_ar: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  teachers?: { commission_rate: number } | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherAvatar, setNewTeacherAvatar] = useState<File | null>(null);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

  const [editingCommissionUser, setEditingCommissionUser] = useState<Profile | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>("70");
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*, teachers(commission_rate)').order('created_at', { ascending: false });
    
    if (filter !== "all") {
      query = query.eq('role', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في تحميل بيانات المستخدمين");
    } else {
      setUsers((data as any as Profile[]) || []);
    }
    setLoading(false);
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommissionUser) return;
    
    setIsUpdatingCommission(true);
    const { error } = await supabase
      .from('teachers')
      .update({ commission_rate: Number(newCommissionRate) })
      .eq('id', editingCommissionUser.id);
      
    if (error) {
      console.error("Error updating commission:", error);
      toast.error("فشل في تحديث نسبة الأرباح");
    } else {
      toast.success("تم تحديث نسبة الأرباح بنجاح");
      setEditingCommissionUser(null);
      fetchUsers();
    }
    setIsUpdatingCommission(false);
  };

  const changeUserRole = async (userId: string, newRole: 'customer' | 'teacher' | 'admin') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error("Error updating role:", error);
      toast.error("فشل في تحديث دور المستخدم");
    } else {
      toast.success("تم تحديث دور المستخدم بنجاح");
      
      // If changing to teacher, create teacher profile
      if (newRole === 'teacher') {
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({ id: userId });
        
        if (teacherError && !teacherError.message.includes('duplicate')) {
          console.error("Error creating teacher profile:", teacherError);
        }
      }
      
      fetchUsers();
    }
  };

  const createTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail || !newTeacherPassword) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsCreatingTeacher(true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: newTeacherEmail,
        password: newTeacherPassword,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const userId = authData.user.id;
        let avatarUrl = null;

        if (newTeacherAvatar) {
          const fileExt = newTeacherAvatar.name.split('.').pop();
          const fileName = `${userId}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, newTeacherAvatar);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            avatarUrl = publicUrl;
          } else {
            console.error("Error uploading avatar:", uploadError);
            toast.error("تم إنشاء الحساب، ولكن فشل رفع الصورة الشخصية");
          }
        }

        const profileUpdates: any = { 
          id: userId,
          role: 'teacher',
          full_name: newTeacherName
        };
        
        if (avatarUrl) {
          profileUpdates.avatar_url = avatarUrl;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileUpdates);

        if (profileError) throw profileError;

        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({ id: userId });
          
        if (teacherError && !teacherError.message.includes('duplicate')) {
          console.error("Error creating teacher record:", teacherError);
        }

        toast.success("تم إنشاء حساب المعلم بنجاح!");
        setIsDialogOpen(false);
        setNewTeacherName("");
        setNewTeacherEmail("");
        setNewTeacherPassword("");
        setNewTeacherAvatar(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error creating teacher:", error);
      toast.error(error.message || "فشل في إنشاء حساب المعلم");
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <UserCircle className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مسؤول';
      case 'teacher':
        return 'معلم';
      default:
        return 'مستخدم';
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden" dir="rtl">
      <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <UsersIcon className="w-6 h-6 text-teal-400" />
             </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>إدارة المستخدمين</CardTitle>
              <CardDescription className="text-slate-400">إدارة الأدوار والصلاحيات وتفاصيل الحسابات</CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-700 text-slate-200">
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="focus:bg-slate-700">كل المستخدمين</SelectItem>
                <SelectItem value="customer" className="focus:bg-slate-700">المستخدمين</SelectItem>
                <SelectItem value="teacher" className="focus:bg-slate-700">المعلمين</SelectItem>
                <SelectItem value="admin" className="focus:bg-slate-700">المسؤولين</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={editingCommissionUser !== null} onOpenChange={(open) => !open && setEditingCommissionUser(null)}>
              <DialogContent className="sm:max-w-[400px] bg-slate-900 border-teal-900/50 text-right" dir="rtl">
                <form onSubmit={handleUpdateCommission}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>تعديل نسبة أرباح المعلم</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      تحديد نسبة الأرباح التي يحصل عليها المعلم من مبيعات الدورات.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="commission" className="text-slate-300">نسبة الأرباح للمدرس (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        min="0"
                        max="100"
                        value={newCommissionRate}
                        onChange={(e) => setNewCommissionRate(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        النسبة الحالية: {editingCommissionUser?.teachers?.commission_rate || 70}%
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setEditingCommissionUser(null)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={isUpdatingCommission} className="bg-teal-600 hover:bg-teal-500 text-white">
                      {isUpdatingCommission ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : null}
                      حفظ التغييرات
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 px-6">
                  <Plus className="w-5 h-5 ml-2" /> إضافة معلم
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-slate-900 border-teal-900/50 text-right" dir="rtl">
                <form onSubmit={createTeacher}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>إنشاء حساب معلم</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      سيتمكن المعلم من تسجيل الدخول باستخدام هذه البيانات لإدارة دوراته.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">الاسم الكامل</Label>
                      <Input
                        id="name"
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                        placeholder="أدخل الاسم..."
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        placeholder="teacher@example.com"
                        className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        dir="ltr"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300">كلمة المرور</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newTeacherPassword}
                        onChange={(e) => setNewTeacherPassword(e.target.value)}
                        placeholder="••••••••"
                        className="text-left bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        dir="ltr"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar" className="text-slate-300">الصورة الشخصية (اختياري)</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewTeacherAvatar(e.target.files?.[0] || null)}
                        className="bg-slate-800/50 border-slate-700 text-slate-300 cursor-pointer file:text-teal-400 file:bg-teal-500/10 hover:file:bg-teal-500/20 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:ml-0"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={isCreatingTeacher} className="bg-teal-600 hover:bg-teal-500 text-white">
                      {isCreatingTeacher ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : null}
                      إنشاء الحساب
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-teal-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-slate-400 font-medium font-cairo">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الاسم</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الهاتف</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">الدور</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">تاريخ الانضمام</TableHead>
                  <TableHead className="text-right text-slate-400 font-semibold py-4">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      لا يوجد مستخدمين مطابقين للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium text-slate-200 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-700 shadow-sm">
                            <AvatarImage src={user.avatar_url || undefined} className="object-cover" />
                            <AvatarFallback className="bg-slate-800">
                              <UserCircle className="h-6 w-6 text-slate-500" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{user.full_name || user.full_name_ar || 'بدون اسم'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400" dir="ltr" style={{ textAlign: "right" }}>{user.phone || 'غير محدد'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="px-3 py-1 font-semibold gap-1.5 shadow-sm">
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm font-medium">
                        {new Date(user.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value: 'customer' | 'teacher' | 'admin') =>
                              changeUserRole(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px] bg-slate-800/80 border-slate-700 text-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="customer" className="focus:bg-slate-700">مستخدم (طالب)</SelectItem>
                              <SelectItem value="teacher" className="focus:bg-slate-700">معلم</SelectItem>
                              <SelectItem value="admin" className="focus:bg-slate-700">مسؤول</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {user.role === 'teacher' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="تعديل نسبة الأرباح"
                              className="border-teal-700 text-teal-400 hover:bg-teal-900/50"
                              onClick={() => {
                                setEditingCommissionUser(user);
                                setNewCommissionRate((user.teachers?.commission_rate || 70).toString());
                              }}
                            >
                              {user.teachers?.commission_rate || 70}% نسبة
                            </Button>
                          )}
                        </div>
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
