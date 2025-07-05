import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): object;
    getRootEvents(): string;
    getStatus(): object;
}
