// src/components/visualize/diagram/Diagram.js
import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import './Diagram.css';

const Diagram = ({ data }) => {
  const GROUP_OPTIONS = {
    category: 'Category',
    organization: 'Organization',
    gender: 'Gender',
    fundingOrg: 'Funding Organisation'
  };
  const [selectedGroup, setSelectedGroup] = useState('category');
  const [threeD, setThreeD] = useState(false);

  // Compute all years present in the data
  const allYears = useMemo(() => {
    const yrs = data
      .map(p => parseInt(p.year, 10))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);
    return Array.from(new Set(yrs));
  }, [data]);

  // Build a contiguous range of years
  const yearRange = useMemo(() => {
    if (!allYears.length) return [];
    const [minY, maxY] = [allYears[0], allYears[allYears.length - 1]];
    const r = [];
    for (let y = minY; y <= maxY; y++) r.push(y);
    return r;
  }, [allYears]);

  // Count occurrences by group per year
  const countsByGroup = useMemo(() => {
    const counts = {};
    yearRange.forEach(y => (counts[y] = {}));
    data.forEach(row => {
      const y = parseInt(row.year, 10);
      if (isNaN(y)) return;

      let keys = [];
      if (selectedGroup === 'category') {
        keys = row.scbsCategories?.length ? row.scbsCategories : ['None'];
      } else if (selectedGroup === 'organization') {
        keys = [row.CoordinatingOrganisationNameEn || 'Unknown'];
      } else if (selectedGroup === 'fundingOrg') {
        keys = [row.FundingOrganisationNameEn || 'Unknown'];
      } else {
        const g = row.gender && row.gender !== '-' ? row.gender : 'Unknown';
        keys = [g];
      }

      keys.forEach(k => {
        counts[y][k] = (counts[y][k] || 0) + 1;
      });
    });

    const groups = new Set();
    Object.values(counts).forEach(o => Object.keys(o).forEach(k => groups.add(k)));

    const result = {};
    groups.forEach(g => {
      result[g] = yearRange.map(y => counts[y][g] || 0);
    });
    return result;
  }, [data, selectedGroup, yearRange]);

  // Find the maximum count for axis scaling
  const maxCount = useMemo(() => {
    return Object.values(countsByGroup)
      .flat()
      .reduce((m, v) => Math.max(m, v), 0);
  }, [countsByGroup]);

  // Handle tab clicks
  const onTabClick = key => {
    setSelectedGroup(key);
    if (key !== 'organization') {
      setThreeD(false);
    }
  };

  // If no data, show message
  if (!yearRange.length || !Object.keys(countsByGroup).length) {
    return <div className="diagram-container">No data available.</div>;
  }

  // Color palette
  const colors = [
    'rgb(120, 230, 230)', 'rgb(255, 142, 244)', 'rgb(129, 83, 15)', 'rgb(187, 255, 98)',
    'rgb(0, 255, 136)', '#edc949', 'rgb(232, 28, 99)', 'rgb(150, 251, 147)',
    '#9c755f', '#bab0ab', 'rgb(41, 114, 92)', 'rgb(85, 0, 109)',
    '#7c0f0f', '#b98b0b', 'rgb(25, 36, 137)', 'rgb(45, 201, 22)',
    'rgb(2, 23, 71)', 'rgba(242, 255, 0, 0.94)', 'rgb(255, 0, 0)',
    'rgb(37, 77, 255)'
  ];

  // Helper to truncate long labels
  const truncate = (str, max = 14) =>
    str.length > max ? str.slice(0, max) + '...' : str;

  // Prepare Plotly data, layout, and config
  let plotData, layout, config;

  if (selectedGroup === 'organization' && threeD) {
    // 3D scatter
    const totals = Object.entries(countsByGroup)
      .map(([org, arr]) => ({ org, total: arr.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);
    const topOrgs = totals.slice(0, 20).map(o => o.org);
    const maxLen = Math.max(...topOrgs.map(n => n.length));
    const tickText = topOrgs.map(n => n + '\u00A0'.repeat(maxLen - n.length));

    plotData = topOrgs.map((org, idx) => ({
      x: Array(yearRange.length).fill(idx),
      y: yearRange,
      z: countsByGroup[org],
      mode: 'markers+lines',
      type: 'scatter3d',
      name: truncate(org),
      customdata: Array(yearRange.length).fill(org),
      marker: { size: 4, color: colors[idx % colors.length] },
      line: { width: 1 },
      hovertemplate: `Org: %{customdata}<br>Year: %{y}<br>Count: %{z}<extra></extra>`
    }));

    layout = {
      margin: { l: 80, r: 80, b: 80, t: 80, pad: 10 },
      scene: {
        xaxis: {
          title: { text: '', standoff: 20 },
          tickvals: topOrgs.map((_, i) => i),
          ticktext: tickText,
          tickangle: 10,
          tickfont: { size: 10 },
          automargin: true
        },
        yaxis: {
          title: { text: 'Year', standoff: 15 },
          range: [yearRange[0], yearRange[yearRange.length - 1] + 5],
          automargin: true
        },
        zaxis: {
          title: { text: 'Count', standoff: 15 },
          range: [0, maxCount + 100],
          automargin: true
        }
      },
      height: 600,
      autosize: true
    };
    config = { responsive: true };
  } else {
    // 2D line + marker chart
    const totalsArr = Object.entries(countsByGroup)
      .map(([k, arr]) => ({ key: k, total: arr.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);
    const keys = selectedGroup === 'organization'
      ? totalsArr.slice(0, 20).map(o => o.key)
      : totalsArr.map(o => o.key);

    plotData = keys.map((g, i) => ({
      x: yearRange,
      y: countsByGroup[g],
      mode: 'lines+markers',
      name: truncate(g),
      customdata: Array(yearRange.length).fill(g),
      marker: { size: 6, color: colors[i % colors.length] },
      line: { width: 2 },
      hovertemplate: `<b>%{customdata}</b>: %{y}<extra></extra>`
    }));

    layout = {
      xaxis: {
        title: { text: 'Year', standoff: 10 },
        tickmode: 'linear',
        automargin: true
      },
      yaxis: {
        title: { text: 'Count', standoff: 10 },
        range: [0, maxCount + 100],
        automargin: true
      },
      hovermode: 'x unified',
      margin: { l: 80, r: 20, b: 60, t: 40, pad: 10 },
      height: 600,
      legend: {
        itemwidth: 100,
        itemclick: 'toggleothers',
        itemdoubleclick: 'toggle',
        font: { size: 12 },
        title: {
          text: '(Click on their color line)<br>(to remove or add them) <br> <br> Groups:',
          font: { size: 13 }
        }
      },
      autosize: true
    };
    config = { responsive: true };
  }

  return (
    <div className="diagram-container">
      <h2>{GROUP_OPTIONS[selectedGroup]} Over Time</h2>
      <div className="diagram-tabs">
        {Object.entries(GROUP_OPTIONS).map(([key, label]) => (
          <button
            key={key}
            className={`diagram-tab ${selectedGroup === key ? 'active' : ''}`}
            onClick={() => onTabClick(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="diagram-chart">
        {selectedGroup === 'organization' && (
          <button className="toggle-3d-btn" onClick={() => setThreeD(!threeD)}>
            {threeD ? 'Switch to 2D' : 'Switch to 3D'}
          </button>
        )}
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default Diagram;
