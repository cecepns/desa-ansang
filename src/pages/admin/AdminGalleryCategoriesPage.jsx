import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryAPI } from '../../utils/api';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminGalleryCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    description: '',
    sort_order: 0,
  });

  const navigate = useNavigate();

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      label: '',
      value: '',
      description: '',
      sort_order: 0,
    });
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAllCategoriesAdmin();
      setCategories(res.data.data || []);
    } catch (e) {
      console.error('Failed to load gallery categories:', e);
      alert('Gagal memuat kategori galeri');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sort_order' ? Number(value) || 0 : value,
    }));
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      label: category.label || '',
      value: category.value || '',
      description: category.description || '',
      sort_order: category.sort_order ?? 0,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini? Kategori yang digunakan pada item galeri tidak dapat dihapus.')) return;
    try {
      await galleryAPI.deleteCategory(id);
      await loadCategories();
    } catch (e) {
      console.error('Failed to delete gallery category:', e);
      alert(e.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      alert('Nama kategori (label) harus diisi');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await galleryAPI.updateCategory(editingId, formData);
        alert('Kategori berhasil diperbarui');
      } else {
        await galleryAPI.createCategory(formData);
        alert('Kategori berhasil ditambahkan');
      }
      resetForm();
      await loadCategories();
    } catch (e) {
      console.error('Failed to save gallery category:', e);
      alert(e.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/galeri')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori Galeri</h1>
        </div>
        <button
          className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-primary-100 hover:bg-primary-100 transition-colors"
          onClick={() => resetForm()}
        >
          <Plus size={18} />
          Kategori Baru
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kategori (Label) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Contoh: Dokumentasi Kegiatan"
            />
            <p className="mt-1 text-xs text-gray-500">
              Nama yang ditampilkan di filter dan form galeri.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai Kategori (Value)
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Contoh: dokumentasi-kegiatan"
            />
            <p className="mt-1 text-xs text-gray-500">
              Jika dikosongkan, akan dibuat otomatis dari nama kategori. Harus unik, tanpa spasi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutan Tampil
            </label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleInputChange}
              className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Angka kecil akan tampil lebih dulu di daftar kategori.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Keterangan tambahan mengenai kategori (opsional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kategori</h2>
          <p className="text-sm text-gray-500">Total: {categories.length} kategori</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            Belum ada kategori galeri.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urutan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.sort_order}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

