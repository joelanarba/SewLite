const util = require('util');

/**
 * Structured logger utility to replace console.log/error
 * Provides log levels, timestamps, colorization, and monitoring-ready output
 */

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Level to color mapping
const LEVEL_COLORS = {
  debug: COLORS.gray,
  info: COLORS.cyan,
  warn: COLORS.yellow,
  error: COLORS.red
};

// Level to emoji mapping
const LEVEL_EMOJI = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌'
};

class Logger {
  constructor() {
    this.level = this._parseLogLevel(process.env.LOG_LEVEL || 'debug');
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.useColors = this.isDevelopment && process.stdout.isTTY;
    this.useJson = !this.isDevelopment;
  }

  /**
   * Parse log level from string to numeric value
   */
  _parseLogLevel(levelStr) {
    const level = levelStr.toLowerCase();
    return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.info;
  }

  /**
   * Check if a log level should be logged
   */
  _shouldLog(level) {
    return LOG_LEVELS[level] >= this.level;
  }

  /**
   * Format timestamp in ISO format
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Colorize text (only in development with TTY)
   */
  _colorize(text, color) {
    if (!this.useColors) {
      return text;
    }
    return `${color}${text}${COLORS.reset}`;
  }

  /**
   * Format log message for development (human-readable)
   */
  _formatDev(level, message, context = {}) {
    const timestamp = this._colorize(this._getTimestamp().substring(11, 23), COLORS.gray);
    const emoji = LEVEL_EMOJI[level];
    const levelStr = this._colorize(
      `[${level.toUpperCase().padEnd(5)}]`,
      LEVEL_COLORS[level]
    );
    
    let output = `${timestamp} ${emoji} ${levelStr} ${message}`;
    
    // Add context if provided
    if (Object.keys(context).length > 0) {
      const contextStr = util.inspect(context, { 
        colors: this.useColors, 
        depth: 3,
        breakLength: 100
      });
      output += `\n${this._colorize('  →', COLORS.gray)} ${contextStr}`;
    }
    
    return output;
  }

  /**
   * Format log message for production (JSON)
   */
  _formatJson(level, message, context = {}) {
    return JSON.stringify({
      timestamp: this._getTimestamp(),
      level: level.toUpperCase(),
      message,
      ...context
    });
  }

  /**
   * Core logging method
   */
  _log(level, message, context = {}) {
    if (!this._shouldLog(level)) {
      return;
    }

    const formattedMessage = this.useJson 
      ? this._formatJson(level, message, context)
      : this._formatDev(level, message, context);

    // Output to appropriate stream
    if (level === 'error') {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message, context) {
    this._log('debug', message, context);
  }

  /**
   * Info level - general informational messages
   */
  info(message, context) {
    this._log('info', message, context);
  }

  /**
   * Warning level - warning messages for potentially harmful situations
   */
  warn(message, context) {
    this._log('warn', message, context);
  }

  /**
   * Error level - error events that might still allow the application to continue
   */
  error(message, context) {
    this._log('error', message, context);
  }

  /**
   * Create a child logger with a specific module/context name
   * Useful for adding module context to all logs from that module
   */
  child(moduleName) {
    const childLogger = Object.create(this);
    childLogger._originalLog = this._log.bind(this);
    childLogger._log = (level, message, context = {}) => {
      childLogger._originalLog(level, message, { module: moduleName, ...context });
    };
    return childLogger;
  }
}

// Export singleton instance
module.exports = new Logger();
