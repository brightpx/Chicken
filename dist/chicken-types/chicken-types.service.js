"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChickenTypesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../common/supabase.service");
const orders_service_1 = require("../orders/orders.service");
let ChickenTypesService = class ChickenTypesService {
    supabaseService;
    ordersService;
    constructor(supabaseService, ordersService) {
        this.supabaseService = supabaseService;
        this.ordersService = ordersService;
    }
    async create(dto) {
        const defaultCookingPrice = await this.supabaseService.getDefaultCookingPriceSetting();
        const entity = {
            id: `chicken-${Date.now()}`,
            name: dto.name,
            unitWeightKg: dto.unitWeightKg,
            pricePerKg: dto.pricePerKg,
            averagePrice: dto.averagePrice,
            isActive: true,
            preparationType: dto.preparationType ?? 'fresh',
            cookingPrice: dto.cookingPrice ?? defaultCookingPrice,
        };
        return this.supabaseService.createChickenType(entity);
    }
    async findAll() {
        return this.supabaseService.listChickenTypes();
    }
    async update(id, dto) {
        const existing = await this.supabaseService.findChickenTypeById(id);
        const updated = await this.supabaseService.updateChickenType(id, dto);
        if (updated && dto.averagePrice !== undefined && dto.averagePrice !== existing?.averagePrice) {
            await this.ordersService.recalculatePricesForChickenType(id, updated.averagePrice);
        }
        return updated;
    }
};
exports.ChickenTypesService = ChickenTypesService;
exports.ChickenTypesService = ChickenTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        orders_service_1.OrdersService])
], ChickenTypesService);
//# sourceMappingURL=chicken-types.service.js.map