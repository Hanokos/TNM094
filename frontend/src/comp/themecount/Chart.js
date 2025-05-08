import React, { useState, useEffect } from 'react';

function Chart({ themeCounts, chartImage }) {
  const [isImageLoading, setIsImageLoading] = useState(false); // Track if the image is loading
  const [previousImage, setPreviousImage] = useState(null); // Keep track of the previous image to hide it while loading

  useEffect(() => {
    if (chartImage) {
      setIsImageLoading(true); // Start the spinner when a new image is set
      setPreviousImage(chartImage); // Store the previous image
    }
  }, [chartImage]);

  const handleImageLoad = () => {
    setIsImageLoading(false); // Image has finished loading
  };

  return (
    <div>
      <h3>Theme Counts</h3>
      <ul>
        {Object.keys(themeCounts).map((theme) => (
          <li key={theme}>{theme}: {themeCounts[theme]}</li>
        ))}
      </ul>

      {/* Chart Container */}
      <div className="chart-container">
        {/* Show loading spinner only if the image is loading */}
        {isImageLoading && !previousImage && <div className="loading-spinner"></div>}

        {/* Render the chart image if it's available */}
        {chartImage && (
          <div>
            <h3>Chart</h3>
            {/* When image finishes loading, trigger the handleImageLoad */}
            <img
              src={`http://127.0.0.1:8000/static/${chartImage}`}
              alt="Chart"
              style={{ maxWidth: '100%', marginTop: '20px' }}
              onLoad={handleImageLoad} // Trigger image load event
              onError={() => setIsImageLoading(false)} // Hide spinner on error if image fails to load
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chart;
