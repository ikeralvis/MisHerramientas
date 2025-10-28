import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteToolsByCategory
} from '../services/firestoreService';

export const useCategories = (userId) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadCategories = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await getCategories(userId);
            setCategories(data);
        } catch (error) {
            toast.error('Error al cargar categorías');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadCategories();
        } else {
            setCategories([]);
        }
    }, [userId, loadCategories]);

    const addCategory = async (categoryData) => {
        try {
            const newCategory = await createCategory({ ...categoryData, userId });
            setCategories(prev => [...prev, newCategory]);
            toast.success('Categoría creada');
            return { success: true, category: newCategory };
        } catch (error) {
            toast.error('Error al crear categoría');
            console.error(error);
            return { success: false };
        }
    };

    const editCategory = async (categoryId, categoryData) => {
        try {
            const updatedCategory = await updateCategory(categoryId, categoryData);
            setCategories(prev => prev.map(cat =>
                cat.id === categoryId ? { ...cat, ...categoryData } : cat
            ));
            toast.success('Categoría actualizada');
            return { success: true, category: updatedCategory };
        } catch (error) {
            toast.error('Error al actualizar categoría');
            console.error(error);
            return { success: false };
        }
    };

    const removeCategory = async (categoryId) => {
        try {
            await deleteToolsByCategory(categoryId, userId);
            await deleteCategory(categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            toast.success('Categoría eliminada');
            return { success: true };
        } catch (error) {
            toast.error('Error al eliminar categoría');
            console.error(error);
            return { success: false };
        }
    };

    return {
        categories,
        loading,
        addCategory,
        editCategory,
        removeCategory,
        reloadCategories: loadCategories
    };
};
