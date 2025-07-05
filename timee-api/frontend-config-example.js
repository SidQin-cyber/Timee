// 🚀 Timee 前端 API 配置示例

// API 配置
const API_CONFIG = {
  // 本地开发
  development: 'http://localhost:8080/api',
  
  // 生产环境 (Sealos外部访问配置后)
  production: 'http://wmxkwzbmhlj.sealoshzh.site/api',
  
  // 当前环境
  current: process.env.NODE_ENV === 'production' 
    ? 'http://wmxkwzbmhlj.sealoshzh.site/api'
    : 'http://localhost:8080/api'
};

// API 服务类
class TimeeAPIService {
  constructor() {
    this.baseURL = API_CONFIG.current;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    return this.request('/health');
  }

  // 事件管理
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // 响应管理
  async getEventResponses(eventId) {
    return this.request(`/events/${eventId}/responses`);
  }

  async submitResponse(eventId, responseData) {
    return this.request(`/events/${eventId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  async deleteResponse(eventId, participantName) {
    return this.request(`/events/${eventId}/responses/${participantName}`, {
      method: 'DELETE',
    });
  }
}

// 使用示例

// 1. 实例化服务
const timeeAPI = new TimeeAPIService();

// 2. React Hook 示例
/*
import { useState, useEffect } from 'react';

export function useTimeeAPI() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await timeeAPI.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}
*/

// 3. 基础使用示例
async function exampleUsage() {
  try {
    // 检查API状态
    const health = await timeeAPI.healthCheck();
    console.log('API健康状态:', health);

    // 获取事件列表
    const events = await timeeAPI.getEvents();
    console.log('事件列表:', events);

    // 创建新事件
    const newEvent = await timeeAPI.createEvent({
      id: `event-${Date.now()}`,
      title: '团队会议',
      description: '周例会讨论',
      startDate: '2025-06-20',
      endDate: '2025-06-22',
      eventType: 'GROUP',
      includeTime: true,
    });
    console.log('创建的事件:', newEvent);

    // 提交时间响应
    const response = await timeeAPI.submitResponse(newEvent.id, {
      eventId: newEvent.id,
      participantName: '张三',
      participantEmail: 'zhangsan@example.com',
      userInitials: 'ZS',
      availableSlots: [
        {
          date: '2025-06-20',
          times: ['09:00', '10:00', '14:00'],
        },
      ],
    });
    console.log('提交的响应:', response);

  } catch (error) {
    console.error('API调用失败:', error);
  }
}

// 4. 环境检测和切换
function switchEnvironment(env) {
  if (env === 'local') {
    timeeAPI.baseURL = API_CONFIG.development;
  } else if (env === 'production') {
    timeeAPI.baseURL = API_CONFIG.production;
  }
  console.log(`API环境切换到: ${timeeAPI.baseURL}`);
}

// 导出配置和服务
export { API_CONFIG, TimeeAPIService, timeeAPI };

// 配置完成检查清单:
// ✅ 本地开发: http://localhost:8080/api
// ⏳ 外部访问: http://wmxkwzbmhlj.sealoshzh.site/api (需要Sealos配置)
// ✅ CORS: 已配置允许所有来源
// ✅ API端点: 完整的RESTful接口
// ✅ 错误处理: 包含在服务类中 