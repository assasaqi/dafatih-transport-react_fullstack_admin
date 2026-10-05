import React, { useState } from 'react';
import '@/components/Admin.css';
import AdminSidebar from '@/components/AdminSidebar';
import RoutesManagement from '@/components/RoutesManagement';
import GalleryManagement from '@/components/GalleryManagement';
import BlogManagement from '@/components/BlogManagement';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('routes');

    const handleFileUpload = (e, setFormState) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file terlalu besar! Maksimal 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState((prev) => ({
                    ...prev,
                    image: reader.result,
                    imageUrl: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="admin-layout-container">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onTabChange={() => { }}
            />

            <main className="admin-main-content">
                {activeTab === 'routes' && <RoutesManagement handleFileUpload={handleFileUpload} />}
                {activeTab === 'gallery' && <GalleryManagement handleFileUpload={handleFileUpload} />}
                {activeTab === 'blog' && <BlogManagement handleFileUpload={handleFileUpload} />}
            </main>
        </div>
    );
};

export default Admin;
