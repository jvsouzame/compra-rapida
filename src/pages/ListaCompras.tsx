
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { CadastroCompraModal } from '@/components/modals/CadastroCompraModal';
import { storage } from '@/utils/storage';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { Compra } from '@/types';

export default function ListaCompras() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [compras, setCompras] = useState<Compra[]>(
    storage.getCompras().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  const filteredCompras = useMemo(() => {
    if (!searchTerm) return compras;
    
    const term = searchTerm.toLowerCase();
    return compras.filter(compra => 
      compra.clienteNome.toLowerCase().includes(term) ||
      compra.formaPagamento.toLowerCase().includes(term) ||
      formatCurrency(compra.valorTotal).toLowerCase().includes(term)
    );
  }, [compras, searchTerm]);

  const handleCompraSalva = (novaCompra: Compra) => {
    setCompras(storage.getCompras().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const getFormaPagamentoBadge = (forma: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      dinheiro: { variant: "default", label: "Dinheiro" },
      cartao: { variant: "secondary", label: "Cartão" },
      pix: { variant: "outline", label: "PIX" },
    };
    
    return variants[forma] || { variant: "outline", label: forma };
  };

  return (
    <PageLayout 
      title="Lista de Compras" 
      subtitle={`${compras.length} compra(s) registrada(s)`}
      action={
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Compra
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Compra
            </CardTitle>
            <CardDescription>
              Pesquise por cliente, valor ou forma de pagamento
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

        {filteredCompras.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhuma compra encontrada' : 'Nenhuma compra registrada'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos da busca'
                  : 'Comece registrando sua primeira venda'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Primeira Compra
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCompras.map((compra) => {
              const formaPagamento = getFormaPagamentoBadge(compra.formaPagamento);
              
              return (
                <Card key={compra.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{compra.clienteNome}</h3>
                          <Badge variant={formaPagamento.variant}>
                            {formaPagamento.label}
                          </Badge>
                          <Badge variant="secondary">
                            {formatDate(compra.data)}
                          </Badge>
                        </div>
                        
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(compra.valorTotal)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Registrado em:</span> {formatDate(compra.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {searchTerm && filteredCompras.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredCompras.length} de {compras.length} compra(s)
          </div>
        )}
      </div>

      <CadastroCompraModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCompraSalva={handleCompraSalva}
      />
    </PageLayout>
  );
}
