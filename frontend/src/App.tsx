import { Routes, Route } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Discover } from "./pages/Discover";
import { Landing } from "./pages/Landing";
import { Library } from "./pages/Library";
import { Login } from "./pages/Login";
import { ReaderDna } from "./pages/ReaderDna";
import { Register } from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/discover" element={<Discover />} />
        <Route path="/library" element={<Library />} />
        <Route path="/reader-dna" element={<ReaderDna />} />
      </Route>
    </Routes>
  );
}

export default App;
