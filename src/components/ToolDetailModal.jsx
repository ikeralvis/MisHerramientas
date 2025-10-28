import React from 'react';
import { X, ExternalLink, Edit2 } from 'lucide-react';

export const ToolDetailModal = ({ tool, categories, user, onClose, onEdit }) => {
    if (!tool) return null;

    const categoryName = user
        ? categories.find(cat => cat.id === tool.categoryId)?.name
        : tool.category;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                            style={{ backgroundColor: tool.color }}
                        >
                            {tool.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {tool.name}
                            </h2>
                            {categoryName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {categoryName}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 dark:text-gray-300" />
                    </button>
                </div>

                {tool.description && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Descripción</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {tool.description}
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">URL</h3>
                    <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {tool.url}
                    </a>
                </div>

                <div className="flex gap-3">
                    <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: tool.color }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Abrir Herramienta
                        <ExternalLink className="w-5 h-5" />
                    </a>
                    {user && (
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(tool);
                            }}
                            className="px-6 py-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-all flex items-center gap-2"
                        >
                            <Edit2 className="w-5 h-5" />
                            Editar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
