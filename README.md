# CONN-WRY

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_4BOsvJaLx4A1bTF1an42hDiLDX6K)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin user management

Set the server-side `ADMIN_EMAILS` environment variable to a comma-separated list
of existing account email addresses that should have admin access. For example:

```text
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

Do not use a `NEXT_PUBLIC_` variable for this allowlist. Apply migrations
`drizzle/0005_add_phone_number_to_profiles.sql` and then
`drizzle/0006_admin_operations.sql` before deploying the admin page. Admins can
sign in at `/admin` and edit users' identity and profile details, suspend or
unsuspend users, permanently delete users, review withdrawals, manage earning
tasks, and view platform overview cards. Access is checked on the server for
every admin API request.

Suspended users lose existing sessions and are blocked from authenticated app
actions. Account deletion removes the user's profile, posts, task/withdrawal
history, and authentication account. Withdrawal approval is manual: send the
payout with your payment provider, then mark it paid in the portal. Admin
balance adjustments are not provided.

For Vercel preview/branch deployments, Better Auth trusts the exact origins
provided by Vercel's `VERCEL_URL` and `VERCEL_BRANCH_URL` variables. If a custom
deployment alias still returns `Invalid origin`, add its exact origin to the
server-side `BETTER_AUTH_TRUSTED_ORIGINS` variable (comma-separated for multiple
origins), for example `https://your-project-git-branch.vercel.app`, then
redeploy. Do not use a wildcard origin.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
