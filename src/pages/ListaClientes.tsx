
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { CadastroClienteModal } from '@/components/modals/CadastroClienteModal';
import { storage } from '@/utils/storage';
import { formatDate } from '@/utils/formatters';
import { UserPlus, Search, Users } from 'lucide-react';
import { Cliente } from '@/types';

export default function ListaClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>(storage.getClientes());

  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes;
    
    const term = searchTerm.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.cpf.includes(term) ||
      cliente.telefone.includes(term)
    );
  }, [clientes, searchTerm]);

  const handleClienteSalvo = (novoCliente: Cliente) => {
    setClientes(storage.getClientes());
  };

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

        {filteredClientes.length === 0 ? (
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
            {filteredClientes.map((cliente) => (
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
                        <div className="md:col-span-2">
                          <span className="font-medium">Cadastrado em:</span> {formatDate(cliente.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchTerm && filteredClientes.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredClientes.length} de {clientes.length} cliente(s)
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
