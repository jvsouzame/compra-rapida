
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseCliente, SupabaseCompra, CompraComCliente } from '@/types/supabase';

export const clienteService = {
  async getAll(): Promise<SupabaseCliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data || [];
  },

  async create(cliente: Omit<SupabaseCliente, 'id'>): Promise<SupabaseCliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async search(term: string): Promise<SupabaseCliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${term}%,cpf.ilike.%${term}%,telefone.ilike.%${term}%`)
      .order('nome');
    
    if (error) throw error;
    return data || [];
  }
};

export const compraService = {
  async getAll(): Promise<CompraComCliente[]> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        id,
        data,
        valor_total,
        forma_pagamento,
        cliente_id,
        clientes!inner(nome)
      `)
      .order('data', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      data: item.data,
      valor_total: item.valor_total,
      forma_pagamento: item.forma_pagamento,
      cliente_id: item.cliente_id,
      nome_cliente: (item.clientes as any).nome
    }));
  },

  async create(compra: Omit<SupabaseCompra, 'id'>): Promise<SupabaseCompra> {
    const { data, error } = await supabase
      .from('compras')
      .insert(compra)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async search(term: string): Promise<CompraComCliente[]> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        id,
        data,
        valor_total,
        forma_pagamento,
        cliente_id,
        clientes!inner(nome)
      `)
      .or(`forma_pagamento.ilike.%${term}%,clientes.nome.ilike.%${term}%`)
      .order('data', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      data: item.data,
      valor_total: item.valor_total,
      forma_pagamento: item.forma_pagamento,
      cliente_id: item.cliente_id,
      nome_cliente: (item.clientes as any).nome
    }));
  },

  async getStats() {
    const [clientesResult, comprasResult, faturamentoResult] = await Promise.all([
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
      supabase.from('compras').select('id', { count: 'exact', head: true }),
      supabase.from('compras').select('valor_total')
    ]);

    if (clientesResult.error) throw clientesResult.error;
    if (comprasResult.error) throw comprasResult.error;
    if (faturamentoResult.error) throw faturamentoResult.error;

    const totalClientes = clientesResult.count || 0;
    const totalCompras = comprasResult.count || 0;
    const compras = faturamentoResult.data || [];
    const faturamentoTotal = compras.reduce((acc, compra) => acc + compra.valor_total, 0);
    const ticketMedio = totalCompras > 0 ? faturamentoTotal / totalCompras : 0;

    return {
      totalClientes,
      totalCompras,
      faturamentoTotal,
      ticketMedio
    };
  }
};
