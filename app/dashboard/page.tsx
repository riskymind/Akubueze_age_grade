import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Pin,
  MapPin,
  Clock,
  Wallet,
} from "lucide-react";
import {
  getCurrentUser,
  getDashboardStats,
  getUpcomingMeetings,
  getAnnouncements,
  getRecentActivity,
  getMemberDashboardData,
} from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

const MEETING_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  EXECUTIVE: "Executive",
  EMERGENCY: "Emergency",
  ANNUAL: "Annual",
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  MEETING_HOST_FEE: "Meeting Host Fee",
  MEETING_DUES: "Meeting Dues",
  DEVELOPMENT_LEVY: "Development Levy",
  EVENT_CONTRIBUTION: "Event Contribution",
  FINE: "Fine",
  DONATION: "Donation",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

function formatAmount(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  if (!isAdmin) {
    return <MemberDashboard userId={user.id} fullName={user.fullName} />;
  }

  const [stats, upcomingMeetings, announcements, recentActivity] =
    await Promise.all([
      getDashboardStats(user.id, true),
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
        {stats.totalMembers !== null && (
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
          label="Payments This Month"
          value={formatAmount(stats.paymentsThisMonth)}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Attendance Rate"
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

async function MemberDashboard({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const [data, announcements] = await Promise.all([
    getMemberDashboardData(userId),
    getAnnouncements(userId),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {fullName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Next Meeting"
          value={
            data.nextMeeting
              ? data.nextMeeting.scheduledAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "None scheduled"
          }
          icon={<Calendar className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="My Attendance Rate"
          value={`${data.attendanceRate}%`}
          icon={<CheckCircle className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="My Outstanding Balance"
          value={formatAmount(data.outstandingBalance)}
          icon={<Wallet className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Next Meeting detail + Your Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Next Meeting detail */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Next Meeting
          </h2>
          {data.nextMeeting ? (
            <div className="space-y-3">
              <div>
                <p className="text-base font-medium text-foreground">
                  {data.nextMeeting.title}
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {MEETING_TYPE_LABELS[data.nextMeeting.type] ??
                    data.nextMeeting.type}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {formatMeetingDate(data.nextMeeting.scheduledAt)} at{" "}
                  {formatMeetingTime(data.nextMeeting.scheduledAt)}
                </span>
                {data.nextMeeting.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {data.nextMeeting.location}
                  </span>
                )}
              </div>
              <div className="mt-3 rounded-md bg-muted/50 border border-border px-4 py-2.5 text-sm text-muted-foreground">
                Mark your attendance when the meeting starts to get credit for
                attendance.
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming meetings scheduled.
            </p>
          )}
        </div>

        {/* Your Profile */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Your Profile
          </h2>
          <div className="space-y-4">
            <ProfileRow
              label="MEMBER SINCE"
              value={formatDate(data.memberSince)}
            />
            <ProfileRow
              label="MEMBER STATUS"
              value={
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    data.memberStatus === "ACTIVE"
                      ? "bg-green-500/15 text-green-500"
                      : data.memberStatus === "SUSPENDED"
                      ? "bg-red-500/15 text-red-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.memberStatus === "ACTIVE"
                    ? "Active"
                    : data.memberStatus === "SUSPENDED"
                    ? "Suspended"
                    : "Inactive"}
                </span>
              }
            />
            <ProfileRow
              label="DUES STATUS"
              value={
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    data.duesStatus === "Paid to Date"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-amber-500/15 text-amber-500"
                  }`}
                >
                  {data.duesStatus}
                </span>
              }
            />
            <ProfileRow
              label="TOTAL PAID THIS YEAR"
              value={formatAmount(data.totalPaidThisYear)}
            />
          </div>
        </div>
      </div>

      {/* My Recent Payments + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Recent Payments */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            My Recent Payments
          </h2>
          {data.recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
                      Payment Type
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 text-foreground">
                        {PAYMENT_TYPE_LABELS[payment.type] ?? payment.type}
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {(payment.paidAt ?? payment.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            payment.status === "PAID"
                              ? "bg-green-500/15 text-green-500"
                              : payment.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {payment.status === "PAID"
                            ? "Paid"
                            : payment.status === "PENDING"
                            ? "Pending"
                            : "Waived"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {typeof value === "string" ? (
        <span className="text-sm text-foreground">{value}</span>
      ) : (
        value
      )}
    </div>
  );
}
