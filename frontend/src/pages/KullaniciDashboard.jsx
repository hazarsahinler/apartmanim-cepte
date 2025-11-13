import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { Home, Loader2 } from 'lucide-react';import { useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';

import { Bell, User, Home, AlertCircle, Loader2 } from 'lucide-react';import { useNavigate } from 'react-router-dom';

const KullaniciDashboard = () => {

  const navigate = useNavigate();import { toast } from 'react-toastify';

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);import { authService } from '../services/authService';import { Bell, User, Home, AlertCircle, Loader2 } from 'lucide-react';import { useNavigate } from 'react-router-dom';



  useEffect(() => {import { userDaireService } from '../services/userDaireService';

    const initPage = async () => {

      try {import NetworkStatusMonitor from '../components/NetworkStatusMonitor';import { toast } from 'react-toastify';

        setLoading(true);

        import { useTheme } from '../contexts/ThemeContext';

        if (!authService.isAuthenticated()) {

          navigate('/giris');import { authService } from '../services/authService';import { import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';

          return;

        }const KullaniciDashboard = () => {



        const userInfo = await authService.getUserInfo();  const navigate = useNavigate();import { userDaireService } from '../services/userDaireService';

        setUser(userInfo);

  const { darkMode } = useTheme();

      } catch (err) {

        console.error('Hata:', err);  const [loading, setLoading] = useState(true);import NetworkStatusMonitor from '../components/NetworkStatusMonitor';  Bell, User, Home, Clock, ChevronRight, 

      } finally {

        setLoading(false);  const [user, setUser] = useState(null);

      }

    };  const [error, setError] = useState(null);import UserSidebar from '../components/UserSidebar';



    initPage();  const [daireInfo, setDaireInfo] = useState(null);

  }, [navigate]);

import { useTheme } from '../contexts/ThemeContext';  Loader2, AlertCircle, CreditCard, Building,import { import { 

  if (loading) {

    return (  useEffect(() => {

      <div className="min-h-screen flex items-center justify-center">

        <Loader2 className="h-12 w-12 text-green-500 animate-spin" />    const initializePage = async () => {

      </div>

    );      try {

  }

        setLoading(true);const KullaniciDashboard = () => {  LogOut, Menu, X, Moon, Sun, MapPin, DollarSign

  return (

    <div className="min-h-screen bg-gray-50">        

      <nav className="bg-white shadow-md p-4">

        <div className="flex items-center">        if (!authService.isAuthenticated()) {  const navigate = useNavigate();

          <Home className="h-6 w-6 text-green-500 mr-2" />

          <span className="text-xl font-bold">Apartman'ım Cepte</span>          navigate('/giris');

        </div>

      </nav>          return;  const { darkMode } = useTheme();} from 'lucide-react';  Bell, User, Home, Clock, ChevronRight,   Bell, User, Home, Clock, ChevronRight, 

      

      <div className="container mx-auto px-4 py-8">        }

        <h1 className="text-3xl font-bold mb-4">

          Hoş Geldiniz, {user?.kullaniciAdi || 'Kullanıcı'}!  const [loading, setLoading] = useState(true);

        </h1>

        <p className="text-gray-600">        const userInfo = await authService.getUserInfo();

          Apartman sakin paneline hoşgeldiniz.

        </p>        setUser(userInfo);  const [user, setUser] = useState(null);import { toast } from 'react-toastify';

      </div>

    </div>

  );

};        const decodedToken = authService.decodeToken();  const [error, setError] = useState(null);



export default KullaniciDashboard;        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;

          const [daireInfo, setDaireInfo] = useState(null);import { authService } from '../services/authService';  Loader2, AlertCircle, CreditCard, Building,  Loader2, AlertCircle, CreditCard, Building,

        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {

          toast.error('Bu sayfa sadece apartman sakinleri içindir.');

          navigate('/site-yonetimi');

          return;  useEffect(() => {import { userDaireService } from '../services/userDaireService';

        }

    const initializePage = async () => {

        try {

          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);      try {import NetworkStatusMonitor from '../components/NetworkStatusMonitor';  LogOut, Menu, X, Moon, Sun, MapPin, DollarSign  LogOut, Menu, X, Moon, Sun, MapPin, DollarSign

          const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);

          setDaireInfo(formattedDaire);        setLoading(true);

        } catch (dairErr) {

          console.warn('Daire bilgisi alınamadı:', dairErr.message);        import UserSidebar from '../components/UserSidebar';

          toast.warn(dairErr.message);

          setDaireInfo(null);        if (!authService.isAuthenticated()) {

        }

          navigate('/giris');import { useTheme } from '../contexts/ThemeContext';} from 'lucide-react';} from 'lucide-react';

      } catch (err) {

        console.error('Sayfa yüklenirken hata:', err);          return;

        setError(err.message);

        toast.error('Sayfa yüklenirken bir hata oluştu.');        }

      } finally {

        setLoading(false);

      }

    };        const userInfo = await authService.getUserInfo();const KullaniciDashboard = () => {import { toast } from 'react-toastify';import { toast } from 'react-toastify';



    initializePage();        setUser(userInfo);

  }, [navigate]);

  const navigate = useNavigate();

  const handleLogout = () => {

    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {        const decodedToken = authService.decodeToken();

      authService.logout();

    }        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;  const { darkMode, toggleTheme } = useTheme();import { authService } from '../services/authService';import { authService } from '../services/authService';

  };

        

  if (loading) {

    return (        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {  const [loading, setLoading] = useState(true);

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">

        <div className="text-center">          toast.error('Bu sayfa sadece apartman sakinleri içindir.');

          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto" />

          <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>          navigate('/site-yonetimi');  const [user, setUser] = useState(null);import { userDaireService } from '../services/userDaireService';import { userDaireService } from '../services/userDaireService';

        </div>

      </div>          return;

    );

  }        }  const [error, setError] = useState(null);



  if (error) {

    return (

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">        try {  const [isSidebarOpen, setIsSidebarOpen] = useState(false);import NetworkStatusMonitor from '../components/NetworkStatusMonitor';import NetworkStatusMonitor from '../components/NetworkStatusMonitor';

        <div className="text-center">

          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h2>

          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>          const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);  const [daireInfo, setDaireInfo] = useState(null);

          <button

            onClick={() => window.location.reload()}          setDaireInfo(formattedDaire);

            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

          >        } catch (dairErr) {  const [finansalOzet, setFinansalOzet] = useState(null);import UserSidebar from '../components/UserSidebar';import UserSidebar from '../components/UserSidebar';

            Tekrar Dene

          </button>          console.warn('Daire bilgisi alınamadı:', dairErr.message);

        </div>

      </div>          toast.warn(dairErr.message);

    );

  }          setDaireInfo(null);



  return (        }  useEffect(() => {import { useTheme } from '../contexts/ThemeContext';import { useTheme } from '../contexts/ThemeContext';

    <>

      <NetworkStatusMonitor />

      

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">      } catch (err) {    const initializePage = async () => {

        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        console.error('Sayfa yüklenirken hata:', err);

            <div className="flex justify-between items-center h-16">

              <div className="flex items-center">        setError(err.message);      try {

                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">

                  <Home className="h-6 w-6 text-white" />        toast.error('Sayfa yüklenirken bir hata oluştu.');

                </div>

                <span className="text-xl font-bold text-gray-900 dark:text-white">      } finally {        setLoading(true);

                  Apartman'ım Cepte

                </span>        setLoading(false);

              </div>

              <button      }        const KullaniciDashboard = () => {const KullaniciDashboard = () => {

                onClick={handleLogout}

                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"    };

              >

                Çıkış        if (!authService.isAuthenticated()) {

              </button>

            </div>    initializePage();

          </div>

        </nav>  }, [navigate]);          navigate('/giris');  const navigate = useNavigate();  const navigate = useNavigate();

        

        <div className="pt-16">

          <div className="container mx-auto px-4 py-8">

            <div className="mb-8">  const handleLogout = () => {          return;

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {

              </h1>

              <p className="text-gray-600 dark:text-gray-400">      authService.logout();        }  const { darkMode, toggleTheme } = useTheme();  const { darkMode, toggleTheme } = useTheme();

                {daireInfo 

                  ? `${daireInfo.adres} - Apartman bilgilerinizi takip edin.`    }

                  : 'Daire bilgileri yüklendiğinde apartman özelliklerine erişebilirsiniz.'

                }  };

              </p>

            </div>



            {!daireInfo && (  if (loading) {        const userInfo = await authService.getUserInfo();  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">

                <div className="flex">    return (

                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />

                  <div>      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">        setUser(userInfo);

                    <h3 className="text-sm font-medium text-amber-800">

                      Daire Bilginiz Bulunamadı        <div className="text-center">

                    </h3>

                    <p className="mt-2 text-sm text-amber-700">          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto" />  const [user, setUser] = useState(null);  const [user, setUser] = useState(null);

                      Hesabınıza henüz bir daire atanmamış. Site yöneticisi ile iletişime geçiniz.

                    </p>          <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>

                  </div>

                </div>        </div>        const decodedToken = authService.decodeToken();

              </div>

            )}      </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">    );        let userRole = userInfo.apartmanRol || decodedToken.apartmanRol;  const [duyurular, setDuyurular] = useState([]);  const [duyurular, setDuyurular] = useState([]);

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">

                <div className="flex items-center">  }

                  <User className="w-10 h-10 text-blue-600 mr-4" />

                  <div>        

                    <h3 className="font-semibold text-gray-900 dark:text-white">Profil Bilgilerim</h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>  if (error) {

                  </div>

                </div>    return (        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {  const [error, setError] = useState(null);  const [error, setError] = useState(null);

              </div>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">

                <div className="flex items-center">        <div className="text-center">          toast.error('Bu sayfa sadece apartman sakinleri içindir.');

                  <Home className="w-10 h-10 text-purple-600 mr-4" />

                  <div>          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

                    <h3 className="font-semibold text-gray-900 dark:text-white">Daire Bilgim</h3>

                    {daireInfo ? (          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h2>          navigate('/site-yonetimi');  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

                      <p className="text-sm text-gray-600 dark:text-gray-400">{daireInfo.kisaAdres}</p>

                    ) : (          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">Daire atanmamış</p>

                    )}          <button          return;

                  </div>

                </div>            onClick={() => window.location.reload()}

              </div>

            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"        }  const [daireInfo, setDaireInfo] = useState(null);  const [daireInfo, setDaireInfo] = useState(null);

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">

                <div className="flex items-center">          >

                  <Bell className="w-10 h-10 text-green-600 mr-4" />

                  <div>            Tekrar Dene

                    <h3 className="font-semibold text-gray-900 dark:text-white">Duyurular</h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400">          </button>

                      {daireInfo ? 'Duyuruları görüntüleyin' : 'Daire atama sonrası erişilebilir'}

                    </p>        </div>        try {  const [finansalOzet, setFinansalOzet] = useState(null);  const [finansalOzet, setFinansalOzet] = useState(null);

                  </div>

                </div>      </div>

              </div>

            </div>    );          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);

          </div>

        </div>  }

      </div>

    </>          const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);

  );

};  return (



export default KullaniciDashboard;    <>          setDaireInfo(formattedDaire);

      <NetworkStatusMonitor />

                  const toggleSidebar = () => {  const toggleSidebar = () => {

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">          userDaireService.saveDaireBilgileri(formattedDaire);

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center h-16">              setIsSidebarOpen(!isSidebarOpen);    setIsSidebarOpen(!isSidebarOpen);

              <div className="flex items-center">

                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">          const finansal = await userDaireService.getKullaniciFinansalOzet(daireBilgileri.daireId);

                  <Home className="h-6 w-6 text-white" />

                </div>          setFinansalOzet(finansal);  };  };

                <span className="text-xl font-bold text-gray-900 dark:text-white">

                  Apartman'ım Cepte          

                </span>

              </div>        } catch (dairErr) {

              <button

                onClick={handleLogout}          console.warn('Daire bilgisi alınamadı:', dairErr.message);

                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"

              >          toast.warn(dairErr.message);  const handleLogout = () => {  const handleLogout = () => {

                Çıkış

              </button>          setDaireInfo(null);

            </div>

          </div>        }    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {

        </nav>

        

        <div className="pt-16">

          <div className="container mx-auto px-4 py-8">      } catch (err) {      authService.logout();      authService.logout();

            <div className="mb-8">

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">        console.error('Sayfa yüklenirken hata:', err);

                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!

              </h1>        setError(err.message);    }    }

              <p className="text-gray-600 dark:text-gray-400">

                {daireInfo         toast.error('Sayfa yüklenirken bir hata oluştu.');

                  ? `${daireInfo.adres} - Apartman bilgilerinizi takip edin.`

                  : 'Daire bilgileri yüklendiğinde apartman özelliklerine erişebilirsiniz.'      } finally {  };  };

                }

              </p>        setLoading(false);

            </div>

      }

            {!daireInfo && (

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">    };

                <div className="flex">

                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />  // Sayfa yüklendiğinde kullanıcı bilgilerini çek  // Sayfa yüklendiğinde kullanıcı bilgilerini çek

                  <div>

                    <h3 className="text-sm font-medium text-amber-800">    initializePage();

                      Daire Bilginiz Bulunamadı

                    </h3>  }, [navigate]);  useEffect(() => {  useEffect(() => {

                    <p className="mt-2 text-sm text-amber-700">

                      Hesabınıza henüz bir daire atanmamış. Site yöneticisi ile iletişime geçiniz.

                    </p>

                  </div>  const handleLogout = () => {    const initializePage = async () => {    const initializePage = async () => {

                </div>

              </div>    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {

            )}

      authService.logout();      try {      try {

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">    }

                <div className="flex items-center">

                  <User className="w-10 h-10 text-blue-600 mr-4" />  };        setLoading(true);        setLoading(true);

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">Profil Bilgilerim</h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>

                  </div>  if (loading) {                

                </div>

              </div>    return (



              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">        // Auth kontrolü        // Auth kontrolü

                <div className="flex items-center">

                  <Home className="w-10 h-10 text-purple-600 mr-4" />        <div className="text-center">

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">Daire Bilgim</h3>          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto" />        if (!authService.isAuthenticated()) {        if (!authService.isAuthenticated()) {

                    {daireInfo ? (

                      <p className="text-sm text-gray-600 dark:text-gray-400">{daireInfo.kisaAdres}</p>          <p className="mt-4 text-gray-600 dark:text-gray-300">Yükleniyor...</p>

                    ) : (

                      <p className="text-sm text-gray-600 dark:text-gray-400">Daire atanmamış</p>        </div>          navigate('/giris');          navigate('/giris');

                    )}

                  </div>      </div>

                </div>

              </div>    );          return;          return;



              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">  }

                <div className="flex items-center">

                  <Bell className="w-10 h-10 text-green-600 mr-4" />        }        }

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">Duyurular</h3>  if (error) {

                    <p className="text-sm text-gray-600 dark:text-gray-400">

                      {daireInfo ? 'Duyuruları görüntüleyin' : 'Daire atama sonrası erişilebilir'}    return (

                    </p>

                  </div>      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">

                </div>

              </div>        <div className="text-center">        // Kullanıcı bilgilerini al        // Kullanıcı bilgilerini al

            </div>

          </div>          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

        </div>

      </div>          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h2>        const userInfo = await authService.getUserInfo();        const userInfo = await authService.getUserInfo();

    </>

  );          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>

};

          <button        setUser(userInfo);        setUser(userInfo);

export default KullaniciDashboard;
            onClick={() => window.location.reload()}

            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"        console.log('KullaniciDashboard - userInfo:', userInfo);

          >

            Tekrar Dene        // Token'dan rol bilgisini de al

          </button>

        </div>        const decodedToken = authService.decodeToken();        // Token'dan rol bilgisini de al

      </div>

    );                const decodedToken = authService.decodeToken();

  }

        // Kullanıcının sakin olup olmadığını kontrol et        console.log('KullaniciDashboard - decodedToken:', decodedToken);

  return (

    <>        let userRole = userInfo.apartmanRol;        

      <NetworkStatusMonitor />

                      // Kullanıcının sakin olup olmadığını kontrol et

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* Navigation */}        // Eğer API'dan rol gelmiyorsa token'dan al        let userRole = userInfo.apartmanRol;

        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        if (userRole === null || userRole === undefined) {        

            <div className="flex justify-between items-center h-16">

              <div className="flex items-center">          userRole = decodedToken.apartmanRol;        // Eğer API'dan rol gelmiyorsa token'dan al

                <button

                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}        }        if (userRole === null || userRole === undefined) {

                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"

                >                  userRole = decodedToken.apartmanRol;

                  {isSidebarOpen ? (

                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {        }

                  ) : (

                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />          toast.error('Bu sayfa sadece apartman sakinleri içindir.');        

                  )}

                </button>          navigate('/site-yonetimi');        console.log('KullaniciDashboard - Final userRole:', userRole);

                <div className="flex items-center">

                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">          return;        

                    <Home className="h-6 w-6 text-white" />

                  </div>        }        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {

                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">

                    Apartman'ım Cepte          console.log('Bu sayfa sadece apartman sakinleri için, kullanıcı rolü:', userRole);

                  </span>

                </div>        // Kullanıcının daire bilgilerini çek          toast.error('Bu sayfa sadece apartman sakinleri içindir.');

              </div>

        try {          navigate('/site-yonetimi');

              <div className="flex items-center space-x-4">

                <button          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);          return;

                  onClick={toggleTheme}

                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"          const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);        }

                >

                  {darkMode ? (          setDaireInfo(formattedDaire);

                    <Sun className="h-5 w-5 text-yellow-500" />

                  ) : (                  // Kullanıcının daire bilgilerini çek

                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />

                  )}          // Daire bilgilerini localStorage'da sakla        try {

                </button>

          userDaireService.saveDaireBilgileri(formattedDaire);          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);

                <div className="hidden md:flex items-center space-x-3">

                  <div className="text-right">                    const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);

                    <p className="text-sm font-medium text-gray-900 dark:text-white">

                      {user?.kullaniciAdi} {user?.kullaniciSoyadi}          // Finansal özet bilgilerini çek          setDaireInfo(formattedDaire);

                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>          const finansal = await userDaireService.getKullaniciFinansalOzet(daireBilgileri.daireId);          

                  </div>

                  <User className="h-8 w-8 text-green-600 dark:text-green-300" />          setFinansalOzet(finansal);          // Daire bilgilerini localStorage'da sakla

                </div>

                                    userDaireService.saveDaireBilgileri(formattedDaire);

                <button

                  onClick={handleLogout}        } catch (dairErr) {          

                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800"

                >          console.warn('Daire bilgisi alınamadı:', dairErr.message);          // Finansal özet bilgilerini çek

                  <LogOut className="h-4 w-4" />

                  <span className="hidden sm:inline">Çıkış</span>          toast.warn(dairErr.message);          const finansal = await userDaireService.getKullaniciFinansalOzet(daireBilgileri.daireId);

                </button>

              </div>          setDaireInfo(null);          setFinansalOzet(finansal);

            </div>

          </div>        }          

        </nav>

          console.log('KullaniciDashboard - Daire bilgileri:', formattedDaire);

        {/* Sidebar */}

        {isSidebarOpen && (        // Duyuruları mock data olarak set et          console.log('KullaniciDashboard - Finansal özet:', finansal);

          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>

        )}        setDuyurular([          

        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                  {        } catch (dairErr) {

        {/* Main Content */}

        <div className="pt-16 ml-0 lg:ml-64">            id: 1,          console.warn('Daire bilgisi alınamadı:', dairErr.message);

          <div className="container mx-auto px-4 py-8">

                        baslik: 'Genel temizlik duyurusu',          toast.warn(dairErr.message);

            {/* Header */}

            <div className="mb-8">            icerik: 'Yarın saat 09:00\'da apartman genel temizliği yapılacaktır.',          setDaireInfo(null);

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!            tarih: '2024-01-15',        }

              </h1>

              <p className="text-gray-600 dark:text-gray-400">            okundu: false

                {daireInfo 

                  ? `${daireInfo.adres} - Apartman bilgilerinizi takip edin.`          },        // TODO: Kullanıcının dairesine göre duyuruları çek

                  : 'Daire bilgileri yüklendiğinde apartman özelliklerine erişebilirsiniz.'

                }          {        if (daireInfo && daireInfo.siteId) {

              </p>

            </div>            id: 2,          // Gelecekte site bazında duyurular çekilebilir



            {/* Quick Actions */}            baslik: 'Asansör bakımı',          setDuyurular([

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              <button            icerik: 'Asansör bakımı pazartesi günü saat 14:00-16:00 arası yapılacaktır.',            {

                onClick={() => navigate('/duyurular')}

                disabled={!daireInfo}            tarih: '2024-01-14',              id: 1,

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all text-left ${

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''            okundu: true              baslik: 'Genel temizlik duyurusu',

                }`}

              >          }              icerik: 'Yarın saat 09:00\'da apartman genel temizliği yapılacaktır.',

                <Bell className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />

                <h3 className="font-semibold text-gray-900 dark:text-white">Duyurular</h3>        ]);              tarih: '2024-01-15',

                <p className="text-sm text-gray-600 dark:text-gray-400">Apartman duyurularını görün</p>

              </button>              okundu: false



              <button      } catch (err) {            },

                onClick={() => navigate('/profil')}

                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all text-left"        console.error('Sayfa yüklenirken hata:', err);            {

              >

                <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />        setError(err.message);              id: 2,

                <h3 className="font-semibold text-gray-900 dark:text-white">Profil</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">Bilgilerinizi düzenleyin</p>        toast.error('Sayfa yüklenirken bir hata oluştu.');              baslik: 'Asansör bakımı',

              </button>

      } finally {              icerik: 'Asansör bakımı pazartesi günü saat 14:00-16:00 arası yapılacaktır.',

              <button

                onClick={() => navigate('/aidat-bilgilerim')}        setLoading(false);              tarih: '2024-01-14',

                disabled={!daireInfo}

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all text-left ${      }              okundu: true

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''

                }`}    };            }

              >

                <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />          ]);

                <h3 className="font-semibold text-gray-900 dark:text-white">Aidat Bilgilerim</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">Ödemelerinizi görün</p>    initializePage();        } else {

              </button>

  }, [navigate]);          setDuyurular([]);

              <button

                onClick={() => navigate('/finansal-ozet')}        }

                disabled={!daireInfo}

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all text-left ${  const handleProfile = () => {

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''

                }`}    navigate('/profil');      } catch (err) {

              >

                <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />  };        console.error('Sayfa yüklenirken hata:', err);

                <h3 className="font-semibold text-gray-900 dark:text-white">Finansal Özet</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">Gelir-gider takibi</p>        setError(err.message);

              </button>

            </div>  const handleDuyuruDetay = (duyuruId) => {        toast.error('Sayfa yüklenirken bir hata oluştu.');



            {/* Info Cards */}    navigate(`/duyuru/${duyuruId}`);      } finally {

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">  };        setLoading(false);

                <div className="flex items-center">

                  <User className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-4" />      }

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">Profil Bilgilerim</h3>  if (loading) {    };

                    <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>

                    <p className="text-xs text-gray-500">{user?.kullaniciTelefon || user?.telefonNumarasi || user?.telefon}</p>    return (

                  </div>

                </div>      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">    initializePage();

              </div>

        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">  }, [navigate]);

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">

                <div className="flex items-center">          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                  <Home className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />

                  <div>            <div className="flex justify-between items-center h-16">  const handleProfile = () => {

                    <h3 className="font-semibold text-gray-900 dark:text-white">Daire Bilgim</h3>

                    {daireInfo ? (              <div className="flex items-center">    navigate('/profil');

                      <>

                        <p className="text-sm text-gray-600 dark:text-gray-400">{daireInfo.kisaAdres}</p>                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">  };

                        <p className="text-xs text-gray-500">{daireInfo.katNo}. Kat</p>

                      </>                  <Home className="h-6 w-6 text-white" />

                    ) : (

                      <p className="text-sm text-gray-600 dark:text-gray-400">Daire atanmamış</p>                </div>  const handleDuyuruDetay = (duyuruId) => {

                    )}

                  </div>                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">    navigate(`/duyuru/${duyuruId}`);

                </div>

              </div>                  Apartman'ım Cepte  };



              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">                </span>

                <div className="flex items-center">

                  <Building className="w-10 h-10 text-green-600 dark:text-green-400 mr-4" />              </div>  if (loading) {

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white">Site Bilgim</h3>              <div className="flex items-center space-x-4">    return (

                    {daireInfo ? (

                      <>                <Loader2 className="h-6 w-6 text-green-500 animate-spin" />      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

                        <p className="text-sm text-gray-600 dark:text-gray-400">{daireInfo.siteIsmi}</p>

                        <div className="flex items-center mt-1">                <span className="text-sm text-gray-600 dark:text-gray-300">Yükleniyor...</span>        <nav className="bg-white shadow-md fixed w-full top-0 z-50">

                          <MapPin className="w-3 h-3 text-gray-400 mr-1" />

                          <p className="text-xs text-gray-500">{daireInfo.siteAdresi}</p>              </div>          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        </div>

                      </>            </div>            <div className="flex justify-between items-center h-16">

                    ) : (

                      <p className="text-sm text-gray-600 dark:text-gray-400">Site bilgisi yok</p>          </div>              <div className="flex items-center">

                    )}

                  </div>        </nav>                <button onClick={toggleSidebar} className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden">

                </div>

              </div>        <div className="pt-16 flex justify-center items-center h-screen">                  {isSidebarOpen ? (<X className="h-6 w-6 text-gray-600" />) : (<Menu className="h-6 w-6 text-gray-600" />)}

            </div>

          <div className="flex flex-col items-center">                </button>

            {/* Financial Summary */}

            {daireInfo && finansalOzet && (            <Loader2 className="h-12 w-12 text-green-500 animate-spin" />                <div className="flex items-center">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">            <span className="mt-4 text-gray-600 dark:text-gray-300">Kullanıcı bilgileri yükleniyor...</span>                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">

                  <div className="flex items-center justify-between">

                    <div>          </div>                    <Home className="h-6 w-6 text-white" />

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Borcum</p>

                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">        </div>                  </div>

                        ₺{finansalOzet.toplamBorc?.toLocaleString('tr-TR') || '0'}

                      </p>      </div>                  <span className="text-xl font-bold text-gray-900 hidden sm:block">Apartman'ım Cepte</span>

                    </div>

                    <CreditCard className="h-8 w-8 text-red-600 dark:text-red-400" />    );                </div>

                  </div>

                </div>  }              </div>

                

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">              <div className="flex items-center space-x-4">

                  <div className="flex items-center justify-between">

                    <div>  if (error) {                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={darkMode ? 'Açık tema' : 'Karanlık tema'}>

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödenen Tutar</p>

                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">    return (                  {darkMode ? (<Sun className="h-5 w-5 text-yellow-500" />) : (<Moon className="h-5 w-5 text-gray-600" />)}

                        ₺{finansalOzet.odenenTutar?.toLocaleString('tr-TR') || '0'}

                      </p>      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">                </button>

                    </div>

                    <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">                <div className="hidden md:flex items-center space-x-3">

                  </div>

                </div>          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                  <div className="text-right">

                

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">            <div className="flex justify-between items-center h-16">                    <p className="text-sm font-medium text-gray-900 dark:text-white">Yükleniyor...</p>

                  <div className="flex items-center justify-between">

                    <div>              <div className="flex items-center">                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödeme</p>

                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">                  </div>

                        {finansalOzet.bekleyenOdemeler || 0}

                      </p>                  <Home className="h-6 w-6 text-white" />                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">

                    </div>

                    <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />                </div>                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />

                  </div>

                </div>                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">                  </div>

                

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">                  Apartman'ım Cepte                </div>

                  <div className="flex items-center justify-between">

                    <div>                </span>                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Son Ödeme</p>

                      <p className="text-sm font-medium text-gray-900 dark:text-white">              </div>                  <LogOut className="h-5 w-5" />

                        {finansalOzet.sonOdeme || 'Henüz ödeme yok'}

                      </p>            </div>                  <span className="hidden sm:inline">Çıkış</span>

                    </div>

                    <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />          </div>                </button>

                  </div>

                </div>        </nav>              </div>

              </div>

            )}        <div className="pt-16 flex justify-center items-center h-screen">            </div>



            {/* No Apartment Warning */}          <div className="text-center">          </div>

            {!daireInfo && (

              <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-6 mb-8">            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />        </nav>

                <div className="flex">

                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>        {isSidebarOpen && (

                  <div>

                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>

                      Daire Bilginiz Bulunamadı

                    </h3>            <button        )}

                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">

                      Hesabınıza henüz bir daire atanmamış. Site yöneticisi ile iletişime geçiniz.              onClick={() => window.location.reload()}        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                    </p>

                  </div>              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"        <div className="pt-16 ml-0 lg:ml-64">

                </div>

              </div>            >          <div className="flex justify-center items-center h-screen">

            )}

              Tekrar Dene            <div className="flex flex-col items-center">

            {/* Recent Announcements */}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">            </button>              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />

              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">          </div>              <span className="mt-4 text-gray-600 dark:text-gray-300">Kullanıcı bilgileri yükleniyor...</span>

                  <Bell className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />

                  Son Duyurular        </div>            </div>

                </h3>

              </div>      </div>          </div>

              

              <div className="p-6 text-center">    );        </div>

                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                <p className="text-gray-500 dark:text-gray-400">  }      </div>

                  {!daireInfo ? 'Daire bilginiz olmadığı için duyurular görüntülenemiyor.' : 'Henüz duyuru bulunmuyor.'}

                </p>    );

              </div>

            </div>  return (  }



          </div>    <>

        </div>

      </div>      <NetworkStatusMonitor />  if (error) {

    </>

  );          return (

};

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

export default KullaniciDashboard;
        {/* Top Navigation Bar */}        <nav className="bg-white shadow-md fixed w-full top-0 z-50">

        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="flex justify-between items-center h-16">

            <div className="flex justify-between items-center h-16">              <div className="flex items-center">

              {/* Left: Logo & Menu Button */}                <button onClick={toggleSidebar} className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden">

              <div className="flex items-center">                  {isSidebarOpen ? (<X className="h-6 w-6 text-gray-600" />) : (<Menu className="h-6 w-6 text-gray-600" />)}

                <button                </button>

                  onClick={toggleSidebar}                <div className="flex items-center">

                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">

                >                    <Home className="h-6 w-6 text-white" />

                  {isSidebarOpen ? (                  </div>

                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />                  <span className="text-xl font-bold text-gray-900 hidden sm:block">Apartman'ım Cepte</span>

                  ) : (                </div>

                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />              </div>

                  )}              <div className="flex items-center space-x-4">

                </button>                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={darkMode ? 'Açık tema' : 'Karanlık tema'}>

                <div className="flex items-center">                  {darkMode ? (<Sun className="h-5 w-5 text-yellow-500" />) : (<Moon className="h-5 w-5 text-gray-600" />)}

                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">                </button>

                    <Home className="h-6 w-6 text-white" />                <div className="hidden md:flex items-center space-x-3">

                  </div>                  <div className="text-right">

                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">                    <p className="text-sm font-medium text-gray-900 dark:text-white">Hata Oluştu</p>

                    Apartman'ım Cepte                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>

                  </span>                  </div>

                </div>                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">

              </div>                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />

                  </div>

              {/* Right: Theme Toggle, User Info & Logout */}                </div>

              <div className="flex items-center space-x-4">                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">

                {/* Theme Toggle Button */}                  <LogOut className="h-5 w-5" />

                <button                  <span className="hidden sm:inline">Çıkış</span>

                  onClick={toggleTheme}                </button>

                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"              </div>

                  title={darkMode ? 'Açık tema' : 'Karanlık tema'}            </div>

                >          </div>

                  {darkMode ? (        </nav>

                    <Sun className="h-5 w-5 text-yellow-500" />        {isSidebarOpen && (

                  ) : (          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>

                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />        )}

                  )}        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                </button>        <div className="pt-16 ml-0 lg:ml-64">

          <div className="flex justify-center items-center h-screen">

                <div className="hidden md:flex items-center space-x-3">            <div className="text-center">

                  <div className="text-right">              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

                    <p className="text-sm font-medium text-gray-900 dark:text-white">              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>

                      Hoşgeldin, {user?.kullaniciAdi} {user?.kullaniciSoyadi}              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>

                    </p>              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>                Tekrar Dene

                  </div>              </button>

                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">            </div>

                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />          </div>

                  </div>        </div>

                </div>      </div>

                <button    );

                  onClick={handleLogout}  }

                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"

                >  return (

                  <LogOut className="h-5 w-5" />    <>

                  <span className="hidden sm:inline">Çıkış</span>      <NetworkStatusMonitor />

                </button>      

              </div>      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

            </div>        {/* Top Navigation Bar */}

          </div>        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">

        </nav>          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center h-16">

        {/* Mobile Sidebar Overlay */}              {/* Left: Logo & Menu Button */}

        {isSidebarOpen && (              <div className="flex items-center">

          <div                <button

            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"                  onClick={toggleSidebar}

            onClick={() => setIsSidebarOpen(false)}                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"

          ></div>                >

        )}                  {isSidebarOpen ? (

                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />

        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />                  ) : (

                            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />

        <div className="pt-16 ml-0 lg:ml-64">                  )}

          <div className="container mx-auto px-4 py-6 lg:py-8">                </button>

            {/* Hoş Geldiniz Başlığı */}                <div className="flex items-center">

            <div className="mb-6 lg:mb-8">                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">                    <Home className="h-6 w-6 text-white" />

                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!                  </div>

              </h1>                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">

              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">                    Apartman'ım Cepte

                {daireInfo                   </span>

                  ? `${daireInfo.adres} - Apartman bilgilerinizi ve duyurularınızı takip edebilirsiniz.`                </div>

                  : 'Daire bilgileriniz yüklendiğinde apartman özelliklerine erişebilirsiniz.'              </div>

                }

              </p>              {/* Right: Theme Toggle, User Info & Logout */}

            </div>              <div className="flex items-center space-x-4">

                {/* Theme Toggle Button */}

            {/* Hızlı Eylemler */}                <button

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">                  onClick={toggleTheme}

              <button                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"

                onClick={() => navigate('/duyurular')}                  title={darkMode ? 'Açık tema' : 'Karanlık tema'}

                disabled={!daireInfo}                >

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${                  {darkMode ? (

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''                    <Sun className="h-5 w-5 text-yellow-500" />

                }`}                  ) : (

              >                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />

                <div className="flex items-center">                  )}

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">                </button>

                    <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />

                  </div>                <div className="hidden md:flex items-center space-x-3">

                  <div className="flex-1">                  <div className="text-right">

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Duyurular</h3>                    <p className="text-sm font-medium text-gray-900 dark:text-white">

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Apartman duyurularını görüntüle</p>                      Hoşgeldin, {user?.kullaniciAdi} {user?.kullaniciSoyadi}

                  </div>                    </p>

                </div>                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>

                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />                  </div>

              </button>                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">

                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />

              <button                  </div>

                onClick={handleProfile}                </div>

                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"                <button

              >                  onClick={handleLogout}

                <div className="flex items-center">                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">                >

                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />                  <LogOut className="h-5 w-5" />

                  </div>                  <span className="hidden sm:inline">Çıkış</span>

                  <div className="flex-1">                </button>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil</h3>              </div>

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Kişisel bilgilerinizi düzenleyin</p>            </div>

                  </div>          </div>

                </div>        </nav>

                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />

              </button>        {/* Mobile Sidebar Overlay */}

        {isSidebarOpen && (

              <button          <div

                onClick={() => navigate('/aidat-bilgilerim')}            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"

                disabled={!daireInfo}            onClick={() => setIsSidebarOpen(false)}

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${          ></div>

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''        )}

                }`}

              >        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <div className="flex items-center">        

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">        <div className="pt-16 ml-0 lg:ml-64">

                    <CreditCard className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />          <div className="container mx-auto px-4 py-6 lg:py-8">

                  </div>            {/* Hoş Geldiniz Başlığı */}

                  <div className="flex-1">            <div className="mb-6 lg:mb-8">

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Aidat Bilgilerim</h3>              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Aidat ödemelerinizi görüntüleyin</p>                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!

                  </div>              </h1>

                </div>              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">

                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />                {daireInfo 

              </button>                  ? `${daireInfo.adres} - Apartman bilgilerinizi ve duyurularınızı takip edebilirsiniz.`

                  : 'Daire bilgileriniz yüklendiğinde apartman özelliklerine erişebilirsiniz.'

              <button                }

                onClick={() => navigate('/finansal-ozet')}              </p>

                disabled={!daireInfo}            </div>

                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${

                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''            {/* Hızlı Eylemler */}

                }`}            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">

              >              <button

                <div className="flex items-center">                onClick={() => navigate('/duyurular')}

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">                disabled={!daireInfo}

                    <DollarSign className="w-5 lg:w-6 h-5 lg:h-6 text-orange-600 dark:text-orange-400" />                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${

                  </div>                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''

                  <div className="flex-1">                }`}

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Finansal Özet</h3>              >

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Gelir ve giderlerinizi görüntüleyin</p>                <div className="flex items-center">

                  </div>                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">

                </div>                    <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />

                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />                  </div>

              </button>                  <div className="flex-1">

            </div>                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Duyurular</h3>

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Apartman duyurularını görüntüle</p>

            {/* Kullanıcı Bilgi Kartları */}                  </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">                </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />

                <div className="flex items-center">              </button>

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">

                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />              <button

                  </div>                onClick={handleProfile}

                  <div>                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil Bilgilerim</h3>              >

                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{user?.email}</p>                <div className="flex items-center">

                    <p className="text-gray-500 dark:text-gray-500 text-xs">{user?.telefonNumarasi}</p>                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">

                  </div>                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />

                </div>                  </div>

              </div>                  <div className="flex-1">

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil</h3>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Kişisel bilgilerinizi düzenleyin</p>

                <div className="flex items-center">                  </div>

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">                </div>

                    <Home className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />

                  </div>              </button>

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Daire Bilgim</h3>              <button

                    {daireInfo ? (                onClick={() => navigate('/aidat-bilgilerim')}

                      <>                disabled={!daireInfo}

                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.kisaAdres}</p>                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${

                        <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.katNo}. Kat</p>                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''

                      </>                }`}

                    ) : (              >

                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Henüz daire atanmamış</p>                <div className="flex items-center">

                    )}                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">

                  </div>                    <CreditCard className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />

                </div>                  </div>

              </div>                  <div className="flex-1">

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Aidat Bilgilerim</h3>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Aidat ödemelerinizi görüntüleyin</p>

                <div className="flex items-center">                  </div>

                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">                </div>

                    <Building className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />

                  </div>              </button>

                  <div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Site Bilgim</h3>              <button

                    {daireInfo ? (                onClick={() => navigate('/finansal-ozet')}

                      <>                disabled={!daireInfo}

                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.siteIsmi}</p>                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${

                        <div className="flex items-center mt-1">                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''

                          <MapPin className="w-3 h-3 text-gray-400 mr-1" />                }`}

                          <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.siteAdresi}</p>              >

                        </div>                <div className="flex items-center">

                      </>                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">

                    ) : (                    <DollarSign className="w-5 lg:w-6 h-5 lg:h-6 text-orange-600 dark:text-orange-400" />

                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Site bilgisi bulunamadı</p>                  </div>

                    )}                  <div className="flex-1">

                  </div>                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Finansal Özet</h3>

                </div>                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Gelir ve giderlerinizi görüntüleyin</p>

              </div>                  </div>

            </div>                </div>

                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />

            {/* Finansal Özet */}              </button>

            {daireInfo && (            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">            {/* Kullanıcı Bilgi Kartları */}

                  <div className="flex items-center justify-between">            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">

                    <div>              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Borcum</p>                <div className="flex items-center">

                      <p className="text-xl font-bold text-red-600 dark:text-red-400">                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">

                        {finansalOzet?.toplamBorc ? `₺${finansalOzet.toplamBorc.toLocaleString('tr-TR')}` : '₺0'}                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />

                      </p>                  </div>

                    </div>                  <div>

                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil Bilgilerim</h3>

                      <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{user?.email}</p>

                    </div>                    <p className="text-gray-500 dark:text-gray-500 text-xs">{user?.telefonNumarasi}</p>

                  </div>                  </div>

                </div>                </div>

                              </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                  <div className="flex items-center justify-between">              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                    <div>                <div className="flex items-center">

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödenen Tutar</p>                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">

                      <p className="text-xl font-bold text-green-600 dark:text-green-400">                    <Home className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />

                        {finansalOzet?.odenenTutar ? `₺${finansalOzet.odenenTutar.toLocaleString('tr-TR')}` : '₺0'}                  </div>

                      </p>                  <div>

                    </div>                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Daire Bilgim</h3>

                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">                    {daireInfo ? (

                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />                      <>

                    </div>                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.kisaAdres}</p>

                  </div>                        <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.katNo}. Kat</p>

                </div>                      </>

                                    ) : (

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Henüz daire atanmamış</p>

                  <div className="flex items-center justify-between">                    )}

                    <div>                  </div>

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödeme</p>                </div>

                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">              </div>

                        {finansalOzet?.bekleyenOdemeler || 0}

                      </p>              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                    </div>                <div className="flex items-center">

                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">

                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />                    <Building className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />

                    </div>                  </div>

                  </div>                  <div>

                </div>                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Site Bilgim</h3>

                                    {daireInfo ? (

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">                      <>

                  <div className="flex items-center justify-between">                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.siteIsmi}</p>

                    <div>                        <div className="flex items-center mt-1">

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Son Ödeme</p>                          <MapPin className="w-3 h-3 text-gray-400 mr-1" />

                      <p className="text-sm font-medium text-gray-900 dark:text-white">                          <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.siteAdresi}</p>

                        {finansalOzet?.sonOdeme || 'Henüz ödeme yok'}                        </div>

                      </p>                      </>

                    </div>                    ) : (

                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Site bilgisi bulunamadı</p>

                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />                    )}

                    </div>                  </div>

                  </div>                </div>

                </div>              </div>

              </div>            </div>

            )}

            {/* Finansal Özet */}

            {/* Daire Atanmamış Uyarısı */}            {daireInfo && (

            {!daireInfo && (              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">

              <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                <div className="flex">                  <div className="flex items-center justify-between">

                  <div className="flex-shrink-0">                    <div>

                    <AlertCircle className="h-5 w-5 text-amber-400" />                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Borcum</p>

                  </div>                      <p className="text-xl font-bold text-red-600 dark:text-red-400">

                  <div className="ml-3">                        {finansalOzet?.toplamBorc ? `₺${finansalOzet.toplamBorc.toLocaleString('tr-TR')}` : '₺0'}

                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">                      </p>

                      Daire Bilginiz Bulunamadı                    </div>

                    </h3>                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">

                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">                      <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />

                      Hesabınıza henüz bir daire atanmamış. Apartman özelliklerine erişebilmek için site yöneticisi ile iletişime geçiniz.                    </div>

                      <br />                  </div>

                      Bu durumda duyurular, aidat bilgileri ve diğer apartman hizmetlerine erişemezsiniz.                </div>

                    </p>                

                  </div>                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                </div>                  <div className="flex items-center justify-between">

              </div>                    <div>

            )}                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödenen Tutar</p>

                      <p className="text-xl font-bold text-green-600 dark:text-green-400">

            {/* Son Duyurular */}                        {finansalOzet?.odenenTutar ? `₺${finansalOzet.odenenTutar.toLocaleString('tr-TR')}` : '₺0'}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">                      </p>

              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">                    </div>

                <div className="flex items-center justify-between">                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">

                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />

                    <Bell className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600 dark:text-blue-400" />                    </div>

                    Son Duyurular                  </div>

                  </h3>                </div>

                  {daireInfo && (                

                    <button                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                      onClick={() => navigate('/duyurular')}                  <div className="flex items-center justify-between">

                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs lg:text-sm font-medium flex items-center transition-colors"                    <div>

                    >                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödeme</p>

                      Tümünü Gör                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">

                      <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 ml-1" />                        {finansalOzet?.bekleyenOdemeler || 0}

                    </button>                      </p>

                  )}                    </div>

                </div>                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">

              </div>                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />

                                  </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">                  </div>

                {duyurular.length > 0 && daireInfo ? (                </div>

                  duyurular.slice(0, 3).map((duyuru) => (                

                    <div                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">

                      key={duyuru.id}                  <div className="flex items-center justify-between">

                      onClick={() => handleDuyuruDetay(duyuru.id)}                    <div>

                      className="px-4 lg:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Son Ödeme</p>

                    >                      <p className="text-sm font-medium text-gray-900 dark:text-white">

                      <div className="flex items-start justify-between">                        {finansalOzet?.sonOdeme || 'Henüz ödeme yok'}

                        <div className="flex-1">                      </p>

                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">                    </div>

                            {duyuru.baslik}                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">

                          </h4>                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />

                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">                    </div>

                            {duyuru.icerik}                  </div>

                          </p>                </div>

                          <div className="flex items-center mt-2">              </div>

                            <Clock className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-1" />            )}

                            <span className="text-xs text-gray-500 dark:text-gray-400">{duyuru.tarih}</span>

                          </div>            {/* Daire Atanmamış Uyarısı */}

                        </div>            {!daireInfo && (

                        <div className="ml-4">              <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">

                          {!duyuru.okundu && (                <div className="flex">

                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>                  <div className="flex-shrink-0">

                          )}                    <AlertCircle className="h-5 w-5 text-amber-400" />

                        </div>                  </div>

                      </div>                  <div className="ml-3">

                    </div>                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">

                  ))                      Daire Bilginiz Bulunamadı

                ) : (                    </h3>

                  <div className="px-4 lg:px-6 py-8 text-center">                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">

                    <Bell className="w-8 lg:w-12 h-8 lg:h-12 text-gray-400 mx-auto mb-4" />                      Hesabınıza henüz bir daire atanmamış. Apartman özelliklerine erişebilmek için site yöneticisi ile iletişime geçiniz.

                    <p className="text-gray-500 dark:text-gray-400 text-sm">                      <br />

                      {!daireInfo ? 'Daire bilginiz olmadığı için duyurular görüntülenemiyor.' : 'Henüz duyuru bulunmuyor.'}                      Bu durumda duyurular, aidat bilgileri ve diğer apartman hizmetlerine erişemezsiniz.

                    </p>                    </p>

                  </div>                  </div>

                )}                </div>

              </div>              </div>

            </div>            )}

          </div>

        </div>            {/* Son Duyurular */}

      </div>            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">

    </>              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">

  );                <div className="flex items-center justify-between">

};                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">

                    <Bell className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600 dark:text-blue-400" />

export default KullaniciDashboard;                    Son Duyurular
                  </h3>
                  {daireInfo && (
                    <button
                      onClick={() => navigate('/duyurular')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs lg:text-sm font-medium flex items-center transition-colors"
                    >
                      Tümünü Gör
                      <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {duyurular.length > 0 && daireInfo ? (
                  duyurular.slice(0, 3).map((duyuru) => (
                    <div
                      key={duyuru.id}
                      onClick={() => handleDuyuruDetay(duyuru.id)}
                      className="px-4 lg:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {duyuru.baslik}
                          </h4>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {duyuru.icerik}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{duyuru.tarih}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {!duyuru.okundu && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 lg:px-6 py-8 text-center">
                    <Bell className="w-8 lg:w-12 h-8 lg:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {!daireInfo ? 'Daire bilginiz olmadığı için duyurular görüntülenemiyor.' : 'Henüz duyuru bulunmuyor.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KullaniciDashboard;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      authService.logout();
    }
  };

  // Sayfa yüklendiğinde kullanıcı bilgilerini çek
  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
        // Auth kontrolü
        if (!authService.isAuthenticated()) {
          navigate('/giris');
          return;
        }

        // Kullanıcı bilgilerini al
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        console.log('KullaniciDashboard - userInfo:', userInfo);

        // Token'dan rol bilgisini de al
        const decodedToken = authService.decodeToken();
        console.log('KullaniciDashboard - decodedToken:', decodedToken);
        
        // Kullanıcının sakin olup olmadığını kontrol et
        let userRole = userInfo.apartmanRol;
        
        // Eğer API'dan rol gelmiyorsa token'dan al
        if (userRole === null || userRole === undefined) {
          userRole = decodedToken.apartmanRol;
        }
        
        console.log('KullaniciDashboard - Final userRole:', userRole);
        
        if (userRole !== 'ROLE_APARTMANSAKIN' && userRole !== 'ApartmanSakin' && userRole !== 'Sakin') {
          console.log('Bu sayfa sadece apartman sakinleri için, kullanıcı rolü:', userRole);
          toast.error('Bu sayfa sadece apartman sakinleri içindir.');
          navigate('/site-yonetimi');
          return;
        }

        // Kullanıcının daire bilgilerini çek
        try {
          const daireBilgileri = await userDaireService.getKullaniciDaireBilgileri(userInfo.telefonNumarasi);
          const formattedDaire = userDaireService.formatDaireBilgileri(daireBilgileri);
          setDaireInfo(formattedDaire);
          
          // Daire bilgilerini localStorage'da sakla
          userDaireService.saveDaireBilgileri(formattedDaire);
          
          // Finansal özet bilgilerini çek
          const finansal = await userDaireService.getKullaniciFinansalOzet(daireBilgileri.daireId);
          setFinansalOzet(finansal);
          
          console.log('KullaniciDashboard - Daire bilgileri:', formattedDaire);
          console.log('KullaniciDashboard - Finansal özet:', finansal);
          
        } catch (dairErr) {
          console.warn('Daire bilgisi alınamadı:', dairErr.message);
          toast.warn(dairErr.message);
          setDaireInfo(null);
        }

        // TODO: Kullanıcının dairesine göre duyuruları çek
        if (daireInfo && daireInfo.siteId) {
          // Gelecekte site bazında duyurular çekilebilir
          setDuyurular([
            {
              id: 1,
              baslik: 'Genel temizlik duyurusu',
              icerik: 'Yarın saat 09:00\'da apartman genel temizliği yapılacaktır.',
              tarih: '2024-01-15',
              okundu: false
            },
            {
              id: 2,
              baslik: 'Asansör bakımı',
              icerik: 'Asansör bakımı pazartesi günü saat 14:00-16:00 arası yapılacaktır.',
              tarih: '2024-01-14',
              okundu: true
            }
          ]);
        } else {
          setDuyurular([]);
        }

      } catch (err) {
        console.error('Sayfa yüklenirken hata:', err);
        setError(err.message);
        toast.error('Sayfa yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const handleProfile = () => {
    navigate('/profil');
  };

  const handleDuyuruDetay = (duyuruId) => {
    navigate(`/duyuru/${duyuruId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Logo & Menu Button */}
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">
                    Apartman'ım Cepte
                  </span>
                </div>
              </div>

              {/* Right: Theme Toggle, User Info & Logout */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={darkMode ? 'Açık tema' : 'Karanlık tema'}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Yükleniyor...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Çıkış</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <span className="mt-4 text-gray-600 dark:text-gray-300">Kullanıcı bilgileri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Logo & Menu Button */}
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">
                    Apartman'ım Cepte
                  </span>
                </div>
              </div>

              {/* Right: Theme Toggle, User Info & Logout */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={darkMode ? 'Açık tema' : 'Karanlık tema'}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Hata Oluştu
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Çıkış</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NetworkStatusMonitor />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Navigation Bar */}
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Logo & Menu Button */}
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                    Apartman'ım Cepte
                  </span>
                </div>
              </div>

              {/* Right: Theme Toggle, User Info & Logout */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={darkMode ? 'Açık tema' : 'Karanlık tema'}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Hoşgeldin, {user?.kullaniciAdi} {user?.kullaniciSoyadi}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Apartman Sakini</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Çıkış</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="pt-16 ml-0 lg:ml-64">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Hoş Geldiniz Başlığı */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Hoş Geldiniz, {user?.kullaniciAdi} {user?.kullaniciSoyadi}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                {daireInfo 
                  ? `${daireInfo.adres} - Apartman bilgilerinizi ve duyurularınızı takip edebilirsiniz.`
                  : 'Daire bilgileriniz yüklendiğinde apartman özelliklerine erişebilirsiniz.'
                }
              </p>
            </div>

            {/* Hızlı Eylemler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <button
                onClick={() => navigate('/duyurular')}
                disabled={!daireInfo}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${
                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Bell className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Duyurular</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Apartman duyurularını görüntüle</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>

              <button
                onClick={handleProfile}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group"
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Kişisel bilgilerinizi düzenleyin</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>

              <button
                onClick={() => navigate('/aidat-bilgilerim')}
                disabled={!daireInfo}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${
                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <CreditCard className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Aidat Bilgilerim</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Aidat ödemelerinizi görüntüleyin</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>

              <button
                onClick={() => navigate('/finansal-ozet')}
                disabled={!daireInfo}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-all duration-300 text-left group ${
                  !daireInfo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                    <DollarSign className="w-5 lg:w-6 h-5 lg:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Finansal Özet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Gelir ve giderlerinizi görüntüleyin</p>
                  </div>
                </div>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 float-right mt-2" />
              </button>
            </div>

            {/* Kullanıcı Bilgi Kartları */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <User className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Profil Bilgilerim</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{user?.email}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">{user?.telefonNumarasi}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <Home className="w-5 lg:w-6 h-5 lg:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Daire Bilgim</h3>
                    {daireInfo ? (
                      <>
                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.kisaAdres}</p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.katNo}. Kat</p>
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Henüz daire atanmamış</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                    <Building className="w-5 lg:w-6 h-5 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Site Bilgim</h3>
                    {daireInfo ? (
                      <>
                        <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">{daireInfo.siteIsmi}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-gray-500 dark:text-gray-500 text-xs">{daireInfo.siteAdresi}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">Site bilgisi bulunamadı</p>
                    )}
                  </div>
              </div>
            </div>

            {/* Finansal Özet */}
            {daireInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Borcum</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {finansalOzet?.toplamBorc ? `₺${finansalOzet.toplamBorc.toLocaleString('tr-TR')}` : '₺0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödenen Tutar</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {finansalOzet?.odenenTutar ? `₺${finansalOzet.odenenTutar.toLocaleString('tr-TR')}` : '₺0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödeme</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {finansalOzet?.bekleyenOdemeler || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Son Ödeme</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {finansalOzet?.sonOdeme || 'Henüz ödeme yok'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daire Atanmamış Uyarısı */}
            {!daireInfo && (
              <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Daire Bilginiz Bulunamadı
                    </h3>
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      Hesabınıza henüz bir daire atanmamış. Apartman özelliklerine erişebilmek için site yöneticisi ile iletişime geçiniz.
                      <br />
                      Bu durumda duyurular, aidat bilgileri ve diğer apartman hizmetlerine erişemezsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Son Duyurular */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Bell className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Son Duyurular
                  </h3>
                  {daireInfo && (
                    <button
                      onClick={() => navigate('/duyurular')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs lg:text-sm font-medium flex items-center transition-colors"
                    >
                      Tümünü Gör
                      <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {duyurular.length > 0 && daireInfo ? (
                  duyurular.slice(0, 3).map((duyuru) => (
                    <div
                      key={duyuru.id}
                      onClick={() => handleDuyuruDetay(duyuru.id)}
                      className="px-4 lg:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {duyuru.baslik}
                          </h4>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {duyuru.icerik}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{duyuru.tarih}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {!duyuru.okundu && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 lg:px-6 py-8 text-center">
                    <Bell className="w-8 lg:w-12 h-8 lg:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {!daireInfo ? 'Daire bilginiz olmadığı için duyurular görüntülenemiyor.' : 'Henüz duyuru bulunmuyor.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KullaniciDashboard;