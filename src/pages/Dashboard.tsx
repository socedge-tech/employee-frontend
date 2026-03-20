import { useState, useEffect } from "react";
import {
  Calendar, Clock, TrendingUp, Users, Award,
  CheckCircle2, ArrowUpRight, ArrowRight, Briefcase,
  Target, Heart, Zap, BookOpen, Trophy, Newspaper,
  ExternalLink, LogIn, LogOut, Sparkles, ChevronRight,
  Star, Bell, Filter, Settings, MoreVertical, Eye,
  EyeOff, Coffee, MessageCircle, UserPlus, TrendingDown,
  AlertCircle, CheckCircle, BarChart3, Lightbulb,
  PartyPopper, Loader2, FileText
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getEmployee } from "../api/employees";
import { getMyAttendanceLogs, checkIn, checkOut } from "../api/attendance";
import { toast } from "sonner";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeBasedInsight = () => {
  const hour = new Date().getHours();
  if (hour < 9) return "Perfect time to tackle important tasks! Your focus is at its peak.";
  if (hour < 12) return "You have 2 hours of deep work time before lunch.";
  if (hour < 14) return "Great time to catch up on messages and team sync.";
  if (hour < 17) return "Afternoon energy boost! Consider a quick break.";
  return "End of day approaching. Time to wrap up and plan for tomorrow.";
};

// Priority feed items - mixed content types
const priorityFeedItems = [
  {
    id: 1,
    type: "urgent-task",
    priority: "high",
    title: "Complete Q1 Performance Self-Assessment",
    description: "Your review cycle closes in 2 days",
    dueDate: "Due in 2 days",
    action: "Start Now",
    icon: AlertCircle,
    color: "red",
  },
  {
    id: 2,
    type: "approval",
    priority: "high",
    title: "Time Off Request - Sarah Chen",
    description: "Vacation: Mar 20-24 (5 days)",
    action: "Review",
    icon: Calendar,
    color: "blue",
    showIfManager: true,
  },
  {
    id: 3,
    type: "recognition",
    priority: "medium",
    title: "Mike Johnson recognized you",
    description: '"Amazing work on the design system refresh! 🎉"',
    time: "2 hours ago",
    icon: Award,
    color: "yellow",
  },
  {
    id: 4,
    type: "learning",
    priority: "medium",
    title: "Continue: Advanced Figma Prototyping",
    description: "You're 65% complete • 2 modules left",
    progress: 65,
    action: "Continue",
    icon: BookOpen,
    color: "purple",
  },
  {
    id: 5,
    type: "team-update",
    priority: "low",
    title: "3 team members completed Security Training",
    description: "Your team is 80% compliant with Q1 training goals",
    icon: Users,
    color: "green",
  },
  {
    id: 6,
    type: "suggestion",
    priority: "low",
    title: "Connect with Jessica Liu from Engineering",
    description: "You both work on the mobile app redesign project",
    action: "View Profile",
    icon: UserPlus,
    color: "blue",
  },
];

const activeGoals = [
  {
    id: 1,
    title: "Master Advanced Design Systems",
    current: 68,
    target: 100,
    category: "Learning",
    dueDate: "End of Q1",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 2,
    title: "Ship Mobile App Redesign",
    current: 45,
    target: 100,
    category: "Project",
    dueDate: "Mar 30",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    title: "Mentor 2 Junior Designers",
    current: 75,
    target: 100,
    category: "Growth",
    dueDate: "Ongoing",
    color: "from-pink-500 to-pink-600",
  },
];

const upcomingEvents = [
  { title: "Product Team Standup", time: "10:00 AM", type: "meeting", attendees: 8 },
  { title: "Design Review: Mobile App", time: "2:00 PM", type: "meeting", attendees: 12 },
  { title: "1:1 with Emily (Manager)", time: "4:00 PM", type: "1on1", attendees: 2 },
];

const aiRecommendations = [
  {
    title: "Recommended Course: Accessibility in Design",
    reason: "Based on your role and recent project work",
    icon: Lightbulb,
    action: "Explore",
  },
  {
    title: "Update your Skills Profile",
    reason: "You've completed 3 courses this month",
    icon: Star,
    action: "Update",
  },
  {
    title: "Schedule Career Development Chat",
    reason: "It's been 60 days since your last check-in",
    icon: TrendingUp,
    action: "Schedule",
  },
];

