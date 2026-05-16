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
  getCurrentUser,
  getDashboardStats,
  getUpcomingMeetings,
  getAnnouncements,
  getRecentActivity,
} from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

const MEETING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
};

function formatMeetingDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMeetingTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const [stats, upcomingMeetings, announcements, recentActivity] =
    await Promise.all([
      getDashboardStats(user.id, isAdmin),
      getUpcomingMeetings(),
      getAnnouncements(user.id),
      getRecentActivity(),
    ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {user.fullName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isAdmin && stats.totalMembers !== null && (
          <StatCard
            label="Total Members"
            value={stats.totalMembers.toString()}
            icon={<Users className="size-4 text-muted-foreground" />}
          />
        )}
        <StatCard
          label="Upcoming Meetings"
          value={stats.upcomingMeetingsCount.toString()}
          icon={<Calendar className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label={isAdmin ? "Payments This Month" : "My Payments This Month"}
          value={`₦${stats.paymentsThisMonth.toLocaleString()}`}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label={isAdmin ? "Attendance Rate" : "My Attendance Rate"}
          value={`${stats.attendanceRate}%`}
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
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
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
          )}
        </div>

        {/* Announcements */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Announcements
          </h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements.</p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((item) => (
                <li key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-start gap-1.5">
                    {item.isPinned && (
                      <Pin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <p
                      className={`text-sm font-medium leading-snug ${
                        item.isRead
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
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
          )}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Upcoming Meetings
        </h2>
        {upcomingMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
        ) : (
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
        )}
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
