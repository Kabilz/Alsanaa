import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, TrendingUp, Shield, Heart, Lightbulb, Globe, Target } from "lucide-react";
import { Layout } from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12" dir="rtl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl mb-6">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 font-cairo">
            عن المنصة
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-cairo">
            السناء منصة للتدريب والتعليم والاستشارات تأسست في عام 2024، وهي تقدم مجموعة شاملة من المقررات الدراسية والدورات التدريبية في مختلف التخصصات والاستشارات العلمية والمهنية المتخصصة، والحلول التنموية المبتكرة، لكل من الأفراد والمؤسسات والشركات على المستوى المحلي والدولي.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-white font-cairo">الرؤية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 leading-relaxed font-cairo">
                أن نصبح المنصة الرائدة والمتميزة في تقديم الخدمات التعليمية والتدريبية والاستشارية المبتكرة التي تُساهم في تطوير الأفراد والمؤسسات على المستويين المحلي والدولي.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-white font-cairo">الرسالة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 leading-relaxed font-cairo">
                تقديم محتوى تعليمي وتدريبي واستشاري هادف وعالي الجودة وميسر الفهم، يعتمد على أحدث الأساليب والتقنيات، بهدف تلبية احتياجات المتعلمين والعملاء وذلك للمساهمة في تحقيق النهضة الحضارية والتنمية المستدامة في اطارها المحلي والاقليمي والدولي.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Objectives */}
        <div className="mb-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4 font-cairo">الأهداف</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                    "تطوير برامج تعليمية وتدريبية متنوعة تلبي احتياجات مختلف الفئات المستهدفة.",
                    "تقديم استشارات متخصصة تُساعد الأفراد والشركات على تحقيق أهدافهم.",
                    "استخدام تقنيات التعليم الحديثة لضمان تجربة تعلم متميزة للمستخدمين.",
                    "توسيع نطاق الخدمات لتشمل مجالات تخصصية متعددة تلبي احتياجات السوق المتغيرة.",
                    "بناء شراكات استراتيجية مع مؤسسات تعليمية وتدريبية واستشارية لتعزيز جودة الخدمات المقدمة."
                 ].map((objective, index) => (
                    <Card key={index} className="border-teal-900/50 bg-slate-900/50 backdrop-blur hover:bg-slate-800/50 transition-colors">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold font-cairo shrink-0 mt-1">
                                {index + 1}
                            </div>
                            <p className="text-gray-300 font-cairo leading-relaxed pt-1">{objective}</p>
                        </CardHeader>
                    </Card>
                 ))}
            </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8 font-cairo">القيم</h2>
          <p className="text-center text-gray-400 mb-10 font-cairo max-w-2xl mx-auto">
             لتعزيز مصداقيتنا وضمان تقديم خدمات عالية الجودة في مجالات التعليم والتدريب والاستشارات، فنحن نتبنى القيم الأساسية التالية:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
                { title: "الجودة والتميز", icon: Award, desc: "الالتزام بتقديم محتوى وخدمات تعليمية وتدريبية واستشارية عالية الجودة تلبي احتياجات المتعلمين والعملاء وتساهم في تطوير مهاراتهم." },
                { title: "الابتكار والتجديد", icon: Lightbulb, desc: "استخدام أحدث تقنيات التعليم والتدريب، مثل الواقع الافتراضي والواقع المعزز، لتوفير تجارب تعليمية تفاعلية ومبتكرة." },
                { title: "المصداقية والشفافية", icon: Shield, desc: "تقديم معلومات موثوقة وشفافة في جميع الجوانب المتعلقة بالتعليم والتدريب والاستشارات، وبناء علاقات قائمة على الثقة مع المتعلمين والعملاء." },
                { title: "التنمية المستدامة", icon: TrendingUp, desc: "التركيز على تطوير مهارات الأفراد والمؤسسات بما يتماشى مع احتياجات سوق العمل والتطورات التكنولوجية الحديثة" },
                { title: "التعلم المستمر", icon: BookOpen, desc: "تشجيع ثقافة التعلم المستمر مدى الحياة وتقديم برامج تدريبية تواكب التغيرات السريعة في مجالات المعرفة والتكنولوجيا." },
                { title: "التعاون والشراكة", icon: Users, desc: "بناء علاقات تعاون مع مؤسسات تعليمية وتدريبية واستشارية أخرى لتعزيز جودة الخدمات وتوسيع نطاق الوصول إليها." },
                { title: "التنوع والشمولية", icon: Globe, desc: "تقديم خدمات تلبي احتياجات مختلف الفئات والشرائح الاجتماعية، وضمان وصول المحتوى التعليمي والمعرفي إلى أكبر عدد ممكن من المتعلمين والعملاء." }
            ].map((value, index) => (
                <Card key={index} className="border-teal-900/50 bg-slate-900/50 backdrop-blur text-center hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white font-cairo">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 font-cairo text-sm leading-relaxed">
                      {value.desc}
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
