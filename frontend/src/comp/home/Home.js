// src/components/Home.js
import React, { useState, useEffect } from 'react';
import Info from './info/Info';
import './Home.css';

function Home() {
  const [showInfo, setShowInfo] = useState(false);

  // Disable page scrolling on mount, re-enable on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const toggleInfo = () => setShowInfo(prev => !prev);

  return (
    <div className="home-container">
      {/* Logo above welcome text */}
      <img
        src="/dartlogo.png"
        alt="D.A.R.T. Logo"
        className="dart-logo"
      />

      <div className="home-heading">
        <span className="welcome-text">Welcome to D.A.R.T</span>
        <span className="dart-text">
          Data Analytics & Research Visualization Toolkit <strong>(D.A.R.T)</strong> is an application
          designed to visually analyze research applications. Developed by [Group E]
          for the Media Technology Bachelor’s Project TNM094 (2025VT).
        </span>
        <h3>
          <strong>NOTE:</strong> For a quick tutorial, click the info button in the top-right corner.
        </h3>
        <p>
          Download our sample data file from our zip (file updated <em>2025-05-07</em>) :
          <a href="/example2025.7z" download>Example Data File</a>
        </p>
        <p>
          <strong>Or</strong> grab your own CSV file from the SWECRIS website :
          <a
            href="https://www.vr.se/english/swecris.html"
            target="_blank"
            rel="noopener noreferrer"
            className="swecris-link"
          >
            SWECRIS
          </a>
        </p>
      </div>

      {/* Info button */}
      <div className="info-button" onClick={toggleInfo}>
        <button className="info-btn">i</button>
      </div>

      {/* Info popup */}
      {showInfo && <Info closeInfo={toggleInfo} />}
    </div>
  );
}

export default Home;
