# 🎓 Validador de Certificados Online

Um sistema completo para validação de certificados digitais com interface moderna e painel administrativo.

## ✨ Funcionalidades

### 🔍 Validação de Certificados
- Interface intuitiva para validação
- Códigos únicos de 9 caracteres alfanuméricos
- Validação em tempo real
- Exibição detalhada dos resultados
- Modal com informações completas
- Design responsivo para todos os dispositivos

### 🛠️ Painel Administrativo
- Adicionar novos certificados
- Listar todos os certificados
- Gerenciar status (Válido, Cancelado, Expirado)
- Excluir certificados
- Geração automática de códigos
- Interface moderna e intuitiva

### 🗄️ Banco de Dados
- SQLite para simplicidade
- Estrutura otimizada
- Dados de exemplo incluídos
- Backup automático

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: SQLite
- **Design**: CSS Grid, Flexbox, Gradientes
- **Ícones**: Font Awesome
- **Fontes**: Google Fonts (Inter)

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (Node Package Manager)

## 🛠️ Instalação

1. **Clone ou baixe o projeto**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd validador-certificados
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   npm start
   ```

4. **Acesse a aplicação**
   - Validador: http://localhost:3000
   - Painel Admin: http://localhost:3000/admin.html

## 📁 Estrutura do Projeto

```
validador-certificados/
├── server.js              # Servidor Express
├── package.json           # Dependências e scripts
├── certificados.db        # Banco de dados SQLite (criado automaticamente)
├── public/                # Arquivos estáticos
│   ├── index.html         # Página principal do validador
│   ├── admin.html         # Painel administrativo
│   ├── styles.css         # Estilos CSS
│   ├── script.js          # JavaScript do validador
│   └── admin.js           # JavaScript do painel admin
└── README.md              # Este arquivo
```

## 🎯 Como Usar

### Para Usuários Finais

1. Acesse http://localhost:3000
2. Digite o código do certificado (9 caracteres)
3. Clique em "Validar"
4. Visualize os resultados
5. Clique em "Ver Detalhes Completos" para mais informações

### Para Administradores

1. Acesse http://localhost:3000/admin.html
2. Use a aba "Adicionar Certificado" para criar novos
3. Use a aba "Listar Certificados" para gerenciar existentes
4. Gere códigos automáticos ou digite manualmente

## 🔧 API Endpoints

### Validação
- `GET /api/validar/:codigo` - Validar certificado

### Gerenciamento
- `GET /api/certificados` - Listar todos os certificados
- `POST /api/certificados` - Adicionar novo certificado
- `PUT /api/certificados/:codigo/status` - Atualizar status
- `DELETE /api/certificados/:codigo` - Excluir certificado

## 📊 Estrutura do Banco de Dados

```sql
CREATE TABLE certificados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    curso TEXT NOT NULL,
    data_emissao TEXT NOT NULL,
    status TEXT DEFAULT 'Válido',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Personalização

### Cores e Estilo
Edite o arquivo `public/styles.css` para personalizar:
- Cores do tema
- Fontes
- Layout
- Animações

### Dados de Exemplo
Modifique a função `insertSampleData()` em `server.js` para adicionar seus próprios dados de exemplo.

## 🔒 Segurança

- Validação de entrada no frontend e backend
- Sanitização de dados
- Proteção contra SQL Injection
- CORS configurado adequadamente

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Smartphone
- Qualquer dispositivo com navegador moderno

## 🚀 Deploy

### Local
```bash
npm start
```

### Produção
1. Configure variáveis de ambiente
2. Use PM2 ou similar para gerenciar processos
3. Configure proxy reverso (nginx/apache)
4. Configure SSL/HTTPS

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia com nodemon (desenvolvimento)

## 📝 Exemplos de Códigos de Teste

O sistema vem com 5 certificados de exemplo:
- `ABC123XYZ` - João da Silva
- `XYZ789ABC` - Maria Oliveira
- `DEF456GHI` - Pedro Santos
- `JKL012MNO` - Ana Costa
- `PQR345STU` - Carlos Ferreira (Cancelado)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email
- Consulte a documentação da API

## 🔄 Atualizações Futuras

- [ ] Autenticação de administradores
- [ ] Exportação para PDF/Excel
- [ ] Busca avançada
- [ ] Relatórios e estatísticas
- [ ] Integração com QR Code
- [ ] API pública para terceiros
- [ ] Backup automático na nuvem
- [ ] Notificações por email

---

**Desenvolvido com ❤️ para facilitar a validação de certificados digitais.** 