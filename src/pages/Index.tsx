import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users,
  Star,
  ArrowLeft,
  PlayCircle,
  CheckCircle,
  Sparkles,
  Trophy,
  Clock,
  User,
  ChevronLeft,
  Zap,
  Globe,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ─── شهادات الطلاب ─── */
const TESTIMONIALS = [
  {
    name: "أحمد الراشد",
    role: "مهندس برمجيات",
    praise: "غيّرت هذه الدورات مساري المهني بالكامل. الجودة لا تُضاهى — حصلت على وظيفة أحلامي خلال 3 أشهر.",
    avatar: "أ",
  },
  {
    name: "سارة محمد",
    role: "عالمة بيانات",
    praise: "جربت منصات كثيرة، لكن لا شيء يقترب من عمق ووضوح الدروس المقدمة هنا.",
    avatar: "س",
  },
  {
    name: "كريم حسن",
    role: "مصمم تجربة المستخدم",
    praise: "مدربون عالميون، مشاريع تطبيقية، ومجتمع يدعمك حقاً في نموك.",
    avatar: "ك",
  },
];

/* ─── خطوات الاستخدام ─── */
const STEPS = [
  {
    icon: BookOpen,
    num: "١",
    title: "تصفح الدورات",
    desc: "استكشف كتالوجنا المنسّق من قِبَل الخبراء عبر عشرات التخصصات.",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80",
  },
  {
    icon: PlayCircle,
    num: "٢",
    title: "سجّل وتعلّم",
    desc: "شاهد الدروس بالوتيرة التي تناسبك — على أي جهاز، في أي وقت.",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=80",
  },
  {
    icon: Trophy,
    num: "٣",
    title: "اكسب واحتفل",
    desc: "أكمل الاختبارات، احصل على الشهادات، وانطلق نحو فرصتك القادمة.",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop&q=80",
  },
];

/* ─── المميزات ─── */
const PERKS = [
  { icon: Zap, label: "تعلم بالوتيرة التي تناسبك" },
  { icon: Globe, label: "تعلم من أي مكان" },
  { icon: BarChart3, label: "تتبع تقدمك" },
  { icon: Trophy, label: "احصل على شهادات" },
  { icon: Users, label: "مدربون خبراء" },
  { icon: Sparkles, label: "محتوى متميز" },
];

/* ─── إحصائيات ─── */
const STATS = [
  { value: "+٢٠", label: "دورة متخصصة" },
  { value: "+٥٠ألف", label: "طالب نشط" },
  { value: "٤.٩★", label: "متوسط التقييم" },
  { value: "٩٥٪", label: "نسبة الإتمام" },
];

/* ─── الفوائد النهائية ─── */
const BENEFITS = [
  "دورات مجانية متاحة",
  "تعلم ذاتي بالوتيرة المناسبة",
  "مدربون خبراء",
  "شهادات مُعتَمدة",
];

