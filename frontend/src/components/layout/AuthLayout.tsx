import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import bookloverSignin from "../../assets/booklover_signin.svg";
import { Login } from "../../pages/Login";
import { Register } from "../../pages/Register";
import {
  PageRevealStage,
  type PageRevealDirection,
} from "../motion/PageRevealStage";

function getAuthRevealDirection(
  fromPath: string,
  toPath: string,
): PageRevealDirection {
  if (fromPath === "/login" && toPath === "/register") return "forward";
  if (fromPath === "/register" && toPath === "/login") return "reverse";
  return "enter";
}

function renderAuthPage(pageKey: string) {
  if (pageKey === "/register") return <Register />;
  return <Login />;
}

export function AuthLayout() {
  const location = useLocation();
  const [transition, setTransition] = useState({
    path: location.pathname,
    direction: "enter" as PageRevealDirection,
  });

  if (location.pathname !== transition.path) {
    setTransition({
      path: location.pathname,
      direction: getAuthRevealDirection(transition.path, location.pathname),
    });
  }

  return (
    <div className="auth-shell">
      <div aria-hidden="true" className="auth-shell-wash" />

      <header className="auth-header">
        <Link
          to="/"
          className="font-display text-[2.125rem] leading-none text-ink md:text-4xl"
        >
          ReaderDNA
        </Link>
      </header>

      <aside className="auth-illustration-pane">
        <div aria-hidden="true" className="auth-illustration-glow" />
        <img
          src={bookloverSignin}
          alt=""
          className="auth-illustration"
          width={500}
          height={500}
          decoding="async"
        />
      </aside>

      <section className="auth-form-pane">
        <div aria-hidden="true" className="auth-form-ambient" />
        <div className="relative mx-auto w-full max-w-100">
          <PageRevealStage
            pageKey={location.pathname}
            direction={transition.direction}
            variant="corner-turn"
            renderPage={renderAuthPage}
          >
            <Outlet />
          </PageRevealStage>
        </div>
      </section>
    </div>
  );
}
