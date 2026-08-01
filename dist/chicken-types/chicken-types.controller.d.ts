import { ChickenTypesService, CreateChickenTypeDto } from './chicken-types.service';
export declare class ChickenTypesController {
    private readonly chickenTypesService;
    constructor(chickenTypesService: ChickenTypesService);
    create(dto: CreateChickenTypeDto): Promise<import("./chicken-types.service").ChickenTypeEntity>;
    findAll(): Promise<import("./chicken-types.service").ChickenTypeEntity[]>;
}
