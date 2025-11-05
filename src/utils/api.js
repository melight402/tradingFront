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
    const errorMessage = error.error || error.details || 'Failed to open position';
    const binanceError = error.binanceError;
    
    if (binanceError && (binanceError.code === -2019 || binanceError.code === '-2019')) {
      throw new Error('Недостаточно маржи на счете для открытия позиции. Пополните баланс или уменьшите размер позиции.');
    }
    
    if (binanceError?.code) {
      throw new Error(`Ошибка Binance (код ${binanceError.code}): ${binanceError.message || errorMessage}`);
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const closePosition = async (closeData, screenshotBlob) => {
  const formData = new FormData();
  
  formData.append('closeData', JSON.stringify(closeData));
  
  if (screenshotBlob) {
    formData.append('screenshot', screenshotBlob, 'screenshot.png');
    console.log('✅ Screenshot blob added to FormData, size:', screenshotBlob.size, 'bytes, type:', screenshotBlob.type);
    
    for (const pair of formData.entries()) {
      if (pair[0] === 'screenshot') {
        console.log('FormData entry "screenshot":', pair[0], 'size:', pair[1].size || 'unknown');
      }
    }
  } else {
    console.error('❌ No screenshot blob provided to closePosition');
  }

  console.log('Sending close position request to:', `${API_BASE_URL}/positions/trading/close`);
  const response = await fetch(`${API_BASE_URL}/positions/trading/close`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Close position request failed:', error);
    throw new Error(error.error || 'Failed to close position');
  }

  const result = await response.json();
  console.log('✅ Position closed successfully. Response:', result);
  if (result.data?.closeScreenshotPath) {
    console.log('✅ Close screenshot path in response:', result.data.closeScreenshotPath);
  } else {
    console.error('❌ No close screenshot path in response!');
  }
  return result;
};

