import Link from 'next/link';
import {
  loginWithPassword,
  loginWithMagicLink,
  loginWithOAuth,
} from '../actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next = '/' } = await searchParams;

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Sign in</h1>

      {error && (
        <p role="alert" style={{ color: 'crimson' }}>{error}</p>
      )}
      {message && (
        <p role="status" style={{ color: 'green' }}>{message}</p>
      )}

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Email and password</h2>
        <form action={loginWithPassword}>
          <input type="hidden" name="next" value={next} />
          <label>
            Email
            <input type="email" name="email" required autoComplete="email"
              style={{ display: 'block', width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginTop: '0.5rem' }}>
            Password
            <input type="password" name="password" required autoComplete="current-password"
              style={{ display: 'block', width: '100%' }} />
          </label>
          <button type="submit" style={{ marginTop: '1rem' }}>Sign in</button>
        </form>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2 style={{ fontSize: '1rem' }}>Magic link</h2>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          We&apos;ll email you a link to sign in without a password.
        </p>
        <form action={loginWithMagicLink}>
          <input type="hidden" name="next" value={next} />
          <label>
            Email
            <input type="email" name="email" required autoComplete="email"
              style={{ display: 'block', width: '100%' }} />
          </label>
          <button type="submit" style={{ marginTop: '1rem' }}>Send magic link</button>
        </form>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2 style={{ fontSize: '1rem' }}>Continue with a provider</h2>
        <form action={loginWithOAuth} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="hidden" name="next" value={next} />
          <button type="submit" name="provider" value="google">Continue with Google</button>
          <button type="submit" name="provider" value="github">Continue with GitHub</button>
        </form>
      </section>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
      </p>
    </main>
  );
}