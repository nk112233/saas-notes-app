import { useState } from "react";
import Login from "./components/Login";
import Notes from "./components/Notes";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (tok) => {
    localStorage.setItem("token", tok);
    setToken(tok);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Notes SaaS</h1>
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Notes onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
