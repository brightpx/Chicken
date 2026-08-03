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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const chicken_types_service_1 = require("../chicken-types/chicken-types.service");
const customers_service_1 = require("../customers/customers.service");
const orders_service_1 = require("../orders/orders.service");
const supabase_service_1 = require("../common/supabase.service");
const groq_service_1 = require("../groq/groq.service");
let AdminController = class AdminController {
    chickenTypesService;
    customersService;
    ordersService;
    supabaseService;
    groqService;
    constructor(chickenTypesService, customersService, ordersService, supabaseService, groqService) {
        this.chickenTypesService = chickenTypesService;
        this.customersService = customersService;
        this.ordersService = ordersService;
        this.supabaseService = supabaseService;
        this.groqService = groqService;
    }
    async getDashboard() {
        const [customers, chickenTypes, orders, defaultCookingPrice] = await Promise.all([
            this.customersService.findAll(),
            this.chickenTypesService.findAll(),
            this.ordersService.findAll(),
            this.supabaseService.getDefaultCookingPriceSetting(),
        ]);
        const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
        const chickenTypeMap = new Map(chickenTypes.map((chickenType) => [chickenType.id, chickenType]));
        const enrichedOrders = orders.map((order) => ({
            ...order,
            customerName: customerMap.get(order.customerId)?.name ?? order.customerId,
            customer: customerMap.get(order.customerId) ?? null,
            items: Array.isArray(order.items)
                ? order.items.map((item) => {
                    const chickenType = chickenTypeMap.get(item.chickenTypeId);
                    return {
                        ...item,
                        chickenTypeName: chickenType?.name ?? 'ไก่',
                    };
                })
                : [],
        }));
        const totalRevenue = enrichedOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
        const paidRevenue = enrichedOrders.reduce((sum, order) => {
            if (order.paymentStatus !== 'paid') {
                return sum;
            }
            return sum + Number(order.totalAmount ?? 0);
        }, 0);
        return {
            totalCustomers: customers.length,
            totalChickenTypes: chickenTypes.length,
            totalOrders: orders.length,
            totalRevenue,
            paidRevenue,
            defaultCookingPrice,
            orders: enrichedOrders,
        };
    }
    async updateDefaultCookingPrice(dto) {
        const value = Number(dto.value);
        await this.supabaseService.setDefaultCookingPriceSetting(value);
        await this.ordersService.recalculateCookingPriceForBoiledOrders(value);
        return { defaultCookingPrice: value };
    }
    async chatWithAI(dto) {
        const [customers, chickenTypes, orders] = await Promise.all([
            this.customersService.findAll(),
            this.chickenTypesService.findAll(),
            this.ordersService.findAll(),
        ]);
        const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
        const chickenTypeMap = new Map(chickenTypes.map((chickenType) => [chickenType.id, chickenType]));
        const enrichedOrders = orders.map((order) => ({
            ...order,
            customerName: customerMap.get(order.customerId)?.name ?? order.customerId,
            customer: customerMap.get(order.customerId) ?? null,
            items: Array.isArray(order.items)
                ? order.items.map((item) => {
                    const chickenType = chickenTypeMap.get(item.chickenTypeId);
                    return {
                        ...item,
                        chickenTypeName: chickenType?.name ?? 'ไก่',
                    };
                })
                : [],
        }));
        const context = `
ข้อมูลร้านไก่:

ลูกค้าทั้งหมด (${customers.length} คน):
${customers.map(c => `- ID: ${c.id}, ชื่อ: ${c.name}, เบอร์: ${c.phone}, ที่อยู่: ${c.address}, วิธีจัดส่ง: ${c.deliveryMethod}`).join('\n')}

ประเภทไก่ทั้งหมด (${chickenTypes.length} ประเภท):
${chickenTypes.map(ct => `- ID: ${ct.id}, ชื่อ: ${ct.name}, น้ำหนัก/กก: ${ct.unitWeightKg}, ราคา/กก: ${ct.pricePerKg}, ราคาเฉลี่ย: ${ct.averagePrice}, สถานะ: ${ct.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}, วิธีเตรียม: ${ct.preparationType}, ค่าต้ม: ${ct.cookingPrice}`).join('\n')}

คำสั่งซื้อทั้งหมด (${orders.length} ออเดอร์):
${enrichedOrders.map(o => `- Order ID: ${o.id}, ลูกค้า: ${o.customerName}, วิธีจัดส่ง: ${o.deliveryMethod}, สถานะชำระ: ${o.paymentStatus}, สถานะจัดส่ง: ${o.deliveryStatus}, รวมเงิน: ${o.totalAmount}, รายการ: ${o.items.map(i => `${i.chickenTypeName} x${i.quantity} @${i.unitPrice}`).join(', ')}`).join('\n')}
`;
        const prompt = `${context}\n\nคำถามจากผู้ใช้: ${dto.message}\n\nโปรดตอบคำถามโดยใช้ข้อมูลด้านบน ตอบเป็นภาษาไทย และเป็นมิตรต่อผู้ใช้`;
        const response = await this.groqService.generateChatCompletion(prompt);
        return { response };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Patch)('default-cooking-price'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateDefaultCookingPrice", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "chatWithAI", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [chicken_types_service_1.ChickenTypesService,
        customers_service_1.CustomersService,
        orders_service_1.OrdersService,
        supabase_service_1.SupabaseService,
        groq_service_1.GroqService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map