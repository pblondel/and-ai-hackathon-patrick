import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '../auth/actions';

type Team = {
  id: number;
  name: string;
  code: string;
  flag_url: string | null;
  group_name: string;
};

// FIFA 3-letter code → flagcdn ISO code. The World Cup API returns FIFA
// codes, but flagcdn.com keys flags by ISO 3166-1 alpha-2 (with a couple
// of UK-region exceptions for the home nations).
const FIFA_TO_FLAGCDN: Record<string, string> = {
  ALG: 'dz', ARG: 'ar', AUS: 'au', AUT: 'at',
  BEL: 'be', BIH: 'ba', BRA: 'br',
  CAN: 'ca', CIV: 'ci', COD: 'cd', COL: 'co', CPV: 'cv',
  CRO: 'hr', CUW: 'cw', CZE: 'cz',
  ECU: 'ec', EGY: 'eg', ENG: 'gb-eng', ESP: 'es',
  FRA: 'fr',
  GER: 'de', GHA: 'gh',
  HAI: 'ht',
  IRN: 'ir', IRQ: 'iq',
  JOR: 'jo', JPN: 'jp',
  KOR: 'kr', KSA: 'sa',
  MAR: 'ma', MEX: 'mx',
  NED: 'nl', NOR: 'no', NZL: 'nz',
  PAN: 'pa', PAR: 'py', POR: 'pt',
  QAT: 'qa',
  RSA: 'za',
  SCO: 'gb-sct', SEN: 'sn', SUI: 'ch', SWE: 'se',
  TUN: 'tn', TUR: 'tr',
  URU: 'uy', USA: 'us', UZB: 'uz',
};

function flagSrc(code: string): string | null {
  const iso = FIFA_TO_FLAGCDN[code];
  return iso ? `https://flagcdn.com/w80/${iso}.png` : null;
}

async function fetchTeams(): Promise<Team[]> {
  const res = await fetch('https://world-cup-api.vercel.app/api/teams', {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`World Cup API responded ${res.status}`);
  }
  return res.json();
}

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/teams');

  let teams: Team[] = [];
  let loadError: string | null = null;
  try {
    teams = await fetchTeams();
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load teams';
  }

  const grouped = new Map<string, Team[]>();
  for (const team of teams) {
    const list = grouped.get(team.group_name) ?? [];
    list.push(team);
    grouped.set(team.group_name, list);
  }
  const groupNames = Array.from(grouped.keys()).sort();

  const secondaryBtn =
    'inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          World Cup teams
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={secondaryBtn}>
            Dashboard
          </Link>
          <form action={logout}>
            <button type="submit" className={secondaryBtn}>
              Logout
            </button>
          </form>
        </div>
      </header>

      {loadError && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {loadError}
        </p>
      )}

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {teams.length} teams across {groupNames.length} groups.
      </p>

      <div className="mt-6 space-y-8">
        {groupNames.map((groupName) => {
          const groupTeams = grouped.get(groupName) ?? [];
          return (
            <section key={groupName}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Group {groupName}
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {groupTeams.map((team) => {
                  const src = team.flag_url ?? flagSrc(team.code);
                  return (
                    <li
                      key={team.id}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={`${team.name} flag`}
                          width={40}
                          height={30}
                          className="h-[30px] w-[40px] rounded-sm object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          aria-hidden
                          className="flex h-[30px] w-[40px] items-center justify-center rounded-sm bg-zinc-100 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800"
                        >
                          {team.code}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {team.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Group {team.group_name}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
