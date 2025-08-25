Plano completo para implementação do app de medições Re11/08/2025, 13:59:16
1. Objetivo e escopo
O objetivo é implementar, na ordem, as melhorias e módulos: edição do valor por painel na
remuneração de instalação; gestão de tipos de serviço; autocomplete de cliente no
lançamento; área de clientes com agregação e adapter global; autenticação com usuário
master; e sistema de logs completo por IP e usuário.
2. Padrões e arquitetura geral
- Camadas: Front-end (Web), API REST, Banco de Dados relacional.
- Padrões: Clean Architecture, DTOs, Services, Repositories, Middlewares.
- Segurança: JWT Access/Refresh, hash de senha (argon2/bcrypt), RBAC.
- Auditoria: middleware de correlação, log estruturado, trilha no banco.
- Escalabilidade: índices em busca, paginação, consultas agregadas.
3. Edição do valor por painel no módulo Lançamentos
3.1 Requisitos
- Permitir editar o valor unitário por painel (atualmente fixo em R$ 90,00).
- Aplicar o valor correto conforme a equipe cadatrada com remuneração por painel ou por
kWp.
- Registrar aditivos e descontos sem perder rastreabilidade.
- Persistir o histórico de alterações de valores.
3.2 Modelagem de dados
- Tabela configuracoesprecos
 - id, chave (ex.: valorpaineldefault), valordecimal, vigentedesde, vigenteate, atualizadopor
- Tabela equipes
 - id, nome, tiporemuneracao (kwp|painel), valorporkwpdecimal, valorporpaineldecimal
(nullable)
- Tabela lancamentos
 - id, clienteid, equipeid, tiposervicoid, dataexecucao, quantidadekwpdecimal,
quantidadepaineisint, valorunitariodecimal, valorbrutodecimal, aditivodecimal,
descontodecimal, valortotaldecimal, status, criadopor, criadoem
- Tabela historicoprecos
 - id, origem (global|equipe|servico|lancamento), origemid, campo, valoranterior,
valornovo, alteradopor, alteradoem
3.3 Regras de negócio
- Hierarquia de preço por painel (ordem de resolução):
 1) valorunitario definido no lançamento (override manual).
 2) valorporpainel da equipe (se preenchido).
 3) preço por painel de um tipo de serviço Instalação (se configurado).
 4) valorpaineldefault em configuracoesprecos (padrão global).
- Cálculo de valores:
 - Remuneração por painel: valorbruto = quantidadepaineis * valorunitario.
 - Remuneração por kWp: valorbruto = quantidadekwp * valorporkwp.
 - valortotal = valorbruto + aditivo - desconto.
- Qualquer alteração em valorpaineldefault, valorporpainel da equipe ou override no
lançamento gera registro em historicoprecos e log de auditoria.
3.4 Endpoints API
- GET /api/config/precos/valor-painel
- PUT /api/config/precos/valor-painel
 - body: valordecimal, vigentedesde
- PUT /api/equipes/:id/precos
 - body: valorporpaineldecimal, valorporkwpdecimal
- POST /api/lancamentos
- PUT /api/lancamentos/:id
- GET /api/historico-precos?origem=global|equipe|servico|lancamento&origemId=:id
3.5 Fluxo de UI
- Página Lançamentos: campo Valor por painel habilitado quando equipe for remuneração
por painel; exibir fonte do preço (global, equipe, serviço, manual).
- Tela Configurações de Preços: editar valor padrão do painel e vigência.
3.6 Critérios de aceitação
- Editar valor padrão por painel reflete em novos lançamentos respeitando vigência.
- Lançamento calcula corretamente valortotal para remuneração por painel e por kWp.
- Histórico de alterações e logs criados a cada mudança de preço.
4. Gestão de Tipos de Serviço
4.1 Requisitos
- Criar área de cadastro e gestão de tipos de serviço.
- Permitir parametrizar remuneração e comportamento por tipo.
- Cobrir serviços atuais: instalação, aditivo, desconto, padrão de entrada, visita técnica,
obra civil, e expansível.
4.2 Modelagem de dados
- Tabela tiposservico
 - id, nome, codigo, descricao, ativo, modelocobranca (painel|kwp|fixo|hora|custom),
