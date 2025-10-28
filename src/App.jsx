import React, { useState, useRef } from 'react';
import { X, Wrench, Loader2, Edit2, Smile } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Components
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ToolCard } from './components/ToolCard';
import { ToolDetailModal } from './components/ToolDetailModal';
import { InstallPWA } from './components/InstallPWA';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useCategories } from './hooks/useCategories';
import { useTools } from './hooks/useTools';

// Constants
import { BASE_TOOLS, PRESET_COLORS, EMOJI_OPTIONS } from './constants';

export default function App() {
  // Hooks personalizados
  const { user, loading: authLoading, handleGoogleLogin, handleEmailLogin, handleEmailRegister, handleLogout } = useAuth();
  const { categories, loading: categoriesLoading, addCategory, editCategory, removeCategory } = useCategories(user?.uid);
  const { tools, loading: toolsLoading, addTool, editTool, removeTool } = useTools(user?.uid);

  // Estados UI
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTool, setEditingTool] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTool, setSelectedTool] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const emojiInputRef = useRef(null);

  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    description: '',
    categoryId: '',
    color: PRESET_COLORS[0]
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '',
    color: PRESET_COLORS[0]
  });

  // Función para manejar autenticación por email
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let result;
      if (authMode === 'register') {
        result = await handleEmailRegister(authEmail, authPassword);
        if (result.success) {
          toast.success('¡Cuenta creada! Bienvenido');
        }
      } else {
        result = await handleEmailLogin(authEmail, authPassword);
        if (result.success) {
          toast.success('¡Bienvenido de nuevo!');
        }
      }

      if (result.success) {
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        // Manejar errores específicos
        if (result.error?.code === 'auth/email-already-in-use') {
          toast.error('Este email ya está registrado');
        } else if (result.error?.code === 'auth/weak-password') {
          toast.error('La contraseña debe tener al menos 6 caracteres');
        } else if (result.error?.code === 'auth/invalid-email') {
          toast.error('Email inválido');
        } else if (result.error?.code === 'auth/user-not-found' || result.error?.code === 'auth/wrong-password') {
          toast.error('Email o contraseña incorrectos');
        } else {
          toast.error('Error al autenticar');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Función para manejar login con Google
  const handleGoogleLoginClick = async () => {
    const result = await handleGoogleLogin();
    if (result.success) {
      setShowAuthModal(false);
      toast.success('¡Bienvenido! Sesión iniciada correctamente');
    } else {
      toast.error('Error al iniciar sesión con Google');
    }
  };

  // Función para manejar logout
  const handleLogoutClick = async () => {
    const result = await handleLogout();
    if (result.success) {
      toast.success('Sesión cerrada');
    } else {
      toast.error('Error al cerrar sesión');
    }
  };

  // Funciones para categorías
  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (editingCategory) {
        result = await editCategory(editingCategory.id, newCategory);
      } else {
        result = await addCategory(newCategory);
      }

      if (result.success) {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setNewCategory({ name: '', emoji: '', color: PRESET_COLORS[0] });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const toolsInCategory = tools.filter(t => t.categoryId === categoryId);
    if (toolsInCategory.length > 0) {
      toast.error(`No puedes eliminar esta categoría porque tiene ${toolsInCategory.length} herramienta(s)`);
      return;
    }

    await removeCategory(categoryId);
  };

  // Funciones para herramientas
  const handleSaveTool = async () => {
    if (!newTool.name || !newTool.url || !newTool.categoryId) {
      toast.error('Nombre, URL y categoría son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (editingTool) {
        result = await editTool(editingTool.id, newTool);
      } else {
        result = await addTool(newTool);
      }

      if (result.success) {
        setIsToolModalOpen(false);
        setEditingTool(null);
        setNewTool({ name: '', url: '', description: '', categoryId: '', color: PRESET_COLORS[0] });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTool = async (id) => {
    await removeTool(id);
  };

  const openEditTool = (tool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      url: tool.url,
      description: tool.description || '',
      categoryId: tool.categoryId,
      color: tool.color
    });
    setIsToolModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      emoji: category.emoji || '',
      color: category.color
    });
    setIsCategoryModalOpen(true);
  };

  const displayTools = user ? tools : BASE_TOOLS;
  const filteredTools = displayTools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedTools = user
    ? categories.map(cat => ({
      ...cat,
      tools: filteredTools.filter(t => t.categoryId === cat.id)
    })).filter(group => group.tools.length > 0)
    : [...new Set(filteredTools.map(t => t.category))].map(category => ({
      name: category,
      color: filteredTools.find(t => t.category === category)?.color || '#6b7280',
      tools: filteredTools.filter(t => t.category === category)
    }));

  const isLoading = authLoading || categoriesLoading || toolsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <div className="text-xl text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          user={user}
          onLogin={() => setShowAuthModal(true)}
          onLogout={handleLogoutClick}
        />

        {/* Toolbar */}
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          user={user}
          categories={categories}
          onNewCategory={() => {
            setEditingCategory(null);
            setNewCategory({ name: '', emoji: '', color: PRESET_COLORS[0] });
            setIsCategoryModalOpen(true);
          }}
          onNewTool={() => {
            if (categories.length === 0) {
              toast.error('Primero crea una categoría');
              return;
            }
            setEditingTool(null);
            setNewTool({ name: '', url: '', description: '', categoryId: categories[0].id, color: PRESET_COLORS[0] });
            setIsToolModalOpen(true);
          }}
        />

        {/* Categories Management (solo para usuarios logueados) */}
        {user && categories.length > 0 && (
          <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Tus categorías:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:scale-105 shadow-md"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  <span>{cat.name}</span>
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools Grid */}
        {displayTools.length === 0 ? (
          <div className="text-center py-20">
            <Wrench className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">Aún no hay herramientas</p>
            <p className="text-gray-400">Crea una categoría y añade tu primera herramienta</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No se encontraron herramientas</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedTools.map((group, idx) => (
              <div key={user ? group.id : idx}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: group.color }}>
                  {group.emoji && <span>{group.emoji}</span>}
                  {group.name}
                </h2>

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.tools.map((tool, toolIdx) => (
                      <ToolCard
                        key={user ? tool.id : toolIdx}
                        tool={tool}
                        user={user}
                        viewMode={viewMode}
                        onEdit={openEditTool}
                        onDelete={handleDeleteTool}
                        onClick={(tool) => {
                          setSelectedTool(tool);
                          setShowDetailModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {group.tools.map((tool, toolIdx) => (
                      <ToolCard
                        key={user ? tool.id : toolIdx}
                        tool={tool}
                        user={user}
                        viewMode={viewMode}
                        onEdit={openEditTool}
                        onDelete={handleDeleteTool}
                        onClick={(tool) => {
                          setSelectedTool(tool);
                          setShowDetailModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Compact View */}
                {viewMode === 'compact' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {group.tools.map((tool, toolIdx) => (
                      <ToolCard
                        key={user ? tool.id : toolIdx}
                        tool={tool}
                        user={user}
                        viewMode={viewMode}
                        onEdit={openEditTool}
                        onDelete={handleDeleteTool}
                        onClick={(tool) => {
                          setSelectedTool(tool);
                          setShowDetailModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                </h2>
                <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={handleGoogleLoginClick}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all mb-4"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium text-gray-700">Continuar con Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">o</span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Cargando...' : (authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
                </button>
              </form>

              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700"
              >
                {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
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
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
                    placeholder="ej: Mis Herramientas IA"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji (opcional)
                  </label>
                  <div className="relative">
                    <input
                      ref={emojiInputRef}
                      type="text"
                      value={newCategory.emoji}
                      onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
                      placeholder="Escribe o elige un emoji"
                      disabled={isSaving}
                      maxLength="2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isSaving}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {showEmojiPicker && (
                    <div className="mt-2 p-3 bg-white border-2 border-purple-200 rounded-xl shadow-lg">
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setNewCategory({ ...newCategory, emoji: '' });
                            setShowEmojiPicker(false);
                          }}
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 flex items-center justify-center text-lg transition-all"
                          disabled={isSaving}
                        >
                          ∅
                        </button>
                        {EMOJI_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setNewCategory({ ...newCategory, emoji });
                              setShowEmojiPicker(false);
                            }}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 flex items-center justify-center text-xl transition-all"
                            disabled={isSaving}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className="relative w-10 h-10 rounded-lg transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                        disabled={isSaving}
                      >
                        {newCategory.color === color && (
                          <div className="absolute inset-0 rounded-lg border-4 border-white shadow-lg" style={{ boxShadow: `0 0 0 2px ${color}` }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: newCategory.color }}
                    >
                      {newCategory.emoji || '📁'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">
                        {newCategory.name || 'Vista previa'}
                      </div>
                      <div className="text-xs text-gray-500">Así se verá tu categoría</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveCategory}
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tool Modal */}
        {isToolModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTool ? 'Editar Herramienta' : 'Nueva Herramienta'}
                </h2>
                <button
                  onClick={() => {
                    setIsToolModalOpen(false);
                    setEditingTool(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 resize-none"
                    rows="3"
                    placeholder="¿Para qué usas esta herramienta?"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={newTool.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setNewTool({ ...newTool, categoryId: e.target.value, color: cat?.color || PRESET_COLORS[0] });
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400"
                    disabled={isSaving}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTool({ ...newTool, color })}
                        className="relative w-10 h-10 rounded-lg transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                        disabled={isSaving}
                      >
                        {newTool.color === color && (
                          <div className="absolute inset-0 rounded-lg border-4 border-white shadow-lg" style={{ boxShadow: `0 0 0 2px ${color}` }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveTool}
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingTool ? 'Actualizar Herramienta' : 'Añadir Herramienta'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tool Detail Modal */}
        {showDetailModal && selectedTool && (
          <ToolDetailModal
            tool={selectedTool}
            categories={categories}
            user={user}
            onClose={() => setShowDetailModal(false)}
            onEdit={openEditTool}
          />
        )}

        {/* PWA Install Prompt */}
        <InstallPWA />
      </div>
    </div>
  );
}