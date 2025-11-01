const fetch = require('node-fetch');

const generateStepSizes = async () => {
  try {
    console.log('Fetching exchange info from Binance...');
    const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const exchangeInfo = await response.json();
    
    const stepSizes = {};
    
    exchangeInfo.symbols
      .filter((symbolInfo) => {
        return (
          symbolInfo.status === 'TRADING' &&
          symbolInfo.contractType === 'PERPETUAL' &&
          (symbolInfo.symbol.endsWith("USDT") || symbolInfo.symbol.endsWith("USDC"))
        );
      })
      .forEach((symbolInfo) => {
        const lotSizeFilter = symbolInfo.filters?.find(f => f.filterType === 'LOT_SIZE');
        if (lotSizeFilter && lotSizeFilter.stepSize) {
          stepSizes[symbolInfo.symbol] = lotSizeFilter.stepSize;
        }
      });

    const jsContent = `export const BINANCE_FUTURES_STEP_SIZES = ${JSON.stringify(stepSizes, null, 2)};\n`;

    console.log(`Generated step sizes for ${Object.keys(stepSizes).length} symbols`);
    console.log('Sample symbols:', Object.keys(stepSizes).slice(0, 5));
    
    return jsContent;
  } catch (error) {
    console.error('Error generating step sizes:', error);
    throw error;
  }
};

if (require.main === module) {
  generateStepSizes()
    .then((content) => {
      const fs = require('fs');
      const path = require('path');
      const outputPath = path.join(__dirname, '../constants/binanceStepSizes.js');
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`Step sizes saved to ${outputPath}`);
    })
    .catch((error) => {
      console.error('Failed to generate step sizes:', error);
      process.exit(1);
    });
}

module.exports = { generateStepSizes };

