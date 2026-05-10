import { Suspense } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Footer } from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader
        avatar={
          <Suspense
            fallback={
              <div className="w-9 h-9 rounded-full bg-green-light animate-pulse" />
            }
          >
            <UserAvatar />
          </Suspense>
        }
      />
      <div className="pb-20 lg:pb-0">
        {children}
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
