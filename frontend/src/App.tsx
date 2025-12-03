/**
 * Application root component.
 * Sets up routing and renders the dashboard.
 */

import { BrowserRouter } from "react-router-dom";
import { Dashboard } from "./components";

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Dashboard />
    </BrowserRouter>
  );
}

export default App;
