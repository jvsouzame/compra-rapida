# 🛒 Compra Rápida – Sistema de Cadastro de Clientes e Compras

Este projeto foi desenvolvido como parte da disciplina **Hands-On Work VI** no curso de **Análise e Desenvolvimento de Sistemas** da **Universidade do Vale do Itajaí (Univali)**, integrando o projeto de extensão **Lite is Cool**.

O sistema foi criado com o objetivo de praticar a programação orientada a objetos, modelagem de dados relacionais e integração com banco de dados moderno. Ele simula a operação de pequenos comércios, permitindo o controle de clientes e o registro de compras.

---

## 📘 Tecnologias Utilizadas

- **TypeScript + React + Vite** – Para construção do frontend moderno e escalável
- **Tailwind CSS + shadcn/ui** – Para estilização responsiva e componentes reutilizáveis
- **Supabase (PostgreSQL)** – Banco de dados com autenticação e persistência em tempo real
- **SQL + PlantUML** – Para modelagem de entidades e consultas

---

## 📌 Justificativa da Escolha por TypeScript

O projeto foi construído com **TypeScript** para aplicar conceitos de orientação a objetos de forma mais clara e segura. A escolha trouxe os seguintes benefícios:

1. **Aplicação direta de orientação a objetos** – uso de classes, interfaces e encapsulamento.
2. **Código mais robusto e legível**, com tipagem estática e validação em tempo de desenvolvimento.
3. **Prática com ferramentas modernas do mercado**, conectando teoria e prática de forma atualizada.

---

## 🧩 Funcionalidades Implementadas

### 📊 Dashboard
- Total de Clientes
- Total de Compras
- Faturamento Total
- Ticket Médio

### 👥 Clientes
- Cadastro de novos clientes
- Edição e exclusão de clientes
- Busca por nome, CPF ou telefone
- Visualização em tabela

### 🛍Compras
- Registro de nova compra vinculada a um cliente
- Edição e exclusão de compras
- Listagem com nome do cliente associado
- Filtro por forma de pagamento e valor

---

## 🧠 Modelagem

- **Entidade Cliente:** id, nome, cpf, telefone
- **Entidade Compra:** id, data, valor_total, forma_pagamento, cliente_id (FK)

Relacionamento: **1 Cliente → N Compras**

Modelagem realizada com base em diagramas de classe (UML) e modelo entidade-relacionamento (MER).

---

## 🧪 Teste Local

Para executar o projeto localmente:

```bash
git clone <seu repositório>
cd <seu projeto>
npm install
npm run dev
