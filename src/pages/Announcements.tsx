import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Failed to load announcements");
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const getAudienceBadge = (audience: string) => {
    const variants = {
      all: { label: "All Users", className: "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border-teal-500/50" },
      students: { label: "Students", className: "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-500/50" },
      teachers: { label: "Teachers", className: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/50" }
    };
    return variants[audience as keyof typeof variants] || variants.all;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Announcements
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest news and important information from Academy
          </p>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading announcements...</p>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-900/50 border border-teal-900/50 backdrop-blur rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Announcements Yet</h3>
              <p className="text-gray-400">Check back later for updates and news</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => {
              const audienceBadge = getAudienceBadge(announcement.target_audience);
              return (
                <Card 
                  key={announcement.id}
                  className="overflow-hidden border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1"
                >
                  {announcement.image_url && (
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-teal-900 to-slate-900 relative">
                      <img 
                        src={announcement.image_url} 
                        alt={announcement.title}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="outline" className={`${audienceBadge.className} border`}>
                        <Users className="h-3 w-3 mr-1" />
                        {audienceBadge.label}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-400 gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700">
                        <Calendar className="h-3 w-3" />
                        {new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight text-white mb-2">{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 line-clamp-3 leading-relaxed">{announcement.content}</p>
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
