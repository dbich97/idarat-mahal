import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Plus, 
  Trash2, 
  User as UserIcon,
  Store,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  purchase_price: number;
  purchase_date: string;
  quantity: number;
}

interface Sale {
  id: number;
  product_name: string;
  quantity: number;
  sale_price: number;
  purchase_price: number;
  total_price: number;
  sale_date: string;
}

// --- Auth Context / Helper ---
const getAuthToken = () => localStorage.getItem('token');
const setAuthToken = (token: string) => localStorage.setItem('token', token);
const removeAuthToken = () => localStorage.removeItem('token');

// --- Components ---

const Navbar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
        <Store size={28} />
        <span>متجري</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
          <LayoutDashboard size={20} />
          <span>الرئيسية</span>
        </Link>
        <Link to="/inventory" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
          <Package size={20} />
          <span>المخزون</span>
        </Link>
        <Link to="/sales" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
          <ShoppingCart size={20} />
          <span>المبيعات</span>
        </Link>
        <Link to="/reports" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
          <FileText size={20} />
          <span>التقارير</span>
        </Link>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors mr-4"
        >
          <LogOut size={20} />
          <span>خروج</span>
        </button>
      </div>
    </nav>
  );
};

const Login = ({ setToken }: { setToken: (t: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (isRegister) {
          setIsRegister(false);
          setError('تم التسجيل بنجاح، يمكنك الآن الدخول');
        } else {
          setToken(data.token);
          setAuthToken(data.token);
          navigate('/');
        }
      } else {
        setError(data.error || 'حدث خطأ ما');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 mb-4">
            <UserIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            {isRegister ? 'تسجيل' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 hover:underline text-sm"
          >
            {isRegister ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = getAuthToken();
    const [prodRes, salesRes] = await Promise.all([
      fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/sales', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    if (prodRes.ok) setProducts(await prodRes.json());
    if (salesRes.ok) setSales(await salesRes.json());
  };

  const totalSales = sales.reduce((acc, sale) => acc + sale.total_price, 0);
  const totalProfits = sales.reduce((acc, sale) => acc + (sale.sale_price - sale.purchase_price) * sale.quantity, 0);
  const inventoryValue = products.reduce((acc, prod) => acc + prod.purchase_price * prod.quantity, 0);
  const remainingCapital = inventoryValue + totalProfits;

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
          <p className="text-slate-500">نظرة عامة على أداء متجرك المالي</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">إجمالي المبيعات</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalSales.toLocaleString()} درهم</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">إجمالي الأرباح</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{totalProfits.toLocaleString()} درهم</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">قيمة المخزون</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{inventoryValue.toLocaleString()} درهم</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Store size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">رأس المال المتبقي</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{remainingCapital.toLocaleString()} درهم</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">آخر المبيعات</h2>
          <Link to="/sales" className="text-indigo-600 text-sm hover:underline">عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الكمية</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{sale.product_name}</td>
                  <td className="px-6 py-4 text-slate-600">{sale.quantity}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{sale.total_price} درهم</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(sale.sale_date).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setProducts(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ 
        name, 
        purchase_price: parseFloat(purchasePrice), 
        quantity: parseInt(quantity),
        purchase_date: purchaseDate
      }),
    });
    if (res.ok) {
      setName(''); setPurchasePrice(''); setQuantity('');
      fetchProducts();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) fetchProducts();
  };

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">إدارة المخزون</h1>
        <p className="text-slate-500">أضف منتجات جديدة أو عدل الكميات المتوفرة</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              إضافة منتج جديد
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المنتج</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">سعر الشراء</label>
                  <input 
                    type="number" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكمية</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الشراء</label>
                <input 
                  type="date" 
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4"
              >
                إضافة للمخزن
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">المنتج</th>
                    <th className="px-6 py-4 font-medium">سعر الشراء</th>
                    <th className="px-6 py-4 font-medium">الكمية</th>
                    <th className="px-6 py-4 font-medium">تاريخ الشراء</th>
                    <th className="px-6 py-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{product.name}</td>
                      <td className="px-6 py-4 text-slate-600">{product.purchase_price} درهم</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {product.quantity} قطعة
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(product.purchase_date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        لا توجد منتجات حالياً. أضف منتجك الأول!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = getAuthToken();
    const [prodRes, salesRes] = await Promise.all([
      fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/sales', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    if (prodRes.ok) setProducts(await prodRes.json());
    if (salesRes.ok) setSales(await salesRes.json());
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ 
        product_id: parseInt(selectedProduct), 
        quantity: parseInt(quantity),
        sale_price: parseFloat(salePrice),
        sale_date: saleDate
      }),
    });
    if (res.ok) {
      setSelectedProduct(''); setQuantity('1'); setSalePrice('');
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error || 'فشلت العملية');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">سجل المبيعات</h1>
        <p className="text-slate-500">سجل عمليات بيع جديدة وراجع التاريخ</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              عملية بيع جديدة
            </h2>
            <form onSubmit={handleSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اختر المنتج</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                >
                  <option value="">اختر منتجاً...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} ({p.quantity} متوفر)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">سعر البيع</label>
                  <input 
                    type="number" 
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكمية</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البيع</label>
                <input 
                  type="date" 
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors mt-4"
              >
                إتمام البيع
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">المنتج</th>
                    <th className="px-6 py-4 font-medium">الكمية</th>
                    <th className="px-6 py-4 font-medium">الإجمالي</th>
                    <th className="px-6 py-4 font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{sale.product_name}</td>
                      <td className="px-6 py-4 text-slate-600">{sale.quantity}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{sale.total_price} درهم</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(sale.sale_date).toLocaleString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        لا توجد مبيعات مسجلة حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const res = await fetch('/api/sales', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setSales(await res.json());
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date).toISOString().split('T')[0];
    return saleDate === selectedDate;
  });

  const daySales = filteredSales.reduce((acc, sale) => acc + sale.total_price, 0);
  const dayProfits = filteredSales.reduce((acc, sale) => acc + (sale.sale_price - sale.purchase_price) * sale.quantity, 0);

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">تقارير المبيعات</h1>
        <p className="text-slate-500">استعرض أداء متجرك ليوم محدد</p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-600" />
          اختر التاريخ
        </label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">مبيعات اليوم</div>
          <div className="text-3xl font-bold text-slate-800">{daySales.toLocaleString()} درهم</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">أرباح اليوم</div>
          <div className="text-3xl font-bold text-emerald-600">{dayProfits.toLocaleString()} درهم</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-800">تفاصيل مبيعات {new Date(selectedDate).toLocaleDateString('ar-SA')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-6 py-4 font-medium">الكمية</th>
                <th className="px-6 py-4 font-medium">سعر البيع</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">الربح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{sale.product_name}</td>
                  <td className="px-6 py-4 text-slate-600">{sale.quantity}</td>
                  <td className="px-6 py-4 text-slate-600">{sale.sale_price} درهم</td>
                  <td className="px-6 py-4 text-slate-800 font-bold">{sale.total_price} درهم</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    {(sale.sale_price - sale.purchase_price) * sale.quantity} درهم
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    لا توجد مبيعات في هذا التاريخ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [token, setToken] = useState<string | null>(getAuthToken());

  const handleLogout = () => {
    removeAuthToken();
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        {token ? (
          <>
            <Navbar onLogout={handleLogout} />
            <main className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
