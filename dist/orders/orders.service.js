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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const app_config_1 = require("../common/app-config");
const chicken_types_service_1 = require("../chicken-types/chicken-types.service");
const customers_service_1 = require("../customers/customers.service");
const supabase_service_1 = require("../common/supabase.service");
let OrdersService = class OrdersService {
    chickenTypesService;
    customersService;
    supabaseService;
    constructor(chickenTypesService, customersService, supabaseService) {
        this.chickenTypesService = chickenTypesService;
        this.customersService = customersService;
        this.supabaseService = supabaseService;
    }
    async create(input) {
        const customer = await this.customersService.findById(input.customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const chickenTypes = await this.chickenTypesService.findAll();
        const preparationType = input.preparationType ?? 'fresh';
        const cookingPrice = preparationType === 'boiled' ? (input.cookingPrice ?? (0, app_config_1.getDefaultCookingPrice)() ?? 30) : 0;
        const items = input.items.map((item) => {
            const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
            const itemPreparationType = item.preparationType ?? preparationType;
            const itemCookingPrice = itemPreparationType === 'boiled' ? (item.cookingPrice ?? cookingPrice) : 0;
            const unitPrice = (chicken?.averagePrice ?? 0) + itemCookingPrice;
            const totalPrice = unitPrice * item.quantity;
            return {
                chickenTypeId: item.chickenTypeId,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                preparationType: itemPreparationType,
                cookingPrice: itemCookingPrice,
            };
        });
        const order = {
            id: `order-${Date.now()}`,
            customerId: input.customerId,
            deliveryMethod: input.deliveryMethod,
            deliveryLocation: input.deliveryLocation,
            paymentStatus: input.paymentStatus,
            deliveryStatus: input.deliveryStatus,
            items,
            totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
        };
        return this.supabaseService.createOrder(order);
    }
    async findAll() {
        return this.supabaseService.listOrders();
    }
    async update(id, input) {
        const existing = await this.supabaseService.findOrderById(id);
        if (!existing) {
            throw new common_1.NotFoundException('Order not found');
        }
        const updatedItems = input.items
            ? await Promise.all(input.items.map(async (item) => {
                const chickenTypes = await this.chickenTypesService.findAll();
                const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
                const itemPreparationType = item.preparationType ?? 'fresh';
                const itemCookingPrice = itemPreparationType === 'boiled' ? (item.cookingPrice ?? (0, app_config_1.getDefaultCookingPrice)() ?? 30) : 0;
                const unitPrice = (chicken?.averagePrice ?? 0) + itemCookingPrice;
                const totalPrice = unitPrice * item.quantity;
                return {
                    chickenTypeId: item.chickenTypeId,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice,
                    preparationType: itemPreparationType,
                    cookingPrice: itemCookingPrice,
                };
            }))
            : existing.items;
        const updatedOrder = {
            ...input,
            items: updatedItems,
            totalAmount: input.totalAmount ?? updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        };
        return this.supabaseService.updateOrder(id, updatedOrder);
    }
    async recalculatePricesForChickenType(chickenTypeId, newAveragePrice) {
        const orders = await this.supabaseService.listOrders();
        const affectedOrders = orders.filter((order) => order.items.some((item) => item.chickenTypeId === chickenTypeId));
        await Promise.all(affectedOrders.map((order) => {
            const updatedItems = order.items.map((item) => {
                if (item.chickenTypeId !== chickenTypeId) {
                    return item;
                }
                const unitPrice = newAveragePrice + (item.cookingPrice ?? 0);
                return {
                    ...item,
                    unitPrice,
                    totalPrice: unitPrice * item.quantity,
                };
            });
            const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
            return this.supabaseService.updateOrder(order.id, { items: updatedItems, totalAmount });
        }));
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => chicken_types_service_1.ChickenTypesService))),
    __metadata("design:paramtypes", [chicken_types_service_1.ChickenTypesService,
        customers_service_1.CustomersService,
        supabase_service_1.SupabaseService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map