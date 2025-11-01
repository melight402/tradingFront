import html2canvas from 'html2canvas';

export const takeScreenshot = async (element = document.body) => {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw new Error('Failed to take screenshot');
  }
};

