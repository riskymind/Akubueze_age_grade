import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Pin,
  MapPin,
  Clock,
} from "lucide-react";
import {
  currentUser,
  dashboardStats,
  recentActivity,
  announcements,
  upcomingMeetings,
} from "@/lib/mock-data";

const MEETING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
};

function formatMeetingDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMeetingTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {currentUser.fullName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={dashboardStats.totalMembers.toString()}
          change={dashboardStats.totalMembersChange}
          icon={<Users className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Upcoming Meetings"
          value={dashboardStats.upcomingMeetingsCount.toString()}
          icon={<Calendar className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Payments This Month"
          value={`₦${dashboardStats.paymentsThisMonth.toLocaleString()}`}
          change={dashboardStats.paymentsThisMonthChange}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Attendance Rate"
          value={`${dashboardStats.attendanceRate}%`}
          change={dashboardStats.attendanceRateChange}
          icon={<CheckCircle className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Middle: Recent Activity + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-0">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 pb-4 mb-4 border-b border-border last:border-0 last:pb-0 last:mb-0"
              >
                <p className="text-sm text-foreground">
                  <span className="font-medium">{item.actor}</span>{" "}
                  {item.description}{" "}
                  <span className="font-medium">{item.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Announcements
          </h2>
          <ul className="space-y-4">
            {announcements.map((item) => (
              <li key={item.id} className="flex flex-col gap-1">
                <div className="flex items-start gap-1.5">
                  {item.isPinned && (
                    <Pin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {item.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.body}
                </p>
                <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Upcoming Meetings
        </h2>
        <ul className="space-y-3">
          {upcomingMeetings.map((meeting) => (
            <li
              key={meeting.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {meeting.title}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {MEETING_TYPE_LABELS[meeting.type] ?? meeting.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatMeetingDate(meeting.scheduledAt)},{" "}
                    {formatMeetingTime(meeting.scheduledAt)}
                  </span>
                  {meeting.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {meeting.location}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {change && (
          <span className="text-xs text-muted-foreground">{change}</span>
        )}
      </div>
    </div>
  );
}
