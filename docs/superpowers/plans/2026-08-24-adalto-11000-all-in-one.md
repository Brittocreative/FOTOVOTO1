# Adalto 11000 All-in-One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma página única, mobile-first, para compor, baixar e compartilhar uma foto 1080 × 1080 com molduras oficiais da campanha Adalto Santos 11000.

**Architecture:** Um aplicativo React/Vite mantém estado e controles na página principal. Um módulo puro de geometria calcula cobertura, zoom e limites; um hook de Canvas concentra desenho, ponteiros, pinça e exportação, mantendo foto e moldura inteiramente no navegador.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, HTML Canvas, CSS nativo.

**Spec:** `docs/superpowers/specs/2026-08-24-adalto-11000-all-in-one-design.md`

## Global Constraints

- Canvas interno fixo em 1080 × 1080.
- Aceitar JPG, JPEG, PNG e WEBP; selfie usa `capture="user"`.
- Exportar `adalto-santos-11000.png` e compartilhar arquivo pela Web Share API quando suportado.
- Nenhuma foto, composição ou dado pode ser enviado ou persistido.
- Molduras em `public/frames/frame-01.png` a `frame-04.png`; a moldura fica acima e nunca se move.
- Interface de uma única rota, sem etapas, modal, backend, autenticação, analytics ou biblioteca pesada de edição.
- Alvos de toque com no mínimo 44 px, foco visível e respeito a `prefers-reduced-motion`.

---

### Task 1: Base do projeto e identidade visual

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Create: `src/styles.css`
- Create: `public/frames/frame-01.png`
- Create: `public/frames/frame-02.svg`
- Create: `public/frames/frame-03.svg`
- Create: `public/frames/frame-04.svg`

**Interfaces:**
- Produces: ambiente Vite com scripts `dev`, `build`, `test` e `test:run`; tokens CSS `--navy`, `--blue`, `--sky`, `--mist`, `--white`; assets quadrados de moldura.

- [ ] **Step 1: Criar o teste de fumaça da configuração**

Crie `src/test/setup.ts` com `import '@testing-library/jest-dom/vitest'` e configure Vitest em `vite.config.ts` com `environment: 'jsdom'` e `setupFiles: './src/test/setup.ts'`.

- [ ] **Step 2: Instalar dependências**

Run: `npm install`
Expected: dependências instaladas e `package-lock.json` criado.

- [ ] **Step 3: Criar entrada e sistema visual**

Em `src/styles.css`, declarar a paleta oficial, carregar Archivo/Barlow, aplicar layout mobile-first, foco visível, alvos de 44 px e media query desktop de duas colunas. Em `src/main.tsx`, montar `<App />` dentro de `#root`.

- [ ] **Step 4: Instalar assets de moldura**

Copiar `/Users/pedrobritto/Desktop/moldura-01` para `public/frames/frame-01.png`. Criar três SVGs 1080 × 1080 locais com fundo transparente, faixa inferior em azul-marinho e variações de texto 11000 como substitutos compatíveis.

- [ ] **Step 5: Verificar a base**

Run: `npm run build`
Expected: build concluído sem erro TypeScript.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src/main.tsx src/test/setup.ts src/styles.css public/frames
git commit -m "chore: scaffold Adalto photo generator"
```

### Task 2: Geometria testada do Canvas

**Files:**
- Create: `src/editor/geometry.ts`
- Test: `src/editor/geometry.test.ts`

**Interfaces:**
- Produces: `Transform { x: number; y: number; scale: number }`; `Size { width: number; height: number }`; `coverScale(image, canvas): number`; `clampTransform(transform, image, canvas, minScale): Transform`; `zoomAroundPoint(transform, nextScale, point): Transform`.

- [ ] **Step 1: Escrever testes que falham**

Testar que `coverScale({width: 800,height:1200},{width:1080,height:1080})` retorna `1.35`; que `clampTransform` impede bordas vazias nos quatro lados; e que `zoomAroundPoint` mantém o ponto indicado visualmente estável.

```ts
expect(coverScale({ width: 800, height: 1200 }, CANVAS)).toBeCloseTo(1.35)
expect(clampTransform({ x: 500, y: 500, scale: 1.35 }, image, CANVAS, 1.35).x).toBe(0)
```

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm run test:run -- src/editor/geometry.test.ts`
Expected: FAIL porque `geometry.ts` ainda não existe.

