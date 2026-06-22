import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

function ProfileFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 dark:bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm">Đang tải hồ sơ...</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
