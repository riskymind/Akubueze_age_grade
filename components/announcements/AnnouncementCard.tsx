"use client";

import { useState } from "react";
import { Pin, X } from "lucide-react";
import { markAnnouncementRead } from "@/actions/announcements";

type Props = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishedAt: Date;
  authorName: string;
  isRead: boolean;
  userId: string;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AnnouncementCard({
  id,
  title,
  body,
  isPinned,
  publishedAt,
  authorName,
  isRead: initialIsRead,
  userId,
}: Props) {
  const [isRead, setIsRead] = useState(initialIsRead);

  async function handleDismiss() {
    setIsRead(true);
    await markAnnouncementRead(id, userId);
  }

  return (
    <div
      className={`relative p-4 rounded-lg border transition-colors ${
        isRead
          ? "bg-card border-border opacity-60"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isPinned && (
            <Pin className="size-3.5 text-muted-foreground shrink-0 rotate-45" />
          )}
          <h3 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h3>
        </div>
        {!isRead && (
          <button
            onClick={handleDismiss}
            className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {body}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Posted by {authorName} on {formatDate(publishedAt)}
      </p>
    </div>
  );
}
