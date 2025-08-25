'use client'

import { useEffect, useRef, useState } from 'react'
import { Edit3, X } from 'lucide-react'
import { Dialog } from '@headlessui/react'
import { toast } from 'react-hot-toast'

interface Cliente {
  id: string;
  nome: string;
  endereco?: string | null;
  data_contrato?: string | null;
}

interface AutoClienteProps {
  value: string;
  onSelect: (cliente: Cliente | null) => void;
}

const EMPTY_CLIENTE: Omit<Cliente, 'id'> = {
    nome: '',
    endereco: '',
    data_contrato: '',
};

export default function AutoCliente({ value, onSelect }: AutoClienteProps) {
  const [query, setQuery] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [results, setResults] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Partial<Cliente> | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sincroniza o estado interno se o valor externo mudar
    if (value !== query) {
        setQuery(value);
        if(!value) setSelectedCliente(null);
    }
  }, [value]);

  const fetchData = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/search?q=${encodeURIComponent(q)}&limit=7`);
      const json = await res.json();
      if (json.success) setResults(json.data || []);
    } catch (e) {
      toast.error('Falha ao buscar clientes.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setSuggestionsOpen(true);
    setSelectedCliente(null);
    onSelect(null); // Limpa a seleção no formulário pai
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchData(q), 250);
  };

  const handleSelectItem = (cliente: Cliente) => {
    setQuery(cliente.nome);
    setSelectedCliente(cliente);
    onSelect(cliente);
    setSuggestionsOpen(false);
  };

  const handleOpenModalParaCriar = async () => {
    setSuggestionsOpen(false);
    const nomeBusca = query.trim();
    if(nomeBusca){
        // Checa duplicidade antes de abrir modal de criação
        const res = await fetch(`/api/clientes/search?q=${encodeURIComponent(nomeBusca)}&limit=1`);
        const json = await res.json();
        const existente = json.data?.[0];
        if (existente && existente.nome.toLowerCase() === nomeBusca.toLowerCase()) {
            if (window.confirm(`Cliente "${existente.nome}" já existe. Deseja usar este cliente?`)) {
                handleSelectItem(existente);
                return;
            }
        }
    }
    setClienteEmEdicao({ ...EMPTY_CLIENTE, nome: nomeBusca });
    setModalOpen(true);
  };
  
  const handleOpenModalParaEditar = () => {
    if (!selectedCliente) return;
    setClienteEmEdicao(selectedCliente);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setClienteEmEdicao(null);
  };

  const handleSave = async () => {
    if (!clienteEmEdicao || !clienteEmEdicao.nome?.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }

    const isCreating = !clienteEmEdicao.id;
    const url = isCreating ? '/api/clientes' : `/api/clientes/${clienteEmEdicao.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    const payload = {
      nome: clienteEmEdicao.nome,
      endereco: clienteEmEdicao.endereco || null,
      data_contrato: clienteEmEdicao.data_contrato || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Erro desconhecido');
      }
      
      toast.success(`Cliente ${isCreating ? 'criado' : 'atualizado'} com sucesso!`);
      handleSelectItem(json.data);
      closeModal();

    } catch (error) {
      toast.error(`Falha ao salvar cliente: ${(error as Error).message}`);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setSelectedCliente(null);
    onSelect(null);
    setResults([]);
  };

  const handleUpdateField = (field: keyof Cliente, value: string) => {
    if(clienteEmEdicao){
        setClienteEmEdicao(prev => ({...prev, [field]: value}));
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
            type="text"
            value={query}
            onChange={onInputChange}
            onFocus={() => { if (query) setSuggestionsOpen(true); }}
            onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nome do cliente"
            autoComplete="off"
            required
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query && <X size={16} className="text-gray-500 hover:text-gray-800 cursor-pointer mr-2" onClick={handleClear} />}
            {selectedCliente && <Edit3 size={16} className="text-gray-500 hover:text-blue-600 cursor-pointer" onClick={handleOpenModalParaEditar} />}
        </div>
      </div>

      {suggestionsOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Carregando...</div>
          ) : (
            <ul className="max-h-56 overflow-auto divide-y divide-gray-100">
              {results.map((r) => (
                <li key={r.id} className="p-3 text-sm hover:bg-gray-50 cursor-pointer" onMouseDown={() => handleSelectItem(r)}>
                  <div className="font-medium text-gray-900">{r.nome}</div>
                </li>
              ))}
               <li className="p-3 text-sm hover:bg-blue-50 cursor-pointer text-blue-700 font-semibold" onMouseDown={handleOpenModalParaCriar}>
                + Criar novo cliente "{query}"
              </li>
            </ul>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
              {clienteEmEdicao?.id ? 'Editar Cliente' : 'Novo Cliente'}
            </Dialog.Title>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome *</label>
                <input type="text" id="nome" value={clienteEmEdicao?.nome || ''} onChange={e => handleUpdateField('nome', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" id="endereco" value={clienteEmEdicao?.endereco || ''} onChange={e => handleUpdateField('endereco', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="data_contrato" className="block text-sm font-medium text-gray-700">Data do Contrato</label>
                <input type="date" id="data_contrato" value={clienteEmEdicao?.data_contrato || ''} onChange={e => handleUpdateField('data_contrato', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button type="button" onClick={closeModal} className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">Cancelar</button>
              <button type="button" onClick={handleSave} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Salvar</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}


