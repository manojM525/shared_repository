// app.tsx (updated)

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext'; // ✅ Added
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRout';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderConfirmation from './pages/OrderConfirmation'; // ✅ Add this import
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import BlogList from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import Wishlist from './pages/Wishlist';
import WhatsApp from './components/whatsapp';
import ScrollToTop from './components/ScrollToTop';
import ShippingPolicy from './pages/shipping';

function App() {
  return (
    <div>
      
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <WishlistProvider> {/* ✅ Added */}
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path = "/wishlist" element={<Wishlist/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element = {<About />} />
                <Route path="/contact" element = {<Contact/>} />
                <Route path="/faq" element = {<FAQ/>} />
                <Route path="/terms" element = {<TermsAndConditions/>} />
                <Route path="/privacy" element = {<PrivacyPolicy/>} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/recipe" element={<RecipesPage />} />
                <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                <Route path='/shipping' element={<ShippingPolicy />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:order_id"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </CartProvider>
        </WishlistProvider> {/* ✅ Added */}
      </AuthProvider>
      <WhatsApp />
    </Router>
    </div>
  );
}

export default App;