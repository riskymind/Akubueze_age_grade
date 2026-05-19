import Link from "next/link";
import { UserX } from "lucide-react";

export default function InactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">
          <UserX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Account inactive
        </h1>
        <p className="text-sm text-muted-foreground">
          This account is no longer active. Please contact your administrator
          for assistance.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
