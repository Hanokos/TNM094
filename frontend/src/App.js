import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './comp/sidebar/Sidebar';
import FileUpload from './comp/themecount/csvUpload';
import Chart from './comp/themecount/Chart';
import List from './comp/list/List';
import Home from './comp/home/Home';
import Visualize from './comp/visualize/Visualize';
import Trends from './comp/trends/Trends';  // New import
//import Abstract from './comp/visualize/Visualize/abstract/Abstract';  // New import

// npm install react-plotly.js plotly.js-basic-dist, 2025-04-18 by: Hans.F

function App() {
  const [themeCounts, setThemeCounts] = useState({});
  const [chartImage, setChartImage] = useState('');

  return (
    
    <Router>
      <div className="app-container">
        <Sidebar />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visualize" element={<Visualize />} />
            <Route path="/trends" element={<Trends />} />
            <Route element={ //  the <div> here should be removed and added to theme-count,but we gonna remove this entire page later.
              <div className="content-box">
                <h1>Upload your file!</h1> 
                <FileUpload setThemeCounts={setThemeCounts} setChartImage={setChartImage} />
                <Chart themeCounts={themeCounts} chartImage={chartImage} />
              </div>
            } />
            <Route path="/list" element={<List />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
