# GRI - Gestão de Retenção Inteligente

Sistema inteligente de previsão e redução de evasão de alunos em academias.

## 🎯 Sobre o Projeto

O GRI analisa padrões de frequência, check-ins e dados administrativos para identificar alunos em risco de cancelamento, permitindo ações proativas de retenção.

## ✨ Funcionalidades Principais

- **Dashboard Executivo**: Métricas-chave, distribuição de risco e visão geral
- **Gestão de Alunos**: Lista completa com filtros por nível de risco
- **Perfil Detalhado**: Análise individual com histórico e ações sugeridas
- **Sistema de Risco**: Classificação em 3 níveis (baixo, médio, alto) com score
- **Fila de Ações**: Tarefas automáticas priorizadas (N1, N2, N3)

## 🎨 Design System

O projeto utiliza um design system robusto com:
- Cores semânticas (success, warning, destructive)
- Gradientes e sombras customizados
- Transições suaves
- Variantes de componentes shadcn personalizadas

## 🚀 Próximos Passos

### Backend com Lovable Cloud
- Banco de dados PostgreSQL para persistência
- Autenticação de usuários
- Edge Functions para integração com Pacto API
- Cron jobs para cálculo diário de risco

### Integrações
- Pacto API para importação automática de dados
- WhatsApp/SMS/Email para notificações
- Webhooks para sistemas externos

## Project info

**URL**: https://lovable.dev/projects/a61297ec-5099-4773-aef5-4c8b88ad2833

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a61297ec-5099-4773-aef5-4c8b88ad2833) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a61297ec-5099-4773-aef5-4c8b88ad2833) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
