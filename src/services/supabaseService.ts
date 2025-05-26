
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

  async update(id: string, cliente: Partial<Omit<SupabaseCliente, 'id'>>): Promise<SupabaseCliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    // Primeiro verifica se há compras associadas
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id')
      .eq('cliente_id', id)
      .limit(1);
    
    if (comprasError) throw comprasError;
    
    if (compras && compras.length > 0) {
      throw new Error('Não é possível excluir este cliente pois existem compras associadas a ele.');
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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

  async update(id: string, compra: Partial<Omit<SupabaseCompra, 'id'>>): Promise<SupabaseCompra> {
    const { data, error } = await supabase
      .from('compras')
      .update(compra)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
