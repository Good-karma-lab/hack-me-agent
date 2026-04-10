"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type RunLiveRefreshProps = {
  active: boolean;
};

export function RunLiveRefresh({ active }: RunLiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [active, router]);

  return null;
}
