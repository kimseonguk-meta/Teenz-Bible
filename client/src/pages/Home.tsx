import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "/teens-bible.html";
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0e27",
      color: "#fff",
      fontFamily: "'Bangers', cursive"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>TEENS BIBLE</h1>
        <p>Loading...</p>
      </div>
    </div>
  );
}
