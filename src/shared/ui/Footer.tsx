import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-700 py-6 h-1/16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="font-bold tracking-tight text-sm uppercase">
            TechWrite AI
          </span>
        </Link>
        <nav className="flex gap-6 text-sm text-slate-400">
          <Link href="#" className="hover:text-amber-400 transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-amber-400 transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-amber-400 transition-colors">
            Contact
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors">
            Github
          </a>
        </nav>
        <p className="text-xs text-slate-500">
          © {year} TechWrite AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
