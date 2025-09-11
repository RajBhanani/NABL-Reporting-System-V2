import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Loading from './components/Loading';
import Layout from './layout/Layout';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Reception = lazy(() => import('./pages/Reception'));
const Samples = lazy(() => import('./pages/Samples'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route element={<PrivateRoute />}> */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/samples/*" element={<Samples />} />
          </Route>
          {/* </Route> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
