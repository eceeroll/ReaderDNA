import { Link } from "react-router";
import booklover from "../assets/booklover.svg";
import { Button } from "../components/ui/Button";

export function Landing() {
  return (
    <div className="landing-hero relative flex min-h-screen flex-col">
      <div aria-hidden="true" className="landing-hero-wash" />

      <header className="relative z-10 flex items-center justify-between px-6 pt-9 pb-6 md:px-10 md:pt-10 md:pb-7 lg:px-16">
        <p className="font-display text-[2.125rem] leading-none text-ink md:text-4xl">
          ReaderDNA
        </p>
        <Link to="/login" className="landing-signin">
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 md:px-10 md:py-12 lg:px-16">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-14 lg:gap-20">
          <div className="motion-safe:animate-landing-rise w-full max-w-xl">
            <h1 className="font-landing text-6xl leading-[1.05] font-semibold text-ink md:text-7xl">
              <span className="block">Find your</span>
              <span className="block">ReaderDNA</span>
            </h1>
            <p className="mt-5 max-w-md font-sans text-xl leading-relaxed text-ink-muted md:mt-6 md:text-2xl md:leading-relaxed">
              Not what you read — why you read it. Discover the shape of your
              taste in books.
            </p>
            <div className="mt-8 md:mt-10">
              <Link to="/register">
                <Button variant="primary" type="button" className="landing-cta">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="landing-illustration-stage motion-safe:animate-landing-rise-delayed">
            <div aria-hidden="true" className="landing-illustration-glow" />
            <img
              src={booklover}
              alt="A reader surrounded by bookshelves, immersed in a book"
              className="landing-illustration"
              width={500}
              height={500}
              decoding="async"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
