import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where
} from 'firebase/firestore';

// Categories
export const getCategories = async (userId) => {
    try {
        const q = query(collection(db, 'categories'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        return { id: docRef.id, ...categoryData };
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (categoryId, categoryData) => {
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, categoryData);
        return { id: categoryId, ...categoryData };
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        await deleteDoc(doc(db, 'categories', categoryId));
        return categoryId;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// Tools
export const getTools = async (userId) => {
    try {
        const q = query(collection(db, 'tools'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching tools:', error);
        throw error;
    }
};

export const createTool = async (toolData) => {
    try {
        const docRef = await addDoc(collection(db, 'tools'), toolData);
        return { id: docRef.id, ...toolData };
    } catch (error) {
        console.error('Error creating tool:', error);
        throw error;
    }
};

export const updateTool = async (toolId, toolData) => {
    try {
        const toolRef = doc(db, 'tools', toolId);
        await updateDoc(toolRef, toolData);
        return { id: toolId, ...toolData };
    } catch (error) {
        console.error('Error updating tool:', error);
        throw error;
    }
};

export const deleteTool = async (toolId) => {
    try {
        await deleteDoc(doc(db, 'tools', toolId));
        return toolId;
    } catch (error) {
        console.error('Error deleting tool:', error);
        throw error;
    }
};

export const deleteToolsByCategory = async (categoryId, userId) => {
    try {
        const q = query(
            collection(db, 'tools'),
            where('categoryId', '==', categoryId),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting tools by category:', error);
        throw error;
    }
};
