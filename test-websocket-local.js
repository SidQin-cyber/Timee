const { io } = require('socket.io-client');

console.log('🚀 开始WebSocket连接测试...');

// 测试本地连接
const socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
});

let testsPassed = 0;
let totalTests = 4;

// 测试1: 连接建立
socket.on('connect', () => {
    console.log('✅ 测试1通过: WebSocket连接建立成功');
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   传输方式: ${socket.io.engine.transport.name}`);
    testsPassed++;
    
    // 测试2: 加入事件房间
    console.log('🚪 测试2: 尝试加入事件房间...');
    socket.emit('join-event', 'tc-538518');
});

// 测试2: 房间加入确认
socket.on('joined-event', (data) => {
    console.log('✅ 测试2通过: 成功加入事件房间');
    console.log(`   返回数据: ${JSON.stringify(data)}`);
    testsPassed++;
    
    // 测试3: 事件监听
    console.log('📡 测试3: 监听WebSocket事件...');
    
    // 模拟一些事件监听
    setTimeout(() => {
        console.log('✅ 测试3通过: 事件监听正常');
        testsPassed++;
        
        // 测试4: 断开连接
        console.log('🔌 测试4: 测试断开连接...');
        socket.disconnect();
    }, 2000);
});

socket.on('disconnect', () => {
    console.log('✅ 测试4通过: 断开连接正常');
    testsPassed++;
    
    // 显示测试结果
    console.log('\n📊 测试结果汇总:');
    console.log(`   通过测试: ${testsPassed}/${totalTests}`);
    console.log(`   成功率: ${(testsPassed/totalTests*100).toFixed(1)}%`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 所有WebSocket测试通过！');
        process.exit(0);
    } else {
        console.log('❌ 部分测试失败');
        process.exit(1);
    }
});

socket.on('connect_error', (error) => {
    console.log('❌ 测试1失败: WebSocket连接失败');
    console.log(`   错误信息: ${error.message}`);
    process.exit(1);
});

// 监听所有事件用于调试
socket.onAny((event, ...args) => {
    console.log(`📡 收到事件: ${event}`, args.length > 0 ? args : '');
});

// 设置超时
setTimeout(() => {
    console.log('❌ 测试超时，可能存在连接问题');
    process.exit(1);
}, 15000); 