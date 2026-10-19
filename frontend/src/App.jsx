import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Home from './pages/consumer/Home.jsx';
import ProductList from './pages/consumer/ProductList.jsx';
import ProductDetail from './pages/consumer/ProductDetail.jsx';
import FarmerPage from './pages/consumer/FarmerPage.jsx';
import Checkout from './pages/consumer/Checkout.jsx';
import OrderHistory from './pages/consumer/OrderHistory.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import FarmerDashboard from './pages/farmer/FarmerDashboard.jsx';
import FarmerProfile from './pages/farmer/FarmerProfile.jsx';
import ProductAdd from './pages/farmer/ProductAdd.jsx';
import ProductEdit from './pages/farmer/ProductEdit.jsx';
import FarmerOrders from './pages/farmer/FarmerOrders.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import FarmerApprovals from './pages/admin/FarmerApprovals.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import Analytics from './pages/admin/Analytics.jsx';

function NotFound() {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><p className="text-6xl">🌱</p><h1 className="mt-4 text-3xl font-extrabold">Page not found</h1><Link className="mt-5 inline-block font-bold text-leaf-700" to="/">Back to AnnDaata →</Link></main>;
}

export default function App() {
  return <BrowserRouter><div className="min-h-screen"><Navbar /><Routes>
    <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route path="/products" element={<ProductList />} /><Route path="/products/:id" element={<ProductDetail />} /><Route path="/farmer/:id" element={<FarmerPage />} />
    <Route element={<ProtectedRoute roles={['consumer']} />}><Route path="/checkout" element={<Checkout />} /><Route path="/my-orders" element={<OrderHistory />} /></Route>
    <Route element={<ProtectedRoute roles={['farmer']} />}><Route path="/farmer/dashboard" element={<FarmerDashboard />} /><Route path="/farmer/profile" element={<FarmerProfile />} /><Route path="/farmer/products/add" element={<ProductAdd />} /><Route path="/farmer/products/edit/:id" element={<ProductEdit />} /><Route path="/farmer/orders" element={<FarmerOrders />} /></Route>
    <Route element={<ProtectedRoute roles={['admin']} />}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/farmers" element={<FarmerApprovals />} /><Route path="/admin/approvals" element={<FarmerApprovals />} /><Route path="/admin/categories" element={<ManageCategories />} /><Route path="/admin/analytics" element={<Analytics />} /></Route>
    <Route path="*" element={<NotFound />} />
  </Routes><footer className="mt-12 border-t bg-white py-7 text-center text-sm text-stone-500">AnnDaata · Fresh from the farm, fair for everyone.</footer></div><ToastContainer position="bottom-right" autoClose={3500} /></BrowserRouter>;
}
