# Sistema de Medição e Lançamento Financeiro - Resolve Energia Solar

Sistema web moderno para gestão financeira da Resolve Energia Solar, desenvolvido com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

### 📊 Demonstrativo Financeiro
- Visualização de demonstrativos financeiros por medição
- Criação de novas medições com período personalizado
- Resumo com totais de clientes, painéis e valores
- Exportação de dados em CSV
- Interface responsiva com cards de métricas

### 🏢 Cadastro de Empresas
- Cadastro completo de empresas terceirizadas
- Gestão de equipes por empresa
- Configuração de tipos de remuneração (por painel ou por kWp)
- Dados bancários e informações de pagamento
- Lista visual de empresas cadastradas

### ➕ Cadastro de Lançamentos
- Formulário dinâmico baseado no tipo de serviço
- Cálculo automático de valores de instalação
- Suporte a múltiplos tipos de serviço:
  - Instalação (com cálculo automático)
  - Aditivos (Logístico, Instalação, Outros)
  - Descontos (com motivo)
  - Padrão de Entrada (Fachada, Poste Auxiliar, Padrão 3 Compartimentos)
  - Visita Técnica (com motivo)
  - Obra Civil (com descrição de material e motivo)

### 📋 Relatórios
- Filtros avançados por período, equipe e cliente
- Visualização completa de todos os lançamentos
- Exportação em CSV
- Funcionalidade de impressão
- Resumo estatístico dos dados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod
- **Notifications**: React Hot Toast
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd resolve-finance-flow
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env.local
   ```
   
   Edite o arquivo `.env.local` com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `empresas`
- `id` (Primary Key)
- `nome` (Nome da empresa)
- `responsavel` (Responsável pela empresa)
- `chave_pix` (Chave PIX para pagamentos)
- `beneficiario` (Nome do beneficiário da conta)
- `tipo_remuneracao` (por_painel ou por_kwp)
- `valor_kwp` (Valor por kWp, se aplicável)
- `created_at` (Data de criação)

#### `equipes`
- `id` (Primary Key)
- `empresa_id` (Foreign Key para empresas)
- `nome` (Nome da equipe)
- `created_at` (Data de criação)

#### `medicoes`
- `id` (Primary Key)
- `numero` (Número da medição - gerado automaticamente)
- `data_inicio` (Data de início do período)
- `data_fim` (Data de fim do período)
- `status` (aberta ou fechada)
- `created_at` (Data de criação)

#### `lancamentos`
- `id` (Primary Key)
- `equipe_id` (Foreign Key para equipes)
- `medicao_id` (Foreign Key para medições)
- `cliente` (Nome do cliente)
- `data_contrato` (Data do contrato)
- `tipo_servico` (Tipo do serviço realizado)
- `subitem_servico` (Subitem específico do serviço)
- `valor` (Valor do serviço)
- `descricao` (Descrição adicional)
- `created_at` (Data de criação)

### View: `demonstrativo_financeiro`
View que agrega dados para gerar o demonstrativo financeiro por empresa e medição.

## 🚀 Deploy na Vercel

1. **Conecte seu repositório ao GitHub**

2. **Configure as variáveis de ambiente na Vercel**
   - Acesse o dashboard da Vercel
   - Vá em Settings > Environment Variables
   - Adicione:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy automático**
   - A cada push para a branch `main`, o deploy será feito automaticamente

## 📁 Estrutura do Projeto

```
resolve-finance-flow/
├── app/                    # App Router do Next.js
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial (Demonstrativo)
│   ├── empresas/          # Página de empresas
│   ├── lancamentos/       # Página de lançamentos
│   └── relatorios/        # Página de relatórios
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI base
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
│   ├── supabase.ts       # Cliente Supabase e tipos
│   └── utils.ts          # Funções utilitárias
├── public/               # Arquivos estáticos
├── package.json          # Dependências do projeto
├── tailwind.config.js    # Configuração do Tailwind
├── tsconfig.json         # Configuração do TypeScript
└── README.md             # Este arquivo
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Executa a aplicação em produção
- `npm run lint` - Executa o linter

## 📋 Fluxo de Trabalho

1. **Cadastre as empresas** na página "Empresas"
2. **Crie uma medição** no "Demonstrativo Financeiro"
3. **Insira os lançamentos** na página "Lançamentos"
4. **Visualize os resultados** no "Demonstrativo Financeiro"
5. **Gere relatórios** na página "Relatórios"

## 🔒 Segurança

- Todas as operações são validadas no frontend e backend
- Conexão segura com Supabase via HTTPS
- Variáveis de ambiente protegidas
- Validação de tipos com TypeScript

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Design System

- Interface moderna e limpa
- Cores consistentes com a identidade visual
- Componentes reutilizáveis
- Feedback visual para todas as ações

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso exclusivo da Resolve Energia Solar.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento. 