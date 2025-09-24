// src/pages/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import './AppLayout.css';
import background from '../assets/bg.svg';
import logo from '../assets/logo.png';

const AppLayout = () => {
  return (
    <div className="page-container">
      <img src={background} className="background-illustration" alt="background" />
      
      <header className="header">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">Farmer's Companion</span>
        </div>
        <nav className="nav-links">
          <a href="#">About Us</a>
          <a href="#">Dashboard</a>
          <a href="#">Contact Us</a>
          <a href="#">Profile</a>
          <a href="#">Change Language</a>
        </nav>
      </header>

      {/* This Outlet is where your pages will be rendered */}
      <Outlet />
    </div>
  );
};

export default AppLayout;