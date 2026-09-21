const footerLinks = [
  {
    href: "https://www.rinadely.com/blog/skipping-auth-basics",
    label: "Read the write-up",
  },
  {
    href: "https://github.com/Hurrinade/authentication-flows",
    label: "Source on GitHub",
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:justify-between">
      <p>
        Auth methods &mdash; built by{" "}
        <a
          className="transition-colors hover:text-white"
          href="https://www.rinadely.com"
        >
          Rinade d.o.o.
        </a>
        , Zagreb
      </p>
      <nav aria-label="Footer links" className="flex gap-4">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            className="transition-colors hover:text-white"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
