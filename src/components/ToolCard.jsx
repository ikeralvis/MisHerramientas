import React from 'react';
import { X, Edit2, ExternalLink } from 'lucide-react';

export const ToolCard = ({
    tool,
    user,
    viewMode,
    onEdit,
    onDelete,
    onClick
}) => {
    const handleCardClick = () => {
        onClick(tool);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(tool);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(tool.id);
    };

    const handleOpenLink = (e) => {
        e.stopPropagation();
        window.open(tool.url, '_blank');
    };

    // Grid View
    if (viewMode === 'grid') {
        return (
            <div
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-white cursor-pointer"
                style={{ borderColor: `${tool.color}20` }}
                onClick={handleCardClick}
            >
                {user && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={handleEdit}
                            className="p-1.5 bg-blue-100 rounded-full hover:bg-blue-200"
                        >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                            onClick={handleDelete}
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

                <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: tool.color }}>
                    Ver detalles
                    <ExternalLink className="w-4 h-4" />
                </div>
            </div>
        );
    }

    // List View
    if (viewMode === 'list') {
        return (
            <div
                className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-2 border-white flex items-center gap-4 cursor-pointer"
                style={{ borderColor: `${tool.color}20` }}
                onClick={handleCardClick}
            >
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: tool.color }}
                >
                    {tool.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                        {tool.name}
                    </h3>
                    {tool.description && (
                        <p className="text-gray-600 text-sm truncate">
                            {tool.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {user && (
                        <>
                            <button
                                onClick={handleEdit}
                                className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-red-100 rounded-lg hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4 text-red-600" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleOpenLink}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: tool.color }}
                        title="Abrir herramienta"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Compact View
    if (viewMode === 'compact') {
        return (
            <div
                className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-2 border-white cursor-pointer"
                style={{ borderColor: `${tool.color}20` }}
                onClick={handleCardClick}
            >
                {user && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={handleEdit}
                            className="p-1 bg-blue-100 rounded-full hover:bg-blue-200"
                        >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1 bg-red-100 rounded-full hover:bg-red-200"
                        >
                            <X className="w-3 h-3 text-red-600" />
                        </button>
                    </div>
                )}

                <div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white font-bold mx-auto"
                    style={{ backgroundColor: tool.color }}
                >
                    {tool.name.charAt(0).toUpperCase()}
                </div>

                <h3 className="text-sm font-bold text-gray-800 text-center mb-2 line-clamp-1">
                    {tool.name}
                </h3>

                <div className="flex items-center justify-center gap-1 text-xs font-medium" style={{ color: tool.color }}>
                    Ver detalles
                </div>
            </div>
        );
    }

    return null;
};
