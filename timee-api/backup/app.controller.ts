import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // Since we have a global prefix '/api', this route is actually '/api'
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

  // Root-level API endpoints for direct access have been moved to dedicated controllers

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