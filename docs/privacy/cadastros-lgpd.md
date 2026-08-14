# Shared registrations: technical LGPD assessment

**Assessment date:** 2026-08-13  
**Scope:** the `cadastros` registration flow used by Biblioteca, Secretaria, and Tesouraria.  
**Assessment type:** technical implementation assessment; not a legal opinion, a completed RIPD, or a certification of
organization-wide LGPD compliance.

## Release decision

Production acceptance is **BLOCKED**. The following decisions require a named human product/privacy owner before
release.

| Decision                         | Named owner | Status  |
| -------------------------------- | ----------- | ------- |
| Purpose approval                 | Unassigned  | Blocked |
| Lawful-basis approval            | Unassigned  | Blocked |
| Retention/deletion approval      | Unassigned  | Blocked |
| Dashboard access-matrix approval | Unassigned  | Blocked |

The controller must assign a named owner and record each decision. The code review cannot make these organizational or
legal decisions.

## Field inventory

All listed information concerns an identifiable natural person and is personal data under LGPD Article 5(I). CPF, RG,
contact/address data, and birthday are explicitly classified here as personal data. The storage form is the server-side
PostgreSQL `cadastros` table unless noted otherwise.

| Field                                                            | Purpose and dashboard access                                                         | Display form                                       | Storage form                     | Retention/deletion owner |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------- | ------------------------ |
| `nome`                                                           | Registration lookup; Biblioteca, Secretaria, Tesouraria                              | Full name in each dashboard's minimum list/detail  | Full value                       | Unassigned privacy owner |
| `cpf`                                                            | Identity record where approved; Biblioteca and Secretaria server-side workflows only | `123.***.***-45` maximum pattern                   | Raw value                        | Unassigned privacy owner |
| `rg`                                                             | Identity record where approved; Biblioteca and Secretaria server-side workflows only | `12.***.***-45` equivalent mask                    | Raw value                        | Unassigned privacy owner |
| `email`                                                          | Contact; Biblioteca and Secretaria                                                   | Full value in their detail forms                   | Full value                       | Unassigned privacy owner |
| `celular` / `telefone`                                           | Contact; Biblioteca and Secretaria; Tesouraria receives only `telefone`              | Full value only in the owning dashboard projection | Digits normalized by validation  | Unassigned privacy owner |
| `logradouro`, `bairro`, `complemento`, `cidade`, `cep`           | Address/contact administration; Biblioteca and Secretaria                            | Full value in their detail forms                   | Full value with input validation | Unassigned privacy owner |
| `aniversario`                                                    | Birthday administration; Secretaria only                                             | Date in Secretaria                                 | Date                             | Unassigned privacy owner |
| `trab`                                                           | Worker classification; all three dashboards as permitted by their projections        | Boolean status                                     | Boolean                          | Unassigned privacy owner |
| `frequencia` / `desencarnado`                                    | Attendance/deceased flags; Secretaria flag endpoint only                             | Boolean status in Secretaria list                  | Boolean                          | Unassigned privacy owner |
| `status`                                                         | Biblioteca registration status; Biblioteca only                                      | Boolean status                                     | Boolean                          | Unassigned privacy owner |
| `incompleto`                                                     | Existing registration completeness state; no dashboard write in this workflow        | Not client-visible                                 | Boolean                          | Unassigned privacy owner |
| `userCadastro`, `userAlteracao`, `dataCadastro`, `dataAlteracao` | Traceability of create/update actions; server/database only                          | Not client-visible                                 | Actor identifiers and dates      | Unassigned privacy owner |

`complemento` and `cidade` have non-breaking input and validation caps of 100 characters. This bounds excessive
collection and accidental oversized submissions without changing the existing unbounded physical columns after the
no-DDL checkpoint. The limit accommodates normal Brazilian address complements and municipality names while preserving
existing stored data.

## Sensitive-data contextual inference

The schema does not label religious belief as a direct field. However, association of a donor, volunteer/worker,
attendance record, or treasury entry with this organization may reveal religious association or belief in context. This
is a contextual inference, not a conclusion about every record. It requires privacy and legal review as potentially
sensitive personal data under Article 5(II), and may require the Article 11 analysis applicable to the actual purpose
and lawful basis.

## Implemented technical controls

