import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">
          <ShieldOff className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Account suspended
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account has been suspended. Please contact your administrator to
          resolve this.
        </p>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
