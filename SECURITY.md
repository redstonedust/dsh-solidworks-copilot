# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.
Use GitHub's private reporting instead:

> Repository → **Security** tab → **Report a vulnerability**
> (or <https://github.com/redstonedust/dsh-solidworks-copilot/security/advisories/new>)

Include what you can: affected version/commit, DSH version, reproduction steps, and the impact you
expect. If the reproduction needs a specific client directory layout, describe it — do not attach
your real home directory contents.

## Scope

In scope — anything in this repository:

| Surface | Examples |
|---|---|
| Host plugin (`index.js`) | tool registration, `apply()` behaviour, local route handler |
| Local routes (`/swas/*`) | missing same-origin check, request-body handling, command/argument injection |
| Deployment core (`lib/fetch-core.mjs`) | `ref` parsing, git invocation, path traversal via `dest`, file overwrite/backup logic |
| CLI (`bin/swas.mjs`) | argument parsing, exit codes, writing outside the target directory |
| Client panel (`src/client.js` / `client.js`) | HTML injection through generated text, unsafe DOM writes, leaking local paths |
| Build scripts (`scripts/*`) | reading untrusted files, writing outside the repo |

Out of scope:

- vulnerabilities in the **upstream skill** (<https://github.com/wzyn20051216/solidworks-automation-skill>) — report them there;
- vulnerabilities in SolidWorks, DSH, Node.js or any dependency — report to their maintainers;
- requests for license circumvention, cracking or activation: those are not security reports and are
  not accepted;
- findings that require an already-compromised local account (a local process that can edit files in
  your home directory already holds the same power this plugin has).

## Known design decisions

- `/swas/status` and `/swas/deploy` require `sec-fetch-site: same-origin` **and**
  `x-swas-client: ui`; anything else gets `403`. This is a guard against casual local scripts, not a
  defence against a hostile local user.
- Deployment never writes outside the resolved client `skills/` directory, never deletes (rename to
  `<dir>.bak-<timestamp>` only), and refuses to overwrite unmanaged installs unless `force` is set.
- The plugin makes no network requests on its own unless `autoFetch: true` is configured.

## Response

Best effort, no SLA. Valid reports get a fix or a documented decision, and credit in the advisory
unless you prefer otherwise.
