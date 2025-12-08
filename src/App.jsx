import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Bell, User, Menu, X, Store, Home, Package, BarChart3, CreditCard, Users, Tag, Image, Settings, MessageSquare, MapPin, ChevronLeft, ChevronRight, Star, Phone, Plus, Edit, Trash2, Eye, Clock, TrendingUp } from 'lucide-react';
import { supabase } from './supabase'; // <- requer src/supabase.js e VITE_SUPABASE_* no .env

// App.jsx integrado ao Supabase
const App = () => {
  // estados de interface
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'establishment', 'customer'
  const [currentView, setCurrentView] = useState('home');
  const [data, setData] = useState({
    admin: null,
    establishments: [],
    categories: [],
    banners: [],
    recharges: [],
    vipPlans: []
  });
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
  const [loading, setLoading] = useState(true);

  // ---------- Carregar dados do Supabase ----------
  async function loadInitialData() {
    setLoading(true);
    try {
      // Estabelecimentos com produtos (assume tabela 'establishments' e 'products' com fk establishment_id)
      const { data: establishments, error: estError } = await supabase
        .from('establishments')
        .select('*, products(*)');
      if (estError) console.error('establishments error', estError);

      // Categorias
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');
      if (catError) console.error('categories error', catError);

      // Banners
      const { data: banners, error: banError } = await supabase
        .from('banners')
        .select('*');
      if (banError) console.error('banners error', banError);

      // Recharges (planos de recarga) - tabela 'plans_recharge' ou 'recharges'
      const { data: recharges, error: recError } = await supabase
        .from('plans_recharge')
        .select('*');
      if (recError) {
        // tenta nome alternativo
        const { data: recharges2, error: recError2 } = await supabase
          .from('recharges')
          .select('*');
        if (recError2) console.error('recharges error', recError2);
        else setData(prev => ({ ...prev, recharges: recharges2 || [] }));
      } else {
        setData(prev => ({ ...prev, recharges: recharges || [] }));
      }

      // VIP plans - tabela 'plans_vip' ou 'vip_plans'
      const { data: vipPlans, error: vipError } = await supabase
        .from('plans_vip')
        .select('*');
      if (vipError) {
        const { data: vip2, error: vipError2 } = await supabase
          .from('vip_plans')
          .select('*');
        if (vipError2) console.error('vip plans error', vipError2);
        else setData(prev => ({ ...prev, vipPlans: vip2 || [] }));
      } else {
        setData(prev => ({ ...prev, vipPlans: vipPlans || [] }));
      }

      // Admin (opcional) - tabela 'admin' (assume apenas 1 registro) ou 'admins'
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .limit(1)
        .single();
      if (adminError) {
        // tenta alternativa
        const { data: admin2, error: adminError2 } = await supabase
          .from('admins')
          .select('*')
          .limit(1)
          .single();
        if (adminError2) {
          console.log('admin table not found or error', adminError2);
        } else {
          setData(prev => ({ ...prev, admin: admin2 || null }));
        }
      } else {
        setData(prev => ({ ...prev, admin: adminData || null }));
      }

      // se as consultas comuns tiverem retornado, set em lote (para establishments, categories, banners)
      setData(prev => ({
        ...prev,
        establishments: establishments || prev.establishments || [],
        categories: categories || prev.categories || [],
        banners: banners || prev.banners || []
      }));
    } catch (err) {
      console.error('loadInitialData error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();

    // listener de auth (usuários clientes)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser({ email: session.user.email, id: session.user.id, name: session.user.user_metadata?.name || session.user.email });
        setUserType('customer');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Funções de login/logout ----------
  // login híbrido: tenta Supabase Auth para clientes; para admin/establishment usa dados carregados
  const handleLogin = async (email, password, type) => {
    if (type === 'customer') {
      try {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.warn('supabase auth signIn error:', error.message || error);
          // fallback: criar sessão local simulada
          setUser({ email, name: 'Cliente (simulado)' });
          setUserType('customer');
          setShowLogin(false);
        } else {
          // usuário autenticado
          setUser({ email: signInData.user.email, id: signInData.user.id, name: signInData.user.user_metadata?.name || signInData.user.email });
          setUserType('customer');
          setShowLogin(false);
        }
      } catch (err) {
        console.error('customer login err', err);
        // fallback local
        setUser({ email, name: 'Cliente (simulado)' });
        setUserType('customer');
        setShowLogin(false);
      }
    } else if (type === 'admin') {
      // verifica admin vindo do banco (caso exista)
      if (data.admin && data.admin.email === email && data.admin.password === password) {
        setUser(data.admin);
        setUserType('admin');
        setShowLogin(false);
        setCurrentView('admin-home');
        return;
      }
      // sem admin no banco: tenta comparar com campos estáticos (ANTIGO comportamento)
      if (email === 'admin@tanatela.com' && password === 'admin123') {
        setUser({ email: 'admin@tanatela.com', name: 'Administrador', logo: 'TÁ NA TELA' });
        setUserType('admin');
        setShowLogin(false);
        setCurrentView('admin-home');
      } else {
        alert('Credenciais de administrador inválidas');
      }
    } else if (type === 'establishment') {
      // procura estabelecimento nos dados carregados (assume senha em texto simples — ajuste conforme seu backend)
      const est = (data.establishments || []).find(e => e.email === email && e.password === password);
      if (est) {
        setUser(est);
        setUserType('establishment');
        setShowLogin(false);
        setCurrentView('establishment-home');
      } else {
        alert('Credenciais de estabelecimento inválidas');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // ignora se não tiver sessão
    }
    setUser(null);
    setUserType(null);
    setCurrentView('home');
  };

  // adicionar ao carrinho
  const addToCart = (product, establishment) => {
    setCart(prev => [...prev, { ...product, establishment }]);
  };

  // ---------- Componentes / Views (mantive sua estrutura e classes) ----------
  const LoginModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('customer');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-700">Entrar</h2>
            <button onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Acesso</label>
            <select
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="w-full border-2 border-yellow-400 rounded-lg p-2 focus:outline-none focus:border-yellow-600"
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
            className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-4 focus:outline-none focus:border-yellow-600"
          />

          <button
            onClick={() => handleLogin(email, password, loginType)}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg p-2 font-semibold hover:from-yellow-700 hover:to-yellow-600 transition"
          >
            Entrar
          </button>

          <div className="mt-4 text-center">
            <button className="w-full border-2 border-gray-300 rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
              <span>🔐</span> Entrar com Google
            </button>
          </div>

          <p className="text-center mt-4 text-sm text-gray-600">
            Não tem conta?{' '}
            <button
              onClick={() => { setShowLogin(false); setShowRegister(true); }}
              className="text-yellow-700 font-semibold hover:text-yellow-800"
            >
              Cadastrar
            </button>
          </p>

          {loginType !== 'customer' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-xs">
              <p className="font-semibold mb-1 text-gray-700">Dados de teste:</p>
              {loginType === 'admin' && <p className="text-gray-600">Email: admin@tanatela.com | Senha: admin123</p>}
              {loginType === 'establishment' && <p className="text-gray-600">Email: super@email.com | Senha: super123</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const RegisterModal = () => {
    const [registerType, setRegisterType] = useState('customer');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // simple registration for customer using Supabase Auth
    const handleRegister = async () => {
      if (registerType === 'customer') {
        try {
          const { data: signUpData, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
          });
          if (error) {
            alert('Erro ao cadastrar: ' + error.message);
          } else {
            alert('Verifique seu e-mail para confirmar a conta (se configurado).');
            setShowRegister(false);
          }
        } catch (err) {
          console.error('register err', err);
          alert('Erro no cadastro.');
        }
      } else {
        // establishment registration: cria registro na tabela 'establishments' via supabase
        try {
          const { data: newEst, error } = await supabase
            .from('establishments')
            .insert([{
              name,
              email,
              password, // ideal: não salvar senha em texto claro — melhorar depois
              category: 'Outro'
            }])
            .select()
            .single();
          if (error) {
            alert('Erro ao cadastrar estabelecimento: ' + error.message);
          } else {
            alert('Estabelecimento cadastrado. Peça ao admin para aprovar/login.');
            setShowRegister(false);
            loadInitialData();
          }
        } catch (err) {
          console.error('register est err', err);
          alert('Erro no cadastro.');
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-700">Cadastrar</h2>
            <button onClick={() => setShowRegister(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Cadastro</label>
            <select
              value={registerType}
              onChange={(e) => setRegisterType(e.target.value)}
              className="w-full border-2 border-yellow-400 rounded-lg p-2 focus:outline-none focus:border-yellow-600"
            >
              <option value="customer">Usuário Comum</option>
              <option value="establishment">Estabelecimento</option>
            </select>
          </div>

          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Nome completo" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />

          {registerType === 'establishment' && (
            <>
              <input type="text" placeholder="Nome do estabelecimento" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />
              <input type="text" placeholder="Telefone/WhatsApp" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />
              <input type="text" placeholder="Endereço" className="w-full border-2 border-yellow-400 rounded-lg p-2 mb-3 focus:outline-none focus:border-yellow-600" />
            </>
          )}

          <button onClick={handleRegister} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg p-2 font-semibold hover:from-yellow-700 hover:to-yellow-600 transition">
            Cadastrar
          </button>

          <p className="text-center mt-4 text-sm text-gray-600">
            Já tem conta?{' '}
            <button
              onClick={() => { setShowRegister(false); setShowLogin(true); }}
              className="text-yellow-700 font-semibold hover:text-yellow-800"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    );
  };

  const Header = () => (
    <header className="bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              <Menu size={24} />
            </button>
            <h1
              onClick={() => setCurrentView('home')}
              className="text-2xl font-bold text-white cursor-pointer drop-shadow-md"
            >
              TÁ NA TELA
            </h1>
          </div>

          {userType === 'customer' && (
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-yellow-700" size={20} />
                <input
                  type="text"
                  placeholder="Buscar produtos, serviços e estabelecimentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-yellow-600 rounded-lg focus:outline-none focus:border-yellow-700"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-white">
            {!user ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden md:block px-4 py-2 text-white font-semibold hover:bg-yellow-700 rounded-lg transition"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="hidden md:block px-4 py-2 bg-white text-yellow-600 font-semibold rounded-lg hover:bg-yellow-100 transition"
                >
                  Cadastrar
                </button>
              </>
            ) : (
              <>
                {userType === 'customer' && (
                  <>
                    <button className="relative hover:scale-110 transition">
                      <Heart size={24} />
                      {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </button>
                    <button className="relative hover:scale-110 transition" onClick={() => setCurrentView('cart')}>
                      <ShoppingCart size={24} />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <button className="relative hover:scale-110 transition">
                  <Bell size={24} />
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 hover:scale-105 transition">
                  <User size={24} />
                  <span className="hidden md:block">{user?.name}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {userType === 'customer' && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-yellow-700" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-yellow-600 rounded-lg focus:outline-none focus:border-yellow-700"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // --- CustomerHome, EstablishmentDetail, AdminDashboard, EstablishmentDashboard, CartView ---
  // Mantive sua lógica visual — apenas referenciei `data.*` que agora vem do Supabase
  const CustomerHome = () => {
    const sortedEstablishments = [...(data.establishments || [])].sort((a, b) => {
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
          <MapPin size={20} className="text-yellow-700" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border-2 border-yellow-400 rounded-lg px-3 py-1 focus:outline-none focus:border-yellow-600"
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
              src={data.banners?.[0]?.image || ''}
              alt="Banner"
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categorias</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(data.categories || []).map(cat => (
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
            {(selectedEstablishment.products || []).map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    R$ {Number(product.price).toFixed(2)}
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
                  {(data.establishments || []).map(est => (
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
                {(data.categories || []).map(cat => (
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
                {(data.recharges || []).map(plan => (
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
                {(data.banners || []).map(banner => (
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

  const EstablishmentDashboard = () => {
    const [estView, setEstView] = useState('home');

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-bold text-blue-600 mb-6">{user?.name}</h2>
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

            {estView === 'home' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500">Créditos</p>
                  <p className="text-2xl font-bold">{user?.credits || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500">Vendas</p>
                  <p className="text-2xl font-bold">{user?.sales || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500">Visitantes</p>
                  <p className="text-2xl font-bold">{user?.visits || 0}</p>
                </div>
              </div>
            </div>
          )}

          {estView === 'products' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Produtos</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(user?.products || []).map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4">
                    <img src={product.images?.[0]} alt={product.name} className="h-40 w-full object-cover mb-2 rounded" />
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <p className="text-blue-600 font-bold mb-2">R$ {Number(product.price).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button className="text-blue-600"><Edit size={18} /></button>
                      <button className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {estView === 'banners' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Banners</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(user?.banners || []).map(banner => (
                  <div key={banner.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <img src={banner.image} alt={`Banner ${banner.id}`} className="w-32 h-20 object-cover rounded" />
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

          {estView === 'sales' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Vendas Recentes</h1>
              <div className="bg-white rounded-lg shadow p-4">
                <p>Em breve, lista de vendas integradas com Supabase.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Carrinho</h1>
      {cart.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cart.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold text-lg">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-blue-600 font-bold mb-2">R$ {Number(item.price).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Loja: {item.establishment?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Modal de Produto (imagem grande)
  const ProductModal = () => {
    if (!selectedProduct) return null;

    const images = selectedProduct.images || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full p-4 relative">
          <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
          <div className="relative">
            {images.length > 0 && (
              <img src={images[imageIndex]} alt={selectedProduct.name} className="w-full h-96 object-cover rounded" />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------- Renderização principal ----------
  if (loading) return <div className="flex items-center justify-center h-screen text-2xl font-bold">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {showLogin && <LoginModal />}
      {showRegister && <RegisterModal />}
      {selectedProduct && <ProductModal />}

      <main>
        {!user && currentView === 'home' && <CustomerHome />}
        {userType === 'customer' && currentView === 'home' && <CustomerHome />}
        {userType === 'customer' && currentView === 'cart' && <CartView />}
        {userType === 'customer' && currentView === 'establishment-detail' && <EstablishmentDetail />}
        {userType === 'admin' && <AdminDashboard />}
        {userType === 'establishment' && <EstablishmentDashboard />}
      </main>
    </div>
  );
};

export default App;

