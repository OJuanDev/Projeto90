# Projeto 90 — Minha evolução

PWA de acompanhamento de treinos, alimentação, marmitas, hábitos e medidas. Visual inspirado no Lume, com navegação responsiva e sincronização Firebase.

## Estrutura

```text
index.html
assets/
  css/
    base.css        # componentes e estrutura do app original
    theme.css       # identidade refinada e responsividade
  js/
    app.js          # páginas, estado, exercícios, gráficos e backups
    navigation.js   # tema, menu mobile e efeito Liquid Glass
    firebase.js     # Firebase Auth e Firestore
manifest.webmanifest
sw.js
icon-192.png
icon-512.png
icon.svg
firestore.rules
```

## Publicar

Publique **todos** os arquivos em um servidor HTTPS, mantendo a estrutura de pastas. Para teste local, use `python -m http.server 8080` e abra `http://localhost:8080`. Abrir como `file://` não funciona corretamente para módulos, autenticação e PWA.

No Firebase Console, habilite Authentication (Email/Senha e Google), adicione o domínio da aplicação em *Authorized domains*, crie o Cloud Firestore e aplique as regras do arquivo `firestore.rules`. A configuração web já está em `assets/js/firebase.js`.

## Dados e atualizações

Os dados são armazenados por UID no Firestore; `localStorage` é usado como cache/apoio. O aplicativo mantém importação e exportação JSON. Faça backup antes de atualizações e não limpe o armazenamento local enquanto houver dados pendentes de sincronização.

A navegação mobile mostra 5 seções. **Ajustes** fica no botão de engrenagem do topo. O efeito de distorção do Liquid Glass é aplicado só durante o arraste.

As fotos das refeições são ilustrações remotas e exigem internet para carregar. O app shell e as telas ficam em cache no Service Worker; login e sincronização exigem conexão.
