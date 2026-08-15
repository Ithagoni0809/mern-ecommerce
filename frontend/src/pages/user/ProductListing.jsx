import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          API.get('/categories'),
          API.get('/brands'),
        ]);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error('Metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = `/products?page=${page}&sort=${selectedSort}`;
        if (keyword) query += `&keyword=${encodeURIComponent(keyword)}`;
        if (selectedCategory) query += `&category=${selectedCategory}`;
        if (selectedBrand) query += `&brand=${selectedBrand}`;

        const { data } = await API.get(query);
        setProducts(data.data.products || []);
        setTotalPages(data.data.pages || 1);
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, keyword, selectedCategory, selectedBrand, selectedSort]);

  const handleCategoryChange = (catId) => {
    searchParams.set('category', catId);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
    setPage(1);
  };

  const handleSortChange = (sortVal) => {
    searchParams.set('sort', sortVal);
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {keyword ? `Search results for "${keyword}"` : 'Catalog Products'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Browse our complete list of premium items</p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-indigo-400" /> Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    selectedCategory === cat._id ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 glass-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl">
              <p className="text-slate-400 text-base">No products match your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-xl glass-card text-slate-400 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-slate-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-xl glass-card text-slate-400 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductListing;
