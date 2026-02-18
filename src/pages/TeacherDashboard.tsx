import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isTeacher } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, BookOpen, Eye } from "lucide-react";
import { toast } from "sonner";

interface TeacherStats {
  total_earnings: number;
  available_balance: number;
  total_courses: number;
  total_enrollments: number;
}

interface Course {
  id: string;
  title: string;
  enrollment_count: number;
  view_count: number;
  price: number;
  status: string;
}

const TeacherDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    total_earnings: 0,
    available_balance: 0,
    total_courses: 0,
    total_enrollments: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    checkTeacherAccess();
  }, [user, authLoading]);

  const checkTeacherAccess = async () => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/login");
      return;
    }

    const teacherStatus = await isTeacher();
    if (!teacherStatus) {
      toast.error("Access denied. Teacher account required.");
      navigate("/courses");
      return;
    }

    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch teacher data
    const { data: teacherData } = await (supabase
      .from('teachers') as any)
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    // Fetch teacher courses
    const { data: coursesData } = await (supabase
      .from('courses_new') as any)
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch teacher earnings
    const { data: earningsData } = await (supabase
      .from('teacher_earnings') as any)
      .select('amount, status')
      .eq('teacher_id', user.id);

    const totalEarnings = earningsData?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    const totalEnrollments = coursesData?.reduce((sum: number, c: any) => sum + c.enrollment_count, 0) || 0;

    setStats({
      total_earnings: totalEarnings,
      available_balance: teacherData?.wallet_balance || 0,
      total_courses: coursesData?.length || 0,
      total_enrollments: totalEnrollments
    });

    setCourses(coursesData || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-400">Manage your courses and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-400">
                ${stats.total_earnings.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Wallet Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ${stats.available_balance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Available to withdraw</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.total_courses}</div>
              <p className="text-xs text-gray-500">Published courses</p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Enrollments</CardTitle>
              <Eye className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-400">{stats.total_enrollments}</div>
              <p className="text-xs text-gray-500">Students enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-teal-900/50">
            <TabsTrigger value="courses" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 text-gray-400">My Courses</TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 text-gray-400">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Your Courses</CardTitle>
                <CardDescription className="text-gray-400">Manage and track your course performance</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No courses yet. Create your first course!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div 
                        key={course.id}
                        className="flex items-center justify-between p-4 border border-teal-900/30 rounded-lg hover:bg-slate-800/50 transition-colors bg-slate-900/30"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">{course.title}</h3>
                          <div className="flex gap-4 mt-2 text-sm text-gray-400">
                            <span>{course.enrollment_count} students</span>
                            <span>{course.view_count} views</span>
                            <span>${course.price}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={course.status === 'published' ? 'default' : 'secondary'}
                          className={course.status === 'published' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-slate-700 text-gray-300'}
                        >
                          {course.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Earnings History</CardTitle>
                <CardDescription className="text-gray-400">Track your commission and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Earnings history coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
