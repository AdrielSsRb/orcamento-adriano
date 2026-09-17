# 🚗 Orçamento Digital - Adriano Centro Automotivo

Uma aplicação web simples e intuitiva para gerar orçamentos de serviços automotivos em PDF, desenvolvida com React + Vite.

---

## 📋 Sumário

- [Proposta](#proposta)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Funciona](#como-funciona)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Tecnologias](#tecnologias)

---

## 🎯 Proposta

A aplicação **Orçamento Digital** foi desenvolvida para otimizar o processo de geração de orçamentos no **Centro Automotivo Adriano**.

**Objetivo:** Criar uma plataforma onde:
- ✅ Clientes e veículos sejam registrados rapidamente
- ✅ Serviços sejam selecionados de um checklist pré-definido
- ✅ Valores sejam calculados automaticamente
- ✅ Orçamentos sejam gerados em PDF profissional com a marca da oficina
- ✅ **Tudo rodando localmente** sem necessidade de servidor ou banco de dados

---

## ✨ Funcionalidades

### 📱 **Tela Web (Preenchimento)**

1. **Formulário de Cliente e Veículo**
   - Nome, telefone, endereço do cliente
   - Modelo, ano, placa, KM do veículo
   - Data do orçamento, forma de pagamento, validade

2. **Checklist Inteligente**
   - 46 serviços divididos em 4 categorias
   - Categorias expansíveis/retráteis
   - Preços pré-definidos para cada serviço
   - Marcar um serviço adiciona automaticamente na tabela

3. **Tabela de Edição**
   - Editar quantidade, tipo (mão de obra/peça), valor
   - Adicionar linhas manualmente
   - Remover linhas com um clique
   - Subtotal calculado automaticamente

4. **Desconto**
   - Campo para aplicar desconto em reais

5. **Resumo do Orçamento**
   - Breakdown: Mão de Obra, Peças, Desconto
   - Total destacado em grande tamanho
   - Contagem de itens por tipo

6. **Botões de Ação**
   - **Limpar:** Reseta todos os dados
   - **Gerar PDF/Imprimir:** Abre diálogo de impressão

### 📄 **PDF Gerado**

- Logo da oficina no topo
- Cabeçalho preto e dourado com identidade visual
- Tabela de serviços/peças com valores
- Observações, forma de pagamento, validade
- Resumo com totais
- Rodapé com slogan

---

## 📁 Estrutura do Projeto

```
orcamento_adriano/
│
├── src/
│   ├── App.jsx                          # 🧠 Lógica principal (maior arquivo)
│   │                                    # - Estado (cliente, rows, desconto, etc)
│   │                                    # - Funções (toggleItem, updateRow, etc)
│   │                                    # - Renderiza: Formulário + OrcamentoPDF oculto
│   │
│   ├── components/
│   │   └── OrcamentoPDF.jsx             # 📄 Apresentação visual do PDF
│   │                                    # - Recebe dados via props
│   │                                    # - Renderiza: header, tabela, resumo
│   │                                    # - Estilos e layout do PDF
│   │
│   ├── data/
│   │   └── categories.js                # 📊 Dados estáticos
│   │                                    # - Array com 46 serviços
│   │                                    # - Divididos em 4 categorias
│   │                                    # - Preços de mão de obra
│   │
│   ├── assets/
│   │   └── logo.jpeg                    # 🖼️ Logo da oficina
│   │                                    # - Usada no cabeçalho do PDF
│   │                                    # - Dimensões: 200x120px
│   │
│   ├── main.jsx                         # 🔌 Entrada da aplicação (não mexer)
│   └── index.css                        # 🎨 Estilos globais (não mexer)
│
├── public/                              # Arquivos estáticos
├── index.html                           # HTML principal
├── package.json                         # Dependências do projeto
├── vite.config.js                       # Configuração do Vite
└── README.md                            # Este arquivo

```

---

## 🔄 Como Funciona

### **Fluxo de Dados (Passo a Passo)**

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣ USUÁRIO PREENCHE DADOS (Tela Web)               │
├─────────────────────────────────────────────────────┤
│ • Nome do cliente, veículo, data, etc               │
│ • State: cliente = { nome, telefone, ... }          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2️⃣ USUÁRIO MARCA ITENS NO CHECKLIST               │
├─────────────────────────────────────────────────────┤
│ • Clica em "Troca de óleo" na categoria "Mecânica"  │
│ • Função toggleItem() é chamada                     │
│ • State: checked = { "mecanica::Troca de óleo": true}│
│ • State: rows += nova linha (qtd, desc, valor)      │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3️⃣ USUÁRIO EDITA LINHAS (Opcional)                 │
├─────────────────────────────────────────────────────┤
│ • Muda quantidade, tipo, valor                      │
│ • Função updateRow() atualiza state: rows           │
│ • Subtotal recalcula automaticamente                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4️⃣ CÁLCULO AUTOMÁTICO DE TOTAIS                    │
├─────────────────────────────────────────────────────┤
│ • useMemo recalcula: maoDeObra + pecas - desconto   │
│ • Resumo na tela atualiza em tempo real             │
│ • State: totals = { maoDeObra, pecas, desconto, ...}│
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5️⃣ PASSAR DADOS PARA PDF                           │
├─────────────────────────────────────────────────────┤
│ • App.jsx passa props para OrcamentoPDF.jsx         │
│ • Props: cliente, rows, totals, fmt, etc            │
│ • OrcamentoPDF renderiza HTML estruturado           │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6️⃣ USUÁRIO CLICA "GERAR PDF"                      │
├─────────────────────────────────────────────────────┤
│ • window.print() abre diálogo de impressão          │
│ • CSS @media print mostra APENAS o PDF              │
│ • Usuário escolhe "Salvar como PDF"                 │
│ • PDF é gerado e baixado                           │
└─────────────────────────────────────────────────────┘
```

### **Estado da Aplicação (React State)**

```javascript
// DADOS DO CLIENTE
cliente = {
  nome: "João Silva",
  telefone: "(11) 9999-8888",
  endereco: "Rua X, 123",
  veiculo: "Honda Civic",
  ano: "2020",
  placa: "ABC1234",
  km: "50000",
  data: "2025-01-15"
}

// CHECKLIST (quais estão marcados)
checked = {
  "mecanica::Troca de óleo": true,
  "freios::Troca de pneu": true,
  "injecao::Embreagem": false  // não marcado
}

// LINHAS DA TABELA
rows = [
  {
    id: 1,
    key: "mecanica::Troca de óleo",
    qtd: 1,
    desc: "Troca de óleo e filtros",
    tipo: "mao_de_obra",
    valor: 60
  },
  {
    id: 2,
    key: "freios::Troca de pneu",
    qtd: 4,
    desc: "Troca de pneu",
    tipo: "peca",
    valor: 400
  }
]

// TOTAIS (calculado automaticamente)
totals = {
  maoDeObra: 60,      // Soma de todas as linhas com tipo === "mao_de_obra"
  pecas: 400,         // Soma de todas as linhas com tipo === "peca"
  desconto: 50,       // Valor inserido pelo usuário
  total: 410          // maoDeObra + pecas - desconto
}
```

---

## 🛠️ Instalação

### **Pré-requisitos**
- Node.js 16+ instalado ([Baixar aqui](https://nodejs.org))
- npm (vem com Node.js)

### **Passos**

1. **Abrir terminal e crie o projeto**
```bash
git clone https://github.com/AdrielSsRb/orcamento-adriano.git
```

2. **Entrar na pasta do projeto**
```bash
cd orcamento_adriano
```

3. **Instalar dependências**
```bash
npm install
npm install lucide-react
```

4. **Rodar o projeto**
```bash
npm run dev
```

5. **Abrir no navegador**
```
http://localhost:5173
```

---

## 📖 Como Usar

### **1. Preencher Dados do Cliente**
- [ ] Nome completo
- [ ] Telefone
- [ ] Endereço
- [ ] Veículo/Modelo
- [ ] Ano
- [ ] Placa
- [ ] KM
- [ ] Data do orçamento
- [ ] Forma de pagamento (opcional)
- [ ] Validade do orçamento (opcional)
- [ ] Observações (opcional)

### **2. Marcar Serviços no Checklist**
- [ ] Clique em uma categoria para expandir (ex: "Mecânica Geral")
- [ ] Clique no serviço desejado (ex: "Troca de óleo")
- [ ] O item aparece automaticamente na tabela abaixo

### **3. Editar Valores (se necessário)**
- [ ] Na tabela "Editar Linhas", você pode:
  - Mudar quantidade
  - Trocar tipo (Mão de Obra ↔ Peça)
  - Ajustar valor unitário
  - Remover linhas (clique no 🗑️)

### **4. Adicionar Serviço Manual (opcional)**
- [ ] Se o serviço não está no checklist, clique "+ Adicionar linha manual"
- [ ] Preencha os dados da linha

### **5. Aplicar Desconto (opcional)**
- [ ] No campo "Desconto", insira o valor em R$
- [ ] O total recalcula automaticamente

### **6. Revisar Resumo**
- [ ] Verifique se os totais estão corretos
- [ ] Confira a contagem de itens (Qtd, MO, Peças)

### **7. Gerar PDF**
- [ ] Clique em "Gerar PDF / Imprimir"
- [ ] No diálogo de impressão, escolha "Salvar como PDF"
- [ ] Escolha o local para salvar
- [ ] Abra o PDF gerado

### **8. Limpar (nova entrada)**
- [ ] Clique em "Limpar" para começar um novo orçamento
- [ ] Confirme a mensagem de aviso

---

## 🏗️ Arquitetura

### **Separação de Responsabilidades**

| Arquivo | Responsabilidade | Tipo |
|---------|-----------------|------|
| **App.jsx** | Lógica, estado, formulário | Inteligente |
| **OrcamentoPDF.jsx** | Apresentação visual, PDF | Burro |
| **categories.js** | Dados estáticos | Dados |
| **assets/logo.jpeg** | Logo da oficina | Recurso |

### **Fluxo de Componentes**

```
┌─────────────────────────────────┐
│         App.jsx                 │
│  (Componente Principal)          │
│                                 │
│  State:                         │
│  - cliente                      │
│  - rows (linhas)                │
│  - checked (checklist)          │
│  - totals (cálculos)            │
│                                 │
│  Renderiza:                     │
│  ├─ Formulário (tela web)       │
│  ├─ Checklist (tela web)        │
│  ├─ Tabela de edição (tela web) │
│  ├─ Resumo (tela web)           │
│  ├─ Botões (tela web)           │
│  └─ OrcamentoPDF (oculto)       │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│   OrcamentoPDF.jsx              │
│  (Componente Apresentação)      │
│                                 │
│  Props (recebidas de App.jsx):  │
│  - cliente                      │
│  - rows                         │
│  - totals                       │
│  - oficina                      │
│  - fmt (função de formatação)   │
│                                 │
│  Renderiza:                     │
│  ├─ Logo                        │
│  ├─ Header (preto/dourado)      │
│  ├─ Dados cliente               │
│  ├─ Tabela de serviços          │
│  ├─ Observações                 │
│  ├─ Resumo                      │
│  └─ Footer                      │
└─────────────────────────────────┘
```

### **Hooks Utilizados**

| Hook | Uso |
|------|-----|
| **useState** | Gerenciar cliente, rows, checked, desconto, etc |
| **useCallback** | Memoizar toggleItem() para evitar duplicações |
| **useMemo** | Recalcular totals apenas quando rows/desconto mudam |
| **useRef** | Referenciar elemento PDF para impressão |

---

## 💾 Banco de Dados

### **Tipo: Nenhum** ✅

Esta aplicação **NÃO usa banco de dados**. Todos os dados ficam em memória (State do React).

**Por quê?**
- ✅ Não há necessidade de histórico permanente
- ✅ Cada orçamento é gerado e exportado como PDF
- ✅ Mantém a aplicação simples e rápida
- ✅ Não requer servidor
- ✅ Funciona completamente offline

### **Fluxo de Dados**

```
Usuário Preenche
        ↓
State do React (na memória)
        ↓
Renderiza na tela
        ↓
Usuário clica "Gerar PDF"
        ↓
PDF é gerado e baixado
        ↓
Usuário clica "Limpar" (State é resetado)
        ↓
Novo orçamento começa
```

### **Persistência de Dados (Opcional - Futuro)**

Se no futuro quiser **salvar orçamentos**, você pode:

1. **localStorage** (salva no navegador)
   ```javascript
   localStorage.setItem('orcamento_1', JSON.stringify(state))
   ```

2. **IndexedDB** (banco de dados local)
   - Mais robusto que localStorage
   - Suporta dados maiores

3. **Firebase/Supabase** (nuvem)
   - Se quiser sincronizar entre dispositivos
   - Requer servidor

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **React** | 18+ | Framework UI |
| **Vite** | 5+ | Bundler (rápido) |
| **Lucide React** | Latest | Ícones |
| **CSS-in-JS** | - | Estilos inline |
| **JavaScript** | ES2022+ | Linguagem |

### **Browser Suportados**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🎨 Identidade Visual

### **Cores**
- **Preto (INK):** `#111111` - Texto e fundo principal
- **Dourado (GOLD):** `#D6A821` - Destaque e títulos
- **Dourado Escuro:** `#B8890F` - Hover e interações
- **Cinza:** `#F3F3F1` - Fundo da página

### **Fontes**
- **Família:** Inter, system-ui, sans-serif
- **Tamanhos:**
  - H1/Títulos: 14-28px, fontWeight 800-900
  - Corpo: 13-14px, fontWeight 400-600
  - Labels: 11-12px, color #888

### **Espaçamento**
- Container max-width: 980px
- Padding padrão: 24px
- Gap entre elementos: 12-32px

---

## 🚀 Próximas Funcionalidades (Ideias)

- [ ] **Salvar orçamentos** em localStorage
- [ ] **Histórico de orçamentos** (últimas 10)
- [ ] **Buscar por placa** (integração com API de veículos)
- [ ] **Enviar PDF por WhatsApp** (API WhatsApp Business)
- [ ] **Editar categorias** (adicionar/remover serviços)
- [ ] **Presets de orçamentos** (modelos salvos)
- [ ] **Autenticação** (se tiver múltiplos usuários)
- [ ] **Tema escuro** (dark mode)
- [ ] **Mobile responsivo** (otimizar para celular)

---

## 🐛 Troubleshooting

### **Erro: "Cannot find module 'lucide-react'"**
```bash
npm install lucide-react
```

### **Erro: "Cannot find ../assets/logo.jpeg"**
- Certifique-se que criou `src/assets/`
- Verifique se a imagem se chama exatamente `logo.jpeg`
- Tente com outra imagem se necessário

### **PDF não aparece na impressão**
- Verifique se o CSS `@media print` está correto
- Tente com Ctrl+P (em vez do botão)
- Teste em outro navegador

### **Checklist não atualiza**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Feche e reabra o navegador
- Rode `npm run dev` novamente

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Confira a estrutura de pastas
3. Certifique-se que instalou todas as dependências
4. Teste em outro navegador

---

## 📄 Licença

Esta aplicação foi desenvolvida para **Centro Automotivo Adriano**.

---

**Desenvolvido com ❤️ para otimizar o processo de orçamentos.**

Última atualização: setembro de 2026

Criado por: **Adriel Ribeiro**
