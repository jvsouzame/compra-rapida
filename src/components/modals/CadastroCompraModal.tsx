
import { useState } from 'react';
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
import { storage } from '@/utils/storage';
import { formatCurrency, parseCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Compra } from '@/types';

interface CadastroCompraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompraSalva: (compra: Compra) => void;
}

export function CadastroCompraModal({ open, onOpenChange, onCompraSalva }: CadastroCompraModalProps) {
  const [formData, setFormData] = useState({
    data: new Date(),
    valorTotal: '',
    formaPagamento: '',
    clienteId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const clientes = storage.getClientes();

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

      const cliente = clientes.find(c => c.id === formData.clienteId);
      if (!cliente) {
        toast({
          title: "Erro",
          description: "Cliente selecionado não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Salvar compra
      const novaCompra = storage.saveCompra({
        data: formData.data,
        valorTotal: valorNumerico,
        formaPagamento: formData.formaPagamento as any,
        clienteId: formData.clienteId,
        clienteNome: cliente.nome,
      });

      toast({
        title: "Compra registrada com sucesso ✅",
        description: `Venda de ${formatCurrency(valorNumerico)} foi registrada`,
      });

      // Chamar callback para atualizar lista
      onCompraSalva(novaCompra);

      // Limpar formulário e fechar modal
      setFormData({
        data: new Date(),
        valorTotal: '',
        formaPagamento: '',
        clienteId: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao registrar compra",
        description: "Tente novamente em alguns instantes",
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clientes.length === 0 && (
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
              disabled={isLoading || clientes.length === 0}
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
