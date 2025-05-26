
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { CadastroClienteModal } from '@/components/modals/CadastroClienteModal';
import { formatDate } from '@/utils/formatters';
import { UserPlus, Search, Users } from 'lucide-react';
import { clienteService } from '@/services/supabaseService';
import type { SupabaseCliente } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

export default function ListaClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clientes, setClientes] = useState<SupabaseCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const clientesData = await clienteService.getAll();
      setClientes(clientesData);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchClientes = async (term: string) => {
    if (!term.trim()) {
      loadClientes();
      return;
    }

    try {
      const clientesData = await clienteService.search(term);
      setClientes(clientesData);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar clientes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchClientes(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleClienteSalvo = (novoCliente: SupabaseCliente) => {
    setClientes(prev => [novoCliente, ...prev]);
  };

  if (isLoading) {
    return (
      <PageLayout 
        title="Lista de Clientes" 
        subtitle="Carregando..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando clientes...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Lista de Clientes" 
      subtitle={`${clientes.length} cliente(s) cadastrado(s)`}
      action={
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Cliente
            </CardTitle>
            <CardDescription>
              Pesquise por nome, CPF ou telefone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {clientes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos da busca'
                  : 'Comece cadastrando seu primeiro cliente'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {clientes.map((cliente) => (
              <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{cliente.nome}</h3>
                        <Badge variant="secondary">Cliente</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">CPF:</span> {cliente.cpf}
                        </div>
                        <div>
                          <span className="font-medium">Telefone:</span> {cliente.telefone}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchTerm && clientes.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {clientes.length} resultado(s) para "{searchTerm}"
          </div>
        )}
      </div>

      <CadastroClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClienteSalvo={handleClienteSalvo}
      />
    </PageLayout>
  );
}
