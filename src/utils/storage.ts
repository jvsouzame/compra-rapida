
import { Cliente, Compra } from '../types';

const CLIENTES_KEY = 'compra-rapida-clientes';
const COMPRAS_KEY = 'compra-rapida-compras';

export const storage = {
  // Clientes
  getClientes: (): Cliente[] => {
    const data = localStorage.getItem(CLIENTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>): Cliente => {
    const clientes = storage.getClientes();
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    clientes.push(novoCliente);
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
    return novoCliente;
  },

  // Compras
  getCompras: (): Compra[] => {
    const data = localStorage.getItem(COMPRAS_KEY);
    if (!data) return [];
    
    const compras = JSON.parse(data);
    return compras.map((compra: any) => ({
      ...compra,
      data: new Date(compra.data),
      createdAt: new Date(compra.createdAt),
    }));
  },

  saveCompra: (compra: Omit<Compra, 'id' | 'createdAt'>): Compra => {
    const compras = storage.getCompras();
    const novaCompra: Compra = {
      ...compra,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    compras.push(novaCompra);
    localStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
    return novaCompra;
  },
};
