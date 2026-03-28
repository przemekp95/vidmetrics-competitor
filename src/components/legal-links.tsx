import Link from "next/link";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/copyright", label: "Copyright" },
  { href: "/legal", label: "Legal Notice" },
];

export function LegalLinks({
  className = "",
  linkClassName = "",
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav
      aria-label="Legal"
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`.trim()}
    >
      {legalLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition hover:text-(--color-accent) ${linkClassName}`.trim()}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
