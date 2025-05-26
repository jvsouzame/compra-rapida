
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, parseCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { clienteService, compraService } from '@/services/supabaseService';
import type { SupabaseCliente, CompraComCliente } from '@/types/supabase';

interface CadastroCompraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompraSalva: (compra: CompraComCliente) => void;
}

export function CadastroCompraModal({ open, onOpenChange, onCompraSalva }: CadastroCompraModalProps) {
  const [formData, setFormData] = useState({
    data: new Date(),
    valorTotal: '',
    formaPagamento: '',
    clienteId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<SupabaseCliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  useEffect(() => {
    if (open) {
      loadClientes();
    }
  }, [open]);

  const loadClientes = async () => {
    setLoadingClientes(true);
    try {
      const clientesData = await clienteService.getAll();
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de clientes",
        variant: "destructive",
      });
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleCurrencyChange = (value: string) => {
    // Remove tudo exceto números e vírgula
    const numbers = value.replace(/[^\d,]/g, '');
    
    // Converte para formato de moeda
    const numericValue = parseCurrency(numbers);
    const formatted = formatCurrency(numericValue);
    
    setFormData(prev => ({ ...prev, valorTotal: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações
      if (!formData.data) {
        toast({
          title: "Erro de validação",
          description: "Data é obrigatória",
          variant: "destructive",
        });
        return;
      }

      const valorNumerico = parseCurrency(formData.valorTotal);
      if (valorNumerico <= 0) {
        toast({
          title: "Erro de validação",
          description: "Valor deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      if (!formData.formaPagamento) {
        toast({
          title: "Erro de validação",
          description: "Forma de pagamento é obrigatória",
          variant: "destructive",
        });
        return;
      }

      if (!formData.clienteId) {
        toast({
          title: "Erro de validação",
          description: "Cliente é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Verificar se cliente existe
      const cliente = clientes.find(c => c.id === formData.clienteId);
      if (!cliente) {
        toast({
          title: "Erro",
          description: "Cliente selecionado não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Salvar compra no Supabase
      await compraService.create({
        data: format(formData.data, 'yyyy-MM-dd'),
        valor_total: valorNumerico,
        forma_pagamento: formData.formaPagamento,
        cliente_id: formData.clienteId,
      });

      toast({
        title: "Compra registrada com sucesso ✅",
        description: `Venda de ${formatCurrency(valorNumerico)} foi registrada`,
      });

      // Criar objeto com nome do cliente para callback
      const compraComCliente: CompraComCliente = {
        id: '', // Será preenchido pela query
        data: format(formData.data, 'yyyy-MM-dd'),
        valor_total: valorNumerico,
        forma_pagamento: formData.formaPagamento,
        cliente_id: formData.clienteId,
        nome_cliente: cliente.nome,
      };

      // Chamar callback para atualizar lista
      onCompraSalva(compraComCliente);

      // Limpar formulário e fechar modal
      setFormData({
        data: new Date(),
        valorTotal: '',
        formaPagamento: '',
        clienteId: '',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao registrar compra:', error);
      toast({
        title: "Erro ao registrar compra",
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
          <DialogTitle>Nova Compra</DialogTitle>
          <DialogDescription>
            Preencha as informações da venda realizada
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Data da Compra *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data ? (
                    format(formData.data, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, data: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total *</Label>
            <Input
              id="valor"
              type="text"
              value={formData.valorTotal}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento *</Label>
            <Select 
              value={formData.formaPagamento} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, formaPagamento: value }))}
            >
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

          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select 
              value={formData.clienteId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
              disabled={loadingClientes}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClientes ? "Carregando..." : "Selecione o cliente"} />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clientes.length === 0 && !loadingClientes && (
              <p className="text-sm text-muted-foreground">
                Nenhum cliente cadastrado. Cadastre um cliente primeiro.
              </p>
            )}
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
              disabled={isLoading || clientes.length === 0 || loadingClientes}
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
