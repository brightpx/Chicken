import { ChickenTypesService, CreateChickenTypeDto, UpdateChickenTypeDto } from './chicken-types.service';
export declare class ChickenTypesController {
    private readonly chickenTypesService;
    constructor(chickenTypesService: ChickenTypesService);
    create(dto: CreateChickenTypeDto): Promise<import("../common/supabase.service").ChickenTypeRecord>;
    findAll(): Promise<import("../common/supabase.service").ChickenTypeRecord[]>;
    update(id: string, dto: UpdateChickenTypeDto): Promise<import("../common/supabase.service").ChickenTypeRecord | null>;
}
