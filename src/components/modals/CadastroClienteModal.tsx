
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatCPF, formatTelefone } from '@/utils/formatters';
import { clienteService } from '@/services/supabaseService';
import type { SupabaseCliente } from '@/types/supabase';

interface CadastroClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteSalvo: (cliente: SupabaseCliente) => void;
}

export function CadastroClienteModal({ open, onOpenChange, onClienteSalvo }: CadastroClienteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'telefone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!formData.cpf.trim()) {
        toast({
          title: "Erro de validação",
          description: "CPF é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!formData.telefone.trim()) {
        toast({
          title: "Erro de validação",
          description: "Telefone é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Salvar cliente no Supabase
      const novoCliente = await clienteService.create({
        nome: formData.nome.trim(),
        cpf: formData.cpf,
        telefone: formData.telefone,
      });

      toast({
        title: "Cliente salvo com sucesso ✅",
        description: `${formData.nome} foi cadastrado com sucesso`,
      });

      // Chamar callback para atualizar lista
      onClienteSalvo(novoCliente);

      // Limpar formulário e fechar modal
      setFormData({ nome: '', cpf: '', telefone: '' });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro ao salvar cliente",
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
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas do cliente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              type="text"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
            />
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
