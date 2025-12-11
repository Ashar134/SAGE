import Header from '../MainLayout/Header/Header';
import Navigation from '../MainLayout/Navigation/Navigation';
import { Outlet } from 'react-router-dom';
import './LayoutStyle.css';

function Layout() {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}

export default Layout;