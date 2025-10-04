import "./App.css";
import LaunchingSoon from "./pages/LaunchingSoon/LaunchingSoon";

function App() {
  // Quick preview: if path matches the LaunchingSoon page path, render the component.
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (
    path === "/pages/LaunchingSoon/LaunchingSoon" ||
    path === "/pages/LaunchingSoon/LaunchingSoon/"
  ) {
    return <LaunchingSoon />;
  }

  return (
    <>
      <h1>Hello World</h1>
    </>
  );
}

export default App;
