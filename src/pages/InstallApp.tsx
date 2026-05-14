import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, ShieldCheck, Zap, Star, ArrowLeft, CheckCircle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const InstallApp = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const FEATURES = [
    {
      icon: Zap,
      title: "أداء فائق السرعة",
      desc: "تصفح الدورات وشاهد الفيديوهات بسلاسة تامة بدون تقطيع."
    },
    {
      icon: ShieldCheck,
      title: "بيئة آمنة",
      desc: "حماية كاملة لبياناتك الشخصية ومعاملاتك المالية."
    },
    {
      icon: Smartphone,
      title: "تعلم في أي مكان",
      desc: "حمل الدروس وشاهدها بدون إنترنت أثناء تنقلك."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(hsl(173 80% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(173 80% 45%) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text Content */}
            <div className="order-2 lg:order-1 text-right">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 text-teal-400 text-sm font-bold mb-6 animate-fade-in">
                <Star className="w-4 h-4 fill-teal-400" />
                <span>التطبيق الرسمي لمنصة السناء</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up" style={{ fontFamily: "'Cairo', sans-serif" }}>
                تعلم بذكاء مع <br />
                <span className="bg-gradient-to-l from-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">تطبيق الموبايل</span>
              </h1>

              <p className="text-lg text-slate-400 mb-10 max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                احصل على تجربة تعليمية لا مثيل لها. حمل تطبيق السناء الآن واستمتع بالدورات والمحتوى الحصري مباشرة من هاتفك الذكي، في أي وقت وفي أي مكان.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-end animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <a href="/Alsanaa.apk" download>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold px-8 py-8 text-lg rounded-2xl shadow-xl shadow-teal-500/25 transition-all hover:scale-105 hover:-translate-y-1 group"
                  >
                    <Download className="ml-3 h-6 w-6 animate-bounce" />
                    تحميل للأندرويد (APK)
                  </Button>
                </a>
              </div>

              <div className="mt-10 flex items-center justify-end gap-6 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> مجاني بالكامل</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> تحديثات مستمرة</div>
              </div>
            </div>

            {/* 3D Phone Showcase */}
            <div className="order-1 lg:order-2 flex justify-center perspective-[1000px]">
              <div
                className={`relative transition-all duration-700 ease-out transform-gpu ${isHovered ? 'rotate-y-0 scale-105' : 'rotate-y-[-15deg] rotate-x-[5deg]'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-teal-500/30 blur-[80px] rounded-full scale-110"></div>

                {/* Phone Frame */}
                <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl p-2 overflow-hidden ring-1 ring-white/10 before:absolute before:inset-0 before:rounded-[2.5rem] before:border before:border-white/10 before:z-20">

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-12 h-1.5 rounded-full bg-slate-700"></div>
                  </div>

                  {/* Screen Content Mockup */}
                  <div className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-950 rounded-[2.2rem] overflow-hidden">
                    <div className="p-6 pt-12 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">مرحباً بك</div>
                          <div className="font-bold text-white">أحمد الراشد</div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl p-4 mb-6 border border-teal-500/30">
                        <div className="text-teal-400 font-bold mb-1">دورة React المتقدمة</div>
                        <div className="text-sm text-slate-300 mb-3">أكملت 60%</div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-400 w-[60%] rounded-full"></div>
                        </div>
                      </div>

                      <div className="text-right font-bold text-white mb-4">الدورات المقترحة</div>
                      <div className="grid gap-4 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-slate-800/50 rounded-xl p-3 flex gap-3 items-center border border-slate-700/50">
                            <div className="w-16 h-16 rounded-lg bg-slate-700 animate-pulse"></div>
                            <div className="flex-1 space-y-2 text-right">
                              <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse ml-auto"></div>
                              <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse ml-auto"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -left-12 top-20 bg-slate-800/90 backdrop-blur border border-teal-500/30 rounded-2xl p-4 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Download className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">حجم التطبيق</div>
                      <div className="font-bold text-white">25 MB</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-32 bg-slate-800/90 backdrop-blur border border-cyan-500/30 rounded-2xl p-4 shadow-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">التقييم</div>
                      <div className="font-bold text-white">4.9/5</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/50 border-t border-slate-800/50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>لماذا التطبيق؟</h2>
            <p className="text-slate-400">مميزات حصرية تجعل تجربة التعلم أفضل وأسرع</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-teal-500/50 group text-right"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 ml-auto group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
                  <feature.icon className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border border-teal-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] opacity-5 mix-blend-overlay bg-cover bg-center"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
                جاهز لتبدأ؟
              </h2>
              <p className="text-lg text-slate-300 mb-10">
                حمل التطبيق الآن وانضم إلى آلاف الطلاب الذين يطورون مهاراتهم يومياً.
              </p>
              <a href="/Alsanaa.apk" download>
                <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-12 py-6 text-lg rounded-2xl shadow-xl shadow-teal-500/20 transition-all hover:scale-105">
                  <Download className="ml-2 w-5 h-5" />
                  تحميل التطبيق الآن
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default InstallApp;
