# RESUMO — Avaliação MeuPlano.AI

- **Atividade:** 10,0 pontos (rubrica em `AVALIACAO.md`)
- **Corte temporal:** último estado de cada PR até **29/06/2026 23:59 −03:00** (`CORTE_UTC = 2026-06-30T02:59:59Z`).
- **Observação geral:** todos os 11 PRs têm o **head ≤ corte** (nenhum commit foi enviado após o prazo), então o estado avaliado é o head de cada PR.
- **Identificação:** por **matrícula** + **número do PR** (nomes omitidos por privacidade). Notas por item são o somatório dos subitens (ver boletins individuais). Máximos: It.1 = 1,5 · It.2 = 3,0 · It.3 = 2,0 · It.4 = 2,0 · It.5 = 1,5.

| PR | Matrícula | It.1 | It.2 | It.3 | It.4 | It.5 | Penalid.        | **Total** | Obs.                                                                                                           |
| -- | ---------- | ---- | ---- | ---- | ---- | ---- | --------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| 9  | 2025201791 | 1,5  | 3,0  | 2,0  | 2,0  | 1,5  | —              | **10,0**  | —                                                                                                             |
| 5  | 2025201684 | 1,5  | 3,0  | 2,0  | 2,0  | 1,5  | —              | **10,0**  | —                                                                                                             |
| 6  | 2025201675 | 1,5  | 3,0  | 2,0  | 2,0  | 1,4  | —              | **9,9**   | ⚠️ Backend CI não consta executado no fork (local verde)                                                    |
| 2  | 2025201719 | 1,5  | 3,0  | 2,0  | 2,0  | 1,4  | —              | **9,9**   | ⚠️ Actions não executou no fork (local verde)                                                               |
| 11 | 2025201942 | 1,5  | 3,0  | 2,0  | 2,0  | 0,8  | —              | **9,3**   | ⚠️`npm ci` falha (lockfile dessincronizado) → CI vermelho. Conferência manual; possível −1,0 adicional |
| 4  | 2025201989 | 1,4  | 3,0  | 1,8  | 1,1  | 1,4  | —              | **8,7**   | ⚠️ Gemini em 429 (cota) no momento; UX modesta                                                               |
| 8  | 2025201862 | 1,3  | 2,5  | 0,8  | 1,4  | 1,4  | —              | **7,4**   | ⚠️**Deploy protegido (Vercel login)**; backend não localizado; usa `MONGO_URI`. Conferência manual |
| 3  | 2025201835 | 1,2  | 2,7  | 0,2  | 1,3  | 1,4  | —              | **6,8**   | ⚠️**Sem URL no README**; deploy não verificável. Conferência manual                                 |
| 1  | 2025201693 | 1,1  | 2,8  | 2,0  | 1,7  | 0,7  | **−2,0** | **6,3**   | ⛔ Teste de frontend alterado (−2,0); IA só com erro genérico                                               |
| 7  | 2025201147 | 1,5  | 3,0  | 2,0  | 1,1  | 0,6  | **−2,0** | **6,2**   | ⛔ Teste backend`gerar-plano-final` alterado (`vi.mock mongoose`) (−2,0)                                  |
| 10 | 2025201933 | 1,1  | 2,0  | 1,8  | 1,4  | 0,8  | **−1,0** | **6,1**   | ⛔**Segredo Atlas commitado** (−1,0); sem repositório; mongo ausente no workflow                       |

> As notas dos itens já consideram os **zeramentos** acionados por penalidade (PR #1 e #7: 4(0,3) e 5(0,6) zerados pela alteração de testes).

## Penalidades aplicadas (resumo)

| PR  | Penalidade | Motivo                                                                               |
| --- | ---------- | ------------------------------------------------------------------------------------ |
| #1  | −2,0      | Alteração de`frontend/tests/unit/plano-de-aula.servico.test.ts`                  |
| #7  | −2,0      | Alteração de`backend/tests/integration/planos-de-aula/gerar-plano-final.test.ts` |
| #10 | −1,0      | Segredo (string Atlas) versionado                                                    |

## Método (resumo)

- **Estático:** `git diff upstream/main...HEAD` para testes (A), varredura de segredos no histórico (B), rótulos (E), contrato `/final` (F), `docker-compose` (G), workflow (H), URL Vercel no README (I).
- **Execução:** `npm ci && npm test && npm run build` em backend e frontend, no estado do corte, **sem `MONGO_URL`** (persistência deve ser não-fatal). Backend: 12 testes; frontend: 10 testes.
- **CI (J):** check-runs do **fork** no SHA do corte (o check "Vercel" no repo base falha por autorização do professor, não é falha do aluno).
- **Deploy ao vivo:** `curl` no Vercel (200) e no backend Render (`/docs`), e `POST /planos-de-aula/rascunho` com corpo válido para confirmar **Gemini real** + **CORS**.

