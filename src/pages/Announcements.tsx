import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, Bell } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Announcement {
  id: string;
  title: string;
  title_ar: string | null;
  content: string;
  content_ar: string | null;
  image_url: string | null;
  target_audience: string;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      toast.error("فشل في تحميل الإعلانات");
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const getAudienceBadge = (audience: string) => {
    const labelMap: Record<string, string> = {
      all: "للجميع",
      students: "للطلاب",
      teachers: "للمعلمين",
    };
    const classMap: Record<string, string> = {
      all: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      students: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      teachers: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    };
    return {
      label: labelMap[audience] || labelMap.all,
      className: classMap[audience] || classMap.all,
    };
  };

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900/20 via-background to-secondary/10 py-16 md:py-24 animate-fade-in">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1400&h=400&fit=crop&q=80')] bg-cover opacity-5 mix-blend-screen" />
        <div className="container relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center rounded-2xl bg-teal-500/10 p-4 mb-6 shadow-xl shadow-teal-500/5 border border-teal-500/20">
            <Bell className="h-10 w-10 text-teal-400 animate-pulse-slow" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t('announcements.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('announcements.subtitle')}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl animate-pulse" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Announcements Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
              <p className="text-slate-400" style={{ fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</p>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="bg-slate-900/40 border border-teal-900/30 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-2xl shadow-teal-900/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-slate-700">
                <Bell className="h-10 w-10 text-slate-500 opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10" style={{ fontFamily: "'Cairo', sans-serif" }}>{t('announcements.none_title')}</h3>
              <p className="text-slate-400 relative z-10 text-lg leading-relaxed">{t('announcements.none_desc')}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {announcements.map((announcement, idx) => {
              const audienceBadge = getAudienceBadge(announcement.target_audience);
              const displayTitle = announcement.title_ar || announcement.title;
              const displayContent = announcement.content_ar || announcement.content;
              return (
                <Card 
                  key={announcement.id}
                  className="overflow-hidden border-teal-900/30 bg-slate-900/50 backdrop-blur hover:bg-slate-900/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/20 group animate-slide-up flex flex-col h-full"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {announcement.image_url ? (
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={announcement.image_url} 
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-teal-900/50 to-slate-900 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                       <Bell className="absolute -left-6 -bottom-6 h-32 w-32 text-teal-500/10 rotate-12" />
                    </div>
                  )}
                  <CardHeader className={`${!announcement.image_url ? 'pt-6' : 'pt-4'} pb-3 px-6`}>
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <Badge variant="outline" className={`${audienceBadge.className} border px-3 py-1 font-medium gap-1.5 flex items-center shadow-inner`}>
                        <Users className="h-3.5 w-3.5" />
                        {audienceBadge.label}
                      </Badge>
                      <div className="flex items-center text-xs text-slate-400 font-medium gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-teal-500/70" />
                        {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <CardTitle className="text-xl md:text-2xl leading-snug text-white mb-2 group-hover:text-teal-300 transition-colors" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {displayTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-8 flex-grow">
                    <p className="text-slate-400 leading-relaxed whitespace-pre-line text-[15px]">
                       {displayContent}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Announcements;
