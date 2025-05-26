
export interface SupabaseCliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
}

export interface SupabaseCompra {
  id: string;
  data: string;
  valor_total: number;
  forma_pagamento: string;
  cliente_id: string;
}

export interface CompraComCliente {
  id: string;
  data: string;
  valor_total: number;
  forma_pagamento: string;
  cliente_id: string;
  nome_cliente: string;
}
