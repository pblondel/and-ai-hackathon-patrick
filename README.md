This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### The three secrets you need
You need to add three secrets in Settings → Secrets and variables → Actions on your GitHub repo:

1. `VERCEL_TOKEN` — a Vercel access token
2. `VERCEL_ORG_ID` — your Vercel team/personal account ID
3. `VERCEL_PROJECT_ID` — the specific project ID

Here's how to get each:

`VERCEL_TOKEN`: Go to [vercel.com/account/tokens](vercel.com/account/tokens), click "Create Token," scope it to your project (not full account access — least privilege), set an expiration you're comfortable with. Copy it once, you can't see it again.

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: The easiest way to grab both is to link your project locally first. From your project root on your host machine (not inside the devcontainer — it doesn't have Vercel CLI installed):

```bash
npm install -g vercel
vercel link
```

Follow the prompts to link to an existing Vercel project (or create one). Once linked, a `.vercel/project.json` file gets created with both IDs:

```bash
cat .vercel/project.json
```

You'll see:

```json
{
  "orgId": "team_xxxxxxxxx",
  "projectId": "prj_xxxxxxxxx"
}
```

Copy those two values into your GitHub secrets. Add `.vercel` to your `.gitignore` — it shouldn't be committed:

```bash
echo ".vercel" >> .gitignore
```

#### Initial setup checklist

In order, to go from zero to deploying:

1. Create a Vercel account if you don't have one, and import your GitHub repo into Vercel via the dashboard — this creates the project and lets you set env vars
2. Disable Vercel's auto-deploy from GitHub in the project's Git settings — otherwise both Vercel's built-in integration and your GitHub Action will deploy on every push, racing each other and doubling your build minutes
3. Set your env vars in the Vercel dashboard under Project → Settings → Environment Variables (the Auth0 stuff, your gateway URL, anything @your-org/auth needs at build or runtime). Scope each one to Production, Preview, or both as appropriate
4. Run vercel link locally to get the IDs
5. Add the three secrets to GitHub
6. Commit the two workflow files
7. Open a PR to test the preview workflow, merge to test production