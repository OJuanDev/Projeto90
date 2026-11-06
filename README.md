# Projeto 90 — Firebase / Lume Edition

Painel mobile-first de treinos, alimentação, marmitas, compras e evolução em PWA com Firebase Auth + Firestore.

## Publicação

1. Publique todos os arquivos da pasta na raiz de um site HTTPS (Vercel, Netlify etc.). Não abra o HTML via `file://`.
2. No console Firebase, projeto `projeto90-356ea`, habilite **Authentication > Sign-in method > E-mail/Senha** e, se quiser, **Google**.
3. Adicione seu domínio publicado em **Authentication > Settings > Authorized domains**.
4. Crie o **Cloud Firestore** e cole o conteúdo de `firestore.rules` em **Firestore Database > Regras > Publicar**.
5. Faça login e teste criando uma medida. Entre com a mesma conta em outro aparelho para confirmar a sincronização.

## Dados e sincronização

- Firestore: `users/{uid}/app/state` (documento individual por usuário), com regras de acesso por UID.
- Cache local: `localStorage` em `projeto90.user.{uid}`, apenas para apoio. A nuvem é a fonte principal.
- Ao entrar na primeira vez, se houver registros antigos `projeto90.v1`, o app pergunta se você deseja migrá-los para sua conta.
- Exportar/importar JSON continua funcionando. Importar substitui o estado atual e sincroniza a cópia importada com a conta.
- O aplicativo requer conexão para autenticação inicial e sincronizar alterações. A interface do PWA é armazenada em cache, mas fotos e SDK Firebase dependem de rede e não há garantia de uso offline integral.
- Atualizações simultâneas em dois aparelhos usam a última gravação; faça backup periódico.

## Imagens

Fotos ilustrativas carregadas do Unsplash por internet; não são fotos exatas das receitas nem fazem parte do ZIP. Para imagens offline, baixe fotos próprias/licenciadas, salve em `assets/` e substitua os endereços em `foodPhotos`.

## Segurança

A `apiKey` do Firebase Web identifica o projeto e pode aparecer no código público. A proteção real são Authentication, regras do Firestore e restrições adequadas do projeto. Nunca coloque credenciais privadas ou chaves de serviço no frontend. Ative App Check se necessário. A regra acima permite ao usuário acessar somente seu documento.
