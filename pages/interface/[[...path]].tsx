import fs from "fs";
import glob from "glob";
import Link from "next/link";
import { useRouter } from "next/router";
import path from "path";
import React, { useEffect, useState } from "react";
import { BiPencil } from "react-icons/bi";
import { FiFilePlus } from "react-icons/fi";
import ActiveLink from "../../components/ActiveLink";
import CodeBlock from "../../components/CodeBlock";

const didc = import("../../lib/didc-js/didc_js");
const GITHUB_REPO = "https://github.com/ic-cubes/ic-tools";

export async function getStaticPaths() {
  const base = `${process.cwd()}/public/interfaces`;
  const paths = glob
    .sync(`${base}/**/*.did`)
    .concat(glob.sync(`${base}/**/*/`))
    .map((did) => ({
      params: {
        path: path
          .relative(base, did)
          .replace(/\.did$/, "")
          .split("/"),
      },
    }))
    .concat([{ params: { path: null } }]); // root path

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { path: path_ = "" } }) {
  const current = (typeof path_ === "string" ? [path_] : path_).join("/");
  const base = `${process.cwd()}/public/interfaces/${current}`;

  // If directory, list children
  let children = null;
  if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
    children = glob
      .sync(`${base}/**/*.did`)
      .map((did) => path.relative(base, did).replace(/\.did$/, ""));
  }

  return {
    props: {
      current,
      children,
    },
  };
}

const Interface = ({ current, children }) => {
  const router = useRouter();
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState(null);
  const { path: path_ } = router.query;

  useEffect(() => {
    if (current) {
      fetch(`/interfaces/${current}.did`)
        .then((res) => res.text())
        .then((data) => {
          setCandid(data);
          didc.then((mod) => {
            const gen = mod.generate(data);
            setBindings(gen);
          });
        })
        .catch(console.error);
    } else {
      setCandid("");
    }
  }, [current]);

  let title;
  if (path_) {
    let joined = "";
    title = (typeof path_ === "string" ? [path_] : path_).map((part, i) => {
      joined += `/${part}`;
      return [
        <span key={i} className="px-1">
          /
        </span>,
        <ActiveLink
          key={joined}
          href={`/interface${joined}`}
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          {part}
        </ActiveLink>,
      ];
    });
  }

  return (
    <div className="py-16">
      <h1 className="text-3xl mb-8">
        <ActiveLink
          href="/interface"
          linkClassName="text-blue-600 hover:underline"
          activeClassName="cursor-default"
        >
          interfaces
        </ActiveLink>
        {title}
      </h1>
      {children ? (
        <>
          <ul className="mb-8">
            {children.map((child) => (
              <li key={child}>
                <Link
                  href={`/interface${current ? "/" + current : ""}/${child}`}
                >
                  <a className="hover:underline">{child}</a>
                </Link>
              </li>
            ))}
          </ul>
          <a
            className="inline-flex items-center text-blue-600 hover:underline"
            href={`${GITHUB_REPO}/new/main/public/interfaces/${current}?filename=newfile.did&value=%2F%2F%20Candid%20file%20here`}
            target="_blank"
          >
            <FiFilePlus className="mr-0.5" />
            Add new file
          </a>
        </>
      ) : (
        <>
          <CodeBlock candid={candid} bindings={bindings} className="mb-8" />
          <a
            className="inline-flex items-center text-blue-600 hover:underline"
            href={`${GITHUB_REPO}/edit/main/public/interfaces/${current}.did`}
            target="_blank"
          >
            <BiPencil className="mr-0.5" /> Edit this file
          </a>
        </>
      )}
    </div>
  );
};

export default Interface;