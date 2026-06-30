# aws-instance-metadata — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is
A small CommonJS utility for reading metadata about the EC2 instance it runs on: arbitrary instance-metadata fields and the instance-identity document (via the link-local `169.254.169.254` endpoint), plus EC2 resource tags (via the AWS SDK). Single-file npm module, consumed by services that want to tag logs/errors with instance identity.

## serves          # CROSS-CUTTING (shared infra library) — owns no product domain
role: Shared library for reading the current EC2 instance's metadata, identity document, and tags at runtime.
referenced-by: [services that annotate errors/logs/observability context with EC2 instance identity]

## Code map        # entry points only — paths/globs, not explanations
- public API -> index.js  (exports `fetch`, `fetchInstanceIdentity`, `fetchTag`)
- tests      -> test/index.test.js

## Conventions     # the few non-obvious rules an agent would get wrong; link the rest
- CommonJS (`require` / `module.exports`); `main` is `index.js`, the whole module is that one file.
- `fetch(field)` and `fetchInstanceIdentity()` hit the link-local metadata endpoint `http://169.254.169.254`; `fetchTag(tag)` resolves the instance id/region then calls EC2 `DescribeTags` via `@aws-sdk/client-ec2`.
- Lint/format via `eslint-config-mixmax` + Prettier; Node pinned to 18.13.0 (`.nvmrc`).

## Gotchas         # high-signal "easy to get wrong"
- Only works on a real EC2 instance — the `169.254.169.254` endpoint is unreachable elsewhere; tests mock it with `nock`.
- `fetchTag` needs the instance role to allow `ec2:DescribeTags`; it returns `null` when the tag is absent.

## Run / test
- `npm test` (jest) · `npm run lint` (eslint) · `npm run ci` (lint + test)
- Publish: `npx semantic-release` (runs from CI).

## Load the matching domain card
- This repo is a cross-cutting infra library — it owns no product domain, so there is no domain card to load. When working here, load the card of the consuming service if the change is driven by that service's needs.
