import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateTCode;
    create(createEventDto: CreateEventDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateData: Partial<CreateEventDto>): Promise<any>;
    remove(id: string): Promise<void>;
    findRecent(limit?: number): Promise<any[]>;
}
