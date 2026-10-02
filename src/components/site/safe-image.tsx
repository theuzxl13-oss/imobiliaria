"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const PLACEHOLDER_IMAGE = "/placeholder-imovel.svg";

/** next/image com imagem substituta quando a foto não carrega. */
export function SafeImage({
  src,
  alt,
  hideOnError,
  ...props
}: Omit<ImageProps, "src"> & { src?: string | null; hideOnError?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (hideOnError && (failed || !src)) return null;
  const finalSrc = !src || failed ? PLACEHOLDER_IMAGE : src;
  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      unoptimized={finalSrc === PLACEHOLDER_IMAGE || props.unoptimized}
      onError={() => setFailed(true)}
    />
  );
}
