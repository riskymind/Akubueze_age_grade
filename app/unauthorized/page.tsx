import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Access denied
        </h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view this page.
        </p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
