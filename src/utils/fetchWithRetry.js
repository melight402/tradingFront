export const fetchWithRetry = async (url, maxRetries = 3, retryDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err.name === 'AbortError' || attempt === maxRetries - 1) {
        throw err;
      }
      
      if (err instanceof TypeError && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('network') ||
        err.message.includes('connection')
      )) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw err;
    }
  }
};

