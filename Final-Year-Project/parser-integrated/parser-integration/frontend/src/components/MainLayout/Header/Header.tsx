import logo from './sage-logo.png';
import './HeaderStyle.css';

function Header() {
  return (

    <>
        <div className="header-container">
        <header className="page-header">
            <div className="container header-container">
                <div className="logo-brand">
                    <img className="logo-image" src={logo} alt="Sage-Logo" />
                    <h1 className="brand-name">
                        Sa<span className="brand-highlight">ge</span>
                    </h1>
                    <p className="brand-name-slogan">Your Hiring Partner</p>
                </div>
                             
            </div>
        </header>
        </div>
    </>
  );
}

export default Header;