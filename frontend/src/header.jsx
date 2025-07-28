import React, { useState } from 'react';
import './header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="header modern-header">
      <div className="header-left">
        <div className="avatar">
          <img src="https://ui-avatars.com/api/?name=H+T&background=25d366&color=fff&rounded=true&size=40" alt="avatar" />
        </div>
        <div
          className="dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="dropdown-btn" aria-label="Menu">
            <span className="menu-icon">&#9776;</span>
            <span className="dropdown-arrow">&#9662;</span>
          </button>
          {dropdownOpen && (
            <ul className="dropdown-content">
              <li><a href="/">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/authenticate">Authenticate</a></li>
            </ul>
          )}
        </div>
      </div>
      <div className="header-center">
        <h1 className="header-title"><b>Hashtext</b></h1>
      </div>
      {/* header-right removed for cleaner, centered header */}
    </header>
  );
};

export default Header;