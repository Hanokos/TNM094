import React, { useState } from 'react';

const FileUpload = ({ setThemeCounts, setChartImage }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true); // Show loading animation
    try {
      const response = await fetch('http://127.0.0.1:8000/upload-csv/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload CSV');
      }

      const data = await response.json();
      console.log('CSV Data:', data);

      // Update the theme counts and chart image URL
      setThemeCounts(data.theme_counts);  // Update theme counts
      setChartImage(data.chart_image + "?t=" + new Date().getTime()); // Force reload the image by appending a timestamp

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Hide loading animation
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload CSV</button>

      {/* Display loading spinner while uploading */}
      {isLoading && <div className="loading-spinner"></div>}
    </div>
  );
};

export default FileUpload;
