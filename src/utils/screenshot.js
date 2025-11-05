import html2canvas from 'html2canvas';

export const takeScreenshot = async (element = document.body) => {
  try {
    console.log('Starting screenshot capture, element:', element);
    
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      logging: false,
    });

    console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          reject(new Error('Failed to create screenshot blob'));
          return;
        }
        console.log('Screenshot blob created successfully, size:', blob.size, 'type:', blob.type);
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw new Error('Failed to take screenshot: ' + error.message);
  }
};

