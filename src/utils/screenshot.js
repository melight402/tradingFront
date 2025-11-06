import html2canvas from 'html2canvas';

export const takeScreenshot = async (element = document.body) => {
  try {
    
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      logging: false,
    });


    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create screenshot blob'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    throw new Error('Failed to take screenshot: ' + error.message);
  }
};

