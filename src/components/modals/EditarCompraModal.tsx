
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { compraService, clienteService } from '@/services/supabaseService';
import type { SupabaseCliente, CompraComCliente } from '@/types/supabase';

interface EditarCompraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compra: CompraComCliente | null;
  onCompraAtualizada: () => void;
}

export function EditarCompraModal({ open, onOpenChange, compra, onCompraAtualizada }: EditarCompraModalProps) {
  const [formData, setFormData] = useState({
    data: '',
    valor_total: '',
    forma_pagamento: '',
    cliente_id: '',
  });
  const [clientes, setClientes] = useState<SupabaseCliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadClientes();
    }
  }, [open]);

  useEffect(() => {
    if (compra) {
      setFormData({
        data: compra.data,
        valor_total: compra.valor_total.toString(),
        forma_pagamento: compra.forma_pagamento,
        cliente_id: compra.cliente_id,
      });
    }
  }, [compra]);

  const loadClientes = async () => {
    try {
      const clientesData = await clienteService.getAll();
      setClientes(clientesData);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de clientes",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compra) return;
    
    setIsLoading(true);

    try {
      if (!formData.data) {
        toast({
          title: "Erro de validação",
          description: "Data é obrigatória",
          variant: "destructive",
        });
        return;
      }

      if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
        toast({
          title: "Erro de validação",
          description: "Valor total deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      if (!formData.forma_pagamento) {
        toast({
          title: "Erro de validação",
          description: "Forma de pagamento é obrigatória",
          variant: "destructive",
        });
        return;
      }

      if (!formData.cliente_id) {
        toast({
          title: "Erro de validação",
          description: "Cliente é obrigatório",
          variant: "destructive",
        });
        return;
      }

      await compraService.update(compra.id, {
        data: formData.data,
        valor_total: parseFloat(formData.valor_total),
        forma_pagamento: formData.forma_pagamento,
        cliente_id: formData.cliente_id,
      });

      toast({
        title: "Compra atualizada com sucesso ✅",
        description: "A compra foi atualizada com sucesso",
      });

      onCompraAtualizada();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar compra:', error);
      toast({
        title: "Erro ao atualizar compra",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Compra</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias na compra
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data da Compra *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_total">Valor Total *</Label>
            <Input
              id="valor_total"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_total}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_total: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select value={formData.forma_pagamento} onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
