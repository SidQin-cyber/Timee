// 临时 CORS 修复配置
module.exports = {
  origin: (origin, callback) => {
    // 在生产环境中临时允许所有来源，用于调试
    console.log('CORS Request from origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Origin'
  ],
  optionsSuccessStatus: 200
};