| LGPD principle/control area | Implemented control and evidence                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose and necessity       | Each dashboard validates a strict, typed form contract and persists only its owned fields through `CadastroModel`; foreign-dashboard fields are not spread into updates. Only `nome` is universally required.                                                                   |
| Data minimization           | List and detail projections select explicit columns. Tesouraria receives only `nome`, `telefone`, and `trab`; its forms cannot submit identity, address, birthday, attendance, or Biblioteca status fields.                                                                     |
| Security and prevention     | Exact dashboard-role checks guard page actions and the Secretaria flag endpoint. The flag endpoint accepts exactly one allowed flag. Server failures use generic Portuguese responses and do not expose database details.                                                       |
| Identifier protection       | CPF and RG are masked before page data is rendered. Edit forms show masks, leave raw identifier inputs empty, and do not resend a mask as persistence data. The cross-dashboard E2E journey checks that raw CPF/RG are absent from rendered HTML and client-visible route data. |
| Transparency                | Validation, duplicate, success, and not-found paths provide Portuguese feedback, including `Cadastro não encontrado.` where appropriate. This is implementation feedback, not a complete privacy notice.                                                                        |
| Accountability              | Typed validation, dashboard authorization tests, integration preservation tests, and the critical E2E journey provide technical evidence. This document records the remaining owner decisions and release gate.                                                                 |

Masking is redaction/pseudonymization for display; it is not anonymization. The raw stored CPF/RG remain personal data
because authorized server/database processing can still associate them with an individual. No raw CPF/RG should enter
HTML, URLs, client-visible action/page data, logs, error messages, persisted test fixtures, or snapshots. The E2E test
generates synthetic CPF/RG per run and confines those values to the created test registration and direct server/database
assertions. Management loaders/actions were reviewed for minimal DTOs, explicit projections, and the absence of logging
of form data, registration rows, names, identifiers, contact/address data, birthdays, donation status, or attendance
flags.

## Remaining organizational controls

Before production release, the named owner must establish and approve:

- The purpose and lawful basis for donors, volunteers/workers, and every shared-registration purpose; assess consent and
  a privacy notice where applicable.
- A retention/deletion schedule, deletion execution owner, and backup-retention treatment.
- A data-subject request process, including identity verification, access, correction, deletion, and response records.
- Periodic dashboard-access and role-assignment review, including the approved access matrix.
- Audit-trail review, incident response, supplier/operator responsibilities, and backup protection.
- Whether at-rest encryption, field-level encryption, or tokenization is required after the risk assessment; database
  SSL in production does not answer the at-rest question.
- Whether this contextual religious-association risk and the scale of processing require a RIPD; the controller should
  document the decision and revisit it when purposes, systems, or risk factors change.

The ANPD describes a RIPD as a controller document for treatment that may create high risk and recommends assessing it
before processing where feasible. Its guidance calls for documented data types, purposes, legal hypotheses, retention,
risks, and mitigations.
[ANPD RIPD guidance](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd)

## Required release order

For every existing target database, use this order from task 7:

1. Deploy the final pre-rename application revision, which uses the `cadastros` TypeScript symbol while querying
   physical `leitor`.
2. Run `npm run db:migrate` to apply every real migration and record the no-DDL checkpoint.
3. Stop application writers or enable maintenance mode.
4. Stage the physical-rename revision without routing traffic to it.
5. Run and verify the isolated `npm run db:push` rename, accepting only `ALTER TABLE "leitor" RENAME TO "cadastros";`.
6. Activate the revision that declares the physical table `cadastros`.
7. Run a smoke test before restoring traffic.

For a fresh database, first run `npm run db:migrate`; migrations and the no-DDL checkpoint leave physical `leitor`, then
run the single verified `db:push` rename before activating the new revision. Never activate the physical-`cadastros`
revision before the rename succeeds, and never restore code declaring physical `leitor` afterward.

## Sources rechecked

- [Compiled LGPD, especially Articles 5, 6, 9–11, 46, and 49](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [ANPD security guide for small processing agents](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-vf.pdf)
- [ANPD RIPD guidance](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd)

The LGPD requires lawful, transparent, necessary treatment; technical and administrative safeguards; and accountable
system design. This assessment maps repository controls to those requirements but cannot certify organization-wide LGPD
compliance. [Compiled LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
