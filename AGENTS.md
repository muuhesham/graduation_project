# AGENTS

## Architecture Direction
- The admin side is the reference implementation for the current repository/model/resource/repository architecture.
- Organizer work should move toward that architecture, but only where the flow is intentionally being migrated.

## Contract Safety Rules
- Use git as the source of truth for legacy methods. If an old method was changed in place during migration work, restore its body and behavior to the git shape before adding new architecture around it.
- Shared service methods are contract-sensitive. Do not replace or broadly rewrite existing service entrypoints that may still be used by other flows.
- When introducing repository-backed behavior, add new explicit methods alongside legacy methods instead of changing old signatures or return shapes in place.
- Before changing any service method, inspect all current callers and preserve behavior for untouched flows.
- Do not rename an existing legacy method just to make room for new architecture code. Keep the old method name and behavior stable; put the new path under a new additive name.
- Do not turn legacy methods into wrapper glue around new methods. Restore the old method and move the migrated behavior into a truly new method instead.

## Organizer Flow Rules
- High-level organizer-specific flow methods may be migrated fully when they are the intended target of the refactor.
- `userService.upgradeToOrganizer` is the high-level onboarding entrypoint and may use the new architecture internally.
- Organizer event-management methods may use the new repository/model/resource flow internally, but shared event, venue, ticket, seat, and location service contracts must remain backward compatible.
- Newly upgraded organizers are created in `UNDER_REVIEW` and must not gain organizer dashboard or organizer event-management access until approved.
- Pending organizers must be blocked consistently from dashboard access and organizer event management until admin approval.

## Event Service Notes
- Treat `eventService` legacy methods such as `create`, `findBySlug`, `getById`, `show`, and related old-flow helpers as stable contracts.
- If organizer-side migrated code needs repository-backed reads or writes, add new methods with clean additive names and route only the migrated organizer flow through them.
- For event reads specifically:
- `getById` remains the legacy contract.
- `findById` is the preferred name for the new repository-backed canonical reader.
- The default new-path read composition belongs in `EventRepository`, not in `eventService`.
- Do not move legacy banner-handling behavior into the new path by mutating old methods. New code should prefer model-owned conventions such as `Event.getUploadPath(...)`.
- Avoid meaningless transaction signatures. If a helper accepts `tx`, it should actually use `tx`.

## Implementation Guardrails
- Prefer additive methods over aliases and wrapper chains. Remove migration-only aliases once the real additive method exists.
- Preserve existing response shapes for non-migrated callers.
- If an old method and a new method need to coexist, keep the old one stable and route the new flow through the new method.
- If migrated code needs strict exception behavior, throw from the migrated caller instead of changing a legacy method that previously returned `null`, a fail object, or another non-throw contract.
- Repository read composition belongs in repositories, derived fields belong in models/resources, and not-found exceptions belong in callers when the old contract did not throw.
- In legacy files, do not add AI-style narrative comments or new `@ts-check` blocks. Add JSDoc only for truly new migration methods.
- When in doubt, follow the admin-side patterns and make the smallest safe change that keeps production callers working.
