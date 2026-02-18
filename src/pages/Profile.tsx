import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, Settings, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
    const { user, userRole } = useAuth();
    const { t } = useTranslation();

    // Fetch purchased courses
    const { data: purchasedCourses, isLoading } = useQuery({
        queryKey: ["purchased-courses", user?.id],
        queryFn: async () => {
            if (!user) return [];
            // Assuming a table 'course_purchases' exists with 'course_id' and 'user_id'
            // and we want to join with 'courses' to get course details.
            // Adjust this query based on actual schema.
            const { data, error } = await supabase
                .from("course_purchases")
                .select(`
                    *,
                    course:courses(*)
                `)
                .eq("user_id", user.id);
            
            if (error) {
                console.error("Error fetching purchased courses:", error);
                // If table doesn't exist yet, return empty to avoid crash loop during dev
                return []; 
            }
            return data;
        },
        enabled: !!user,
    });

    if (!user) {
        return <Layout><div>Please log in...</div></Layout>;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / User Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
                            <CardHeader className="text-center">
                                <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-teal-500">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-slate-800 text-teal-400 text-2xl">
                                        {user.email?.[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-2xl text-white">{user.user_metadata?.full_name || "User"}</CardTitle>
                                <p className="text-teal-400 font-medium capitalize">{userRole}</p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="courses" className="w-full">
                            <TabsList className="bg-slate-900/50 border border-teal-900/50 w-full justify-start">
                                <TabsTrigger value="courses" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    My Courses
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="courses" className="mt-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Enrolled Courses</h2>
                                {isLoading ? (
                                    <p className="text-gray-400">Loading courses...</p>
                                ) : purchasedCourses?.length === 0 ? (
                                    <Card className="bg-slate-900/30 border-dashed border-gray-700 p-8 text-center">
                                        <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No courses yet</h3>
                                        <p className="text-gray-400 mb-6">Start your learning journey today!</p>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {purchasedCourses?.map((item: any) => (
                                            <Card key={item.id} className="bg-slate-900/50 border-teal-900/30 overflow-hidden hover:border-teal-500/50 transition-colors">
                                                <div className="flex flex-col md:flex-row gap-4 p-4">
                                                    <div className="h-32 w-full md:w-48 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                        {item.course?.image_url ? (
                                                            <img src={item.course.image_url} alt={item.course.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900 to-slate-900">
                                                                <BookOpen className="h-10 w-10 text-teal-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-white mb-2">{item.course?.title}</h3>
                                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{item.course?.description}</p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-teal-400 text-sm">Enrolled on {new Date(item.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="settings" className="mt-6">
                                <Card className="bg-slate-900/50 border-teal-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-white">Account Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-400">Profile settings coming soon...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
