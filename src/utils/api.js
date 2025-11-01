const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const uploadScreenshot = async (screenshotBlob) => {
  const formData = new FormData();
  formData.append('screenshot', screenshotBlob, 'screenshot.png');

  const response = await fetch(`${API_BASE_URL}/screenshots/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload screenshot');
  }

  return await response.json();
};

export const savePositions = async (positions, screenshotPath) => {
  const payload = {
    positions: positions,
    screenshot: screenshotPath,
    metadata: {
      timestamp: new Date().toISOString(),
      exportTime: new Date().toISOString(),
    },
  };

  const response = await fetch(`${API_BASE_URL}/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save positions');
  }

  return await response.json();
};

export const openPosition = async (positionData, screenshotBlob) => {
  const formData = new FormData();
  
  formData.append('positionData', JSON.stringify(positionData));
  
  if (screenshotBlob) {
    formData.append('screenshot', screenshotBlob, 'screenshot.png');
  }

  const response = await fetch(`${API_BASE_URL}/positions/trading/open`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to open position');
  }

  return await response.json();
};

export const closePosition = async (closeData, screenshotBlob) => {
  const formData = new FormData();
  
  formData.append('closeData', JSON.stringify(closeData));
  
  if (screenshotBlob) {
    formData.append('screenshot', screenshotBlob, 'screenshot.png');
  }

  const response = await fetch(`${API_BASE_URL}/positions/trading/close`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to close position');
  }

  return await response.json();
};