const Index = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: featuredCourses } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`*, teacher:teachers(profiles(full_name, avatar_url))`)
        .limit(3) as any;
      if (error) throw error;
      return (data as any[]).map((c) => ({ ...c, teacher: c.teacher?.profiles }));
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent" />
          <p className="mt-4 text-gray-300">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-teal-500/8 blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 -left-48 w-[600px] h-[600px] rounded-full bg-cyan-400/6 blur-[100px] animate-pulse [animation-delay:2s]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-teal-300/5 blur-[80px] animate-pulse [animation-delay:4s]" />
        </div>

        {/* Geometric grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(173 80% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(173 80% 45%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div className="text-right order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-5 py-2 text-teal-400 text-sm font-semibold mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>منصة التعلم الأولى عربياً</span>
              </div>

              <h1
                className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                <span className="text-white block">أتقن أي مهارة.</span>
                <span
                  className="block bg-gradient-to-l from-teal-400 via-cyan-300 to-teal-500 bg-clip-text text-transparent"
                  style={{ filter: "drop-shadow(0 0 40px hsl(173 80% 45% / 0.4))" }}
                >
                  حوّل مستقبلك.
                </span>
              </h1>

              <p className="text-xl text-slate-400 mb-10 leading-relaxed animate-slide-up [animation-delay:0.1s]">
                انضم إلى أكثر من <strong className="text-teal-400">٥٠٬٠٠٠</strong> طالب يتعلمون من أمهر
                المدربين — بالوتيرة التي تناسبك، وفي الوقت الذي يناسبك.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-end animate-slide-up [animation-delay:0.2s]">
                <Button
                  size="lg"
                  onClick={() => navigate("/courses")}
                  className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold px-10 py-7 text-lg shadow-lg shadow-teal-500/30 transition-all hover:scale-105 rounded-xl"
                >
                  استكشف الدورات
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/courses")}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-teal-500/50 px-10 py-7 text-lg transition-all hover:scale-105 rounded-xl"
                >
                  <PlayCircle className="ml-2 h-5 w-5 text-teal-400" />
                  شاهد عرضاً تجريبياً
                </Button>
              </div>

              {/* Perks ticker */}
              <div className="mt-12 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
                {PERKS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-slate-500 text-sm">
                    <Icon className="h-4 w-4 text-teal-500/70" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right image */}
            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-500/10 border border-teal-900/40">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=500&fit=crop&q=85"
                  alt="طلاب يتعلمون"
                  className="w-full h-80 md:h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-4 bg-slate-800/90 backdrop-blur border border-teal-900/50 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-teal-400" />
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">+٥٠٬٠٠٠ طالب</div>
                  <div className="text-slate-400 text-xs">نجحوا معنا</div>
                </div>
              </div>
              {/* Floating rating card */}
              <div className="absolute -top-4 -left-4 bg-slate-800/90 backdrop-blur border border-teal-900/50 rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="text-white font-bold text-sm">٤.٩ / ٥</div>
                <div className="text-slate-400 text-xs">تقييم الطلاب</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAND
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-800/70 bg-slate-900/60 backdrop-blur py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {value}
                </div>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED COURSES
      ═══════════════════════════════════════════════════════════ */}
      {featuredCourses && featuredCourses.length > 0 && (
        <section className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="text-right">
              <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">
                دورات مختارة
              </p>
              <h2
                className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                ابدأ مع
                <br />
                <span className="text-teal-400">الأفضل</span>
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/courses")}
              className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 group self-start"
            >
              <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              عرض جميع الدورات
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course: any) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="group block">
                <Card className="h-full border-slate-800/70 bg-slate-900/60 hover:bg-slate-800/60 hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 overflow-hidden">
                  <div className="h-44 relative overflow-hidden bg-gradient-to-br from-teal-900/40 via-slate-800 to-slate-900">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title_ar || course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-14 w-14 text-teal-500/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-teal-500/90 text-slate-900 font-semibold text-xs">
                      {course.price > 0 ? `${course.price} د.ل` : "مجاني"}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 justify-end">
                      <span className="text-slate-500 text-xs">
                        {course.teacher?.full_name || "مدرب خبير"}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                        {course.teacher?.avatar_url ? (
                          <img src={course.teacher.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-lg leading-snug line-clamp-2 group-hover:text-teal-400 transition-colors mb-2 text-right">
                      {course.title_ar || course.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 text-right">
                      {course.description_ar || course.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> دورة ذاتية
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        <span className="text-slate-500 ml-1">٥.٠</span>
                        <Star className="h-3 w-3 fill-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS  —  with images
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">
              عملية بسيطة
            </p>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-white"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              كيف يعمل السناء؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, num, title, desc, img }, i) => (
              <div key={num} className="group text-right">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden mb-6 h-48 border border-slate-800/60">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6 text-teal-400" />
                  </div>
                  <span className="absolute top-4 left-4 text-3xl font-black text-teal-400/30">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">
            قصص الطلاب
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-white"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            يحبنا المتعلمون
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, praise, avatar }) => (
            <Card
              key={name}
              className="border-slate-800/70 bg-slate-900/60 hover:bg-slate-800/60 hover:border-teal-900/60 transition-all"
            >
              <CardContent className="p-7 text-right">
                <div className="flex gap-1 mb-5 justify-end">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 italic text-sm">
                  "{praise}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800 justify-end">
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-md shadow-teal-500/20">
                    {avatar}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-teal-800/40">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&h=500&fit=crop&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/90 via-slate-900/95 to-cyan-950/80" />

          {/* Geometric grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(173 80% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(173 80% 45%) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 text-center py-20 px-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 mb-6">
              <GraduationCap className="w-8 h-8 text-teal-400" />
            </div>

            <h2
              className="text-4xl md:text-6xl font-extrabold text-white mb-5"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              هل أنت مستعد للانطلاق؟
            </h2>

            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              انضم إلى آلاف الطلاب الذين يبنون مهارات المستقبل. فرصتك القادمة تبدأ بدورة واحدة.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-10">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle className="h-4 w-4 text-teal-500" />
                  {b}
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/courses")}
              className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold px-12 py-7 text-xl shadow-2xl shadow-teal-500/30 transition-all hover:scale-105 rounded-xl"
            >
              استكشف جميع الدورات
              <ArrowLeft className="mr-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
