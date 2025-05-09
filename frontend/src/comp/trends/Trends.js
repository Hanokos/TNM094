// src/components/Trends.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Trends.css';

function Trends() {
  // — State —
  const [file, setFile] = useState(null);
  const [keywordsByYear, setKeywordsByYear] = useState({});
  const [error, setError] = useState('');
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [highlightedKeyword, setHighlightedKeyword] = useState(null);

  // — Lock scroll until processed —
  useEffect(() => {
    document.documentElement.style.overflow = Object.keys(keywordsByYear).length ? 'auto' : 'hidden';
    return () => {
      document.documentElement.style.overflow = 'auto';
    };
  }, [keywordsByYear]);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setError('');
    setKeywordsByYear({});
    setMinYear(null);
    setMaxYear(null);
    setStartYear('');
    setEndYear('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file from SWECRIS.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/upload-trends/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      const yearKeywords = res.data.year_keywords || {};
      setKeywordsByYear(yearKeywords);

      const years = Object.keys(yearKeywords).map(y => parseInt(y, 10));
      const min = Math.min(...years);
      const max = Math.max(...years);

      setMinYear(min);
      setMaxYear(max);
      setStartYear(min);
      setEndYear(max);
    } catch {
      setError('Failed to process file. Vercel has trouble reaching the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = keyword => {
    setHighlightedKeyword(prev => (prev === keyword ? null : keyword));
  };

  // Filtered data for display
  const filteredYears = Object.keys(keywordsByYear)
    .map(Number)
    .filter(year => year >= startYear && year <= endYear)
    .sort((a, b) => a - b);

  const filteredKeywordsByYear = filteredYears.reduce((obj, year) => {
    obj[year] = keywordsByYear[year];
    return obj;
  }, {});

  // Center container until we have results
  const preLoadStyle = !Object.keys(keywordsByYear).length && !loading
    ? { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }
    : {};

  // To add drop down menu
    const allKeywords = React.useMemo(() => {
      const keywordsSet = new Set();
      Object.values(filteredKeywordsByYear).forEach(list =>
        list.forEach(keyword => keyword && keywordsSet.add(keyword))
      );
      return Array.from(keywordsSet).sort((a, b) => a.localeCompare(b));
    }, [filteredKeywordsByYear]);

  return (
    <div className="trends-container" style={preLoadStyle}>
      <h1>Trends Analysis</h1>

      <div className="upload-section">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading
            ? <>
                <span className="loading-spinner" />
                Processing...
              </>
            : 'Upload and Analyze'}
        </button>
        {!Object.keys(keywordsByYear).length && !loading && (
          <img src="/trendrobot.png" alt="TrendRobot" className="trend-image" />
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {minYear !== null && maxYear !== null && (
        <div className="year-range-container">
          <label>
            Start Year:
            <select value={startYear} onChange={e => setStartYear(parseInt(e.target.value, 10))}>
              {Object.keys(keywordsByYear).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label>
            End Year:
            <select value={endYear} onChange={e => setEndYear(parseInt(e.target.value, 10))}>
              {Object.keys(keywordsByYear).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {Object.keys(filteredKeywordsByYear).length > 0 && (
        <div className="results-section">
          <h2>Top Keywords per Year</h2>
          <p>Range: {minYear} - {maxYear}</p>

          <div className="keyword-filter-dropdown">
  <label>
    Highlight keyword:
    <select
      value={highlightedKeyword || ''}
      onChange={(e) => setHighlightedKeyword(e.target.value || null)}
    >
      <option value="">-- Select a keyword --</option>
      {allKeywords.map((kw) => (
        <option key={kw} value={kw}>
          {kw}
        </option>
      ))}
    </select>
  </label>
</div>

          <div className="table-wrapper">
            <table className="keywords-table">
              <thead>
                <tr>
                  {filteredYears.map(year => <th key={year}>{year}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(...filteredYears.map(y => filteredKeywordsByYear[y].length))
                }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {filteredYears.map(year => {
                      const kw = filteredKeywordsByYear[year][rowIndex] || '';
                      return (
                        <td
                          key={`${year}-${rowIndex}`}
                          onClick={() => kw && handleKeywordClick(kw)}
                          className={kw === highlightedKeyword ? 'highlighted' : ''}
                          style={{ cursor: kw ? 'pointer' : 'default' }}
                        >
                          {kw}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trends;

