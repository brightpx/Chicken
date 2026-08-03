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

    // สรุปข้อมูลสถิติแทนการส่งข้อมูลทั้งหมด
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.deliveryStatus === 'pending').length;
    const deliveredOrders = orders.filter(o => o.deliveryStatus === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.deliveryStatus === 'cancelled').length;

    // สรุปประเภทไก่ที่ขายดี
    const chickenSales = new Map<string, number>();
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

    // สรุปลูกค้าที่ซื้อเยอะ
    const customerOrders = new Map<string, number>();
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

    // เตรียมข้อมูลลูกค้าสำหรับการค้นหา
    const customerList = customers.map(c => `${c.name} (ID: ${c.id})`).join(', ');

    // เตรียมข้อมูลคำสั่งซื้อล่าสุด (10 ออเดอร์ล่าสุด)
    const recentOrders = orders.slice(-10).reverse().map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const items = order.items?.map(item => {
        const chicken = chickenTypes.find(c => c.id === item.chickenTypeId);
        return `${chicken?.name || 'ไก่'} x${item.quantity}`;
      }).join(', ') || 'ไม่มีรายการ';
      return `Order ${order.id}: ${customer?.name || 'ไม่ระบุ'} - ${items} - ${order.totalAmount} บาท`;
    }).join('\n');

    // จัดรูปแบบ context ให้กระชับ
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

รายชื่อลูกค้า: ${customerList}

ประเภทไก่:
${chickenTypes.filter(c => c.isActive).map(ct => `- ${ct.name}: ${ct.averagePrice} บาท/ชิ้น (${ct.preparationType})`).join('\n')}

คำสั่งซื้อล่าสุด (10 ออเดอร์):
${recentOrders}
`;

    const prompt = `${context}\nคำถาม: ${dto.message}\n\nตอบสั้นๆ เป็นภาษาไทย`;

    const response = await this.groqService.generateChatCompletion(prompt);
    return { response };
  }
}
