
export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  createdAt: Date;
}

export interface Compra {
  id: string;
  data: Date;
  valorTotal: number;
  formaPagamento: 'dinheiro' | 'cartao' | 'pix';
  clienteId: string;
  clienteNome: string;
  createdAt: Date;
}

export type FormaPagamento = 'dinheiro' | 'cartao' | 'pix';
