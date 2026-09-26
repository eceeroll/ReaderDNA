import { Routes, Route } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { Discover } from "./pages/Discover";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/discover" element={<Discover />} />
      </Route>
    </Routes>
  );
}

export default App;
