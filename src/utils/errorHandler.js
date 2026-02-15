/**
 * Централизованный обработчик ошибок
 * Заменяет везде "void 0;" на правильную обработку
 */

/* global process */

const isDevelopment = typeof window !== 'undefined' && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

export const createErrorLogger = (context = 'App') => {
  return (error, fallbackValue = null) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[${context}] Error:`, errorMessage);
      if (errorStack) {
        // eslint-disable-next-line no-console
        console.error('Stack:', errorStack);
      }
    }
    
    return fallbackValue;
  };
};

export const safeJSONParse = (jsonString, fallback = null, context = 'JSONParse') => {
  try {
    return jsonString ? JSON.parse(jsonString) : fallback;
  } catch (error) {
    const logger = createErrorLogger(context);
    return logger(error, fallback);
  }
};

export const safeExecute = async (fn, fallback = null, context = 'Execute') => {
  try {
    return await fn();
  } catch (error) {
    const logger = createErrorLogger(context);
    return logger(error, fallback);
  }
};

export const logError = (context, error, fallback = null) => {
  const logger = createErrorLogger(context);
  return logger(error, fallback);
};
