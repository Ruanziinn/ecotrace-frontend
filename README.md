# EcoTrace — Frontend 🌱♻️

> Painel Web3 do protocolo EcoTrace — rastreabilidade da reciclagem de plástico na Ethereum Sepolia.

A interface conecta-se diretamente a 5 smart contracts via **ethers.js v6** e **MetaMask**.

---

## ✨ Funcionalidades

- Conexão de carteira via MetaMask com detecção automática de rede (força Sepolia)
- Dashboard com saldo $REC, total staked, NFTs mintados e estatísticas globais
- Comprar $REC com ETH diretamente pelo contrato EcoSale
- Cooperativa: mintar fardos de plástico como NFTs (ERC-721) e aposentá-los
- Staking: depositar $REC, acumular recompensas e fazer claim/unstake
- Governança: criar propostas, votar e executar (aprovar/revogar cooperativas)

---

## 🧰 Stack

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Framework principal |
| Vite 5 | Bundler e dev server |
| TailwindCSS | Estilização com tokens semânticos HSL |
| ethers.js v6 | Interação com a blockchain (BrowserProvider, parseEther, formatEther) |
| shadcn/ui + Radix UI | Componentes de interface |
| sonner | Toasts de feedback de transação |

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── BuyRecCard.tsx       # Card de compra de $REC com ETH
│   ├── ConnectGate.tsx      # Tela de conexão / troca de rede
│   ├── Header.tsx           # Topo com endereço, saldo e rede
│   ├── Tabs.tsx             # Navegação entre páginas
│   └── ui/                  # Componentes shadcn
├── contracts/
│   └── config.ts            # Endereços + ABIs dos 5 contratos
├── hooks/
│   ├── useWallet.ts         # Conexão MetaMask + eventos account/chain
│   ├── useContracts.ts      # Instancia contratos com signer
│   └── useTx.ts             # Envia tx, aguarda confirmação, exibe toast
├── pages/
│   ├── DashboardPage.tsx    # Visão geral + Comprar $REC
│   ├── CooperativaPage.tsx  # Mint e aposentadoria de fardos
│   ├── StakingPage.tsx      # Stake / unstake / claim
│   └── GovernancaPage.tsx   # Propostas, votos e execução
└── utils/
    └── format.ts            # Helpers de formatação (wei → string)
```

---

## 🔗 Contratos Integrados (Sepolia)

| Contrato | Função |
|---|---|
| `RecToken` | Token ERC-20 $REC — recompensa e utilidade do protocolo |
| `PlasticNFT` | NFT ERC-721 representando fardos de plástico reciclado |
| `EcoStaking` | Staking de $REC com recompensas proporcionais via Chainlink |
| `EcoGovernance` | Propostas e votação para aprovar/revogar cooperativas |
| `EcoSale` | Venda de $REC por ETH a uma taxa fixa |

> Os endereços e ABIs ficam em `src/contracts/config.ts`.

---

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ (ou [Bun](https://bun.sh/))
- [MetaMask](https://metamask.io/) instalada no navegador
- ETH de teste na Sepolia — [sepoliafaucet.com](https://sepoliafaucet.com/)

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repo>
cd ecotrace-frontend

# Instalar dependências
npm install
# ou: bun install

# Rodar em modo desenvolvimento
npm run dev
```

A aplicação abre em **http://localhost:8080**.

---

## ⚙️ Configurando os Contratos

Edite `src/contracts/config.ts` e substitua os endereços pelos contratos reais deployados na Sepolia:

```ts
export const ADDRESSES = {
  RecToken:      "0x...",
  PlasticNFT:    "0x...",
  EcoStaking:    "0x...",
  EcoGovernance: "0x...",
  EcoSale:       "0x...",
};
```

> Os endereços são gerados ao rodar o script de deploy do repositório de contratos (`ecotrace-blockchain`).

---

## 🔄 Fluxo de Uso

```
1. Conecta MetaMask → troca para Sepolia automaticamente
         │
         ▼
2. Compra $REC com ETH (aba Dashboard → Comprar $REC)
         │
         ▼
3. Vota na DAO para aprovar sua cooperativa (aba Governança)
         │
         ▼
4. Minta o fardo de plástico como NFT (aba Cooperativa)
         │
         ▼
5. Empresa faz stake de $REC como garantia (aba Staking)
         │
         ▼
6. Aposenta o fardo ao usar o plástico na produção
```

---

## 🔗 Repositórios Relacionados

| Repositório | Descrição |
|---|---|
| `ecotrace-blockchain` | Contratos Solidity, scripts de deploy e testes unitários |
| `ecotrace-frontend` | Este repositório — interface Web3 |

---

<div align="center">
  <p>EcoTrace ♻️ — Rastreabilidade de reciclagem de plástico na Ethereum Sepolia</p>
</div>