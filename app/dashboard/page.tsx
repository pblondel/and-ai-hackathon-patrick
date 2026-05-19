// EXAMPLE — replace with your actual dashboard.
// Demonstrates: protected route, fetching user-owned data, RLS-enforced
// queries, server actions, logout.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '../auth/actions';
import { createNote, deleteNote } from './actions';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false });

  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <form action={logout}>
          <button type="submit">Sign out</button>
        </form>
      </header>

      {error && (
        <p role="alert" style={{ color: 'crimson', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Your account</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {profile?.full_name ?? '—'}</p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>User ID: {user.id}</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem' }}>New note</h2>
        <form action={createNote}>
          <label>
            Title
            <input
              type="text"
              name="title"
              required
              maxLength={200}
              style={{ display: 'block', width: '100%' }}
            />
          </label>
          <label style={{ display: 'block', marginTop: '0.5rem' }}>
            Body (optional)
            <textarea
              name="body"
              rows={3}
              style={{ display: 'block', width: '100%' }}
            />
          </label>
          <button type="submit" style={{ marginTop: '0.5rem' }}>
            Add note
          </button>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Your notes ({notes?.length ?? 0})</h2>
        {notes && notes.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notes.map((note) => (
              <li
                key={note.id}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong>{note.title}</strong>
                  {note.body && (
                    <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>
                      {note.body}
                    </p>
                  )}
                  <small style={{ color: '#666' }}>
                    {new Date(note.created_at).toLocaleString()}
                  </small>
                </div>
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={note.id} />
                  <button type="submit" style={{ color: 'crimson' }}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            No notes yet. Add one above.
          </p>
        )}
      </section>
    </main>
  );
}