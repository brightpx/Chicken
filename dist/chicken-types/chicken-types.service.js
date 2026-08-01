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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChickenTypesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../common/supabase.service");
let ChickenTypesService = class ChickenTypesService {
    supabaseService;
    items = [];
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(dto) {
        const entity = {
            id: `chicken-${Date.now()}`,
            name: dto.name,
            unitWeightKg: dto.unitWeightKg,
            pricePerKg: dto.pricePerKg,
            averagePrice: dto.averagePrice,
            isActive: true,
        };
        this.items.push(entity);
        const client = this.supabaseService?.getClient();
        if (client) {
            await client.from('chicken_types').insert({
                id: entity.id,
                name: entity.name,
                unit_weight_kg: entity.unitWeightKg,
                price_per_kg: entity.pricePerKg,
                average_price: entity.averagePrice,
                is_active: entity.isActive,
            });
        }
        return entity;
    }
    async findAll() {
        const client = this.supabaseService?.getClient();
        if (client) {
            const { data } = await client.from('chicken_types').select('*');
            if (data) {
                return data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    unitWeightKg: item.unit_weight_kg,
                    pricePerKg: item.price_per_kg,
                    averagePrice: item.average_price,
                    isActive: item.is_active,
                }));
            }
        }
        return this.items;
    }
};
exports.ChickenTypesService = ChickenTypesService;
exports.ChickenTypesService = ChickenTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ChickenTypesService);
//# sourceMappingURL=chicken-types.service.js.map