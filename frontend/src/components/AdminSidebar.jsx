import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, onTabChange }) => {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-brand">
                <i className="fa-solid fa-user-gear" style={{ color: '#007bff' }}></i> Panel Admin
            </div>
            <div className="sidebar-menu">
                <button
                    className={`sidebar-btn ${activeTab === 'routes' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('routes'); onTabChange('routes'); }}
                >
                    <i className="fa-solid fa-route"></i> Rute & Tarif
                </button>
                <button
                    className={`sidebar-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('gallery'); onTabChange('gallery'); }}
                >
                    <i className="fa-solid fa-images"></i> Galeri Dokumentasi
                </button>
                <button
                    className={`sidebar-btn ${activeTab === 'blog' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('blog'); onTabChange('blog'); }}
                >
                    <i className="fa-solid fa-newspaper"></i> Blog & Artikel
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
