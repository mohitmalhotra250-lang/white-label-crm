export default function HomePage() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>White Label AI Calling CRM</h1>
      <p>Welcome to your AI Voice Calling Platform.</p>

      <div style={{ marginTop: "20px" }}>
        <a href="/login">Login</a>
        {" | "}
        <a href="/signup">Sign Up</a>
      </div>
    </main>
  );
}

