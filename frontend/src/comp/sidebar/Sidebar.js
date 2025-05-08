import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
 
  return (
    
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-heading">
          {!isCollapsed && (
            <>
              <span className="line1">Data</span>
              <span className="line2">Analytics &</span>
              <span className="line3">Research visualisation</span>
              <span className="line4">Toolkit</span>
            </>
          )}
        </h2>
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      {!isCollapsed && (
        <ul className="sidebar-nav">
          <li>
            <Link to="/" className="nav-link">
              <div className="left-stripe"></div>  
               Home
            </Link>
          </li>
          <li>
            <Link to="/visualize" className="nav-link">
              <div className="left-stripe"></div> 
              Visualize
            </Link>
          </li>
          <li>
            <Link to="/trends" className="nav-link">
              <div className="left-stripe"></div>
              Trends
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
