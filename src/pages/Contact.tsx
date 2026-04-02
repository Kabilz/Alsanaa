import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact.required_fields'));
      return;
    }

    setLoading(true);

    const { error } = await (supabase
      .from('contact_submissions') as any)
      .insert([{
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject || null,
        message: formData.message,
        status: 'new'
      }]);

    if (error) {
      console.error("Error submitting contact form:", error);
      toast.error(t('contact.error'));
    } else {
      toast.success(t('contact.success'));
      setFormData({ name: "", email: "", subject: "", message: "" });
    }

    setLoading(false);
  };

  return (
    <Layout>
      {/* Header Section with Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900/20 via-background to-secondary/10 py-16 md:py-24 animate-fade-in">
        <img
          src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1400&h=400&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="container relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center rounded-full bg-teal-500/10 p-3 mb-6">
            <MessageSquare className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t('contact.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6 order-2 lg:order-1">
            <Card className="shadow-2xl border-teal-500/20 bg-gradient-to-br from-teal-900/80 to-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t('contact.get_in_touch')}
                </CardTitle>
                <CardDescription className="text-teal-200">
                  {t('contact.channels')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="flex items-start gap-4 transition-transform hover:translate-x-1">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                    <Mail className="h-6 w-6 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white text-lg">{t('contact.email')}</h3>
                    <p className="text-teal-100/80">support@alsanaa.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 transition-transform hover:translate-x-1">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                    <Phone className="h-6 w-6 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white text-lg">{t('contact.phone')}</h3>
                    <p className="text-teal-100/80" dir="ltr">+966 50 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 transition-transform hover:translate-x-1">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                    <MapPin className="h-6 w-6 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white text-lg">{t('contact.address')}</h3>
                    <p className="text-teal-100/80">{t('contact.address_value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur hover:bg-slate-900/80 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {t('contact.office_hours')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="font-medium text-slate-300">{t('contact.mon_fri')}</span>
                    <span className="text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">{t('contact.mon_fri_hours')}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="font-medium text-slate-300">{t('contact.saturday')}</span>
                    <span className="text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">{t('contact.saturday_hours')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-300">{t('contact.sunday')}</span>
                    <span className="text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{t('contact.sunday_hours')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur order-1 lg:order-2 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t('contact.send_message')}
              </CardTitle>
              <CardDescription className="text-slate-400 text-base mt-2">
                {t('contact.form_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    {t('contact.full_name')} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="أحمد محمد"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-950/50 border-teal-900/40 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    {t('contact.email')} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ahmed@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-slate-950/50 border-teal-900/40 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 py-6 text-right"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-300">{t('contact.subject')}</Label>
                  <Input
                    id="subject"
                    placeholder={t('contact.subject_placeholder')}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-slate-950/50 border-teal-900/40 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-300">
                    {t('contact.message')} <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={t('contact.message_placeholder')}
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-slate-950/50 border-teal-900/40 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none pt-4"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold transition-all hover:scale-[1.02] gap-2 mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {t('contact.send')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
