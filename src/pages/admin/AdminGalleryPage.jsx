import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryAPI, BASE_IMAGE_URL } from '../../utils/api';
import { Eye, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      const res = await galleryAPI.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
      };
      const res = await galleryAPI.getAllAdmin(params);
      setItems(res.data.data || []);
    } catch (e) {
      console.error('Failed to load gallery items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus item galeri ini?')) return;
    try {
      await galleryAPI.delete(id);
      await loadItems();
    } catch (e) {
      console.error('Failed to delete gallery item:', e);
      alert('Gagal menghapus item galeri');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const item = items.find(i => i.id === id);
      await galleryAPI.update(id, { ...item, status: newStatus });
      await loadItems();
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Gagal mengubah status');
    }
  };

  const getCategoryLabel = (value) => {
    const category = categories.find(c => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Galeri</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => navigate('/admin/galeri/tambah')}
        >
          <Plus size={20} />
          Tambah Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada item galeri ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {item.image ? (
                            <img
                              src={`${BASE_IMAGE_URL}/${item.image}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Eye size={24} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(item.id, item.status)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors cursor-pointer`}
                        >
                          {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/galeri/edit/${item.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
      )}
    </div>
  );
}
