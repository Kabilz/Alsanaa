import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users, TrendingUp, Star } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Welcome to Academy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Unlock your potential with expert-led courses. Start learning today and transform your future.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/courses")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Explore Courses
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                2+
              </div>
              <p className="text-gray-400">Courses</p>
            </CardContent>
          </Card>
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <p className="text-gray-400">Students</p>
            </CardContent>
          </Card>
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 flex items-center justify-center">
                4.8<Star className="w-6 h-6 text-teal-400 ml-1 fill-teal-400" />
              </div>
              <p className="text-gray-400">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Academy Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Academy?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of learners who have already transformed their careers with our comprehensive courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Expert Content</h3>
              <p className="text-gray-400">
                Learn from industry professionals with years of real-world experience.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Support</h3>
              <p className="text-gray-400">
                Connect with fellow learners and get help when you need it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Career Growth</h3>
              <p className="text-gray-400">
                Gain practical skills that help you advance in your career.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
