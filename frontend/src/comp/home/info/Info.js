import React from 'react';
import './Info.css';

function Info({ closeInfo }) {
  return (
    <>
      <div className="info-overlay" onClick={closeInfo}></div>
      <div className="info-popup">
        <button className="close-btn" onClick={closeInfo}>✖</button>
        <h3>How to use D.A.R.T.</h3>
        <h4>A Quick Tutorial</h4>

        <section className="info-section">
          <h5>Getting Started</h5>
          <p>Select <strong>Visualize</strong> or <strong>Trends</strong> from the sidebar.</p>
          <p><strong>IMPORTANT!</strong> The CSV file must be from SWECRIS to make the processing step work. To download your own CSV file press the <em>"Export Data"</em> button on their website.</p>
        </section>

        <section className="info-section">
          <h5>Visualize:</h5>
          <ul>
            <li>Upload your CSV; you’ll be redirected automatically.</li>
            <li>Use filters (year, gender, institution, etc.) and click <em>"Add"</em> for each criterion.</li>
            <li>The list and graph update in real time.</li>
            <li>You can also click on the lists headers (Project Title ⇅,	Organization ⇅,	Funding⇅) to sort them descending or ascending.</li>
            <li>Click a project title to view its abstract.</li>
            <li>To reset all filters press <em>"Reset all filters"</em> button at the very bottom of the filters sidebar.</li>
          </ul>
        </section>

        <section className="info-section">
          <h5>Trends:</h5>
          <p>(The Trends page is a bit slow processing and is currently not fully working. So ¨Trends will include some random words that doesn't make sense)</p>
          <ul>
            <li>Upload your CSV, then click <em>"Upload and Analyze"</em>.</li>
            <li>Review the top 10 keywords per year in the table.</li>
            <li>Adjust the year range to explore trends over time.</li>
            <li>Click a keyword to highlight its trend line.</li>
          </ul>
        </section>
      </div>
    </>
  );
}

export default Info;
