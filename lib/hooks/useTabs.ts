import { useCallback, useEffect, useState } from "react";

export type TabItem<T extends string> = {
  name: T;
  current: boolean;
  count?: string;
};

export const useTabs = <T extends string>() => {
  const [tabs, setTabs] = useState<TabItem<T>[]>(() => []);

  const handleTabChange = useCallback(
    (tab: T) => {
      setTabs(
        tabs.map((t) => {
          if (t.name === tab) {
            return { ...t, current: true };
          } else {
            return { ...t, current: false };
          }
        })
      );
    },
    [tabs]
  );

  const addTab = useCallback((tabName: T, count?: string) => {
    setTabs((prev) => {
      if (prev.find((t) => t.name === tabName)) return prev;
      return [
        ...prev,
        {
          name: tabName,
          current: false,
          count,
        },
      ];
    });
  }, []);

  const removeTab = useCallback((tabName: T) => {
    setTabs((prev) => {
      return prev.filter((t) => t.name !== tabName);
    });
  }, []);

  // if no tab is selected, select the first one
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((tab) => tab.current)) {
      setTabs((prev) => {
        return prev.map((t, i) => {
          if (i === 0) {
            return { ...t, current: true };
          }
          return t;
        });
      });
    }
  }, [tabs]);

  return [tabs, handleTabChange, addTab, removeTab] as const;
};
