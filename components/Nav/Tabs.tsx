import React from "react";
import { TabItem } from "../../lib/hooks/useTabs";
import { PrincipalTabId } from "../../pages/principal/[principalId]";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  tabs: TabItem<PrincipalTabId>[];
  handleTabChange: (name: string) => void;
};
export const Tabs = ({ tabs, handleTabChange }: Props) => {
  return (
    <>
      <div className="sm:hidden text-gray-850">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block py-2 pr-10 pl-3 w-full text-base sm:text-sm rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
          defaultValue={tabs.find((tab) => tab.current)?.name || tabs[0].name}
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
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8" aria-label="Tabs">
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
                    ? "border-indigo-100 dark:text-white text-gray-800"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300",
                  "whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                {tab.name}
                {tab.count ? (
                  <span
                    className={classNames(
                      tab.current
                        ? "bg-indigo-100 text-gray-900"
                        : "bg-gray-300 text-gray-800",
                      "hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block"
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};
