
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { formatCurrency } from '@/utils/formatters';
import { useEffect, useState } from 'react';
import { compraService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface Stats {
  totalClientes: number;
  totalCompras: number;
  faturamentoTotal: number;
  ticketMedio: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    totalCompras: 0,
    faturamentoTotal: 0,
    ticketMedio: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const statsData = await compraService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout 
        title="Dashboard" 
        subtitle="Carregando estatísticas..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Visão geral do seu negócio"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompras}</div>
            <p className="text-xs text-muted-foreground">
              compras registradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.faturamentoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              em vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</div>
            <p className="text-xs text-muted-foreground">
              por compra
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" size="lg">
              <a href="/clientes">
                <Users className="mr-2 h-4 w-4" />
                Ver Lista de Clientes
              </a>
            </Button>
            <Button asChild className="w-full justify-start" size="lg" variant="outline">
              <a href="/compras">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver Lista de Compras
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
            <CardDescription>Compra Rápida - Sistema de Vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema desenvolvido para facilitar o registro e controle de clientes e vendas. 
              Interface intuitiva e eficiente para pequenos e médios estabelecimentos.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="/clientes">Ver Clientes</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/compras">Ver Compras</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
