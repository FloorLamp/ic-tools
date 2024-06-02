import React from "react";

export default function PrincipalDetailsLoader({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <table className="w-full table-fixed animate-pulse">
        <thead className="block bg-heading">
          <tr className="flex">
            <th
              colSpan={2}
              className="flex flex-wrap flex-1 justify-between py-2 px-2"
            >
              <div className="flex gap-1">
                <label className="mr-4">Overview</label>
              </div>
              <div className="flex gap-1"></div>
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-gray-300 dark:divide-gray-700">
          {[...Array(10).keys()].map((_, i) => (
            <tr key={i} className="flex items-center p-1">
              <td className="py-2 px-2 mr-2 w-20 sm:w-44 h-7 bg-gray-400 rounded-md"></td>
              <td className="flex flex-1 gap-2 py-2 px-2 h-7 bg-gray-400 rounded-md"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
