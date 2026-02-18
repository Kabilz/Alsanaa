import { GraduationCap, BookOpen, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onAddCourse: () => void;
  activeView: "courses" | "add";
}

export function Sidebar({ onAddCourse, activeView }: SidebarProps) {
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary-sm">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sidebar-foreground">
              Course Admin
            </h2>
            <p className="text-xs text-muted-foreground">Management Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            activeView === "courses" && "bg-sidebar-accent text-sidebar-primary"
          )}
        >
          <BookOpen className="w-4 h-4" />
          All Courses
        </Button>
        
        <Button
          variant="ghost"
          onClick={onAddCourse}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            activeView === "add" && "bg-sidebar-accent text-sidebar-primary"
          )}
        >
          <PlusCircle className="w-4 h-4" />
          Add Course
        </Button>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-medium text-sidebar-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
