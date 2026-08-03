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
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => o.deliveryStatus === 'pending').length;
        const deliveredOrders = orders.filter(o => o.deliveryStatus === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.deliveryStatus === 'cancelled').length;
        const chickenSales = new Map();
        orders.forEach(order => {
            order.items?.forEach(item => {
                const current = chickenSales.get(item.chickenTypeId) || 0;
                chickenSales.set(item.chickenTypeId, current + item.quantity);
            });
        });
        const topChickenTypes = Array.from(chickenSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, qty]) => {
            const chicken = chickenTypes.find(c => c.id === id);
            return `${chicken?.name || id}: ${qty} ชิ้น`;
        })
            .join(', ');
        const customerOrders = new Map();
        orders.forEach(order => {
            const current = customerOrders.get(order.customerId) || 0;
            customerOrders.set(order.customerId, current + 1);
        });
        const topCustomers = Array.from(customerOrders.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id, count]) => {
            const customer = customers.find(c => c.id === id);
            return `${customer?.name || id}: ${count} ออเดอร์`;
        })
            .join(', ');
        const context = `
สรุปร้านไก่:
- ลูกค้า: ${customers.length} คน
- ประเภทไก่: ${chickenTypes.length} ประเภท (${chickenTypes.filter(c => c.isActive).length} ใช้งาน)
- คำสั่งซื้อ: ${orders.length} ออเดอร์
- รายได้รวม: ${totalRevenue.toFixed(2)} บาท
- รายได้จ่ายแล้ว: ${paidRevenue.toFixed(2)} บาท
- สถานะจัดส่ง: รอ ${pendingOrders}, จัดส่งแล้ว ${deliveredOrders}, ยกเลิก ${cancelledOrders}
- ประเภทไก่ขายดี: ${topChickenTypes || 'ไม่มีข้อมูล'}
- ลูกค้าซื้อเยอะ: ${topCustomers || 'ไม่มีข้อมูล'}

ประเภทไก่:
${chickenTypes.filter(c => c.isActive).map(ct => `- ${ct.name}: ${ct.averagePrice} บาท/ชิ้น (${ct.preparationType})`).join('\n')}
`;
        const prompt = `${context}\nคำถาม: ${dto.message}\n\nตอบสั้นๆ เป็นภาษาไทย`;
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