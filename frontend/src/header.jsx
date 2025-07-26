import React, { useState } from 'react';
import './header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <div
          className="dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="dropdown-btn">Menu &#9662;</button>
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
    </header>
  );
};

export default Header;