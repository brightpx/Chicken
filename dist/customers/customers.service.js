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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../common/supabase.service");
let CustomersService = class CustomersService {
    supabaseService;
    items = [];
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(dto) {
        const entity = {
            id: `customer-${Date.now()}`,
            name: dto.name,
            phone: dto.phone,
            address: dto.address,
            deliveryMethod: dto.deliveryMethod,
        };
        this.items.push(entity);
        const client = this.supabaseService?.getClient();
        if (client) {
            await client.from('customers').insert({
                id: entity.id,
                name: entity.name,
                phone: entity.phone,
                address: entity.address,
                delivery_method: entity.deliveryMethod,
            });
        }
        return entity;
    }
    async findAll() {
        const client = this.supabaseService?.getClient();
        if (client) {
            const { data } = await client.from('customers').select('*');
            if (data) {
                return data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    phone: item.phone,
                    address: item.address,
                    deliveryMethod: item.delivery_method,
                }));
            }
        }
        return this.items;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map