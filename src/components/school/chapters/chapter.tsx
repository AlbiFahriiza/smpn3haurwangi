import type { Field, NavTheme } from "@/components/motion/chapter-theme";

/**
 * Satu warna datar penuh untuk satu bab. Tepi keras antar bab adalah
 * tampilannya, jadi tidak ada gradasi, bayangan, atau garis pemisah.
 */
export type { Field, NavTheme };

const PAD = {
  none: "",
  tight: "py-16 md:py-24",
  normal: "py-20 md:py-28",
  tall: "py-24 md:py-36",
} as const;

export function Chapter({
  id,
  field,
  nav = "light",
  pad = "normal",
  className = "",
  children,
}: {
  id?: string;
  field: Field;
  nav?: NavTheme;
  pad?: keyof typeof PAD;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-field={field}
      data-nav={nav}
      className={`relative ${PAD[pad]} ${className}`}
    >
      {children}
    </section>
  );
}

/** Kisi dan margin tunggal yang dipakai semua bab. */
export function Inner({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`chapter-inner ${className}`}>{children}</div>;
}
