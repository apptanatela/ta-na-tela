import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Bell, User, Menu, X, Store, Home, Package, BarChart3, CreditCard, Users, Tag, Image, Settings, MessageSquare, MapPin, ChevronLeft, ChevronRight, Star, Phone, Plus, Edit, Trash2, Eye, Clock, TrendingUp } from 'lucide-react';

// Dados simulados iniciais
const INITIAL_DATA = {
  admin: {
    email: 'admin@tanatela.com',
    password: 'admin123',
    name: 'Administrador',
    logo: 'TÁ NA TELA'
  },
  establishments: [
    {
      id: 1,
      name: 'Supermercado Bom Preço',
      email: 'super@email.com',
      password: 'super123',
      category: 'Supermercado',
      logo: '🛒',
      banner: 'https://via.placeholder.com/800x300/4CAF50/ffffff?text=Supermercado+Bom+Preco',
      phone: '(75) 99999-0001',
      whatsapp: '75999990001',
      address: 'Rua Principal, 100',
      credits: 100,
      visits: 0,
      sales: 0,
      plan: 'START',
      vipUntil: null,
      products: [
        { id: 1, name: 'Arroz 5kg', price: 25.90, category: 'Alimentos', images: ['https://via.placeholder.com/400?text=Arroz'], description: 'Arroz tipo 1' },
        { id: 2, name: 'Feijão 1kg', price: 8.50, category: 'Alimentos', images: ['https://via.placeholder.com/400?text=Feijao'], description: 'Feijão carioca' }
      ]
    },
    {
      id: 2,
      name: 'Farmácia Saúde',
      email: 'farmacia@email.com',
      password: 'farm123',
      category: 'Farmácia',
      logo: '💊',
      banner: 'https://via.placeholder.com/800x300/2196F3/ffffff?text=Farmacia+Saude',
      phone: '(75) 99999-0002',
      whatsapp: '75999990002',
      address: 'Av. Central, 200',
      credits: 100,
      visits: 0,
      sales: 0,
      plan: 'GOLD',
      vipUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      products: [
        { id: 3, name: 'Dipirona 500mg', price: 12.90, category: 'Medicamentos', images: ['https://via.placeholder.com/400?text=Dipirona'], description: 'Analgésico' }
      ]
    }
  ],
  categories: [
    { id: 1, name: 'Supermercado', icon: '🛒' },
    { id: 2, name: 'Farmácia', icon: '💊' },
    { id: 3, name: 'Restaurante', icon: '🍽️' },
    { id: 4, name: 'Moda', icon: '👕' },
    { id: 5, name: 'Eletrônicos', icon: '📱' }
  ],
  banners: [
    { id: 1, image: 'https://via.placeholder.com/1200x400/FF5722/ffffff?text=Ofertas+Especiais', link: '' },
    { id: 2, image: 'https://via.placeholder.com/1200x400/9C27B0/ffffff?text=Novidades', link: '' }
  ],
  recharges: [
    { id: 1, name: 'START', price: 25, credits: 500, maxProducts: 25 },
    { id: 2, name: 'GOLD', price: 50, credits: 2000, maxProducts: 50 },
    { id: 3, name: 'PREMIUM', price: 100, credits: 5000, maxProducts: 100 }
  ],
  vipPlans: [
    { id: 1, name: 'VIP 15 dias', price: 10, days: 15 },
    { id: 2, name: 'VIP 30 dias', price: 20, days: 30 }
  ]
};

