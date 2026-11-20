import React from "react";

type ImageProps = {
  src?: string | { src: string };
  alt?: string;
  [key: string]: unknown;
};

const NEXT_IMAGE_ONLY_PROPS = new Set([
  "src",
  "alt",
  "fill",
  "priority",
  "unoptimized",
  "sizes",
  "loader",
  "placeholder",
  "blurDataURL",
  "quality",
]);

export default function Image(props: ImageProps) {
  const resolvedSrc =
    typeof props.src === "string" ? props.src : props.src?.src ?? "";

  const domProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (NEXT_IMAGE_ONLY_PROPS.has(key)) continue;
    domProps[key] = value;
  }

  return React.createElement("img", {
    ...domProps,
    src: resolvedSrc,
    alt: props.alt ?? "",
  });
}