valorunitariodecimal, permiteaditivo (bool), permitedesconto (bool), exigequantidadepaineis
(bool), exigekwp (bool), exigehoras (bool), criadoem
- Relacionamento lancamentos.tiposervicoid -> tiposservico.id
4.3 Regras de negócio
- Instalação: modelocobranca = painel|kwp (conforme equipe), pode herdar valor do painel
global ou sobrepor em tiposservico.valorunitariodecimal.
- Aditivo/Desconto: atuam como ajustes no lançamento principal ou como lançamentos
independentes vinculados a um serviço.
- Visita técnica: modelocobranca = hora ou fixo.
- Obra civil: modelocobranca = fixo ou custom, conforme parametrização.
- Validações condicionais conforme flags exige* do tipo.
4.4 Endpoints API
- GET /api/tipos-servico?ativo=true
- POST /api/tipos-servico
- PUT /api/tipos-servico/:id
- DELETE /api/tipos-servico/:id
- GET /api/tipos-servico/:id
4.5 UI e fluxo
- Tela Gestão de Tipos de Serviço: lista, filtro por ativo, criar/editar com campos e
pré-visualização do cálculo.
- Seleção de tipo de serviço no lançamento carrega automaticamente as regras de
validação e valor sugerido.
4.6 Critérios de aceitação
- Criar, editar, desativar e excluir tipos de serviço.
- Regras e validações são aplicadas no formulário de lançamento.
- Valor sugerido é calculado conforme hierarquia e modelocobranca.
5. Autocomplete e pesquisa de cliente no Lançamento
5.1 Requisitos
- Campo de nome do cliente com autocomplete e pesquisa.
- Limitar a 7 resultados.
- Suportar múltiplos serviços por cliente, com seleção rápida.
5.2 Modelagem e índices
- Tabela clientes
 - id, nome, documento, email, telefone, empresaid, criadoem, atualizadoem, ativo
- Índices: idxclientesnome, idxclientesdocumento
5.3 Endpoint de busca
- GET /api/clientes/search?q=:termo&limit=7
 - Busca por prefixo e substring case-insensitive, normalizando acentuação.
 - Ordenação: clientes mais usados recentemente pelo usuário, depois por similaridade,
depois por nome.
5.4 UI e comportamento
- Digitação abre dropdown com até 7 sugestões.
- Suporte a teclas seta e Enter.
- Exibir nome e documento.
- Se não encontrar, opção Criar novo cliente.
- Debounce de 250 ms; mostrar estado carregando.
5.5 Critérios de aceitação
- Nunca retornar mais de 7 resultados.
- Seleção preenche automaticamente clienteid no lançamento.
- Performance da consulta < 150 ms com índice ativo.
6. Área de Clientes com agregação e adapter global
6.1 Requisitos
- Lista de clientes em formato de card-linha exibindo:
 - Nome do cliente (destaque).
 - Data do último serviço executado.
 - Valor total gasto no cliente.
- Itens agregados a partir de lançamentos.
- Exclusão de cliente ou lançamento reflete imediatamente nos agregados.
6.2 Modelagem e agregação
- View ou tabela materializada clientesagregados
 - clienteid, totalgastodecimal, ultimoservicoem
- Tabela clientesusorecente
 - clienteid, usuarioid, usadoem (para rankear autocomplete)
- Chaves e integridade:
 - lancamentos.clienteid ON DELETE CASCADE.
 - Atualização de clientesagregados por triggers ou job assíncrono.
6.3 Adapter global de consistência
- Camada Repository com métodos transacionais:
 - salvarLancamento(lancamento) atualiza agregados no commit.
 - excluirLancamento(id) atualiza agregados e logs.
 - excluirCliente(id) executa cascata e recalcula agregados.
- Triggers SQL
 - AFTER INSERT/UPDATE/DELETE em lancamentos para atualizar clientesagregados.
- Fallback
 - Tarefa de reconciliação diária que recalcula agregados full-scan.
6.4 Endpoints API
- GET /api/clientes?pagina=&limite=&q=
- GET /api/clientes/:id
- GET /api/clientes/:id/agregados
- DELETE /api/clientes/:id
- GET /api/clientes/cards?ordenar=ultimoservico|totalgasto&direcao=desc
6.5 UI e comportamento
- Lista com linhas tipo card:
 - Primeira linha: Nome em fonte maior.
 - Segunda linha: Último serviço executado (data).
 - Terceira linha: Valor total gasto (moeda).
- Abertura do card mostra histórico de lançamentos com tipo de serviço e data de
execução.
- Paginação e filtro por nome.
6.6 Critérios de aceitação
- Exclusões de lançamentos reduzem corretamente totalgasto e atualizam
ultimoservicoem.
- Exclusão de cliente remove agregados e lançamentos associados.
- Atualização visível em até 1 segundo após operação.
7. Autenticação de usuário e usuário master
7.1 Requisitos
- Login com e-mail e senha.
- Usuário master com credenciais fornecidas.
- Expiração de sessão, refresh token, revogação.
- RBAC (ex.: MASTER, ADMIN, OPERADOR, VISUALIZADOR).
7.2 Modelagem
- Tabela usuarios
 - id, nome, email, senhahash, perfil, ativo, ultimologinem, criadoem
