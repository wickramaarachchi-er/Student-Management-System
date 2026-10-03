/**
 * HomePage – Temporary placeholder confirming the frontend is running.
 * Replace with the real landing / login page in a later step.
 */
function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#f1f5f9',
        padding: '2rem',
      }}
    >
      {/* Shield icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 40px rgba(59,130,246,0.4)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}
      >
        CyberShield
      </h1>

      <p
        style={{
          fontSize: '1rem',
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: '480px',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
        }}
      >
        Security and compliance workspace
      </p>

      {/* Status badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          marginBottom: '2rem',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
          Frontend is running
        </span>
      </div>

      {/* Info card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          maxWidth: '520px',
          width: '100%',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          This is a temporary placeholder page. The full application — including
          authentication, dashboards, policy management, training modules, and
          reporting — will be built in subsequent development steps.
        </p>
      </div>

      {/* Tech stack pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '2rem',
          justifyContent: 'center',
        }}
      >
        {['React 19', 'Vite', 'Tailwind CSS', 'React Router', 'Node.js', 'Express', 'MySQL', 'Prisma'].map(
          (tech) => (
            <span
              key={tech}
              style={{
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#93c5fd',
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
              }}
            >
              {tech}
            </span>
          )
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}

export default HomePage;
