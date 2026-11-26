import { useEffect, useState } from "react";

import { readStartFlags, type StartFlags } from "@/lib/storage/flags";

export function useStartFlags(): StartFlags | null {
  const [flags, setFlags] = useState<StartFlags | null>(null);

  useEffect(() => {
    let active = true;
    readStartFlags().then((result) => {
      if (active) {
        setFlags(result);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return flags;
}
