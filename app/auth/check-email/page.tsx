export default function CheckEmailPage() {
  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Check your email</h1>
      <p>
        We sent you a link to sign in. Click the link in the email to continue.
      </p>
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '2rem' }}>
        If you don&apos;t see the email within a minute, check your spam folder.
      </p>
    </main>
  );
}