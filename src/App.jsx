import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Search, Wrench, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function App() {
  const [tools, setTools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    description: '',
    category: 'desarrollo',
    color: '#3b82f6'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { value: 'desarrollo', label: '💻 Desarrollo', color: '#3b82f6' },
    { value: 'ia', label: '🤖 IA & Asistentes', color: '#f59e0b' },
    { value: 'apis', label: '🔌 APIs & Testing', color: '#10b981' },
    { value: 'diseno', label: '🎨 Diseño & UI', color: '#8b5cf6' },
    { value: 'bibliotecas', label: '📚 Bibliotecas', color: '#ec4899' },
    { value: 'terminal', label: '⚡ Terminal & DevOps', color: '#06b6d4' },
    { value: 'otros', label: '🔧 Otros', color: '#6b7280' }
  ];

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tools'));
      const toolsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTools(toolsData);
    } catch (error) {
      console.error('Error al cargar herramientas:', error);
      alert('Error al cargar las herramientas. Verifica tu conexión a Firebase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTool = async () => {
    if (!newTool.name || !newTool.url) {
      alert('Por favor completa el nombre y la URL');
      return;
    }

    setIsSaving(true);
    try {
      const toolData = {
        ...newTool,
        addedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'tools'), toolData);
      
      setTools([...tools, { id: docRef.id, ...toolData }]);
      setIsModalOpen(false);
      setNewTool({
        name: '',
        url: '',
        description: '',
        category: 'desarrollo',
        color: '#3b82f6'
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la herramienta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTool = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta herramienta?')) return;

    try {
      await deleteDoc(doc(db, 'tools', id));
      setTools(tools.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la herramienta');
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTools = categories.map(cat => ({
    ...cat,
    tools: filteredTools.filter(t => t.category === cat.value)
  })).filter(group => group.tools.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <div className="text-xl text-gray-600">Cargando herramientas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Mi Caja de Herramientas
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Las herramientas que uso cada día</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-white bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nueva Herramienta</span>
          </button>
        </div>

        {/* Tools Grid */}
        {tools.length === 0 ? (
          <div className="text-center py-20">
            <Wrench className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">Aún no hay herramientas</p>
            <p className="text-gray-400">Haz clic en "Nueva Herramienta" para empezar</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No se encontraron herramientas</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedTools.map(group => (
              <div key={group.value}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: group.color }}>
                  {group.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.tools.map(tool => (
                    <div
                      key={tool.id}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-white hover:border-opacity-100"
                      style={{ borderColor: `${tool.color}20` }}
                    >
                      <button
                        onClick={() => handleDeleteTool(tool.id)}
                        className="absolute top-3 right-3 p-1.5 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                      
                      <div
                        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 text-gray-800 pr-8">
                        {tool.name}
                      </h3>
                      
                      {tool.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {tool.description}
                        </p>
                      )}
                      
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        style={{ color: tool.color }}
                      >
                        Abrir herramienta
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Nueva Herramienta</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="ej: Figma"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newTool.url}
                    onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="https://..."
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                    rows="3"
                    placeholder="¿Para qué usas esta herramienta?"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newTool.category}
                    onChange={(e) => {
                      const cat = categories.find(c => c.value === e.target.value);
                      setNewTool({ ...newTool, category: e.target.value, color: cat.color });
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
                    disabled={isSaving}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setNewTool({ ...newTool, color: cat.color })}
                        className="w-10 h-10 rounded-full transition-all"
                        style={{
                          backgroundColor: cat.color,
                          transform: newTool.color === cat.color ? 'scale(1.2)' : 'scale(1)',
                          boxShadow: newTool.color === cat.color ? '0 0 0 3px white, 0 0 0 5px ' + cat.color : 'none'
                        }}
                        disabled={isSaving}
                        type="button"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddTool}
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Añadir Herramienta'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}