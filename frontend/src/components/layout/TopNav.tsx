import clsx from "clsx";
import { NavLink, useNavigate } from "react-router";
import { clearToken } from "../../lib/auth-storage";

const links = [
  { to: "/discover", label: "Discover" },
  { to: "/library", label: "Library" },
  { to: "/reader-dna", label: "Reader DNA" },
] as const;

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.25a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function TopNav() {
  const navigate = useNavigate();

  function handleAvatarClick() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <p className="font-display text-2xl text-ink">ReaderDNA</p>
          <nav className="flex items-center gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-full px-4 py-2 font-sans text-[15px] font-medium",
                    isActive ? "bg-warm-tint text-ink" : "text-ink-muted",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          type="button"
          aria-label="Log out"
          onClick={handleAvatarClick}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-muted"
        >
          <UserIcon />
        </button>
      </div>
    </header>
  );
}
