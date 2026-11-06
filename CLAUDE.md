# Documentation des bibliothèques (Context7)

<!-- Règle officielle Context7 : https://github.com/upstash/context7/blob/master/rules/context7-mcp.md -->

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, porting code between libraries, platforms, or SQL dialects, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, debugging, or reviewing code that does not depend on a library or platform API, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and what to look up in the library's documentation, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and what to look up in the library's documentation (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs

# Revue avant livraison

Avant chaque commit, push ou pull request qui touche au code du site, fais une revue du changement et attends l'accord de l'utilisateur avant de livrer. Les changements qui ne touchent que la configuration de Claude Code (`.claude/`, `.mcp.json`, `CLAUDE.md`) n'ont besoin que de l'étape 1.

## Étapes

1. **Revue du diff** : lance la commande intégrée `/code-review` sur le diff local. N'utilise pas le plugin `/code-review:code-review` dans les sessions cloud : il dépend de `gh pr view` et `gh pr diff`, que le proxy y refuse.
2. **Sécurité** : si le changement touche à des données venant de l'utilisateur ou de l'URL, à des formulaires, à des appels réseau, à des clés ou à des dépendances, lance aussi `/security-review`.
3. **Contrôle visuel** : si le changement modifie l'affichage, ouvre la page avec Playwright, prends une capture sur ordinateur (1440 px) et sur mobile (390 px), et relève les erreurs de la console.
4. **Régressions** : vérifie que les parties existantes touchées par le diff fonctionnent encore (navigation, scènes 3D, animations, formulaires).

## Rapport

Présente un seul rapport en français, avec les problèmes classés par gravité :

- **Critique** : faille de sécurité exploitable, perte de données, site cassé ou page blanche.
- **Élevée** : bug visible par les visiteurs, régression, erreur dans la console, forte baisse de performance.
- **Moyenne** : cas limite mal géré, problème d'accessibilité, performance dégradée sur mobile.
- **Faible** : amélioration mineure.

Pour chaque problème, donne le fichier et la ligne, ce qui se passe concrètement, et la correction proposée. Ne signale pas les problèmes qui existaient déjà avant le changement, sauf s'ils sont critiques. Si rien n'est trouvé, dis-le et liste ce qui a été vérifié.

## Règles

- N'applique aucune correction sans l'accord explicite de l'utilisateur.
- Ne commite pas, ne pousse pas et ne déploie pas tant qu'un problème Critique ou Élevé reste ouvert, sauf si l'utilisateur décide de passer outre.
- Ne publie aucun commentaire sur GitHub sans accord.
