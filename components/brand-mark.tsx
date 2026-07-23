import Image from "next/image";

type BrandMarkProps = {
  className?: string;
};

const logoSrc = encodeURI("/header-logo/ChatGPT Image 2026年7月23日 15_57_10.png");

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      className={[
        "relative flex shrink-0 overflow-hidden rounded-[1.1rem] border border-white/18 bg-white/34 p-1.25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-white/20 backdrop-blur-3xl dark:border-white/8 dark:bg-white/7 dark:ring-white/8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={logoSrc}
        alt="Dreamweave logo"
        fill
        sizes="40px"
        className="object-contain p-0.75"
        priority
      />
    </span>
  );
}