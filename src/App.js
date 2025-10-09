import React from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import { LanguageProvider } from "./contexts/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Home />
      </div>
    </LanguageProvider>
  );
}

export default App;
