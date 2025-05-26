
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { storage } from '@/utils/storage';
import { formatCPF, formatTelefone } from '@/utils/formatters';
import { Users } from 'lucide-react';

export default function CadastroCliente() {
  const navigate = useNavigate();
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

      // Verificar se CPF já existe
      const clientes = storage.getClientes();
      const cpfNumeros = formData.cpf.replace(/\D/g, '');
      const clienteExistente = clientes.find(cliente => 
        cliente.cpf.replace(/\D/g, '') === cpfNumeros
      );

      if (clienteExistente) {
        toast({
          title: "Cliente já cadastrado",
          description: "Já existe um cliente com este CPF",
          variant: "destructive",
        });
        return;
      }

      // Salvar cliente
      storage.saveCliente({
        nome: formData.nome.trim(),
        cpf: formData.cpf,
        telefone: formData.telefone,
      });

      toast({
        title: "Cliente salvo com sucesso ✅",
        description: `${formData.nome} foi cadastrado com sucesso`,
      });

      // Limpar formulário
      setFormData({ nome: '', cpf: '', telefone: '' });
    } catch (error) {
      toast({
        title: "Erro ao salvar cliente",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout 
      title="Cadastro de Cliente" 
      subtitle="Adicione um novo cliente ao sistema"
      action={
        <Button variant="outline" onClick={() => navigate('/clientes')}>
          <Users className="mr-2 h-4 w-4" />
          Ver Clientes
        </Button>
      }
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
            <CardDescription>
              Preencha as informações básicas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                  className="text-base"
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
                  className="text-base"
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
                  className="text-base"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setFormData({ nome: '', cpf: '', telefone: '' })}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
