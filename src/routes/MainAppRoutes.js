import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import LayoutApp from "../components/layout/Layout";
import Loading from "../components/common/Loading";

const Home = lazy(() => import("../components/Home/Home"));
// Fix: Use correct file name and component name
const CatalogProduct = lazy(() => import("../components/Products/catalogProduct"));
const ProductsDetail = lazy(() => import("../components/Products/productType"));
const Profile = lazy(() => import("../components/profile/Profile"));
const LineChart = lazy(() => import("../components/Chart/LineChart"));
const Suppliers = lazy(() => import("../components/Suppliers/Suppliers"));
const AddSupplier = lazy(() => import("../components/Suppliers/AddSupplier"));
const Explain = lazy(() => import("../components/Explain/Explain"));

function MainAppRoutes() {
  return (
    <LayoutApp>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Route chính, redirect từ "/" đến "/home" */}
          <Route path="/" element={<Home />} />
          {/* Route Home */}
          <Route path="/home" element={<Home />} />
          {/* Route Suppliers */}
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/add" element={<AddSupplier />} />
      
          {/* Route Products - Fixed component reference */}
          <Route path="/products" element={<ProductsDetail />} />
          <Route path="/products/catalogs" element={<CatalogProduct />} />
          
          {/* Route Profile */}
          <Route path="/profile" element={<Profile />} />
          {/* Route Statistic */}
          <Route path="/statistic" element={<LineChart />} />
          {/* Route Explain */}
          <Route path="/bao_gia" element={<Explain />} />
          {/* Route 404 hoặc catch-all (tùy chọn) */}
          <Route path="*" element={<Home />} /> {/* Hoặc redirect đến trang 404 */}
        </Routes>
      </Suspense>
    </LayoutApp>
  );
}

export default MainAppRoutes;