- Tabela tokensrevogados
 - id, usuarioid, tokenid, revogadoem, motivo
7.3 Seed do usuário master
- Usuário master
 - email: luiguy.lima@resolvenergiasolar.com
 - senha: @Resolve@2011
 - perfil: MASTER
 - ativo: true
7.4 Endpoints
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/usuarios (apenas MASTER/ADMIN)
- POST /api/usuarios (apenas MASTER/ADMIN)
7.5 Fluxo de UI
- Tela de login com máscara e feedback de erro.
- Exibir nome do usuário logado no header.
- Timeout de inatividade configurável.
7.6 Critérios de aceitação
- Usuário master consegue autenticar e acessar áreas administrativas.
- Senhas armazenadas com hash seguro.
- Tokens revogados impedem reuso.
8. Sistema de logs e auditoria por IP e usuário
8.1 Requisitos
- Registrar toda movimentação: login, logout, baixar planilha, consolidar medição,
lançamento (criar/editar/excluir), alterações de preço, cadastro de tipos de serviço,
clientes, empresas.
- Guardar IP, usuário, timestamp, entidade afetada, payload relevante e correlação.
8.2 Modelagem
- Tabela logsauditoria
 - id, evento, usuarioid, emailusuario, ip, useragent, entidade, entidadeid, acao,
