export const currentUser = {
  id: "usr_001",
  fullName: "Opara Kelechi",
  email: "kelechi@gmail.com",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
};

export const dashboardStats = {
  totalMembers: 17,
  totalMembersChange: "+12% from last month",
  upcomingMeetingsCount: 3,
  paymentsThisMonth: 125000,
  paymentsThisMonthChange: "+8% from last month",
  attendanceRate: 87,
  attendanceRateChange: "+5% from last month",
};

export const recentActivity = [
  {
    id: "act_001",
    description: "marked attendance for",
    subject: "May General Meeting",
    actor: "Okere Tochi",
    timeAgo: "2 hours ago",
  },
  {
    id: "act_002",
    description: "recorded payment of ₦5,000 -",
    subject: "Monthly Dues",
    actor: "Chukwu Chukwudi",
    timeAgo: "4 hours ago",
  },
  {
    id: "act_003",
    description: "updated profile information",
    subject: "Personal Details",
    actor: "Duru Chioma",
    timeAgo: "1 day ago",
  },
  {
    id: "act_004",
    description: "was added as",
    subject: "New Member",
    actor: "Ifeanyi Nwankwo",
    timeAgo: "2 days ago",
  },
  {
    id: "act_005",
    description: "marked attendance for",
    subject: "April General Meeting",
    actor: "Amara Okafor",
    timeAgo: "3 days ago",
  },
];

export const upcomingMeetings = [
  {
    id: "mtg_001",
    title: "May General Meeting",
    type: "GENERAL" as const,
    status: "SCHEDULED" as const,
    scheduledAt: "2026-05-20T10:00:00",
    location: "Community Center, Enugu",
  },
  {
    id: "mtg_002",
    title: "Executive Review",
    type: "EXECUTIVE" as const,
    status: "SCHEDULED" as const,
    scheduledAt: "2026-05-25T09:00:00",
    location: "Chairman's Residence",
  },
  {
    id: "mtg_003",
    title: "Annual General Assembly",
    type: "ANNUAL" as const,
    status: "SCHEDULED" as const,
    scheduledAt: "2026-06-10T10:00:00",
    location: "Town Hall, Enugu",
  },
];

export const announcements = [
  {
    id: "ann_001",
    title: "New Members Welcome",
    body: "Please join us in welcoming Ifeanyi Nwankwo and Blessing Okoro to our association.",
    isPinned: true,
    publishedAt: "2026-05-12T08:00:00",
    timeAgo: "2 days ago",
    author: "Amar John",
  },
  {
    id: "ann_002",
    title: "May General Meeting Venue Changed",
    body: "The May general meeting will now be held at the Community Center instead of the usual location.",
    isPinned: false,
    publishedAt: "2026-05-09T14:00:00",
    timeAgo: "5 days ago",
    author: "Amar John",
  },
];