- [ ] **Step 3: Implementar cálculos mínimos**

Implementar escala `Math.max(canvas.width / image.width, canvas.height / image.height)`, limites com metade do excedente escalado e zoom ancorado pela razão `nextScale / transform.scale`.

- [ ] **Step 4: Executar e confirmar sucesso**

Run: `npm run test:run -- src/editor/geometry.test.ts`
Expected: todos os testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/editor/geometry.ts src/editor/geometry.test.ts
git commit -m "feat: add constrained canvas geometry"
```

### Task 3: Carregamento local, desenho e gestos

**Files:**
- Create: `src/editor/imageFile.ts`
- Create: `src/editor/usePhotoCanvas.ts`
- Create: `src/editor/PhotoCanvas.tsx`
- Test: `src/editor/imageFile.test.ts`
- Test: `src/editor/PhotoCanvas.test.tsx`

**Interfaces:**
- Consumes: tipos e funções de `src/editor/geometry.ts`.
- Produces: `validateImageFile(file): string | null`; `loadImageFile(file): Promise<HTMLImageElement>`; `PhotoCanvasProps { photo: HTMLImageElement | null; frameUrl: string; zoom: number; onZoomChange(value): void; onError(message): void; onReadyChange(ready): void }`; ref imperativa `exportBlob(): Promise<Blob>`.

- [ ] **Step 1: Escrever testes que falham para arquivos**

Cobrir JPG/PNG/WEBP aceitos, PDF rejeitado com “Escolha uma imagem JPG, PNG ou WEBP.” e revogação de URL após carregamento ou erro.

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm run test:run -- src/editor/imageFile.test.ts`
Expected: FAIL porque o módulo não existe.

- [ ] **Step 3: Implementar validação e decodificação local**

Usar `URL.createObjectURL`, `new Image()`, `image.decode()` e `URL.revokeObjectURL` em `finally`; nunca usar `fetch`, `FormData` ou armazenamento.

- [ ] **Step 4: Escrever testes que falham para Canvas**

Mockar contexto 2D e verificar ordem `drawImage(photo)` antes de `drawImage(frame)`, dimensões 1080 × 1080 e atualização de transform em eventos de ponteiro.

- [ ] **Step 5: Implementar Canvas e gestos**

Desenhar em `requestAnimationFrame`; usar Pointer Events com captura; um ponteiro move, dois ponteiros calculam distância para pinça; wheel e slider atualizam zoom; todo transform passa por `clampTransform`.

- [ ] **Step 6: Executar testes**

Run: `npm run test:run -- src/editor/imageFile.test.ts src/editor/PhotoCanvas.test.tsx`
Expected: todos os testes PASS.

- [ ] **Step 7: Commit**

```bash
git add src/editor
git commit -m "feat: add local canvas editor and gestures"
```

### Task 4: Interface all-in-one e estados acessíveis

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/CampaignHeader.tsx`
- Create: `src/components/FramePicker.tsx`
- Create: `src/components/PhotoInput.tsx`
- Create: `src/components/EditorControls.tsx`
- Create: `src/components/CampaignFooter.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `PhotoCanvas`, `validateImageFile`, `loadImageFile`.
- Produces: `FrameOption { id: string; name: string; src: string }`; página única com estado `selectedFrame`, `photo`, `zoom`, `editorReady`, `message`.

- [ ] **Step 1: Escrever teste de jornada que falha**

