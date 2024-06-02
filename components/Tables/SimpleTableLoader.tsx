import classNames from "classnames";

const SimpleTablePlaceHolder = ({ rows = 20 }: { rows?: number }) => {
  return (
    <>
      <table className="animate-pulse w-full table-fixed">
        <thead className="bg-heading">
          <tr className="h-5 flex justify-between">
            <th
              className={classNames("px-10 py-2 bg-gray-400 rounded-md")}
            ></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default">
          {[...Array(rows).keys()].map((_, i) => (
            <tr
              key={i}
              className="h-5 flex flex-wrap bg-gray-400 rounded-md mt-2"
            ></tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SimpleTablePlaceHolder;
