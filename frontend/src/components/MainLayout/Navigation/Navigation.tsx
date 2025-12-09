import { NavLink } from 'react-router-dom';
import './NavigationStyle.css';

function Navigation() {
  return (
    <div className="bottom-navigation">
      <nav className="nav-links">

        <NavLink
          to="/app"
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <div className="nav-item">
            <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="nav-text">Home</span>
          </div>
        </NavLink>

        <NavLink
          to="/app/jobs"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <div className="nav-item">
            <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span className="nav-text">Jobs</span>
          </div>
        </NavLink>
        <NavLink
          to="/app/application"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <div className="nav-item">
            <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span className="nav-text">Application</span>
          </div>
        </NavLink>
        <NavLink
          to="/app/profile"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <div className="nav-item">
            <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="nav-text">Profile</span>
          </div>
        </NavLink>
      </nav>
    </div>
    
  );
}

export default Navigation;
