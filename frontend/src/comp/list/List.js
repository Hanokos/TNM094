import React, { useState } from 'react';
import Papa from 'papaparse';
import { useTable, useSortBy, usePagination } from 'react-table';
import './List.css';

function List() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      delimiter: ";",
      complete: (result) => {
        if (result.data.length === 0) return;
        const headers = Object.keys(result.data[0]);
        setColumns(headers.map((header) => ({ 
          Header: header, 
          accessor: header 
        })));
        setData(result.data);
      },
      header: true,
      skipEmptyLines: true
    });
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage,
    nextPage,
    previousPage,
  } = useTable(
    { 
      columns, 
      data, 
      initialState: { pageSize: 10 } 
    }, 
    useSortBy, 
    usePagination
  );

  return (
    <div className="table-container">
      <h2>CSV-List Viewer</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      
      {data.length > 0 && (
        <>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={() => gotoPage(0)} 
              disabled={!canPreviousPage}
            >
              {'<<'}
            </button>
            <button 
              className="pagination-btn" 
              onClick={() => previousPage()} 
              disabled={!canPreviousPage}
            >
              Previous
            </button>
            <button 
              className="pagination-btn" 
              onClick={() => nextPage()} 
              disabled={!canNextPage}
            >
              Next
            </button>
            <button 
              className="pagination-btn" 
              onClick={() => gotoPage(pageOptions.length - 1)} 
              disabled={!canNextPage}
            >
              {'>>'}
            </button>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default List;
