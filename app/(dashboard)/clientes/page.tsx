'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@headlessui/react'
import { Edit3, Search, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Cliente {
  id: string;
  nome: string;
  endereco?: string | null;
  data_contrato?: string | null;
}

export const dynamic = 'force-dynamic'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editData, setEditData] = useState<Partial<Cliente> | null>(null)
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  useEffect(() => {
    load()
  }, [page])

  const verificarTabela = async () => {
    toast.loading('Verificando tabela de clientes...');
    try {
      const res = await fetch('/api/clientes/verificar', { method: 'POST' });
      const json = await res.json();
      toast.dismiss();
      if (json.success) {
        toast.success(json.message || 'Tabela de clientes verificada com sucesso!');
        load();
      } else {
        toast.error(json.error || 'Falha ao verificar/criar tabela.');
      }
    } catch (e) {
      toast.dismiss();
      toast.error('Erro de conexão ao verificar tabela.');
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ pagina: String(page), limite: String(limit) })
      if (q.trim()) params.set('q', q.trim())
      const res = await fetch(`/api/clientes?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setClientes(json.data || [])
        setTotal(json.total || 0)
      } else {
        const errorMsg = json.error || 'Falha ao carregar clientes'
        toast.error(errorMsg)
        if (typeof errorMsg === 'string' && errorMsg.includes('column') && errorMsg.includes('does not exist')) {
            toast.error("Detectamos uma mudança na estrutura do banco. Tente usar o botão 'Verificar Tabela' para corrigir.", { duration: 6000 });
        }
      }
    } catch (e) {
      toast.error('Erro de conexão ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  const abrirEdicao = (cliente: Cliente) => {
    // Formata a data para YYYY-MM-DD se ela existir
    const dataFormatada = cliente.data_contrato ? new Date(cliente.data_contrato).toISOString().split('T')[0] : '';
    setEditData({...cliente, data_contrato: dataFormatada});
    setShowEdit(true);
  }

  const fecharModalEdicao = () => {
    setShowEdit(false);
    setEditData(null);
  };

  const handleEditDataChange = (field: keyof Cliente, value: string) => {
    if (editData) {
      setEditData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const salvarEdicao = async () => {
    if (!editData?.id || !editData.nome) {
        toast.error('O nome é obrigatório para editar.');
        return;
    };
    try {
      const url = `/api/clientes/${editData.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editData.nome,
          endereco: editData.endereco,
          data_contrato: editData.data_contrato || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Falha ao salvar edição')
      } else {
        toast.success('Cliente atualizado com sucesso!')
        fecharModalEdicao();
        load();
      }
    } catch (e) {
      toast.error('Erro de conexão ao salvar cliente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
            </div>
            <Button onClick={verificarTabela} variant="outline">Verificar Tabela</Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar por nome do cliente..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load() } }}
                />
              </div>
              <Button onClick={() => { setPage(1); load() }}>Buscar</Button>
            </div>

            <div className="divide-y divide-gray-100">
              {loading && <div className="p-6 text-center text-gray-500">Carregando...</div>}
              {!loading && clientes.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum cliente encontrado.</div>}
              {!loading && clientes.map((c) => (
                  <div key={c.id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{c.nome}</div>
                      <div className="text-sm text-gray-500">{c.endereco || 'Endereço não informado'}</div>
                    </div>
                    <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => abrirEdicao(c)}>
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <div>Página {page} de {totalPages} ({total} clientes)</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showEdit} onClose={fecharModalEdicao} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
             <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
              Editar Cliente
              <X className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-800" onClick={fecharModalEdicao} />
            </Dialog.Title>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-nome" className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" id="edit-nome" value={editData?.nome || ''} onChange={e => handleEditDataChange('nome', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
               <div>
                <label htmlFor="edit-endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" id="edit-endereco" value={editData?.endereco || ''} onChange={e => handleEditDataChange('endereco', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="edit-data-contrato" className="block text-sm font-medium text-gray-700">Data do Contrato</label>
                <input type="date" id="edit-data-contrato" value={editData?.data_contrato || ''} onChange={e => handleEditDataChange('data_contrato', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={fecharModalEdicao}>Cancelar</Button>
              <Button onClick={salvarEdicao}>Salvar Alterações</Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}



