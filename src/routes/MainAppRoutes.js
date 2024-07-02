import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import LayoutApp from '../components/layout/Layout';
import Loading from '../components/common/Loading';

const Home = lazy(() => import('../components/home/Home'));
const Room = lazy(() => import('../components/room/Rooms'));
const DetailRoom = lazy(() => import('../components/room/detailRoom/DetailRoom'));
const Profile = lazy(() => import('../components/profile/Profile'));
const LineChart = lazy(() => import('../components/Chart/LineChart'))
const Map = lazy(() => import('../components/Map/Map'))
const Explain = lazy(() => import('../components/Explain/Explain'))

function MainAppRoutes(props) {
  return (
    <LayoutApp>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
          <Route path="/locations" element={<Room />}></Route>
          <Route path="/locations/:id" element={<DetailRoom />} />
          <Route path="/maps" element={<Map />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/statistic" element={<LineChart />} />
          <Route path="/explain" element={<Explain />} />
          
        </Routes>
      </Suspense>
    </LayoutApp>
  );
}

export default MainAppRoutes;
