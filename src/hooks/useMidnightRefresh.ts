import { useEffect, useRef } from "react";

export function useMidnightRefresh(onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function scheduleNextMidnight() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      timer = setTimeout(() => {
        onRefreshRef.current();
        scheduleNextMidnight();
      }, midnight.getTime() - now.getTime());
    }

    scheduleNextMidnight();
    return () => clearTimeout(timer);
  }, []);
}