Renderizar `App`; verificar quatro radios de moldura, botões “Escolher foto” e “Tirar selfie”, slider inicialmente desabilitado, mensagem de privacidade e ausência de links de rota.

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm run test:run -- src/App.test.tsx`
Expected: FAIL porque os componentes não existem.

- [ ] **Step 3: Implementar componentes e composição**

Usar `fieldset`/`legend` no seletor, dois inputs invisíveis (galeria e `capture="user"`), região `aria-live` para erros, canvas sempre visível e controles na mesma seção. Manter a moldura ao trocar foto e o enquadramento ao trocar moldura.

- [ ] **Step 4: Completar testes de estado**

Simular arquivo válido e verificar habilitação de zoom e ações; simular arquivo inválido e verificar mensagem sem apagar a seleção de moldura.

- [ ] **Step 5: Executar testes e build**

Run: `npm run test:run && npm run build`
Expected: suíte PASS e build concluído.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components src/App.test.tsx
git commit -m "feat: build single-page campaign editor"
```

### Task 5: Exportação, compartilhamento e fallback

**Files:**
- Create: `src/export/shareImage.ts`
- Create: `src/components/ExportActions.tsx`
- Test: `src/export/shareImage.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `downloadBlob(blob, filename): void`; `shareImage(blob): Promise<'shared' | 'download'>`; `ExportActionsProps { disabled: boolean; exportImage(): Promise<Blob>; onMessage(message): void }`.

- [ ] **Step 1: Escrever testes que falham**

Verificar que um `File` chamado `adalto-santos-11000.png` é enviado a `navigator.share` quando `navigator.canShare({files})` é verdadeiro; caso contrário, verificar criação de link com `download="adalto-santos-11000.png"`.

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm run test:run -- src/export/shareImage.test.ts`
Expected: FAIL porque o módulo não existe.

- [ ] **Step 3: Implementar compartilhamento progressivo**

Criar `File` PNG, tentar compartilhamento nativo de arquivo e usar download como fallback. Não capturar `AbortError` como falha visível; revogar URL de download após o clique.

- [ ] **Step 4: Integrar ações e feedback**

Adicionar botões “Compartilhar” e “Baixar minha foto”, estados ocupados, confirmação discreta e texto de apoio. Desabilitar ações sem foto válida.

- [ ] **Step 5: Executar testes e build**

Run: `npm run test:run && npm run build`
Expected: suíte PASS e build concluído.

- [ ] **Step 6: Commit**

```bash
git add src/export src/components/ExportActions.tsx src/App.tsx src/styles.css
git commit -m "feat: export and share campaign image"
```

### Task 6: Verificação visual e operacional

**Files:**
- Modify: `src/styles.css`
- Modify: arquivos de componentes somente se a inspeção revelar defeitos.

**Interfaces:**
- Consumes: aplicação completa das Tasks 1–5.
- Produces: build responsivo validado, sem erros de console e com exportação 1080 × 1080.

- [ ] **Step 1: Executar a verificação automatizada completa**

Run: `npm run test:run && npm run build`
Expected: todos os testes PASS e build sem warnings críticos.

- [ ] **Step 2: Testar manualmente no navegador**

Abrir o app local, carregar uma foto de teste, arrastar nos quatro sentidos, usar slider, roda e pinça, trocar moldura, baixar e confirmar por inspeção que o PNG mede 1080 × 1080.

- [ ] **Step 3: Verificar responsividade e acessibilidade**

Inspecionar 360 × 800, 768 × 1024 e 1440 × 900; percorrer controles por teclado; confirmar foco visível, ausência de overflow horizontal e áreas de toque adequadas.

- [ ] **Step 4: Verificar privacidade e erros**

Confirmar que carregar e manipular a foto não dispara requisições de rede; testar tipo inválido e moldura ausente; verificar console sem erros.

- [ ] **Step 5: Aplicar correções estritamente necessárias e repetir verificação**

Run: `npm run test:run && npm run build`
Expected: todos os testes PASS após correções.

- [ ] **Step 6: Commit final de polimento, se houver mudanças**

```bash
git add src
git commit -m "fix: polish responsive campaign editor"
```
