import React from "react";

type LinkProps = {
  href?: string | { pathname?: string };
  children?: React.ReactNode;
  [key: string]: unknown;
};

const NEXT_LINK_ONLY_PROPS = new Set([
  "href",
  "children",
  "prefetch",
  "replace",
  "scroll",
  "shallow",
  "passHref",
  "legacyBehavior",
  "locale",
]);

export default function Link(props: LinkProps) {
  const resolvedHref =
    typeof props.href === "string" ? props.href : props.href?.pathname ?? "";

  const domProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (NEXT_LINK_ONLY_PROPS.has(key)) continue;
    domProps[key] = value;
  }

  return React.createElement(
    "a",
    { ...domProps, href: resolvedHref },
    props.children
  );
}
