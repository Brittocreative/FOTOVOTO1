# Adalto 11000 — gerador de foto all-in-one

## Objetivo

Criar uma aplicação eleitoral mobile-first, em uma única página, que permita ao apoiador escolher uma moldura, selecionar ou fotografar uma imagem, ajustar o enquadramento e baixar ou compartilhar uma composição quadrada de alta qualidade. Toda a edição acontece localmente no navegador.

## Direção visual

A interface seguirá a identidade oficial do site de Adalto Santos: azul-marinho `#0C2B62`, azul institucional `#1668C7`, azul-claro `#2AB4E8`, fundo frio `#F3F6FA`, branco e tipografia Archivo + Barlow. A direção escolhida é “Campanha em movimento”: o número 11000 terá protagonismo no topo, enquanto a área de edição será contida e silenciosa.

A página deve parecer uma ação oficial de campanha, não um painel administrativo. O acabamento será direto, humano e popular, com espaço negativo, áreas de toque confortáveis e sem efeitos decorativos excessivos.

## Estrutura da página

A aplicação terá uma única rota e uma única coluna principal no celular. No desktop, o conteúdo poderá usar duas colunas: editor à esquerda e controles à direita.

1. Cabeçalho compacto com marca, cargo e número 11000.
2. Introdução curta: “Mostre que você está com Adalto”.
3. Seletor horizontal de quatro molduras.
4. Ações “Escolher foto” e “Tirar selfie”.
5. Canvas quadrado sempre visível, com instrução contextual antes da foto.
6. Controles de enquadramento e zoom.
7. Ações “Compartilhar” e “Baixar”.
8. Mensagem de privacidade e rodapé eleitoral obrigatório.

Não haverá etapas, rotas, modal de onboarding ou menu. A seleção de uma foto habilita o editor no próprio lugar, sem mudança de página.

## Editor de imagem

O Canvas terá resolução interna de 1080 × 1080 e tamanho visual responsivo. A foto será desenhada primeiro e a moldura PNG selecionada será desenhada por cima.

Ao carregar uma foto, o sistema calculará uma escala mínima que cubra todo o quadrado sem áreas vazias e centralizará a imagem. O usuário poderá:

- arrastar com toque, caneta ou mouse;
- usar pinça com dois dedos para zoom;
- usar a roda do mouse no desktop;
- controlar o zoom por slider;
- trocar a foto sem perder a moldura selecionada;
- trocar a moldura sem perder o enquadramento.

O deslocamento será limitado para impedir que bordas vazias apareçam. A moldura nunca será movida ou escalada pelo usuário.

## Molduras

As molduras ficarão em `public/frames/frame-01.png` até `frame-04.png` e serão descritas por uma configuração central. Enquanto os PNGs oficiais não forem enviados, a aplicação usará quatro molduras provisórias locais com a mesma proporção, permitindo substituição direta dos arquivos.

Falhas no carregamento de uma moldura não impedirão o uso da foto: o sistema mostrará uma mensagem clara e manterá as outras opções disponíveis.

## Entrada, saída e privacidade

Os inputs aceitarão JPG, JPEG, PNG e WEBP. O botão de selfie usará `capture="user"` como preferência para a câmera frontal em dispositivos compatíveis. Arquivos inválidos ou impossíveis de decodificar gerarão orientação objetiva para escolher outra imagem.

A exportação padrão será PNG 1080 × 1080 com o nome `adalto-santos-11000.png`. O compartilhamento usará a Web Share API com arquivo quando suportado. Caso o navegador não aceite compartilhamento de arquivos, a interface oferecerá download e, quando possível, compartilhamento de texto como alternativa. Não haverá tentativa de publicação automática no Instagram ou WhatsApp.

Fotos, composições e dados não serão enviados, persistidos ou armazenados. URLs temporárias serão revogadas quando substituídas ou ao desmontar a aplicação.

## Acessibilidade e responsividade

Todos os controles terão rótulos acessíveis, foco visível e alvos de toque de pelo menos 44 px. A seleção de moldura funcionará por teclado como grupo de opções. Instruções não dependerão apenas de cor. Movimentos respeitarão `prefers-reduced-motion`.

A interface será testada em largura móvel de 360 px, tablet e desktop. A jornada principal deverá ser utilizável com o polegar e sem zoom da página.

## Arquitetura

O projeto usará React, TypeScript e Vite. A interface será composta por unidades pequenas:

- `CampaignHeader`: identidade compacta;
- `FramePicker`: seleção acessível de molduras;
- `PhotoInput`: galeria e selfie;
- `PhotoCanvas`: renderização e gestos;
- `EditorControls`: zoom e troca de arquivos;
- `ExportActions`: compartilhamento e download;
- `CampaignFooter`: informações legais;
- módulo de geometria do Canvas: cálculos puros de escala, limites e coordenadas.

O estado principal permanecerá na página e será passado explicitamente aos componentes. Não haverá backend, banco de dados, autenticação, analytics ou bibliotecas pesadas de edição.

## Tratamento de erros

A interface cobrirá: tipo de arquivo inválido, falha de leitura, foto muito grande para decodificar, moldura ausente, falha de exportação e indisponibilidade da Web Share API. Erros aparecerão próximos à ação correspondente e não apagarão uma composição válida.

## Testes e validação

Os cálculos de escala, cobertura e limites de arraste terão testes unitários. O fluxo principal terá testes de interface para seleção de moldura, carregamento, habilitação de controles e fallback de compartilhamento. A validação manual incluirá:

- arraste e zoom sem revelar áreas vazias;
- pinça em viewport móvel;
- exportação com dimensões 1080 × 1080;
- substituição de foto e moldura;
- compartilhamento suportado e fallback;
- navegação por teclado;
- ausência de envio de rede ao manipular a foto;
- inspeção visual em celular e desktop.

## Fora do escopo

Hospedagem, publicação automática em redes sociais, armazenamento de fotos, login, painel administrativo, métricas, criação dos PNGs oficiais e integração com serviços externos não fazem parte desta entrega.
