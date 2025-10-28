import React from 'react';
import { Search, Plus, Tag, Grid3x3, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

export const Toolbar = ({
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
    user,
    categories,
    onNewCategory,
    onNewTool
}) => {
    const handleNewTool = () => {
        if (categories.length === 0) {
            toast.error('Primero crea una categoría');
            return;
        }
        onNewTool();
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar herramientas..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-white bg-white/80 backdrop-blur-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-1 border-2 border-white">
                <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    title="Vista Grid"
                >
                    <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    title="Vista Lista"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onViewModeChange('compact')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'compact'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    title="Vista Compacta"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
            </div>

            {user && (
                <>
                    <button
                        onClick={onNewCategory}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all"
                    >
                        <Tag className="w-5 h-5" />
                        <span className="font-medium">Nueva Categoría</span>
                    </button>
                    <button
                        onClick={handleNewTool}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Nueva Herramienta</span>
                    </button>
                </>
            )}
        </div>
    );
};
