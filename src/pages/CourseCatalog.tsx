import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Loader2,
  GraduationCap,
  Star,
  Clock,
  BookOpen,
  School,
  Book,
  User,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ChevronLeft
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useEducationalLevels, useEducationalYears, useSubjects, useColleges, useDepartments } from "@/hooks/useHierarchy";

interface Course {
  id: string;
  title: string;
  title_ar?: string | null;
  title_en?: string | null;
  description: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  image_url: string | null;
  teacher_id: string | null;
  teacher?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const COURSES_PER_PAGE = 9;

const CourseCatalog = () => {
  const { t } = useTranslation();
  const { addToCart, isInCart, removeFromCart } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Hierarchy Selection State
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const { data: levels, isLoading: loadingLevels } = useEducationalLevels();
  const selectedLevel = levels?.find(l => l.id === selectedLevelId);

  const { data: years } = useEducationalYears(selectedLevelId || undefined);
  const { data: colleges } = useColleges();
  const { data: departments } = useDepartments(selectedCollegeId || undefined);
  const { data: subjects } = useSubjects(selectedYearId || undefined);

  // Use a query that accepts the hierarchy filters for courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", selectedYearId, selectedSubjectId, selectedDepartmentId],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          teacher:teachers(
            profiles(full_name, avatar_url)
          )
        `);

      if (selectedYearId) query = query.eq('educational_year_id', selectedYearId);
      if (selectedSubjectId) query = query.eq('subject_id', selectedSubjectId);
      if (selectedDepartmentId) query = query.eq('department_id', selectedDepartmentId);

      const { data, error } = await query;
      if (error) throw error;
      return data.map((course: any) => ({
        ...course,
        teacher: course.teacher?.profiles,
      })) as Course[];
    },
  });

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase();
      const titleMatch =
        (course.title || "").toLowerCase().includes(q) ||
        (course.title_ar || "").toLowerCase().includes(q) ||
        (course.title_en || "").toLowerCase().includes(q);
      const teacherMatch = (course.teacher?.full_name || "").toLowerCase().includes(q);
      if (q && !titleMatch && !teacherMatch) return false;
      if (filter === "free" && course.price > 0) return false;
      if (filter === "paid" && (!course.price || course.price <= 0)) return false;
      return true;
    });
  }, [courses, searchQuery, filter]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, selectedLevelId, selectedYearId, selectedCollegeId, selectedDepartmentId, selectedSubjectId]);

  const renderLevelSelection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
      {levels?.map((level) => (
        <Card 
          key={level.id} 
          className="cursor-pointer border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
          onClick={() => {
            setSelectedLevelId(level.id);
            setSelectedYearId(null);
            setSelectedCollegeId(null);
            setSelectedDepartmentId(null);
            setSelectedSubjectId(null);
          }}
        >
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {level.name_ar || level.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const renderPath = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-10 bg-secondary/20 p-4 rounded-xl shadow-sm border border-border/50" dir="rtl">
        <button onClick={() => setSelectedLevelId(null)} className="hover:text-primary font-semibold transition-colors flex items-center gap-1.5 focus:outline-none">
          <BookOpen className="h-4 w-4" /> التصنيفات
        </button>
        <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
        
        <span className={!selectedYearId && !selectedCollegeId ? "text-primary font-bold" : "font-medium"}>
          {selectedLevel.name_ar || selectedLevel.name}
        </span>
        
        {selectedYearId && (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
            <span className={!selectedSubjectId ? "text-primary font-bold" : "font-medium"}>
              {years?.find(y => y.id === selectedYearId)?.name_ar || years?.find(y => y.id === selectedYearId)?.name}
            </span>
          </>
        )}

        {selectedCollegeId && (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
            <span className={!selectedDepartmentId ? "text-primary font-bold" : "font-medium"}>
              {colleges?.find(c => c.id === selectedCollegeId)?.name_ar || colleges?.find(c => c.id === selectedCollegeId)?.name}
            </span>
          </>
        )}

        {selectedDepartmentId && (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
            <span className={!selectedSubjectId ? "text-primary font-bold" : "font-medium"}>
              {departments?.find(d => d.id === selectedDepartmentId)?.name_ar || departments?.find(d => d.id === selectedDepartmentId)?.name}
            </span>
          </>
        )}

        {selectedSubjectId && (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-primary font-bold">
              {subjects?.find(s => s.id === selectedSubjectId)?.name_ar || subjects?.find(s => s.id === selectedSubjectId)?.name}
            </span>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedLevel) return null;

    if (['elementary', 'middle', 'secondary'].includes(selectedLevel.slug)) {
      if (!selectedYearId) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
            {years?.map(year => (
              <Button 
                key={year.id} 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center gap-3 border-border hover:bg-secondary/50 rounded-2xl"
                onClick={() => setSelectedYearId(year.id)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                   <School className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {year.name_ar || year.name}
                </span>
              </Button>
            ))}
          </div>
        );
      }

      // Render courses directly now
    }

    if (selectedLevel.slug === 'university') {
      if (!selectedCollegeId) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
            {colleges?.map(college => (
              <Button 
                key={college.id} 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center gap-3 border-border hover:bg-secondary/50 rounded-2xl"
                onClick={() => setSelectedCollegeId(college.id)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                   <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {college.name_ar || college.name}
                </span>
              </Button>
            ))}
          </div>
        );
      }

      if (!selectedDepartmentId) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" dir="rtl">
            {departments && departments.length > 0 ? departments.map(dept => (
              <Button 
                key={dept.id} 
                variant="outline" 
                className="h-auto py-6 flex flex-col items-center gap-2 border-border hover:bg-secondary/50 rounded-xl"
                onClick={() => setSelectedDepartmentId(dept.id)}
              >
                <Book className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base whitespace-normal text-center leading-tight">
                  {dept.name_ar || dept.name}
                </span>
              </Button>
            )) : (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/10 rounded-2xl border border-border border-dashed">
                <School className="h-12 w-12 mx-auto mb-3 opacity-20" />
                لا يوجد أقسام
              </div>
            )}
          </div>
        );
      }
    }

    // After selection is complete, render courses!
    return (
      <div className="space-y-6" dir="rtl">
        {/* Search + Filters inline for courses */}
        <section className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Tabs value={filter} onValueChange={setFilter} dir="rtl">
              <TabsList>
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="free">مجاني</TabsTrigger>
                <TabsTrigger value="paid">مدفوع</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن دورة أو اسم معلم..."
              className="pr-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} دورة مطابقة
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="flex flex-col overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 bg-card"
                >
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title_ar || course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                      <Star className="ml-1 h-3 w-3" />
                      {t("course_catalog.featured_badge")}
                    </span>
                  </div>

                  {/* Header */}
                  <CardHeader className="relative pb-2">
                    {/* Teacher avatar */}
                    <div className="absolute -top-6 left-4">
                      <div className="h-11 w-11 rounded-full border-4 border-background bg-slate-800 flex items-center justify-center overflow-hidden shadow">
                        {course.teacher?.avatar_url ? (
                          <img src={course.teacher.avatar_url} alt={course.teacher.full_name || "معلم"} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg pl-12 line-clamp-1 group-hover:text-primary transition-colors text-right">
                      {course.title_ar || course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[36px] text-right">
                      {course.description_ar || course.description || t("course_catalog.no_description")}
                    </CardDescription>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="flex-grow pt-0">
                    <div className="flex items-center text-sm text-muted-foreground mb-4 justify-end">
                      <span className="truncate">{course.teacher?.full_name || t("course_catalog.instructor")}</span>
                      <User className="h-3 w-3 mr-1 ml-1 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                       <span className="text-xl font-bold text-primary">
                        {course.price > 0 ? `${course.price} $` : t("course_details.free")}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        {t("course_catalog.self_paced")}
                        <Clock className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="flex gap-2">
                    {isInCart(course.id) ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20"
                        onClick={() => removeFromCart(course.id)}
                        title="إزالة من السلة"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="shrink-0 border-primary/20 hover:bg-primary/10 text-primary"
                        onClick={() => addToCart({
                          id: course.id,
                          title: course.title_ar || course.title,
                          price: course.price,
                          image_url: course.image_url,
                          teacher_name: course.teacher?.full_name
                        })}
                        title="أضف إلى السلة"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                    )}
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full">{t("course_catalog.view_details")}</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              {/* Empty state */}
              {paginatedCourses.length === 0 && (
                <div className="col-span-full text-center py-20 bg-secondary/10 rounded-3xl border border-border border-dashed">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-lg mb-2">{t("course_catalog.no_courses")}</p>
                  {(searchQuery || filter !== "all") && (
                    <Button variant="link" onClick={() => { setSearchQuery(""); setFilter("all"); }}>
                      مسح عوامل التصفية
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage((p) => p - 1); }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <PaginationItem key={`e-${page}`}><span className="px-2 text-muted-foreground">…</span></PaginationItem>;
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage((p) => p + 1); }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-14">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&h=400&fit=crop&q=75"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-5"
        />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              style={{ fontFamily: "'Cairo', sans-serif" }}>
            استكشف الدورات
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("course_catalog.browse")}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {renderPath()}
          
          <div className="mt-4">
            {loadingLevels ? (
              <div className="py-24 flex flex-col justify-center items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                 <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : (
              !selectedLevel ? renderLevelSelection() : renderContent()
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseCatalog;
