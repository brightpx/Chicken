"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChickenTypesModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../common/supabase.module");
const orders_module_1 = require("../orders/orders.module");
const chicken_types_controller_1 = require("./chicken-types.controller");
const chicken_types_service_1 = require("./chicken-types.service");
let ChickenTypesModule = class ChickenTypesModule {
};
exports.ChickenTypesModule = ChickenTypesModule;
exports.ChickenTypesModule = ChickenTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, (0, common_1.forwardRef)(() => orders_module_1.OrdersModule)],
        controllers: [chicken_types_controller_1.ChickenTypesController],
        providers: [chicken_types_service_1.ChickenTypesService],
        exports: [chicken_types_service_1.ChickenTypesService],
    })
], ChickenTypesModule);
//# sourceMappingURL=chicken-types.module.js.map