import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import CashBox from './pages/CashBox';
import Suppliers from './pages/Suppliers';
import Clients from './pages/Clients';
import InventoryReports from './pages/InventoryReports';
import FinalReports from './pages/FinalReports';
import Settings from './pages/Settings';
import Calculator from './pages/Calculator';

function App() {
  return (
    <Routes>
      {/* Main Dashboard Route */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Screen 1 Routes */}
      <Route path="/categories" element={<Categories />} />
      <Route path="/products" element={<Products />} />
      <Route path="/purchases" element={<Purchases />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/cash-box" element={<CashBox />} />

      {/* Screen 2 Routes */}
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/inventory-reports" element={<InventoryReports />} />
      <Route path="/final-reports" element={<FinalReports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/calculator" element={<Calculator />} />
    </Routes>
  );
}

export default App;
