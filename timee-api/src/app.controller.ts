import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Enhanced health check for Sealos deployment monitoring
  @Get('health')
  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Timee API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      external_url: 'http://wmxkwzbmhlj.sealoshzh.site/api'
    };
  }

  // Add root-level API endpoints for direct access
  @Get('events')
  getRootEvents(): string {
    return 'API endpoints are available at /api/events - please use the /api prefix';
  }

  @Get('status')
  getStatus(): object {
    return {
      message: 'Timee API is running',
      api_endpoints: {
        health: '/api/health',
        events: '/api/events',
        root: '/api'
      },
      external_access: 'http://wmxkwzbmhlj.sealoshzh.site/api'
    };
  }
} 