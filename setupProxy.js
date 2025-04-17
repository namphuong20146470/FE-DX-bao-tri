const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    createProxyMiddleware('/api', {
      target: 'https://192.168.0.252:3000',
      changeOrigin: true,
      secure: false,
    })
  );
};