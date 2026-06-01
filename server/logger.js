const isDebug = process.env.NODE_ENV !== 'production';

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaText = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}] ${message}${metaText}`;
}

function info(message, meta) {
  console.log(formatMessage('info', message, meta));
}

function warn(message, meta) {
  console.warn(formatMessage('warn', message, meta));
}

function error(message, meta) {
  console.error(formatMessage('error', message, meta));
}

function debug(message, meta) {
  if (!isDebug) return;
  console.debug(formatMessage('debug', message, meta));
}

module.exports = {
  info,
  warn,
  error,
  debug,
};