detalhesjson, correlacaoid, criadoem
- Índices: idxlogscriadoem, idxlogsusuario, idxlogsentidade
8.3 Coleta e correlação
- Middleware captura IP e useragent.
- Gerar correlacaoid por request e propagar.
- Enriquecer logs no serviço com contexto do usuário.
8.4 Eventos mínimos
- auth.login.sucesso, auth.login.falha, auth.logout
- clientes.criar, clientes.editar, clientes.excluir
- lancamentos.criar, lancamentos.editar, lancamentos.excluir
- servicos.criar, servicos.editar, servicos.excluir
- precos.alterar.global, precos.alterar.equipe, precos.alterar.servico,
precos.alterar.lancamento
- relatorios.baixarplanilha
- medicoes.consolidar
8.5 Exportação e consulta
- GET /api/logs?inicio=&fim=&usuario=&evento=&entidade=
- GET /api/logs/export?formato=csv|xlsx
- Paginação e filtros por período, usuário, evento e entidade.
8.6 Critérios de aceitação
- Todas as ações críticas registradas com IP e usuário.
- Possibilidade de rastrear uma operação ponta a ponta via correlacaoid.
- Exportação funciona com filtros aplicados.
9. Regras específicas dos lançamentos
9.1 Campos e validações
- Instalação (painel): exige quantidadepaineis, proíbe quantidadekwp vazia se modelo
exigir.
- Instalação (kWp): exige quantidadekwp.
- Visita técnica (hora): exige horas trabalhadas.
- Obra civil (fixo): exige valor acordado se tipo for fixo custom.
- Aditivo e desconto: valores não negativos; desconto não pode exceder valorbruto.
9.2 Cálculo e persistência
- Computar valorunitario conforme hierarquia de preço.
- Arredondamento bancário a 2 casas.
- Persistir valortotal e origem do preço em campo fontepreco
(global|equipe|servico|manual).
9.3 Estados e fluxo
- status: rascunho, confirmado, faturado, cancelado.
- Transições válidas: rascunho -> confirmado -> faturado; confirmado -> cancelado.
10. Relatórios e downloads
10.1 Requisitos
- Relatórios por período, cliente, tipo de serviço, equipe.
- Exportar CSV/XLSX com logs de download.
10.2 Endpoints
- GET /api/relatorios/lancamentos?inicio=&fim=&cliente=&equipe=&tipoServico=
- GET /api/relatorios/lancamentos/export?formato=csv|xlsx
10.3 Critérios de aceitação
- Filtros aplicados corretamente.
- Ação de exportar registrada em logsauditoria.
11. Plano de implementação passo a passo para o agente de IA (Cursor)
11.1 Iteração 1 – Edição do valor por painel
1) Criar migração para configuracoesprecos, historicoprecos, ajustes em equipes e
lancamentos.
2) Implementar serviço de resolução de preço com hierarquia.
3) Atualizar criação/edição de lançamento para usar o serviço de preço.
4) Expor endpoints GET/PUT do valor padrão do painel.
5) Ajustar UI em Lançamentos para exibir e permitir override do valor por painel.
6) Registrar histórico e logs em cada alteração de preço.
7) Testes unitários de cálculo e integrais de API.
11.2 Iteração 2 – Gestão de tipos de serviço
1) Criar migração de tiposservico e vínculos em lancamentos.
2) Implementar CRUD de tipos de serviço com validações.
3) Integrar seleção de tipo de serviço no formulário de lançamento.
4) Implementar validações condicionais no back-end e front-end.
5) Testes de criação/edição e aplicação de regras no lançamento.
11.3 Iteração 3 – Autocomplete de clientes
1) Criar índices em clientes.
2) Implementar endpoint /clientes/search com normalização e limite 7.
3) Implementar componente de autocomplete com debounce e navegação por teclado.
4) Registrar uso recente na tabela clientesusorecente.
5) Testes de performance e relevância de resultados.
11.4 Iteração 4 – Área de clientes e adapter global
1) Criar view/tabela materializada clientesagregados e triggers em lancamentos.
2) Implementar Repositories transacionais para salvar/excluir lançamentos e clientes.
3) Implementar endpoints de cards e agregados do cliente.
4) Criar UI de lista de clientes com cards e detalhe com histórico.
5) Implementar tarefa de reconciliação.
6) Testes de consistência em exclusões e atualizações.
11.5 Iteração 5 – Autenticação e usuário master
1) Criar migração de usuarios e tokensrevogados.
2) Implementar login, refresh e logout com JWT e hash de senha.
3) Criar seed do usuário master: luiguy.lima@resolvenergiasolar.com / @Resolve@2011.
4) Proteger rotas com RBAC (MASTER/ADMIN/OPERADOR/VISUALIZADOR).
5) Testes de autenticação, revogação e autorização.
11.6 Iteração 6 – Logs e auditoria
1) Criar migração de logsauditoria.
2) Implementar middleware de captura de IP/useragent e correlacaoid.
3) Injetar logging nos casos de uso listados.
4) Implementar consultas e exportação.
5) Testes de cobertura dos eventos e performance.
12. Dicionário de dados resumido
- clientes: id, nome, documento, email, telefone, empresaid, ativo, criadoem, atualizadoem
- empresas: id, nome, cnpj, email, telefone, ativo, criadoem
- equipes: id, nome, tiporemuneracao, valorporkwpdecimal, valorporpaineldecimal, ativo
- tiposservico: id, nome, codigo, descricao, ativo, modelocobranca, valorunitariodecimal,
flags de validação
- lancamentos: id, clienteid, equipeid, tiposervicoid, dataexecucao, quantidadekwpdecimal,
quantidadepaineisint, valorunitariodecimal, valorbrutodecimal, aditivodecimal,
descontodecimal, valortotaldecimal, fontepreco, status, criadopor, criadoem
- configuracoesprecos: id, chave, valordecimal, vigentedesde, vigenteate, atualizadopor
- historicoprecos: id, origem, origemid, campo, valoranterior, valornovo, alteradopor,
alteradoem
- clientesagregados: clienteid, totalgastodecimal, ultimoservicoem
- clientesusorecente: clienteid, usuarioid, usadoem
- usuarios: id, nome, email, senhahash, perfil, ativo, ultimologinem, criadoem
- tokensrevogados: id, usuarioid, tokenid, revogadoem, motivo
- logsauditoria: id, evento, usuarioid, emailusuario, ip, useragent, entidade, entidadeid,
acao, detalhesjson, correlacaoid, criadoem
13. Critérios gerais de qualidade
- Performance: respostas críticas < 250 ms no P95.
- Confiabilidade: consistência das agregações após operações CRUD.
- Segurança: endpoints sensíveis protegidos, senhas com hash, logs sem dados sensíveis
de senhas.
- Observabilidade: logs com correlação e filtros; contadores de eventos.
14. Testes recomendados
- Unitários: serviço de preço, validações por tipo de serviço, cálculo de valortotal.
- Integração: CRUD de tipos de serviço, lançamentos com diferentes modelos de
cobrança, autocomplete.
- E2E: fluxo completo de login -> lançamento -> consulta de cliente -> exportação ->
exclusão -> verificação de agregados.
- Carga: endpoint de busca de clientes com 100k registros.
- Auditoria: verificação da presença de logs para cada evento exigido.
15. Entregáveis
- Migrações do banco para todas as tabelas e índices descritos.
- Endpoints REST implementados e documentados.
- Interface web atualizada: Lançamentos, Tipos de Serviço, Clientes (cards e detalhe),
Login.
- Seed do usuário master.
- Middleware de auditoria e exportação de logs.