const companyNews = [
  {
    title: "Q1 2026 Results Exceed Expectations",
    excerpt: "Company achieves 35% revenue growth and expands team by 150 employees.",
    date: "March 12, 2026",
    category: "Company Update",
    image: "https://images.unsplash.com/photo-1769740333462-9a63bfa914bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NzM0MjU0MjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    relevance: "company",
  },
  {
    title: "New Design System 2.0 Launched",
    excerpt: "Unified component library now available across all products.",
    date: "March 10, 2026",
    category: "Product & Design",
    image: "https://images.unsplash.com/photo-1622127800610-3022cb75dc90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzczNDU3MDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    relevance: "department",
  },
];

const trendingNews = [
  {
    title: "AI Revolution Transforms Workplace Productivity",
    source: "Tech Industry Today",
    excerpt: "Latest studies show 40% increase in employee efficiency with AI-powered tools.",
    date: "2 hours ago",
    image: "https://images.unsplash.com/photo-1658124974726-d96bc44783cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlJTIwbGFwdG9wfGVufDF8fHx8MTc3MzQyNTk4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Design Trends 2026: What's Next in UX",
    source: "Design Weekly",
    excerpt: "Top designers share insights on emerging patterns and user expectations.",
    date: "5 hours ago",
    image: "https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NzM0ODc2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const quickAccessItems = [
  { label: "PTO Policy", icon: FileText, path: "/documents" },
  { label: "IT Support", icon: Briefcase, path: "/it-requests" },
  { label: "Benefits Guide", icon: Heart, path: "/documents" },
  { label: "Directory", icon: Users, path: "/directory" },
];

const engagementData = [
  { week: "W1", score: 82 },
  { week: "W2", score: 85 },
  { week: "W3", score: 88 },
  { week: "W4", score: 92 },
];

const calendarEvents = [
  { date: 14, type: "today", events: 3 },
  { date: 15, type: "event", title: "Team Standup", time: "9:00 AM" },
  { date: 16, type: "event", title: "1:1 with Manager", time: "2:00 PM" },
  { date: 18, type: "event", title: "Design Review", time: "10:00 AM" },
  { date: 20, type: "deadline", title: "Q1 Review Due" },
  { date: 22, type: "event", title: "All Hands Meeting", time: "3:00 PM" },
  { date: 25, type: "holiday", title: "Company Holiday" },
];

export function Dashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"for-you" | "team" | "company">("for-you");
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [newsTab, setNewsTab] = useState<"company" | "trending">("company");
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // LIVE API STATES
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [now, setNow] = useState(new Date());

  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // refresh every minute for checking out counters
    return () => clearInterval(timer);
  }, []);

  // Fetch initial profile & attendance
  useEffect(() => {
    if (user?.id) {
      getEmployee(Number(user.id))
        .then(setEmployeeDetails)
        .catch(err => console.error("Failed to load employee details for dashboard", err));

      getMyAttendanceLogs()
        .then(res => setAttendanceLogs(res.data || []))
        .catch(err => console.error("Failed to load attendance logs", err));
    }
  }, [user?.id]);

  // Derived Log state
  // Compare by UTC date string (YYYY-MM-DD) — matches how the backend stores dates.
  // Using local midnight causes mismatch when the client is in IST (+5:30):
  //   e.g. March 20 00:54 IST = March 19 19:24 UTC → stored date is "2026-03-19"
  const todayUTCDate = now.toISOString().split('T')[0]; // e.g. "2026-03-19"
  const todayLog = attendanceLogs.find(log => {
    const logUTCDate = new Date(log.date).toISOString().split('T')[0];
    return logUTCDate === todayUTCDate;
  });

  const isCheckedInToday = !!todayLog && !todayLog.check_out;
  const isCheckedOutToday = !!todayLog && !!todayLog.check_out;

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await checkIn();
      toast.success("Checked in successfully!");
      const res = await getMyAttendanceLogs();
      setAttendanceLogs(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to check in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await checkOut();
      toast.success("Checked out successfully!");
      const res = await getMyAttendanceLogs();
      setAttendanceLogs(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to check out");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getTodayHours = () => {
    if (!todayLog) return "0h 0m";
    if (todayLog.work_hours) {
      const hrs = Math.floor(todayLog.work_hours);
      const mins = Math.round((todayLog.work_hours - hrs) * 60);
      return `${hrs}h ${mins}m`;
    }
    if (todayLog.check_in) {
      const msDate = now.getTime() - new Date(todayLog.check_in).getTime();
      const totalMins = Math.floor(msDate / 60000);
      const hrs = Math.floor(totalMins / 60);
      const mins = Math.floor(totalMins % 60);
      return `${hrs}h ${mins}m`;
    }
    return "0h 0m";
  };

  const getWeekHours = () => {
    let totalMs = 0;
    const currentDay = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    weekStart.setHours(0, 0, 0, 0);

    attendanceLogs.forEach(log => {
      const d = new Date(log.date);
      if (d >= weekStart && d <= now) {
        if (log.work_hours) {
          totalMs += log.work_hours * 60 * 60 * 1000;
        } else if (log.check_in && !log.check_out && d.getDate() === now.getDate()) {
          totalMs += now.getTime() - new Date(log.check_in).getTime();
        }
      }
    });

    const totalMins = Math.floor(totalMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = Math.floor(totalMins % 60);
    return `${hrs}h ${mins}m`;
  };

  const calculateStreak = () => {
    if (!attendanceLogs.length) return 0;

    // Work with UTC date strings (YYYY-MM-DD) to match backend storage
    const toUTC = (d: Date) => d.toISOString().split('T')[0]; // "2026-03-19"

    // Sort by UTC date descending
    const sorted = [...attendanceLogs]
      .filter(log => log.status === 'PRESENT' || log.status === 'LATE')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    // Start from today's UTC date
    let expectedUTC = toUTC(now); // e.g. "2026-03-19"

    const hasTodayLog = sorted.some(l => toUTC(new Date(l.date)) === expectedUTC);
    if (!hasTodayLog) {
      // Allow streak to continue even if today's check-in hasn't happened yet
      const prev = new Date(now);
      prev.setUTCDate(prev.getUTCDate() - 1);
      expectedUTC = toUTC(prev);
    }

    for (const log of sorted) {
      const logUTC = toUTC(new Date(log.date));

      if (logUTC === expectedUTC) {
        streak++;
        const prev = new Date(expectedUTC + 'T00:00:00Z');
        prev.setUTCDate(prev.getUTCDate() - 1);
        expectedUTC = toUTC(prev);
      } else if (logUTC < expectedUTC) {
        // Skip weekends — check backward from expected until we hit logUTC or a weekday
        let tempDate = new Date(expectedUTC + 'T00:00:00Z');
        while (toUTC(tempDate) > logUTC) {
          const day = tempDate.getUTCDay(); // 0=Sun, 6=Sat
          if (day === 0 || day === 6) {
            tempDate.setUTCDate(tempDate.getUTCDate() - 1);
          } else {
            break;
          }
        }
        if (toUTC(tempDate) === logUTC) {
          streak++;
          tempDate.setUTCDate(tempDate.getUTCDate() - 1);
          expectedUTC = toUTC(tempDate);
        } else {
          break;
        }
      }
    }

    return streak;
  };

  // Name: prefer first_name from details > username from API > part of user.name before '@'
  const rawFallbackName = user?.name?.includes('@')
    ? user.name.split('@')[0]           // strip email domain
    : user?.name?.split(' ')[0] ?? 'User';
  const displayFirstName = employeeDetails?.details?.first_name
    || employeeDetails?.username
    || rawFallbackName
    || 'User';
  const displayLastName = employeeDetails?.details?.last_name || '';
  const avatarInitials = [
    (displayFirstName[0] || '').toUpperCase(),
    (displayLastName[0] || '').toUpperCase(),
  ].join('') || 'U';
  // Role: prefer job_role from details > first assigned role name > auth role
  const apiRoleName = employeeDetails?.roles?.[0]?.role?.role_name;
  const displayRole = employeeDetails?.details?.job_role
    || (apiRoleName ? apiRoleName.replace(/\b\w/g, (c: string) => c.toUpperCase()) : null)
    || user?.role?.replace(/_/g, ' ')
    || 'Employee';
  const displayDepart = employeeDetails?.details?.department?.department_name || '';


  const toggleWidget = (widgetId: string) => {
    setHiddenWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const isWidgetVisible = (widgetId: string) => !hiddenWidgets.includes(widgetId);

  // Filter feed based on active tab
  const getFilteredFeed = () => {
    if (activeTab === "team") {
      return priorityFeedItems.filter(item =>
        ["approval", "team-update"].includes(item.type)
      );
    }
    if (activeTab === "company") {
      return priorityFeedItems.filter(item =>
        item.type === "team-update"
      );
    }
    return priorityFeedItems; // Show all for testing
  };

  const filteredFeed = getFilteredFeed();

  // Auto-rotate news carousel
  useEffect(() => {
    const currentNewsList = newsTab === "company" ? companyNews : trendingNews;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % currentNewsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsTab]);

  const getCurrentNews = () => {
    const currentNewsList = newsTab === "company" ? companyNews : trendingNews;
    const mainIndex = currentNewsIndex % currentNewsList.length;
    const previewIndex = (currentNewsIndex + 1) % currentNewsList.length;

    return {
      main: currentNewsList[mainIndex],
      preview: currentNewsList[previewIndex],
      isCompany: newsTab === "company"
    };
  };

  const newsData = getCurrentNews();

  return (
    <div className="space-y-6">
      {/* Personalized Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30 shadow-lg">
                {avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">
                    {getGreeting()}, <span className="capitalize">{displayFirstName}</span>! 👋
                  </h1>
                </div>
                <p className="text-blue-100 text-sm">{displayRole} • {displayDepart}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-xs text-blue-100">Streak</p>
                <p className="text-xl font-bold text-white">{calculateStreak()} days</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-xs text-blue-100">Tasks</p>
                <p className="text-xl font-bold text-white">3 pending</p>
              </div>
            </div>
          </div>

          {/* AI Insight & Primary Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-50 mb-1 font-medium">AI Insight</p>
                <p className="text-white text-base">{getTimeBasedInsight()}</p>
              </div>
            </div>
          </div>

          {/* Compact Attendance + Primary Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm font-semibold text-white">Attendance Today</p>
                    <p className="text-xs text-blue-100">{currentDate}</p>
                  </div>
                </div>
                {isCheckedInToday ? (
                  <button
                    disabled={isCheckingOut || isCheckedOutToday}
                    onClick={handleCheckOut}
                    className={`flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all border border-white/30 ${isCheckedOutToday ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/80 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105'}`}
                  >
                    {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {isCheckedOutToday ? "Checked Out" : "Check Out"}
                  </button>
                ) : (
                  <button
                    disabled={isCheckingIn}
                    onClick={handleCheckIn}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 rounded-lg text-blue-600 text-sm font-medium transition-all shadow-lg hover:scale-105"
                  >
                    {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Check In
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-blue-100">Check In</p>
                  <p className="text-sm font-semibold text-white">{todayLog?.check_in ? new Date(todayLog.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : " "}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-100">Today</p>
                  <p className="text-sm font-semibold text-white">{getTodayHours()}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-100">This Week</p>
                  <p className="text-sm font-semibold text-white">{getWeekHours()}</p>
                </div>
              </div>
            </div>

            {/* Primary Action */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <p className="text-sm font-semibold text-white mb-3">Most Important Right Now</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mb-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">Performance Self-Assessment</p>
                    <p className="text-xs text-blue-100">Due in 2 days</p>
                  </div>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-white hover:bg-white/90 rounded-lg text-blue-600 font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                Start Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals - Compact View */}
      {isWidgetVisible("goals") && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Your Active Goals</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {activeGoals.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWidget("goals")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Hide widget"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-slate-700">
                    {goal.category}
                  </span>
                  <MoreVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">{goal.title}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${goal.color} rounded-full h-2 transition-all`}
                      style={{ width: `${goal.current}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{goal.current}%</span>
                </div>
                <p className="text-xs text-slate-500">{goal.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Feed with Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Your Priority Feed</h3>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("for-you")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "for-you"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "team"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "company"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            Company
          </button>
        </div>

        {/* Feed Items */}
        <div className="space-y-3">
          {filteredFeed.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">All caught up! No items in this feed.</p>
            </div>
          ) : (
            filteredFeed.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))
          )}
        </div>
      </div>

      {/* Two Column Layout: Upcoming Events + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Today */}
        {isWidgetVisible("events") && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Today</h3>
              </div>
              <button
                onClick={() => toggleWidget("events")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl hover:from-slate-100 transition-colors border border-slate-200/40"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <p className="text-xs text-slate-500">{event.time}</p>
                      <span className="text-xs text-slate-400">•</span>
                      <Users className="w-3 h-3 text-slate-400" />
                      <p className="text-xs text-slate-500">{event.attendees} attending</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {isWidgetVisible("recommendations") && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Recommended for You</h3>
              </div>
              <button
                onClick={() => toggleWidget("recommendations")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-200/40 hover:from-blue-100 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <rec.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-1">{rec.title}</p>
                      <p className="text-xs text-slate-600">{rec.reason}</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Score - Compact */}
        {isWidgetVisible("engagement") && (
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Your Engagement Trend</h3>
                <p className="text-sm text-slate-500">Last 4 weeks • +12% increase</p>
              </div>
              <button
                onClick={() => toggleWidget("engagement")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="dashboardEngagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" key="dashboard-grid" />
                <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: '12px' }} key="dashboard-xaxis" />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} key="dashboard-yaxis" />
                <Tooltip
                  key="dashboard-tooltip"
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#dashboardEngagementGradient)" key="engagement-area" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Access */}
        {isWidgetVisible("quick-access") && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Quick Access</h3>
              <button
                onClick={() => toggleWidget("quick-access")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2">
              {quickAccessItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left group"
                >
                  <item.icon className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900 flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Widget */}
      {isWidgetVisible("calendar") && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">March 2026</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWidget("calendar")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View Full
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center">
                <p className="text-xs font-semibold text-slate-500">{day}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Previous month days */}
            {[28, 29].map((day) => (
              <button
                key={`prev-${day}`}
                className="aspect-square flex items-center justify-center rounded-lg text-sm text-slate-300 hover:bg-slate-50 transition-colors"
              >
                {day}
              </button>
            ))}

            {/* Current month days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const event = calendarEvents.find(e => e.date === day);
              const isToday = day === 14;
              const hasEvent = !!event && event.type !== 'today';

              return (
                <button
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative group ${isToday
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30'
                      : hasEvent && event.type === 'holiday'
                        ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-700 hover:from-green-200 hover:to-green-100 border border-green-200'
                        : hasEvent && event.type === 'deadline'
                          ? 'bg-gradient-to-br from-red-100 to-red-50 text-red-700 hover:from-red-200 hover:to-red-100 border border-red-200'
                          : hasEvent
                            ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 hover:from-blue-200 hover:to-blue-100 border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span>{day}</span>
                  {hasEvent && event.type === 'event' && event.events && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  )}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  )}

                  {/* Tooltip on hover */}
                  {hasEvent && event.title && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <p className="font-semibold">{event.title}</p>
                      {event.time && <p className="text-slate-300">{event.time}</p>}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Next month days */}
            {[1, 2, 3, 4, 5].map((day) => (
              <button
                key={`next-${day}`}
                className="aspect-square flex items-center justify-center rounded-lg text-sm text-slate-300 hover:bg-slate-50 transition-colors"
              >
                {day}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-5 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded"></div>
              <span className="text-slate-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded"></div>
              <span className="text-slate-600">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-red-100 to-red-50 border border-red-200 rounded"></div>
              <span className="text-slate-600">Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded"></div>
              <span className="text-slate-600">Holidays</span>
            </div>
          </div>
        </div>
      )}

      {/* News Sections - Compact Cards */}
      {isWidgetVisible("news") && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">News & Updates</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWidget("news")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* News Tabs */}
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
            <button
              onClick={() => setNewsTab("company")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newsTab === "company"
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Company News
            </button>
            <button
              onClick={() => setNewsTab("trending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newsTab === "trending"
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Trending
              </div>
            </button>
          </div>

          {/* Company News Tab Content */}
          {newsTab === "company" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Relevant to you
                </span>
              </div>

              {/* Main news (3/4 width) + Preview news (1/4 width) */}
              <div className="flex gap-4">
                {/* Main News - 3/4 width */}
                <div
                  onClick={() => setCurrentNewsIndex((prev) => (prev + 1) % companyNews.length)}
                  className="flex-[3] group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 hover:from-blue-100 hover:to-slate-100 transition-all border border-slate-200/60 hover:shadow-xl animate-fade-in-up"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={newsData.isCompany ? (newsData.main as typeof companyNews[0]).image : (newsData.main as typeof trendingNews[0]).image}
                      alt={newsData.main.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    {newsData.isCompany && (newsData.main as typeof companyNews[0]).relevance === "department" && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                          Your Dept
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-xs font-semibold text-white/90 mb-2">
                        {newsData.isCompany ? (newsData.main as typeof companyNews[0]).category : (newsData.main as typeof trendingNews[0]).source}
                      </p>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {newsData.main.title}
                      </h3>
                      <p className="text-sm text-white/90 line-clamp-2 mb-3">
                        {newsData.main.excerpt}
                      </p>
                      <p className="text-xs text-white/70">{newsData.main.date}</p>
                    </div>
                  </div>
                </div>

                {/* Preview News - 1/4 width */}
                <div
                  onClick={() => setCurrentNewsIndex((prev) => (prev + 1) % companyNews.length)}
                  className="flex-[1] group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all border border-slate-200/60 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
                >
                  <div className="relative h-full min-h-[224px] overflow-hidden flex flex-col">
                    <div className="relative h-32 overflow-hidden flex-shrink-0">
                      <img
                        src={newsData.isCompany ? (newsData.preview as typeof companyNews[0]).image : (newsData.preview as typeof trendingNews[0]).image}
                        alt={newsData.preview.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          Up Next
                        </p>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-3 group-hover:text-blue-600 transition-colors">
                          {newsData.preview.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-5000"
                            style={{ width: `${((currentNewsIndex % companyNews.length) / (companyNews.length - 1)) * 100}%` }}
                          ></div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trending News Tab Content */}
          {newsTab === "trending" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  Industry Insights
                </span>
              </div>

              {/* Main news (3/4 width) + Preview news (1/4 width) */}
              <div className="flex gap-4">
                {/* Main News - 3/4 width */}
                <div
                  onClick={() => setCurrentNewsIndex((prev) => (prev + 1) % trendingNews.length)}
                  className="flex-[3] group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-slate-50 hover:from-purple-100 hover:to-slate-100 transition-all border border-slate-200/60 hover:shadow-xl animate-fade-in-up"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={(newsData.main as typeof trendingNews[0]).image}
                      alt={newsData.main.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                        <ExternalLink className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-semibold text-slate-900">
                          {(newsData.main as typeof trendingNews[0]).source}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {newsData.main.title}
                      </h3>
                      <p className="text-sm text-white/90 line-clamp-2 mb-3">
                        {newsData.main.excerpt}
                      </p>
                      <p className="text-xs text-white/70">{newsData.main.date}</p>
                    </div>
                  </div>
                </div>

                {/* Preview News - 1/4 width */}
                <div
                  onClick={() => setCurrentNewsIndex((prev) => (prev + 1) % trendingNews.length)}
                  className="flex-[1] group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all border border-slate-200/60 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
                >
                  <div className="relative h-full min-h-[224px] overflow-hidden flex flex-col">
                    <div className="relative h-32 overflow-hidden flex-shrink-0">
                      <img
                        src={(newsData.preview as typeof trendingNews[0]).image}
                        alt={newsData.preview.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          Up Next
                        </p>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-3 group-hover:text-purple-600 transition-colors">
                          {newsData.preview.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-5000"
                            style={{ width: `${((currentNewsIndex % trendingNews.length) / (trendingNews.length - 1)) * 100}%` }}
                          ></div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Widget Customization Helper */}
      {hiddenWidgets.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-600">
                {hiddenWidgets.length} widget{hiddenWidgets.length > 1 ? 's' : ''} hidden
              </p>
            </div>
            <button
              onClick={() => setHiddenWidgets([])}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Show All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Feed Item Component
function FeedItem({ item }: { item: any }) {
  const priorityColors = {
    high: "border-red-200 bg-red-50/50",
    medium: "border-yellow-200 bg-yellow-50/50",
    low: "border-slate-200 bg-slate-50/50",
  };

  const iconColors = {
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:shadow-md ${priorityColors[item.priority as keyof typeof priorityColors]
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconColors[item.color as keyof typeof iconColors]} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
          <item.icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
            {item.priority === "high" && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex-shrink-0">
                Urgent
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-2">{item.description}</p>

          {item.progress !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-1.5 transition-all"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-slate-700">{item.progress}%</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {item.time && (
              <span className="text-xs text-slate-500">{item.time}</span>
            )}
            {item.dueDate && (
              <span className="text-xs text-slate-500">{item.dueDate}</span>
            )}
          </div>
        </div>

        {item.action && (
          <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 transition-all flex-shrink-0">
            {item.action}
          </button>
        )}
      </div>
    </div>
  );
}