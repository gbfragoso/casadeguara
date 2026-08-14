# Master Plan: Critical Refactor of Shared Registrations

Use this file as the sequencing and release contract for the critical refactor centered on `src/routes/(protected)/biblioteca/leitores`. Execute the numbered prompts in order. Each prompt is self-contained, independently reviewable, and ends at a stable verification checkpoint, but later tasks assume every earlier task has been accepted.

Do not execute these tasks in parallel: they intentionally share the Drizzle schema symbol, validation contracts, model API, route DTOs, and physical table name.

## Task sequence

| Done | Order | Prompt | Objective | Database effect |
| --- | --- | --- | --- | --- |
| [x] | 1 | [task-1](refactor-biblioteca-leitores/task-1.md) | Rename only the TypeScript schema symbol and update direct consumers | None; physical table remains `leitor` |
| [x] | 2 | [task-2](refactor-biblioteca-leitores/task-2.md) | Define Zod contracts and privacy masks | None |
| [x] | 3 | [task-3](refactor-biblioteca-leitores/task-3.md) | Extract authorization and `CadastroModel` | Data-level integration tests only |
| [x] | 4 | [task-4](refactor-biblioteca-leitores/task-4.md) | Refactor biblioteca reader routes and pages | No schema change |
| [x] | 5 | [task-5](refactor-biblioteca-leitores/task-5.md) | Refactor secretaria registration routes, flags, and pages | No schema change |
| [x] | 6 | [task-6](refactor-biblioteca-leitores/task-6.md) | Refactor tesouraria contributor routes and pages | No schema change |
| [x] | 7 | [task-7](refactor-biblioteca-leitores/task-7.md) | Rename the physical table with an isolated `db:push` | Only `leitor` -> `cadastros` via `db:push` |
| [ ] | 8 | [task-8](refactor-biblioteca-leitores/task-8.md) | Prove the cross-dashboard journey and close the LGPD/release gate | No schema change |

## Global criticality rule

The SQL table is the single registration source for readers, volunteers/workers, donors/contributors, loans, attendance, and treasury entries. Do not call the overall work complete because one dashboard passes. Completion requires every task, cross-dashboard preservation coverage, privacy controls, direct mutation authorization, Portuguese feedback, and final repository verification.

If purpose, lawful basis, retention/deletion, or the dashboard access matrix cannot be confirmed by a named product/privacy owner, technical implementation may finish but production acceptance remains blocked. Never describe a code-only assessment as certification of LGPD compliance.

## Global database rule

- `npm run db:push` may apply exactly one kind of schema change: the final physical table rename from `leitor` to `cadastros` in task 7.
- Any other required schema change must be completed before task 7 in its own short commit using `npm run db:generate`, SQL review, `npm run db:migrate`, and integration coverage.
- Do not create speculative migrations. No other schema change is currently expected.
- Never accept a `db:push` plan containing a column, type, default, constraint, index, second table, drop/create, data-copy operation, or any statement beyond the single table rename.
- No migration may be appended after task 7's no-DDL checkpoint within this feature.
- Never issue ad hoc DDL/DML or edit Drizzle migration-journal rows manually.

## Dashboard write contract

Only `nome` is required in every dashboard.

| Dashboard | May create/update | Must preserve |
| --- | --- | --- |
| Biblioteca | `nome`, `rg`, `cpf`, `email`, `celular`, `telefone`, `logradouro`, `bairro`, `complemento`, `cidade`, `cep`, `trab`, `status`, audit actor/time | `aniversario`, `frequencia`, `desencarnado`, `incompleto`, and unrelated values |
| Secretaria | `nome`, `rg`, `cpf`, `email`, `celular`, `telefone`, `logradouro`, `bairro`, `complemento`, `cidade`, `cep`, `aniversario`, `trab`, audit actor/time | `status` and unrelated values; `frequencia`/`desencarnado` change only through the flag endpoint |
| Tesouraria | `nome`, `telefone`, `trab`, audit actor/time | Identity, address, birthday, biblioteca status, frequency, deceased, and unrelated values |
| Secretaria flags | Exactly one of `trab`, `frequencia`, or `desencarnado` | Every other column |

Every update is a true typed partial update. Raw `FormData`, a complete row, masked identifiers, and fields owned by another dashboard must never be spread into persistence.

## Global engineering constraints

- Read and follow repository `AGENTS.md`, `C:\Users\gbfra\.codex\RTK.md`, `.agents/rules/code-standards.md`, and `.agents/rules/tests.md` before each task.
- Load the skills named by each prompt. Apply `javascript` to all TypeScript changes, `svelte-core-bestpractices` to Svelte/SvelteKit files, `zod` to form boundaries, `drizzle-postgres` to database work, `no-workarounds` to fixes, and `vitest` to tests.
- Run `rtk git status --short` before each task and preserve all pre-existing work. Do not reformat, revert, or commit unrelated changes.
- Use npm exclusively. Do not edit `.svelte-kit/`, `.vercel/`, `build/`, generated route `$types`, existing migration SQL, or existing snapshots.
- Keep every `.ts` file and class at 100 lines or fewer and every function/method at 30 lines or fewer.
- Do not use `any`, unsafe type assertions, non-null assertions, lint suppressions, swallowed errors, arbitrary delays, compatibility aliases, dual writes, or copied validation.
- Each task must be committed separately using only the commits specified by that prompt. Do not include this ignored plan directory in implementation commits unless explicitly requested.

## Baseline recorded when the plan was created

- `rtk git status --short` was clean.
- `rtk npm test` passed 24 files and 163 tests.
- `rtk npm run check` passed with zero errors and warnings.
- `rtk npm run lint` already failed Prettier on 58 files. Reconfirm this baseline. Require formatting and ESLint to pass for every changed file and report the repository-wide pre-existing failure without broad reformatting or suppression.

## Final completion gate

Task 8 owns final verification, but every task must preserve these end-state requirements:

- The physical and application table names are `cadastros`; the old physical `leitor` table and schema export do not remain.
- Domain contracts that still mean reader, such as route paths, UI text, `emprestimo.leitor`, selected DTO properties, and form names, are not blindly renamed.
- All nine management pages delegate persistence to `CadastroModel`, validate `FormData` with Zod, preserve foreign-dashboard fields, and follow Svelte 5 best practices.
- Raw CPF/RG never enter HTML, page/action data, URLs, logs, or snapshots; minimal dashboard projections are used.
- Known validation/duplicate/not-found outcomes are Portuguese 400/404 responses; unknown database failures remain private 500 responses.
- Direct page actions and the flag endpoint enforce exact dashboard roles.
- Unit, integration, component, authorization, privacy, and end-to-end coverage pass with the repository's per-file thresholds.
- The release runbook applies all real migrations and the no-DDL checkpoint, stops writers, executes the isolated rename `db:push`, activates the new application revision, and verifies the result.

Do not merge or report the overall refactor as delivered while any numbered task or final gate remains unresolved.
