import { useEffect, useState } from "react";
import { Search, Filter, Eye, X } from "lucide-react";
import { galleryAPI, BASE_IMAGE_URL } from "../../utils/api";

const GalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const loadCategories = async () => {
    try {
      const res = await galleryAPI.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const loadItems = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        category: categoryFilter,
      };
      const res = await galleryAPI.getAll(params);
      setItems(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
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
    loadItems(1);
  }, [searchTerm, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    loadItems(newPage);
  };

  const getCategoryLabel = (value) => {
    const category = categories.find(c => c.value === value);
    return category ? category.label : value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 pb-12">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Galeri Desa Ansang
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Dokumentasi kegiatan dan momen penting di Desa Ansang
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari foto atau kegiatan..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
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
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-16" data-aos="fade-up">
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-12 shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Belum Ada Foto
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  Galeri foto masih kosong. Segera akan hadir dengan koleksi foto dan dokumentasi kegiatan menarik di Desa Ansang.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-aos="fade-up">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedImage(item)}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img
                          src={`${BASE_IMAGE_URL}/${item.image}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12" data-aos="fade-up">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === pagination.page
                            ? 'text-white bg-primary-600 border border-primary-600'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Selanjutnya
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={`${BASE_IMAGE_URL}/${selectedImage.image}`}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <h3 className="text-lg font-semibold mb-2">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-sm text-gray-200">{selectedImage.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                  {getCategoryLabel(selectedImage.category)}
                </span>
                <span className="text-xs text-gray-300">
                  {new Date(selectedImage.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
