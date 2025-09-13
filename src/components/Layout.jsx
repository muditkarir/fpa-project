import React from "react";
import { NavLink } from "react-router-dom";

const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const siteName = import.meta.env.VITE_APP_NAME || "Adobe FP&A";

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="site-title">{siteName}</h1>
          <nav className="nav">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/scenario" className="nav-link">
              Scenario Analysis
            </NavLink>
            <NavLink to="/insights" className="nav-link">
              Insights
            </NavLink>
            <NavLink to="/sources" className="nav-link">
              Data Sources
            </NavLink>
            <NavLink to="/about" className="nav-link">
              About
            </NavLink>
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <p>© {currentYear} Adobe FP&A Project</p>
      </footer>
    </div>
  );
};

export default Layout;