import React from "react";
import { TabItem } from "../../lib/hooks/useTabs";
import { CandidSecondaryTabId } from "../../pages/principal/[principalId]";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  tabs: TabItem<CandidSecondaryTabId>[];
  handleTabChange: (name: string) => void;
};

export const SecondaryTab = ({ tabs, handleTabChange }: Props) => {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.current).name}
          onChange={(e) => {
            handleTabChange(e.target.value);
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <a
              onClick={(e) => {
                e.preventDefault();
                handleTabChange(tab.name);
              }}
              href="#"
              key={tab.name}
              className={classNames(
                tab.current
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-400 hover:text-gray-600",
                "px-3 py-2 font-medium text-sm rounded-md"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              {tab.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
