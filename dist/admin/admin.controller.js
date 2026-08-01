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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const app_config_1 = require("../common/app-config");
const chicken_types_service_1 = require("../chicken-types/chicken-types.service");
const customers_service_1 = require("../customers/customers.service");
const orders_service_1 = require("../orders/orders.service");
let AdminController = class AdminController {
    chickenTypesService;
    customersService;
    ordersService;
    constructor(chickenTypesService, customersService, ordersService) {
        this.chickenTypesService = chickenTypesService;
        this.customersService = customersService;
        this.ordersService = ordersService;
    }
    async getDashboard() {
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
        const totalRevenue = enrichedOrders.reduce((sum, order) => {
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
            defaultCookingPrice: (0, app_config_1.getDefaultCookingPrice)(),
            orders: enrichedOrders,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [chicken_types_service_1.ChickenTypesService,
        customers_service_1.CustomersService,
        orders_service_1.OrdersService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map