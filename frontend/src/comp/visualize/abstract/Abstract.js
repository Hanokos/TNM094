import React from 'react';
import './Abstract.css'; // Separate CSS for styling the popup

/**
 * Abstract Popup Component
 * Displays project information along with involved people details
 * parsed from the "InvolvedPeople" column.
 *
 * Props:
 *   open (boolean) – whether the popup is visible
 *   onOpenChange (function) – callback to close the popup
 *   data (object) – the selected project data; should include at least:
 *       ProjectId, ProjectTitleEn or ProjectTitleSv, ProjectAbstractEn,
 *       CoordinatingOrganisationNameEn, year, FundingsSek, InvolvedPeople,
 *       scbsCategories (main categories), subCategories (sub-categories),
 *       FundingOrganisationNameEn
 */
const Abstract = ({ open, onOpenChange, data }) => {
  if (!open || !data) return null;

  const projectUrl = `https://www.vr.se/english/swecris.html?project=${data.ProjectId}#/`;
  const projectTitle = data.ProjectTitleEn || data.ProjectTitleSv || 'No Title Available';
  const fundingYear = data.year || 'N/A';

  let involvedPeople = [];
  if (data.InvolvedPeople) {
    involvedPeople = data.InvolvedPeople
      .split('¤¤¤')
      .filter(record => record.trim() !== '')
      .map(record => {
        const parts = record.split('¤').map(s => s.trim());
        return {
          name: parts[1] || 'Unknown',
          role: parts[3] || 'Unknown'
        };
      })
      .sort((a, b) => {
        if (a.role === 'Principal Investigator' && b.role !== 'Principal Investigator') {
          return -1;
        } else if (b.role === 'Principal Investigator' && a.role !== 'Principal Investigator') {
          return 1;
        }
        return 0;
      });
  }

  return (
    <div className="abstract-overlay" onClick={onOpenChange}>
      <div className="abstract-content" onClick={e => e.stopPropagation()}>
        <div className="abstract-header">
          <div className="close-button">
            <button className="btn-circle btn-primary" onClick={onOpenChange}>
              X
            </button>
          </div>
          <div className="title">
            <h1 className="abstract-title">{projectTitle}</h1>
          </div>
        </div>

        <div className="abstract-body">
          <div className="abstract-left">
            <p className="project-title">Abstract</p>
            {data.ProjectAbstractEn ? (
              <p className="abstract-text">{data.ProjectAbstractEn}</p>
            ) : (
              <p className="abstract-text">
                No abstract available. Click on the ProjectID link to check if SWECRIS has it.
              </p>
            )}
          </div>

          <div className="abstract-right">
            <div className="abstract-info-row">
              <strong className="project-id">Project ID:</strong>
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="abstract-link"
              >
                {data.ProjectId}
              </a>
            </div>

            <div className="abstract-info-row">
              <strong className="coord-org">Coordinating Organisation:</strong>
              <span>{data.CoordinatingOrganisationNameEn || 'N/A'}</span>
            </div>

            {involvedPeople.length > 0 && (
              <div className="abstract-info-row">
                <strong className="involved-people">Involved People:</strong>
                <div className="involved-people">
                  {involvedPeople.map((person, index) => (
                    <span key={index} className="person-info">
                      {person.role}: {person.name}
                      {index !== involvedPeople.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="abstract-info-row">
              <strong className="main-catergory">Main Category:</strong>
              <span>
                {data.scbsCategories && data.scbsCategories.length > 0
                  ? data.scbsCategories.join(', ')
                  : 'N/A'}
              </span>
            </div>

            <div className="abstract-info-row">
              <strong className="sub-category">Sub-Category:</strong>
              <span>
                {data.subCategories && data.subCategories.length > 0
                  ? data.subCategories.join(', ')
                  : 'N/A'}
              </span>
            </div>

            <div className="funding">
              <div className="abstract-info-row">
                <strong className="project-year">Project year:</strong>
                <span>{fundingYear}</span>
              </div>

              <div className="abstract-info-row">
                <strong className="project-year">Funding Organisation:</strong>
                <span>{data.FundingOrganisationNameEn || 'N/A'}</span>
              </div>

              <div className="abstract-info-row-funding">
                <div className="funding">
                  <strong className="funding-total">Total funding: </strong>
                </div>
                <div className="sum">
                  <span>{new Intl.NumberFormat('sv-SE').format(data.FundingsSek)}</span>
                  <p style={{ textIndent: '0.2em' }}> kr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Abstract;
