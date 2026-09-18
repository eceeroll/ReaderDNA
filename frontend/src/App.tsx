import { Button } from "./components/ui/Button";

function App() {
  return (
    <div className="min-h-screen bg-page p-8">
      <Button variant="primary">Add to library</Button>
      <Button variant="secondary" className="ml-2">
        Learn more
      </Button>
      <Button variant="ghost" className="ml-2">
        Skip
      </Button>
    </div>
  );
}
export default App;
