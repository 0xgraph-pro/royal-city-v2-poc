import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Property3D from './pages/Property3D';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import WalletConnectPage from './pages/WalletConnectPage';
import { useWallet } from './lib/walletContext';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';


function AuthGuard({ children }) {
  const { address, isConnecting } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnecting && !address) {
      navigate("/login", { replace: true });
    }
  }, [address, isConnecting, navigate]);

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/30 rounded px-2 py-1 tracking-widest text-lg">
            ET
          </span>
          <p className="font-mono text-xs text-muted-foreground animate-pulse tracking-widest">
            VERIFYING WALLET…
          </p>
        </div>
      </div>
    );
  }

  if (!address) {
    return null;
  }

  return <>{children}</>;
}

function ProtectedLayout() {
  const { message } = useWallet();

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/property-3d" element={<Property3D />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path = '*' element={<NotFound/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover draggable pauseOnFocusLoss theme="colored" />  
      <Router>
        <Routes>
          <Route path="/login" element={<WalletConnectPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;