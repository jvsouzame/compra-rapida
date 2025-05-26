
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { CadastroCompraModal } from '@/components/modals/CadastroCompraModal';
import { EditarCompraModal } from '@/components/modals/EditarCompraModal';
import { ConfirmarExclusaoModal } from '@/components/modals/ConfirmarExclusaoModal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Plus, Search, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { compraService } from '@/services/supabaseService';
import type { CompraComCliente } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

export default function ListaCompras() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<CompraComCliente | null>(null);
  const [compras, setCompras] = useState<CompraComCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async () => {
    try {
      setIsLoading(true);
      const comprasData = await compraService.getAll();
      setCompras(comprasData);
    } catch (error: any) {
      console.error('Erro ao carregar compras:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de compras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchCompras = async (term: string) => {
    if (!term.trim()) {
      loadCompras();
      return;
    }

    try {
      const comprasData = await compraService.search(term);
      setCompras(comprasData);
    } catch (error: any) {
      console.error('Erro ao buscar compras:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar compras",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompras(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCompraSalva = (novaCompra: CompraComCliente) => {
    loadCompras();
  };

  const handleEditarCompra = (compra: CompraComCliente) => {
    setSelectedCompra(compra);
    setEditModalOpen(true);
  };

  const handleExcluirCompra = (compra: CompraComCliente) => {
    setSelectedCompra(compra);
    setDeleteModalOpen(true);
  };

  const handleCompraAtualizada = () => {
    loadCompras();
    setEditModalOpen(false);
    setSelectedCompra(null);
  };

  const handleConfirmarExclusao = async () => {
    if (!selectedCompra) return;

    try {
      await compraService.delete(selectedCompra.id);
      toast({
        title: "Compra excluída com sucesso ✅",
        description: "A compra foi excluída com sucesso",
      });
      loadCompras();
    } catch (error: any) {
      console.error('Erro ao excluir compra:', error);
      toast({
        title: "Erro ao excluir compra",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const getFormaPagamentoBadge = (forma: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      dinheiro: { variant: "default", label: "Dinheiro" },
      cartao: { variant: "secondary", label: "Cartão" },
      pix: { variant: "outline", label: "PIX" },
    };
    
    return variants[forma] || { variant: "outline", label: forma };
  };

  if (isLoading) {
    return (
      <PageLayout 
        title="Lista de Compras" 
        subtitle="Carregando..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando compras...</div>
        </div>
      </PageLayout>
    );
  }

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

        {compras.length === 0 ? (
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
            {compras.map((compra) => {
              const formaPagamento = getFormaPagamentoBadge(compra.forma_pagamento);
              
              return (
                <Card key={compra.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{compra.nome_cliente}</h3>
                          <Badge variant={formaPagamento.variant}>
                            {formaPagamento.label}
                          </Badge>
                          <Badge variant="secondary">
                            {formatDate(new Date(compra.data))}
                          </Badge>
                        </div>
                        
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(compra.valor_total)}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarCompra(compra)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExcluirCompra(compra)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {searchTerm && compras.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {compras.length} resultado(s) para "{searchTerm}"
          </div>
        )}
      </div>

      <CadastroCompraModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCompraSalva={handleCompraSalva}
      />

      <EditarCompraModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        compra={selectedCompra}
        onCompraAtualizada={handleCompraAtualizada}
      />

      <ConfirmarExclusaoModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Excluir Compra"
        description={`Tem certeza que deseja excluir esta compra de ${formatCurrency(selectedCompra?.valor_total || 0)}? Esta ação não poderá ser desfeita.`}
        onConfirm={handleConfirmarExclusao}
      />
    </PageLayout>
  );
}
