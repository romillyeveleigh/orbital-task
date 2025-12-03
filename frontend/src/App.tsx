/**
 * Application root component.
 * Sets up routing and renders the dashboard.
 */

import { BrowserRouter } from "react-router-dom";
import { Dashboard } from "./components";

function App() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

export default App;
