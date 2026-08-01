"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultCookingPrice = getDefaultCookingPrice;
function getDefaultCookingPrice() {
    const value = process.env.DEFAULT_COOKING_PRICE;
    if (value === undefined || value === '') {
        return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
//# sourceMappingURL=app-config.js.map