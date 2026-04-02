import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEducationalLevels, useEducationalYears, useSubjects, useColleges, useDepartments } from "@/hooks/useHierarchy";
import { Loader2, ChevronDown, ChevronLeft, Network, GraduationCap, LibraryBig } from "lucide-react";

export function AdminHierarchy() {
  const { data: levels, isLoading: loadingLevels } = useEducationalLevels();
  
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  if (loadingLevels) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-teal-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-slate-400 font-medium font-cairo">جاري تحميل الهيكل التعليمي...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 bg-slate-900/40 p-6 rounded-2xl border border-teal-900/30">
        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
           <Network className="w-8 h-8 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>الهيكل التعليمي</h2>
          <p className="text-slate-400 text-sm">
            إدارة المراحل الدراسية، السنوات، والمواد بسلاسة.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-cyan-500/10 pointer-events-none" />
          <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20 relative z-10">
            <div className="flex items-center gap-3 mb-1">
               <GraduationCap className="w-5 h-5 text-cyan-400" />
               <CardTitle className="text-xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>المراحل والسنوات الدراسية</CardTitle>
            </div>
            <CardDescription className="text-slate-400 pr-8">الابتدائية، الإعدادية، الثانوية، والكورسات العامة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6 relative z-10">
            {levels?.filter(l => ['elementary', 'middle', 'secondary', 'courses'].includes(l.slug)).map((level) => (
              <div key={level.id} className="border border-slate-800 bg-slate-800/20 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/40">
                <button
                  className="flex items-center justify-between w-full text-right font-medium p-4 text-slate-200 transition-colors"
                  onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                >
                  <span className="flex items-center gap-3 text-base">
                    <div className="p-1 rounded bg-slate-800/80 border border-slate-700 text-teal-400">
                      {expandedLevel === level.id ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </div>
                    {level.name_ar} {level.name && <span className="text-slate-500 ml-1 text-sm font-normal">({level.name})</span>}
                  </span>
                </button>
                
                {expandedLevel === level.id && (
                  <div className="pr-6 pl-2 py-4 text-sm border-t border-slate-800 bg-slate-900/30">
                    <YearsList levelId={level.id} expandedYear={expandedYear} setExpandedYear={setExpandedYear} />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-teal-900/30 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-fuchsia-500/10 pointer-events-none" />
          <CardHeader className="border-b border-slate-800/50 pb-6 bg-slate-900/20 relative z-10">
            <div className="flex items-center gap-3 mb-1">
               <LibraryBig className="w-5 h-5 text-fuchsia-400" />
               <CardTitle className="text-xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>التعليم العالي</CardTitle>
            </div>
            <CardDescription className="text-slate-400 pr-8">المسارات الجامعية والأكاديمية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 relative z-10">
            <h3 className="font-semibold text-sm mb-3 text-slate-400 px-1 border-b border-slate-800/60 pb-2">الجامعة (الكليات والأقسام)</h3>
            <CollegesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function YearsList({ levelId, expandedYear, setExpandedYear }: { levelId: string, expandedYear: string | null, setExpandedYear: (id: string | null) => void }) {
  const { data: years, isLoading } = useEducationalYears(levelId);

  if (isLoading) return <div className="p-2 text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل السنوات...</div>;
  if (!years?.length) return <div className="p-3 text-sm text-slate-500 bg-slate-900/50 rounded-lg text-center border border-slate-800/30">لم يتم إضافة سنوات بعد</div>;

  return (
    <div className="space-y-2">
      {years.map((year) => (
        <div key={year.id} className="border-r-2 border-teal-500/40 pr-3 py-1">
          <button
            className="flex items-center justify-between w-full text-right text-sm hover:text-teal-400 text-slate-300 transition-colors"
            onClick={() => setExpandedYear(expandedYear === year.id ? null : year.id)}
          >
            <span className="flex items-center gap-2 font-medium">
              {expandedYear === year.id ? <ChevronDown className="h-3 w-3 text-teal-500" /> : <ChevronLeft className="h-3 w-3 text-slate-500" />}
              {year.name_ar}
            </span>
          </button>
          
          {expandedYear === year.id && (
            <div className="mt-3 mr-4 mb-2">
              <SubjectsList yearId={year.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SubjectsList({ yearId }: { yearId: string }) {
  const { data: subjects, isLoading } = useSubjects(yearId);

  if (isLoading) return <div className="text-xs text-slate-400 mt-2 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل المواد...</div>;

  return (
    <div className="space-y-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">المواد الدراسية</span>
      </div>
      {subjects?.length ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {subjects.map(s => (
            <span key={s.id} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm">
              {s.name_ar}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-500 italic block mt-2">لم تتم إضافة أي مواد بعد</span>
      )}
    </div>
  );
}

function CollegesList() {
  const { data: colleges, isLoading } = useColleges();
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null);

  if (isLoading) return <div className="p-2 text-sm text-slate-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل الكليات...</div>;
  if (!colleges?.length) return <div className="p-3 text-sm text-slate-500 bg-slate-900/50 rounded-lg text-center border border-slate-800/30">لم يتم تضمين معلومات جامعية</div>;

  return (
    <div className="space-y-3">
      {colleges?.map(college => (
        <div key={college.id} className="border border-slate-800 bg-slate-800/20 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/40">
          <button
            className="flex items-center justify-between w-full text-right font-medium text-sm p-3 text-slate-200 hover:text-fuchsia-400 transition-colors"
            onClick={() => setExpandedCollege(expandedCollege === college.id ? null : college.id)}
          >
            <span className="flex items-center gap-3">
               <div className="p-1 rounded bg-slate-800/80 border border-slate-700 text-fuchsia-400">
                  {expandedCollege === college.id ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
               </div>
               {college.name_ar}
            </span>
          </button>
          
          {expandedCollege === college.id && (
            <div className="pr-6 pl-2 py-3 mt-1 border-t border-slate-800 bg-slate-900/30">
              <DepartmentsList collegeId={college.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DepartmentsList({ collegeId }: { collegeId: string }) {
  const { data: departments, isLoading } = useDepartments(collegeId);

  if (isLoading) return <div className="text-xs text-slate-400 mt-2 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> جاري تحميل الأقسام...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
        <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider">الأقسام</span>
      </div>
      {departments?.length ? (
        <div className="flex flex-col gap-2">
          {departments.map(d => (
            <span key={d.id} className="text-sm flex items-center text-slate-300 before:content-[''] before:w-1.5 before:h-1.5 before:bg-fuchsia-500/50 before:rounded-full before:ml-2">
              {d.name_ar}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-500 italic block">لم تتم إضافة أي أقسام بعد</span>
      )}
    </div>
  );
}
