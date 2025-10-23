import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ExternalLink, Search, Wrench, Loader2, LogOut, Edit2, Tag, Mail, Smile } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { db, auth, googleProvider } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const BASE_TOOLS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'Asistente de IA de OpenAI', category: '🤖 IA', color: '#10a37f' },
  { name: 'Claude', url: 'https://claude.ai', description: 'Asistente de IA de Anthropic', category: '🤖 IA', color: '#f59e0b' },
  { name: 'Gemini', url: 'https://gemini.google.com', description: 'IA de Google', category: '🤖 IA', color: '#4285f4' },
  { name: 'Perplexity', url: 'https://perplexity.ai', description: 'Buscador con IA', category: '🤖 IA', color: '#6b7280' },
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'Asistente de código con IA', category: '🤖 IA', color: '#8b5cf6' },
  { name: 'VS Code', url: 'https://code.visualstudio.com', description: 'Editor de código de Microsoft', category: '💻 IDEs', color: '#0078d4' },
  { name: 'Cursor', url: 'https://cursor.sh', description: 'IDE con IA integrada', category: '💻 IDEs', color: '#000000' },
  { name: 'Windsurf', url: 'https://codeium.com/windsurf', description: 'IDE de Codeium', category: '💻 IDEs', color: '#3b82f6' },
  { name: 'WebStorm', url: 'https://www.jetbrains.com/webstorm', description: 'IDE para JavaScript', category: '💻 IDEs', color: '#00d4ff' },
  { name: 'Figma', url: 'https://figma.com', description: 'Diseño colaborativo', category: '🎨 Diseño', color: '#a259ff' },
  { name: 'Canva', url: 'https://canva.com', description: 'Diseño gráfico simple', category: '🎨 Diseño', color: '#00c4cc' },
  { name: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html', description: 'Diseño UX/UI', category: '🎨 Diseño', color: '#ff61f6' },
  { name: 'Postman', url: 'https://postman.com', description: 'Testing de APIs', category: '🔌 APIs', color: '#ff6c37' },
  { name: 'Insomnia', url: 'https://insomnia.rest', description: 'Cliente REST', category: '🔌 APIs', color: '#5849be' },
  { name: 'Warp', url: 'https://warp.dev', description: 'Terminal moderna con IA', category: '⚡ Terminal', color: '#00d4ff' }
];

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#000000'
];

const EMOJI_OPTIONS = ['😀', '🎨', '💻', '🚀', '🔧', '📱', '🎯', '✨', '🌟', '💡', '🔥', '🎪', '🎭', '🖌️', '📊', '📈', '🔍', '🔬', '🤖', '⚡', '🔌', '📚', '🎓', '🏆'];

export default function App() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser.uid);
      } else {
        setTools([]);
        setCategories([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    setIsLoading(true);
    try {
      const [toolsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'tools'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'categories'), where('userId', '==', userId)))
      ]);

      const toolsData = toolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setTools(toolsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
      toast.success('¡Bienvenido! Sesión iniciada correctamente');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión con Google');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        toast.success('¡Cuenta creada! Bienvenido');
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast.success('¡Bienvenido de nuevo!');
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      console.error('Error de autenticación:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña debe tener al menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Email o contraseña incorrectos');
      } else {
        toast.error('Error al autenticar');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const categoryData = {
        ...newCategory,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryData } : c));
        toast.success('Categoría actualizada');
      } else {
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        setCategories([...categories, { id: docRef.id, ...categoryData }]);
        toast.success('Categoría creada');
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setNewCategory({ name: '', emoji: '', color: PRESET_COLORS[0] });
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('Error al guardar la categoría');
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

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success('Categoría eliminada');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleSaveTool = async () => {
    if (!newTool.name || !newTool.url || !newTool.categoryId) {
      toast.error('Nombre, URL y categoría son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const toolData = {
        ...newTool,
        userId: user.uid,
        createdAt: editingTool ? editingTool.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTool) {
        await updateDoc(doc(db, 'tools', editingTool.id), toolData);
        setTools(tools.map(t => t.id === editingTool.id ? { ...t, ...toolData } : t));
        toast.success('Herramienta actualizada');
      } else {
        const docRef = await addDoc(collection(db, 'tools'), toolData);
        setTools([...tools, { id: docRef.id, ...toolData }]);
        toast.success('Herramienta añadida');
      }

      setIsToolModalOpen(false);
      setEditingTool(null);
      setNewTool({ name: '', url: '', description: '', categoryId: '', color: PRESET_COLORS[0] });
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la herramienta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTool = async (id) => {
    try {
      await deleteDoc(doc(db, 'tools', id));
      setTools(tools.filter(t => t.id !== id));
      toast.success('Herramienta eliminada');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la herramienta');
    }
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
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              {user ? 'ToolStack' : 'Herramientas Populares'}
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="text-gray-600 text-lg">
              {user ? 'Tu colección personal de herramientas' : 'Descubre las mejores herramientas para desarrolladores'}
            </p>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="text-gray-700 font-medium">{user.displayName || user.email}</span>
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
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
          {user && (
            <>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: '', emoji: '', color: PRESET_COLORS[0] });
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <Tag className="w-5 h-5" />
                <span className="font-medium">Nueva Categoría</span>
              </button>
              <button
                onClick={() => {
                  if (categories.length === 0) {
                    toast.error('Primero crea una categoría');
                    return;
                  }
                  setEditingTool(null);
                  setNewTool({ name: '', url: '', description: '', categoryId: categories[0].id, color: PRESET_COLORS[0] });
                  setIsToolModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nueva Herramienta</span>
              </button>
            </>
          )}
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.tools.map((tool, toolIdx) => (
                    <div
                      key={user ? tool.id : toolIdx}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-white"
                      style={{ borderColor: `${tool.color}20` }}
                    >
                      {user && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditTool(tool)}
                            className="p-1.5 bg-blue-100 rounded-full hover:bg-blue-200"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="p-1.5 bg-red-100 rounded-full hover:bg-red-200"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      )}
                      
                      <div
                        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 text-gray-800 pr-12">
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
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all mb-4"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
      </div>
    </div>
  );
}