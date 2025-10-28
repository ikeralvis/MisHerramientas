import React from 'react';
import { Wrench, LogOut } from 'lucide-react';
import PropTypes from 'prop-types';

export const Header = ({ user, onLogin, onLogout }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        StudioTools
                    </h1>
                    <p className="text-sm text-gray-600">
                        {user ? `¡Hola, ${user.email}!` : 'Organiza tus herramientas favoritas'}
                    </p>
                </div>
            </div>

            {user ? (
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:inline">Cerrar Sesión</span>
                </button>
            ) : (
                <button
                    onClick={onLogin}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                    Iniciar Sesión
                </button>
            )}
        </div>
    );
};

Header.propTypes = {
    user: PropTypes.object,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired
};
