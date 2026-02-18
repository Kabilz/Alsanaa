import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2, GraduationCap, Star, Clock, Award, Zap, Shield, TrendingUp, BookOpen, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  teacher_id: string | null;
  teacher?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const CourseCatalog = () => {
  const { t } = useTranslation();

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:teachers(
            profiles(full_name, avatar_url)
          )
        `);
      
      if (error) throw error;
      
      // Transform data to flatten teacher profile
      return data.map((course: any) => ({
        ...course,
        teacher: course.teacher?.profiles
      })) as Course[];
    }
  });

  const features = [
    {
      icon: Zap,
      title: "Learn at Your Pace",
      description: "Access courses anytime, anywhere. Study at your own speed with lifetime access."
    },
    {
      icon: Award,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience."
    },
    {
      icon: Shield,
      title: "Quality Content",
      description: "High-quality video lessons, quizzes, and hands-on projects."
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with interactive quizzes and assessments."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('home.welcome')}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {t('home.subtitle')}
            </p>
            <Button size="lg" className="gap-2">
              <Star className="h-4 w-4" />
              {t('home.explore')}
            </Button>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold text-primary">{courses?.length || 0}+</div>
                <div className="text-sm text-muted-foreground">{t('home.stats.courses')}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">{t('home.stats.students')}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">{t('home.stats.rating')}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('home.why_choose')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners who have already transformed their careers with our comprehensive courses.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('home.featured')}</h2>
            <p className="text-muted-foreground">Browse our selection of premium courses</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                            <BookOpen className="h-16 w-16" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="inline-flex items-center rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </span>
                    </div>
                  </div>
                  <CardHeader className="relative">
                    <div className="absolute -top-6 right-6">
                        <div className="h-12 w-12 rounded-full border-4 border-background bg-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
                             {course.teacher?.avatar_url ? (
                                 <img src={course.teacher.avatar_url} alt={course.teacher.full_name || 'Teacher'} className="h-full w-full object-cover" />
                             ) : (
                                <User className="h-6 w-6 text-gray-400" />
                             )}
                        </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-xl pr-12 line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 min-h-[40px]">
                      {course.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-0">
                     <div className="flex items-center text-sm text-muted-foreground mb-4">
                         <User className="h-3 w-3 mr-1" />
                         <span>{course.teacher?.full_name || "Instructor"}</span>
                     </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <span className="text-2xl font-bold text-primary">
                        {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3" />
                        Self-paced
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/courses/${course.id}`} className="w-full">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              {(!courses || courses.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No courses available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseCatalog;
