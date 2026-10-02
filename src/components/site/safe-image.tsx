"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const PLACEHOLDER_IMAGE = "/placeholder-imovel.svg";

/** next/image com imagem substituta quando a foto não carrega. */
export function SafeImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src?: string | null }) {
  const [failed, setFailed] = useState(false);
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
