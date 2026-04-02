import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, TrendingUp, Shield, Heart, Lightbulb, Globe, Target, Compass } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  const objectives: string[] = t('about.objectives', { returnObjects: true }) as string[];

  const values = [
    { key: "quality", icon: Award },
    { key: "innovation", icon: Lightbulb },
    { key: "integrity", icon: Shield },
    { key: "sustainability", icon: TrendingUp },
    { key: "continuous_learning", icon: BookOpen },
    { key: "collaboration", icon: Users },
    { key: "diversity", icon: Globe },
  ];

  return (
    <Layout>
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900/20 via-background to-secondary/10 py-16 md:py-24 animate-fade-in">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&h=400&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="container relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center rounded-2xl bg-teal-500/10 p-4 mb-6 shadow-xl shadow-teal-500/5">
            <Compass className="h-10 w-10 text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t('about.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">

        {/* Vision & Mission Images */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 items-center">
          {/* Vision */}
          <div className="order-2 lg:order-1">
             <Card className="border-teal-900/30 bg-slate-900/50 backdrop-blur hover:bg-slate-900/70 transition-all duration-300 shadow-xl shadow-teal-900/20 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <CardHeader className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('about.vision_title')}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {t('about.vision_desc')}
                  </p>
                </CardContent>
              </Card>
          </div>
          <div className="order-1 lg:order-2 rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/20 border border-teal-900/30 relative h-[300px] lg:h-full">
               <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80" alt="الرؤية" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          </div>

          {/* Mission */}
          <div className="order-3 rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/20 border border-teal-900/30 relative h-[300px] lg:h-[400px]">
               <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&q=80" alt="الرسالة" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          </div>
          <div className="order-4">
              <Card className="border-teal-900/30 bg-slate-900/50 backdrop-blur hover:bg-slate-900/70 transition-all duration-300 shadow-xl shadow-teal-900/20 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <CardHeader className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('about.mission_title')}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {t('about.mission_desc')}
                  </p>
                </CardContent>
              </Card>
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('about.objectives_title')}</h2>
            <div className="h-1.5 w-24 bg-gradient-to-l from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {objectives.map((objective, index) => (
              <Card key={index} className="border-teal-900/30 bg-slate-900/60 backdrop-blur hover:bg-slate-800/80 hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-6 pt-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed pt-2">{objective}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('about.values_title')}</h2>
             <p className="text-center text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
               {t('about.values_subtitle')}
             </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {values.map(({ key, icon: Icon }) => (
              <Card key={key} className="border-teal-900/30 bg-slate-900/50 backdrop-blur hover:bg-slate-800/70 text-center hover:scale-105 transition-all duration-300 group">
                <CardHeader className="pt-8">
                  <div className="w-16 h-16 bg-slate-800 border border-slate-700 group-hover:border-teal-500/50 group-hover:bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 shadow-lg">
                    <Icon className="h-8 w-8 text-teal-400 group-hover:text-teal-300 transition-colors" />
                  </div>
                  <CardTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>{t(`about.${key}`)}</CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t(`about.${key}_desc`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default About;
