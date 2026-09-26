import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function Landing() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="font-display text-2xl text-brand">ReaderDNA</p>
        <h1 className="mt-8 font-display text-[32px] leading-[1.2] font-semibold text-ink">
          Your reading, decoded.
        </h1>
        <p className="mt-4 font-sans text-[15px] leading-[1.6] text-ink-muted">
          Sign in to discover books and build your library.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" type="button" className="w-full">
              Sign in
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="secondary" type="button" className="w-full">
              Create your account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
