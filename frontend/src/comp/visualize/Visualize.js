// src/components/visualize/Visualize.js
import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { useTable, useSortBy, usePagination } from 'react-table';
import Abstract from './abstract/Abstract';
import Diagram from './diagram/Diagram';
import './Visualize.css';

// =====================
// DualSlider Component
// =====================
function DualSlider({ min, max, values, onChange }) {
  const range = max - min;
  const leftPercent = ((values[0] - min) / range) * 100;
  const rightPercent = ((values[1] - min) / range) * 100;

  const handleMinChange = e => {
    const newMin = Number(e.target.value);
    if (newMin <= values[1]) onChange([newMin, values[1]]);
  };
  const handleMaxChange = e => {
    const newMax = Number(e.target.value);
    if (newMax >= values[0]) onChange([values[0], newMax]);
  };

  return (
    <div className="dual-slider">
      <div className="slider-track" />
      <div
        className="slider-range"
        style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={values[0]}
        onChange={handleMinChange}
        className={`slider-input slider-min ${values[0] === values[1] ? 'slider-equal' : ''}`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={values[1]}
        onChange={handleMaxChange}
        className="slider-input slider-max"
      />
      <div className="slider-values">
        <span>Min: {values[0]}</span>
        <span>Max: {values[1]}</span>
      </div>
    </div>
  );
}

// =====================
// Main Visualize Component
// =====================
function Visualize() {
  // --- Data & UI State ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [filterYear, setFilterYear] = useState('');
  const [minFunding, setMinFunding] = useState(0);
  const [maxFunding, setMaxFunding] = useState(0);
  const [filterGender, setFilterGender] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [pendingOrg, setPendingOrg] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [pendingCategory, setPendingCategory] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [pendingSubCategory, setPendingSubCategory] = useState('');
  const [uniqueSubCategories, setUniqueSubCategories] = useState([]);
  const [selectedPIs, setSelectedPIs] = useState([]);
  const [pendingPI, setPendingPI] = useState('');
  const [uniquePIs, setUniquePIs] = useState([]);
  const [selectedFundingOrgs, setSelectedFundingOrgs] = useState([]);
  const [pendingFundingOrg, setPendingFundingOrg] = useState('');
  const [uniqueFundingOrgs, setUniqueFundingOrgs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [years, setYears] = useState([]);
  const [orgFilterCategory, setOrgFilterCategory] = useState('all');
  const [sliderYears, setSliderYears] = useState([0, 100]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Required CSV columns
  const REQUIRED_COLUMNS = [
    'ProjectId',
    'CoordinatingOrganisationNameEn',
    'FundingsSek',
    'FundingYear',
    'FundingOrganisationNameEn',
    'Scbs',
    'InvolvedPeople'
  ];

  // --- Lock scroll until fileUploaded ---
  useEffect(() => {
    document.documentElement.style.overflow = fileUploaded ? 'auto' : 'hidden';
    return () => {
      document.documentElement.style.overflow = 'auto';
    };
  }, [fileUploaded]);

  // --- CSV Upload & Parse ---
  const handleFileUpload = e => {
    setErrorMessage('');
    const file = e.target.files[0];
    if (!file) {
      setErrorMessage('Please select a CSV file from SWECRIS');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Wrong file type — Please upload a ".csv" file');
      return;
    }

    setIsLoading(true);

    Papa.parse(file, {
      delimiter: ";",
      header: true,
      skipEmptyLines: true,
      complete: ({ data: raw, meta }) => {
        const headers = meta.fields || [];
        const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        if (missing.length) {
          setIsLoading(false);
          setErrorMessage(`CSV missing required columns: ${missing.join(', ')}`);
          return;
        }

        const cleaned = raw
          .filter(r => r.ProjectId)
          .map(r => {
            let piGender = 'Unknown', piName = 'Unknown';
            if (r.InvolvedPeople) {
              for (const blk of r.InvolvedPeople.split("¤¤¤").filter(Boolean)) {
                const f = blk.split('¤').map(s => s.trim());
                if (f[3] === "Principal Investigator") {
                  piName = f[1] || 'Unknown';
                  piGender = f[5] || 'Unknown';
                  break;
                }
              }
            }

            const mainCats = new Set();
            if (r.Scbs) {
              r.Scbs.split("¤¤¤").filter(Boolean).forEach(seg => {
                const m = seg.match(/^\s*\d+:\s*[^,]+,\s*([^,]+)/);
                if (m) mainCats.add(m[1].trim());
              });
            }

            const subCats = new Set();
            const regex = /(\d{3,}):\s*([\s\S]*?)(?=(\d{1,2}:|\d{3,}:|¤¤¤|$))/g;
            let m;
            while ((m = regex.exec(r.Scbs || '')) !== null) {
              const code = m[1];
              const text = m[2].trim();
              const parts = text.split(',').map(p => p.trim()).filter(p => p);
              const half = parts.length / 2;
              parts.slice(half).forEach(label => subCats.add(`${code}: ${label}`));
            }

            return {
              ...r,
              FundingsSek: parseInt(r.FundingsSek, 10) || 0,
              year: r.FundingYear ? +r.FundingYear : null,
              gender: piGender,
              piName,
              scbsCategories: Array.from(mainCats),
              subCategories: Array.from(subCats)
            };
          });

        const orgs = [...new Set(cleaned.map(r => r.CoordinatingOrganisationNameEn).filter(Boolean))];
        const yrs = [...new Set(cleaned.map(r => r.year).filter(Boolean))].sort((a, b) => b - a);
        const funds = cleaned.map(r => r.FundingsSek).filter(v => v);
        const uniqCats = [...new Set(cleaned.flatMap(r => r.scbsCategories))];
        const uniqSubs = [...new Set(cleaned.flatMap(r => r.subCategories))].sort((a, b) => a.localeCompare(b));
        const allPIs = cleaned.map(r => r.piName).filter(Boolean);
        const fundOrgs = [...new Set(cleaned.map(r => r.FundingOrganisationNameEn).filter(Boolean))];

        if (yrs.length) setSliderYears([Math.min(...yrs), Math.max(...yrs)]);
        setData(cleaned);
        setOrganizations(orgs);
        setYears(yrs);
        setMinFunding(Math.min(...funds));
        setMaxFunding(Math.max(...funds));
        setUniqueCategories(uniqCats);
        setUniqueSubCategories(uniqSubs);
        setUniquePIs([...new Set(allPIs)].sort((a, b) => a.localeCompare(b)));
        setUniqueFundingOrgs(fundOrgs.sort((a, b) => a.localeCompare(b)));
        setFileUploaded(true);
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
        setErrorMessage('Error parsing CSV file.');
      }
    });
  };

  // --- Handlers for Chips / Filters / Reset ---
  const handleAddOrg = () => {
    if (pendingOrg && !selectedOrgs.includes(pendingOrg)) {
      setSelectedOrgs([...selectedOrgs, pendingOrg]);
    }
    setPendingOrg('');
  };
  const handleRemoveOrg = o => setSelectedOrgs(selectedOrgs.filter(x => x !== o));

  const handleAddCategory = () => {
    if (!pendingCategory) return;
    if (pendingCategory === 'none') {
      setSelectedCategories(['none']);
    } else {
      if (selectedCategories.includes('none')) {
        alert('Remove "None" first');
        return;
      }
      if (!selectedCategories.includes(pendingCategory)) {
        setSelectedCategories([...selectedCategories, pendingCategory]);
      }
    }
    setPendingCategory('');
  };
  const handleRemoveCategory = c => setSelectedCategories(selectedCategories.filter(x => x !== c));

  const handleAddSubCategory = () => {
    if (pendingSubCategory && !selectedSubCategories.includes(pendingSubCategory)) {
      setSelectedSubCategories([...selectedSubCategories, pendingSubCategory]);
    }
    setPendingSubCategory('');
  };
  const handleRemoveSubCategory = c => setSelectedSubCategories(selectedSubCategories.filter(x => x !== c));

  const handleAddPI = () => {
    if (pendingPI && !selectedPIs.includes(pendingPI)) {
      setSelectedPIs([...selectedPIs, pendingPI]);
    }
    setPendingPI('');
  };
  const handleRemovePI = p => setSelectedPIs(selectedPIs.filter(x => x !== p));

  const handleAddFundingOrg = () => {
    if (pendingFundingOrg && !selectedFundingOrgs.includes(pendingFundingOrg)) {
      setSelectedFundingOrgs([...selectedFundingOrgs, pendingFundingOrg]);
    }
    setPendingFundingOrg('');
  };
  const handleRemoveFundingOrg = f => setSelectedFundingOrgs(selectedFundingOrgs.filter(x => x !== f));

  const handleResetFilters = () => {
    setFilterYear('');
    setSelectedOrgs([]);
    setPendingOrg('');
    if (data.length) {
      const vals = data.map(r => r.FundingsSek).filter(Boolean);
      setMinFunding(Math.min(...vals));
      setMaxFunding(Math.max(...vals));
    }
    setFilterGender('');
    setSelectedCategories([]);
    setPendingCategory('');
    setSelectedSubCategories([]);
    setPendingSubCategory('');
    setSelectedPIs([]);
    setPendingPI('');
    setSelectedFundingOrgs([]);
    setPendingFundingOrg('');
    setOrgFilterCategory('all');
    if (years.length) {
      setSliderYears([Math.min(...years), Math.max(...years)]);
    }
  };

  // --- Dynamic Filtering ---
  useEffect(() => {
    if (!data.length) return;
    const result = data.filter(r => {
      const yearOk = filterYear
        ? r.year === +filterYear
        : (r.year >= sliderYears[0] && r.year <= sliderYears[1]);
      return yearOk
        && (!selectedOrgs.length || selectedOrgs.includes(r.CoordinatingOrganisationNameEn))
        && r.FundingsSek >= minFunding && r.FundingsSek <= maxFunding
        && (!filterGender || r.gender === filterGender)
        && (!selectedCategories.length
          || (selectedCategories.includes('none')
            ? !r.scbsCategories.length
            : r.scbsCategories.some(c => selectedCategories.includes(c))
          ))
        && (!selectedSubCategories.length
          || (selectedSubCategories.includes('none')
            ? !r.subCategories.length
            : r.subCategories.some(sc => selectedSubCategories.includes(sc))
          ))
        && (!selectedPIs.length || selectedPIs.includes(r.piName))
        && (!selectedFundingOrgs.length || selectedFundingOrgs.includes(r.FundingOrganisationNameEn));
    });
    setFilteredData(result);
  }, [
    data, filterYear, sliderYears, selectedOrgs,
    minFunding, maxFunding, filterGender,
    selectedCategories, selectedSubCategories,
    selectedPIs, selectedFundingOrgs
  ]);

  // --- Table Columns ---
  const columns = useMemo(() => [
    {
      Header: 'Project Title',
      accessor: row => row.ProjectTitleEn || row.ProjectTitleSv || 'No Title Available',
      Cell: ({ value }) => <span title={value}>{value}</span>
    },
    {
      Header: 'Organization',
      accessor: 'CoordinatingOrganisationNameEn',
      Cell: ({ value }) => <span title={value}>{value}</span>
    },
    {
      Header: 'Funding (SEK)',
      accessor: 'FundingsSek',
      Cell: ({ value }) => (
        <span title={value}>{new Intl.NumberFormat('sv-SE').format(value)}</span>
      )
    }
  ], []);

  // --- Filtered Organizations ---
  const filteredOrganizations = useMemo(() => {
    let orgs = [...organizations];
    if (orgFilterCategory === 'university') {
      orgs = orgs.filter(o => /school|university|institute|college/i.test(o));
    } else if (orgFilterCategory === 'kommun') {
      orgs = orgs.filter(o => /kommun/i.test(o));
    } else if (orgFilterCategory === 'others') {
      orgs = orgs.filter(o => !/school|university|institute|college|kommun/i.test(o));
    }
    orgs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return orgs;
  }, [organizations, orgFilterCategory]);

  // --- React Table Setup ---
  const {
    getTableProps, getTableBodyProps,
    headerGroups, page, prepareRow,
    canPreviousPage, canNextPage,
    pageOptions, state: { pageIndex },
    gotoPage, nextPage, previousPage
  } = useTable(
    { columns, data: filteredData, initialState: { pageSize: 10 } },
    useSortBy, usePagination
  );

  const handleSliderChange = newRange => {
    setSliderYears(newRange);
    setFilterYear('');
  };

  // Inline style to center & fill viewport before upload
  const preUploadStyle = !fileUploaded && !isLoading
    ? {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
    : {};

  return (
    <div className="visualise-container" style={preUploadStyle}>
      <h1>Research Application Visualization</h1>

      {/* File Upload + Spinner + Floating Image + Error */}
      <div className="file-upload-section">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        {isLoading && (
          <div className="loading-spinner" /> // This allows the loading spinner to spin
        )}
        {!fileUploaded && !isLoading && (
          <img src="/visrobot.png" alt="VisRobot" className="startup-image" />
        )}
      </div>

      {/* Main Content */}
      {fileUploaded && (
        <div className="visualise-content">
          <div className="filter-sidebar">
            <h2>Filters:</h2>

            {/* Project Year */}
            <div className="filter-group">
              <h3>Project Year</h3>
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Year Range */}
            {years.length > 0 && (
              <div className="filter-group">
                <h3>Project Year Range</h3>
                <DualSlider
                  min={Math.min(...years)}
                  max={Math.max(...years)}
                  values={sliderYears}
                  onChange={handleSliderChange}
                />
              </div>
            )}

            {/* Organization */}
            <div className="filter-group">
              <h3>Organization</h3>
              <div className="quick-org-filters">
                <button
                  className={orgFilterCategory === 'university' ? 'quick-org-active' : ''}
                  onClick={() => setOrgFilterCategory('university')}
                >University & Institute</button>
                <button
                  className={orgFilterCategory === 'kommun' ? 'quick-org-active' : ''}
                  onClick={() => setOrgFilterCategory('kommun')}
                >Kommun</button>
                <button
                  className={orgFilterCategory === 'others' ? 'quick-org-active' : ''}
                  onClick={() => setOrgFilterCategory('others')}
                >Others</button>
                <button onClick={() => setOrgFilterCategory('all')}>Show All Orgs.</button>
              </div>

              <div className="category-select-area">
                <input
                  type="text"
                  list="orgOptions"
                  placeholder="Search Organization…"
                  value={pendingOrg}
                  onChange={e => setPendingOrg(e.target.value)}
                />
                <datalist id="orgOptions">
                  {(pendingOrg
                    ? filteredOrganizations.filter(o => o.toLowerCase().includes(pendingOrg.toLowerCase()))
                    : filteredOrganizations
                  ).map(o => <option key={o} value={o} />)}
                </datalist>
                <button onClick={handleAddOrg}>Add</button>
              </div>
              <div className="selected-categories">
                {selectedOrgs.map(o => (
                  <div key={o} className="category-chip">
                    {o} <button onClick={() => handleRemoveOrg(o)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Organisation */}
            <div className="filter-group">
              <h3>Funding Organisation</h3>
              <div className="category-select-area">
                <input
                  type="text"
                  list="fundingOptions"
                  placeholder="Search Funding Organisation…"
                  value={pendingFundingOrg}
                  onChange={e => setPendingFundingOrg(e.target.value)}
                />
                <datalist id="fundingOptions">
                  {uniqueFundingOrgs.map(f => <option key={f} value={f} />)}
                </datalist>
                <button onClick={handleAddFundingOrg}>Add</button>
              </div>
              <div className="selected-categories">
                {selectedFundingOrgs.map(f => (
                  <div key={f} className="category-chip">
                    {f} <button onClick={() => handleRemoveFundingOrg(f)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Range */}
            <div className="filter-group">
              <h3>Funding Range</h3>
              <div className="range-inputs">
                <input
                  type="number"
                  value={minFunding}
                  onChange={e => setMinFunding(+e.target.value)}
                  min={0}
                />
                <span>to</span>
                <input
                  type="number"
                  value={maxFunding}
                  onChange={e => setMaxFunding(+e.target.value)}
                  min={minFunding}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="filter-group">
              <h3>Gender of Principal Investigator</h3>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Principal Investigator */}
            <div className="filter-group">
              <h3>Principal Investigator</h3>
              <div className="category-select-area">
                <input
                  type="text"
                  list="piOptions"
                  placeholder="Search Name…"
                  value={pendingPI}
                  onChange={e => setPendingPI(e.target.value)}
                />
                <datalist id="piOptions">
                  {(pendingPI
                    ? uniquePIs.filter(pi => pi.toLowerCase().includes(pendingPI.toLowerCase()))
                    : uniquePIs
                  ).map(pi => <option key={pi} value={pi} />)}
                </datalist>
                <button onClick={handleAddPI}>Add</button>
              </div>
              <div className="selected-categories">
                {selectedPIs.map(pi => (
                  <div key={pi} className="category-chip">
                    {pi} <button onClick={() => handleRemovePI(pi)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h3>Category</h3>
              <div className="category-select-area">
                <select value={pendingCategory} onChange={e => setPendingCategory(e.target.value)}>
                  <option value="" disabled>Select a category</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="none">None (N/A)</option>
                </select>
                <button onClick={handleAddCategory}>Add</button>
              </div>
              <div className="selected-categories">
                {selectedCategories.map(c => (
                  <div key={c} className="category-chip">
                    {c} <button onClick={() => handleRemoveCategory(c)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Category */}
            <div className="filter-group">
              <h3>Sub-Category</h3>
              <div className="category-select-area">
                <input
                  type="text"
                  list="subCatOptions"
                  placeholder="Search sub-category…"
                  value={pendingSubCategory}
                  onChange={e => setPendingSubCategory(e.target.value)}
                />
                <datalist id="subCatOptions">
                  {(pendingSubCategory
                    ? uniqueSubCategories.filter(opt => opt.toLowerCase().includes(pendingSubCategory.toLowerCase()))
                    : uniqueSubCategories
                  ).map(opt => <option key={opt} value={opt} />)}
                </datalist>
                <button onClick={handleAddSubCategory}>Add</button>
              </div>
              <div className="selected-categories">
                {selectedSubCategories.map(c => (
                  <div key={c} className="category-chip">
                    {c} <button onClick={() => handleRemoveSubCategory(c)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <button className="reset-filters-btn" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>

          {/* Data Table */}
          <div className="data-table">
            <h2>List:</h2>
            {filteredData.length > 0 ? (
              <>
                <table {...getTableProps()}>
                  <thead>
                    {headerGroups.map(hg => {
                      const { key, ...hgProps } = hg.getHeaderGroupProps();
                      return (
                        <tr key={key} {...hgProps}>
                          {hg.headers.map(col => {
                            const { key: thKey, ...thProps } = col.getHeaderProps(col.getSortByToggleProps());
                            return (
                              <th key={thKey} {...thProps}>
                                {col.render('Header')}
                                <span className="sort-indicator">
                                  {col.isSorted ? (col.isSortedDesc ? ' 🔽' : ' 🔼') : ' ⇅'}
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map(row => {
                      prepareRow(row);
                      const { key: rowKey, ...rowProps } = row.getRowProps();
                      return (
                        <tr key={rowKey} {...rowProps} onClick={() => { setSelectedProject(row.original); setModalVisible(true); }}>
                          {row.cells.map(cell => {
                            const { key: cellKey, ...cellProps } = cell.getCellProps();
                            return (
                              <td key={cellKey} {...cellProps}>
                                {cell.render('Cell')}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>

                </table>

                {/* Pagination */}
                <div className="pagination-controls">
                  <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
                  <button onClick={previousPage} disabled={!canPreviousPage}>Previous</button>
                  <span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
                  <button onClick={nextPage} disabled={!canNextPage}>Next</button>
                  <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>{'>>'}</button>
                </div>

                {/* Diagram */}
                <div className="diagram-container">
                  <Diagram data={filteredData} />
                </div>
              </>
            ) : (
              <div className="no-results">No projects match the selected filters</div>
            )}
          </div>
        </div>
      )}

      {/* Abstract Modal */}
      <Abstract
        open={modalVisible}
        onOpenChange={() => setModalVisible(false)}
        data={selectedProject}
      />
    </div>
  );
}

export default Visualize;
