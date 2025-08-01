# Projeto Python - Servidor Local

Este projeto demonstra a configuração de um servidor Python local com integração ao GitHub e Supabase.

## 🚀 Funcionalidades

- Servidor HTTP Python personalizado
- Interface web responsiva
- Integração com GitHub para versionamento
- Configuração para Supabase

## 📋 Pré-requisitos

- Python 3.13.5+
- Git 2.50.1+
- npm 11.5.2+
- Node.js 24.5.0+

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd venv
```

2. Instale as dependências Python:
```bash
pip install requests
```

3. Execute o servidor:
```bash
python test_server.py
```

## 🌐 Uso

O servidor estará disponível em: `http://localhost:8000`

### Scripts Disponíveis

- `test_server.py` - Servidor principal com interface moderna
- `simple_server.py` - Servidor simples para testes
- `test_connection.py` - Script para testar a conexão

## 🔧 Configuração do Git

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## 📦 Estrutura do Projeto

```
venv/
├── test_server.py          # Servidor principal
├── simple_server.py        # Servidor simples
├── test_connection.py      # Script de teste
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Documentação
```

## 🔗 Integrações

### GitHub
- Repositório configurado para versionamento
- Git configurado com credenciais

### Supabase
- Configuração preparada para integração
- Variáveis de ambiente configuradas

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Luiguy Lima - Resolve Energia Solar 