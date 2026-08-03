import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { SupabaseService } from '../common/supabase.service';
import { GroqService } from '../groq/groq.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly chickenTypesService: ChickenTypesService,
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
    private readonly supabaseService: SupabaseService,
    private readonly groqService: GroqService,
  ) {}

  @Get('dashboard')
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

    const totalRevenue = enrichedOrders.reduce((sum: number, order) => sum + Number(order.totalAmount ?? 0), 0);
    const paidRevenue = enrichedOrders.reduce((sum: number, order) => {
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

  @Patch('default-cooking-price')
  async updateDefaultCookingPrice(@Body() dto: { value: number }) {
    const value = Number(dto.value);
    await this.supabaseService.setDefaultCookingPriceSetting(value);
    await this.ordersService.recalculateCookingPriceForBoiledOrders(value);
    return { defaultCookingPrice: value };
  }

  @Post('chat')
  async chatWithAI(@Body() dto: { message: string }) {
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
}