const App = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'establishment', 'customer'
  const [currentView, setCurrentView] = useState('home');
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedCity, setSelectedCity] = useState('Paripiranga, BA');
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  // Login
  const handleLogin = (email, password, type) => {
    if (type === 'admin' && email === data.admin.email && password === data.admin.password) {
      setUser(data.admin);
      setUserType('admin');
      setShowLogin(false);
      setCurrentView('admin-home');
    } else if (type === 'establishment') {
      const est = data.establishments.find(e => e.email === email && e.password === password);
      if (est) {
        setUser(est);
        setUserType('establishment');
        setShowLogin(false);
        setCurrentView('establishment-home');
      }
    } else if (type === 'customer') {
      // Simulação de login de cliente
      setUser({ email, name: 'Cliente Teste' });
      setUserType('customer');
      setShowLogin(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setCurrentView('home');
  };

  // Adicionar ao carrinho
  const addToCart = (product, establishment) => {
    setCart([...cart, { ...product, establishment }]);
  };

  // Modal de Login
  const LoginModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('customer');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Entrar</h2>
            <button onClick={() => setShowLogin(false)} className="text-gray-500">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tipo de Acesso</label>
            <select 
              value={loginType} 
              onChange={(e) => setLoginType(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="customer">Cliente</option>
              <option value="establishment">Estabelecimento</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 mb-3"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
          />
          
          <button
            onClick={() => handleLogin(email, password, loginType)}
            className="w-full bg-blue-600 text-white rounded-lg p-2 font-semibold hover:bg-blue-700"
          >
            Entrar
          </button>

          <div className="mt-4 text-center">
            <button className="w-full border border-gray-300 rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50">
              <span>🔐</span> Entrar com Google
            </button>
          </div>

          <p className="text-center mt-4 text-sm">
            Não tem conta?{' '}
            <button 
              onClick={() => { setShowLogin(false); setShowRegister(true); }}
              className="text-blue-600 font-semibold"
            >
              Cadastrar
            </button>
          </p>

          {loginType !== 'customer' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <p className="font-semibold mb-1">Dados de teste:</p>
              {loginType === 'admin' && <p>Email: admin@tanatela.com | Senha: admin123</p>}
              {loginType === 'establishment' && <p>Email: super@email.com | Senha: super123</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal de Registro
  const RegisterModal = () => {
    const [registerType, setRegisterType] = useState('customer');
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Cadastrar</h2>
            <button onClick={() => setShowRegister(false)} className="text-gray-500">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tipo de Cadastro</label>
            <select 
              value={registerType} 
              onChange={(e) => setRegisterType(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="customer">Usuário Comum</option>
              <option value="establishment">Estabelecimento</option>
            </select>
          </div>

          <input type="text" placeholder="Nome completo" className="w-full border rounded-lg p-2 mb-3" />
          <input type="email" placeholder="Email" className="w-full border rounded-lg p-2 mb-3" />
          <input type="password" placeholder="Senha" className="w-full border rounded-lg p-2 mb-3" />
          
          {registerType === 'establishment' && (
            <>
              <input type="text" placeholder="Nome do estabelecimento" className="w-full border rounded-lg p-2 mb-3" />
              <input type="text" placeholder="Telefone/WhatsApp" className="w-full border rounded-lg p-2 mb-3" />
              <input type="text" placeholder="Endereço" className="w-full border rounded-lg p-2 mb-3" />
            </>
          )}
          
          <button className="w-full bg-blue-600 text-white rounded-lg p-2 font-semibold hover:bg-blue-700">
            Cadastrar
          </button>

          <p className="text-center mt-4 text-sm">
            Já tem conta?{' '}
            <button 
              onClick={() => { setShowRegister(false); setShowLogin(true); }}
              className="text-blue-600 font-semibold"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Header
  const Header = () => (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              <Menu size={24} />
            </button>
            <h1 
              onClick={() => setCurrentView('home')}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              TÁ NA TELA
            </h1>
          </div>

          {userType === 'customer' && (
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar produtos, serviços e estabelecimentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="hidden md:block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => setShowRegister(true)}
                  className="hidden md:block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Cadastrar
                </button>
              </>
            ) : (
              <>
                {userType === 'customer' && (
                  <>
                    <button className="relative">
                      <Heart size={24} />
                      {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </button>
                    <button className="relative" onClick={() => setCurrentView('cart')}>
                      <ShoppingCart size={24} />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <button className="relative">
                  <Bell size={24} />
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2">
                  <User size={24} />
                  <span className="hidden md:block">{user.name}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {userType === 'customer' && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // Home Page (Cliente)
  const CustomerHome = () => {
    const sortedEstablishments = [...data.establishments].sort((a, b) => {
      const aIsVip = a.vipUntil && new Date(a.vipUntil) > new Date();
      const bIsVip = b.vipUntil && new Date(b.vipUntil) > new Date();
      if (aIsVip && !bIsVip) return -1;
      if (!aIsVip && bIsVip) return 1;
      return 0;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* City Selector */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin size={20} className="text-blue-600" />
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border rounded-lg px-3 py-1"
          >
            <option>Paripiranga, BA</option>
            <option>Salvador, BA</option>
            <option>São Paulo, SP</option>
          </select>
        </div>

        {/* Banners */}
        <div className="mb-8">
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={data.banners[0].image} 
              alt="Banner" 
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categorias</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {data.categories.map(cat => (
              <div key={cat.id} className="flex flex-col items-center min-w-[80px] cursor-pointer hover:opacity-75">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-2">
                  {cat.icon}
                </div>
                <span className="text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Establishments */}
        <div>
          <h2 className="text-xl font-bold mb-4">Lojas em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEstablishments.map(est => {
              const isVip = est.vipUntil && new Date(est.vipUntil) > new Date();
              return (
                <div 
                  key={est.id}
                  onClick={() => {
                    if (!user) {
                      setShowLogin(true);
                    } else {
                      setSelectedEstablishment(est);
                      setCurrentView('establishment-detail');
                    }
                  }}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img 
                      src={est.banner} 
                      alt={est.name}
                      className="w-full h-40 object-cover"
                    />
                    {isVip && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> VIP
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">{est.logo}</div>
                      <div>
                        <h3 className="font-bold text-lg">{est.name}</h3>
                        <p className="text-sm text-gray-600">{est.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{est.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Establishment Detail
  const EstablishmentDetail = () => {
    if (!selectedEstablishment) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-blue-600 mb-4"
        >
          <ChevronLeft size={20} /> Voltar
        </button>

        {/* Banner */}
        <div className="mb-6">
          <img 
            src={selectedEstablishment.banner} 
            alt={selectedEstablishment.name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{selectedEstablishment.logo}</div>
            <div>
              <h1 className="text-2xl font-bold">{selectedEstablishment.name}</h1>
              <p className="text-gray-600">{selectedEstablishment.category}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin size={16} /> {selectedEstablishment.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> {selectedEstablishment.phone}
            </p>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-bold mb-4">Produtos e Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedEstablishment.products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`https://wa.me/${selectedEstablishment.whatsapp}`, '_blank')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <Phone size={16} /> Contato
                    </button>
                    <button 
                      onClick={() => addToCart(product, selectedEstablishment)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard
  const AdminDashboard = () => {
    const [adminView, setAdminView] = useState('establishments');

    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-bold text-blue-600 mb-6">Painel Admin</h2>
            <nav className="space-y-2">
              <button onClick={() => setAdminView('team')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Users size={18} /> Minha Equipe
              </button>
              <button onClick={() => setAdminView('establishments')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Store size={18} /> Estabelecimentos
              </button>
              <button onClick={() => setAdminView('categories')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Tag size={18} /> Categorias
              </button>
              <button onClick={() => setAdminView('recharges')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <CreditCard size={18} /> Recargas
              </button>
              <button onClick={() => setAdminView('vip')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Star size={18} /> Destaques VIP
              </button>
              <button onClick={() => setAdminView('banners')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Image size={18} /> Banners
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">
            {adminView === 'team' && 'Minha Equipe'}
            {adminView === 'establishments' && 'Estabelecimentos'}
            {adminView === 'categories' && 'Categorias'}
            {adminView === 'recharges' && 'Planos de Recarga'}
            {adminView === 'vip' && 'Destaques VIP'}
            {adminView === 'banners' && 'Banners Publicitários'}
          </h1>

          {adminView === 'establishments' && (
            <div className="bg-white rounded-lg shadow p-6">
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus size={18} /> Novo Estabelecimento
              </button>
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Categoria</th>
                    <th className="pb-2">Plano</th>
                    <th className="pb-2">Créditos</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.establishments.map(est => (
                    <tr key={est.id} className="border-b">
                      <td className="py-3">{est.name}</td>
                      <td>{est.category}</td>
                      <td>{est.plan}</td>
                      <td>{est.credits}</td>
                      <td className="flex gap-2">
                        <button className="text-blue-600"><Edit size={18} /></button>
                        <button className="text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminView === 'categories' && (
            <div className="bg-white rounded-lg shadow p-6">
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus size={18} /> Nova Categoria
              </button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.categories.map(cat => (
                  <div key={cat.id} className="border rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <p className="font-semibold">{cat.name}</p>
                    <div className="flex gap-2 justify-center mt-2">
                      <button className="text-blue-600"><Edit size={16} /></button>
                      <button className="text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminView === 'recharges' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.recharges.map(plan => (
                  <div key={plan.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-4">R$ {plan.price}</p>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li>✓ {plan.credits} créditos</li>
                      <li>✓ Até {plan.maxProducts} produtos</li>
                    </ul>
                    <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Edit size={16} className="inline mr-2" /> Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminView === 'banners' && (
            <div className="bg-white rounded-lg shadow p-6">
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus size={18} /> Novo Banner
              </button>
              <div className="space-y-4">
                {data.banners.map(banner => (
                  <div key={banner.id} className="border rounded-lg p-4 flex items-center gap-4">
                    <img src={banner.image} alt="Banner" className="w-32 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Banner #{banner.id}</p>
                    </div>
                    <button className="text-blue-600"><Edit size={18} /></button>
                    <button className="text-red-600"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Establishment Dashboard
  const EstablishmentDashboard = () => {
    const [estView, setEstView] = useState('home');

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-bold text-blue-600 mb-6">{user.name}</h2>
            <nav className="space-y-2">
              <button onClick={() => setEstView('home')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Home size={18} /> Home
              </button>
              <button onClick={() => setEstView('profile')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Settings size={18} /> Perfil
              </button>
              <button onClick={() => setEstView('banners')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Image size={18} /> Banners
              </button>
              <button onClick={() => setEstView('products')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Package size={18} /> Produtos
              </button>
              <button onClick={() => setEstView('sales')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <BarChart3 size={18} /> Vendas
              </button>
              <button onClick={() => setEstView('credits')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <CreditCard size={18} /> Créditos
              </button>
              <button onClick={() => setEstView('visitors')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <Eye size={18} /> Visitantes
              </button>
              <button onClick={() => setEstView('recharges')} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                <TrendingUp size={18} /> Recargas
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8">
          {estView === 'home' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Créditos</p>
                  <p className="text-3xl font-bold text-blue-600">{user.credits}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Visitantes</p>
                  <p className="text-3xl font-bold text-green-600">{user.visits}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Vendas</p>
                  <p className="text-3xl font-bold text-purple-600">{user.sales}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600 text-sm">Produtos</p>
                  <p className="text-3xl font-bold text-orange-600">{user.products.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Seus Produtos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {user.products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-blue-600 font-bold">R$ {product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {estView === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Meus Produtos</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Plus size={18} /> Novo Produto
                </button>
              </div>

              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Produto</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Preço</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.products.map(product => (
                      <tr key={product.id} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4">{product.category}</td>
                        <td className="p-4">R$ {product.price.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600"><Edit size={18} /></button>
                            <button className="text-red-600"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {estView === 'credits' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Créditos</h1>
              
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Créditos Disponíveis</p>
                    <p className="text-4xl font-bold text-blue-600">{user.credits}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Plano Atual</p>
                    <p className="text-2xl font-bold">{user.plan}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">⚠️ Um crédito é descontado a cada visita única de usuário por dia</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Recargas</h2>
                <p className="text-gray-600">Nenhuma recarga realizada ainda</p>
              </div>
            </div>
          )}

          {estView === 'recharges' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Recargas e Destaques</h1>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Planos de Recarga</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.recharges.map(plan => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-lg p-6 border-2 hover:border-blue-600 transition">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-4xl font-bold text-blue-600 mb-4">R$ {plan.price}</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> {plan.credits} créditos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Até {plan.maxProducts} produtos
                        </li>
                      </ul>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                        Comprar Agora
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Destaque VIP</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.vipPlans.map(plan => (
                    <div key={plan.id} className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Star size={24} fill="currentColor" />
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                      </div>
                      <p className="text-3xl font-bold mb-4">R$ {plan.price}</p>
                      <ul className="space-y-2 mb-6">
                        <li>✓ Selo VIP por {plan.days} dias</li>
                        <li>✓ Apareça nas primeiras posições</li>
                        <li>✓ Mais visibilidade</li>
                      </ul>
                      <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
                        Ativar Destaque VIP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {estView === 'visitors' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Visitantes</h1>
              
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Total de Visitantes</h2>
                  <select className="border rounded px-3 py-1">
                    <option>Últimos 7 dias</option>
                    <option>Últimos 30 dias</option>
                    <option>Este mês</option>
                  </select>
                </div>
                <p className="text-5xl font-bold text-blue-600">{user.visits}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Gráfico de Visitantes</h2>
                <div className="h-64 flex items-end justify-around gap-2">
                  {[12, 18, 25, 15, 30, 22, 28].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-600 rounded-t"
                        style={{ height: `${value * 3}px` }}
                      ></div>
                      <p className="text-xs mt-2">Dia {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {estView === 'sales' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Vendas</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Total de Vendas</p>
                  <p className="text-3xl font-bold text-blue-600">{user.sales}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">A Entregar</p>
                  <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Concluídas</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Vendas</h2>
                <p className="text-gray-600 text-center py-8">Nenhuma venda realizada ainda</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Cart View
  const CartView = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Carrinho de Compras</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Seu carrinho está vazio</p>
            <button 
              onClick={() => setCurrentView('home')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow mb-6">
              {cart.map((item, index) => (
                <div key={index} className="p-4 border-b flex items-center gap-4">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.establishment.name}</p>
                    <p className="text-blue-600 font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => setCart(cart.filter((_, i) => i !== index))}
                    className="text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-blue-600">R$ {total.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <select className="w-full border rounded-lg p-2">
                  <option>Dinheiro</option>
                  <option>PIX</option>
                  <option>Cartão</option>
                </select>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {showLogin && <LoginModal />}
      {showRegister && <RegisterModal />}

      {userType === 'admin' ? (
        <AdminDashboard />
      ) : userType === 'establishment' ? (
        <EstablishmentDashboard />
      ) : currentView === 'establishment-detail' ? (
        <EstablishmentDetail />
      ) : currentView === 'cart' ? (
        <CartView />
      ) : (
        <CustomerHome />
      )}
    </div>
  );
};

export default App;
