import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import './Admin.css';

const BlogManagement = ({ handleFileUpload }) => {
    // ==========================================
    // STATE DATA, FORM, MODAL, SEARCH & PAGINATION
    // ==========================================
    const [blogs, setBlogs] = useState([]);
    const [blogsLoading, setBlogsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // State untuk kontrol Dropdown Detail tiap Card
    const [expandedCardIds, setExpandedCardIds] = useState({});

    // State Search & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // State Confirm Modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        targetId: null
    });

    const initialFormState = {
        title: '',
        category: 'berita',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        image: '',
        excerpt: '',
        content: ''
    };

    const [formState, setFormState] = useState(initialFormState);

    // Helper untuk memformat tanggal rilis dengan aman dari berbagai opsi field API
    const getFormattedDate = (item) => {
        const rawDate = item.date || item.createdAt || item.publishedAt || item.created_at;
        if (!rawDate) return '-';

        try {
            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return rawDate;
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return rawDate;
        }
    };

    // Toggle Buka/Tutup Dropdown Detail Card
    const toggleCardDetail = (id) => {
        setExpandedCardIds((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Reset ke halaman 1 saat pencarian/filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    // ==========================================
    // FETCH DATA BLOG DARI API
    // ==========================================
    const fetchBlogs = () => {
        setBlogsLoading(true);
        fetch('http://localhost:5000/api/blogs')
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Gagal memuat data (Status ${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setBlogs(Array.isArray(data) ? data : data.blogs || []);
                setBlogsLoading(false);
            })
            .catch((err) => {
                console.error('Gagal memuat artikel blog:', err.message);
                setBlogsLoading(false);
            });
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // ==========================================
    // HANDLER FORM (SUBMIT, EDIT, CLOSE)
    // ==========================================
    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormState(initialFormState);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            title: formState.title ? formState.title.trim() : '',
            category: formState.category || 'berita',
            author: formState.author ? formState.author.trim() : 'Admin',
            date: formState.date || new Date().toISOString().split('T')[0],
            image: formState.image || '',
            excerpt: formState.excerpt ? formState.excerpt.trim() : '',
            content: formState.content ? formState.content.trim() : ''
        };

        const isEdit = editingId !== null;
        const url = isEdit
            ? `http://localhost:5000/api/blogs/${editingId}`
            : 'http://localhost:5000/api/blogs';
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menyimpan artikel blog');
                return data;
            })
            .then((data) => {
                alert(data.message || 'Berhasil menyimpan artikel!');
                fetchBlogs();
                closeForm();
            })
            .catch((err) => alert(`Gagal menyimpan: ${err.message}`));
    };

    const handleEdit = (item) => {
        const rawDate = item.date || item.createdAt || item.publishedAt || item.created_at;
        let formattedDate = new Date().toISOString().split('T')[0];

        if (rawDate) {
            try {
                const parsedDate = new Date(rawDate);
                if (!isNaN(parsedDate.getTime())) {
                    formattedDate = parsedDate.toISOString().split('T')[0];
                }
            } catch {
                // Gunakan default tanggal hari ini jika gagal parse
            }
        }

        setFormState({
            title: item.title || '',
            category: item.category || 'berita',
            author: item.author || 'Admin',
            date: formattedDate,
            image: item.image || item.imageUrl || '',
            excerpt: item.excerpt || '',
            content: item.content || ''
        });
        setEditingId(item.id || item._id);
        setShowForm(true);
    };

    // ==========================================
    // HANDLER HAPUS DENGAN CONFIRM MODAL
    // ==========================================
    const openDeleteModal = (id) => {
        setDeleteModal({
            isOpen: true,
            targetId: id
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            targetId: null
        });
    };

    const handleConfirmDelete = () => {
        const id = deleteModal.targetId;
        if (!id) return;

        fetch(`http://localhost:5000/api/blogs/${id}`, { method: 'DELETE' })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menghapus artikel');
                return data;
            })
            .then((data) => {
                alert(data.message || 'Artikel berhasil dihapus!');
                fetchBlogs();
            })
            .catch((err) => alert(`Error: ${err.message}`))
            .finally(() => {
                closeDeleteModal();
            });
    };

    // ==========================================
    // LOGIKA FILTER PENCARIAN & PAGINATION
    // ==========================================
    const filteredBlogs = blogs.filter((item) => {
        const matchesCategory = selectedCategory === 'all' ||
            (item.category || '').toLowerCase() === selectedCategory.toLowerCase();

        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.author && item.author.toLowerCase().includes(q)) ||
            (item.excerpt && item.excerpt.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            {/* Header Konten & Tombol Tambah */}
            <div className="content-header">
                <h2>Kelola Blog & Artikel</h2>
                <button
                    className="btn-add-primary"
                    onClick={() => { closeForm(); setShowForm(true); }}
                >
                    + Tulis Artikel Baru
                </button>
            </div>

            {/* MODAL FORM TAMBAH / EDIT BLOG */}
            {showForm && (
                <div className="modal-backdrop" onClick={closeForm}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId !== null ? `Edit Artikel #${editingId}` : 'Tambah Artikel Baru'}</h3>
                            <button className="btn-close-modal" onClick={closeForm}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-form-grid">
                            <input
                                type="text"
                                placeholder="Judul Artikel"
                                value={formState.title}
                                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                required
                                className="full-width"
                            />

                            <select
                                value={formState.category}
                                onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                required
                            >
                                <option value="berita">Berita & Pengumuman</option>
                                <option value="tips">Tips Traveling</option>
                                <option value="destinasi">Rekomendasi Wisata</option>
                                <option value="promo">Promo & Info Tarif</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Penulis (Author)"
                                value={formState.author}
                                onChange={(e) => setFormState({ ...formState, author: e.target.value })}
                                required
                            />

                            <input
                                type="date"
                                value={formState.date}
                                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                                required
                                className="full-width"
                            />


                            <textarea
                                placeholder="Isi Konten Artikel Lengkap..."
                                value={formState.content}
                                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                                className="full-width"
                                rows="5"
                                required
                            />

                            <div className="full-width">
                                <label className="form-label">Upload Gambar Sampul:</label>
                                <div className="image-upload-box">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input"
                                        onChange={(e) => handleFileUpload && handleFileUpload(e, setFormState)}
                                    />
                                </div>
                                {formState.image && (
                                    <div className="image-preview-container">
                                        <img src={formState.image} alt="Preview Sampul" className="image-preview" />
                                        <span className="upload-success-badge">✓ Sampul terpilih</span>
                                    </div>
                                )}
                            </div>

                            <div className="full-width form-actions">
                                <button
                                    type="submit"
                                    className={editingId !== null ? "btn-submit-update" : "btn-submit-save"}
                                >
                                    {editingId !== null ? 'Perbarui Artikel' : 'Simpan Artikel'}
                                </button>
                                <button type="button" onClick={closeForm} className="btn-cancel">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TOOLBAR FILTER CATEGORY & SEARCH BAR */}
            <div className="toolbar-container">
                <div className="filter-toolbar" style={{ marginBottom: 0 }}>
                    {['all', 'berita', 'tips', 'destinasi', 'promo'].map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="search-input-box">
                    <input
                        type="text"
                        placeholder="Cari judul, penulis, atau topik..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* LIST KARTU DATA BLOG DENGAN DROPDOWN DETAIL */}
            {blogsLoading ? (
                <p className="empty-text">Memuat artikel blog...</p>
            ) : (
                <div className="cards-container">
                    {currentItems.length === 0 ? (
                        <p className="empty-text">Artikel blog tidak ditemukan.</p>
                    ) : (
                        currentItems.map((item) => {
                            const itemKey = item.id || item._id;
                            const isExpanded = !!expandedCardIds[itemKey];

                            return (
                                <div key={itemKey} className={`item-card-wrapper ${isExpanded ? 'is-open' : ''}`}>
                                    {/* BARIS UTAMA (HORIZONTAL SLIM) */}
                                    <div className="item-card">
                                        {/* 1. THUMBNAIL GAMBAR SAMPUL */}
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="card-thumbnail"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}

                                        {/* 2. INFORMASI RINGKAS SEJAJAR */}
                                        <div className="card-main-info">
                                            <span className="card-category-badge">{item.category}</span>
                                            <h4 className="card-title">{item.title}</h4>
                                            <p className="card-route-info">
                                                <strong>Oleh:</strong> {item.author || 'Admin'}
                                            </p>
                                        </div>

                                        {/* 3. TOMBOL AKSI & DROPDOWN */}
                                        <div className="card-actions">
                                            <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                                            <button onClick={() => openDeleteModal(itemKey)} className="btn-delete">Hapus</button>
                                            <button
                                                onClick={() => toggleCardDetail(itemKey)}
                                                className={`btn-dropdown-toggle ${isExpanded ? 'active' : ''}`}
                                            >
                                                {isExpanded ? 'Detail' : 'Detail'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* PANEL DROPDOWN DETAIL KETIKA DIBUKA */}
                                    {isExpanded && (
                                        <div className="card-detail-dropdown">
                                            <div className="detail-row">
                                                {/* <div className="detail-item">
                                                    <strong>ID Artikel:</strong>
                                                    <span>#{itemKey}</span>
                                                </div> */}
                                            </div>
                                            <div className="detail-item">
                                                <strong>Penulis:</strong>
                                                <span>{item.author || 'Admin'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <strong>Tanggal Rilis:</strong>
                                                <span>{getFormattedDate(item)}</span>
                                            </div>

                                            {item.excerpt && (
                                                <div className="full-width-detail" style={{ marginBottom: '8px' }}>
                                                    <strong>Ringkasan (Excerpt):</strong>
                                                    <p>{item.excerpt}</p>
                                                </div>
                                            )}

                                            <div className="full-width-detail">
                                                <strong>Isi Konten Lengkap:</strong>
                                                <p>{item.content || 'Tidak ada isi konten.'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* KOMPONEN PAGINATION */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* MODAL KONFIRMASI HAPUS KUSTOM */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Artikel"
                message="Apakah Anda yakin ingin menghapus artikel blog ini?"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
            />
        </div>
    );
};

export default BlogManagement;
