import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    getTools,
    createTool,
    updateTool,
    deleteTool
} from '../services/firestoreService';

export const useTools = (userId) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTools = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await getTools(userId);
            setTools(data);
        } catch (error) {
            toast.error('Error al cargar herramientas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadTools();
        } else {
            setTools([]);
        }
    }, [userId, loadTools]);

    const addTool = async (toolData) => {
        try {
            const newTool = await createTool({ ...toolData, userId });
            setTools(prev => [...prev, newTool]);
            toast.success('Herramienta añadida');
            return { success: true, tool: newTool };
        } catch (error) {
            toast.error('Error al añadir herramienta');
            console.error(error);
            return { success: false };
        }
    };

    const editTool = async (toolId, toolData) => {
        try {
            const updatedTool = await updateTool(toolId, toolData);
            setTools(prev => prev.map(tool =>
                tool.id === toolId ? { ...tool, ...toolData } : tool
            ));
            toast.success('Herramienta actualizada');
            return { success: true, tool: updatedTool };
        } catch (error) {
            toast.error('Error al actualizar herramienta');
            console.error(error);
            return { success: false };
        }
    };

    const removeTool = async (toolId) => {
        try {
            await deleteTool(toolId);
            setTools(prev => prev.filter(tool => tool.id !== toolId));
            toast.success('Herramienta eliminada');
            return { success: true };
        } catch (error) {
            toast.error('Error al eliminar herramienta');
            console.error(error);
            return { success: false };
        }
    };

    const removeToolsByCategory = (categoryId) => {
        setTools(prev => prev.filter(tool => tool.categoryId !== categoryId));
    };

    return {
        tools,
        loading,
        addTool,
        editTool,
        removeTool,
        removeToolsByCategory,
        reloadTools: loadTools
    };
};
