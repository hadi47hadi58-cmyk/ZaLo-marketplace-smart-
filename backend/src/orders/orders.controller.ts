import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, Patch, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { IsNotEmpty, IsNumber, IsString, IsArray, IsEnum, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'رقم السلعة المعنية', example: 1001 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'اسم السلعة', example: 'ساعات أنكر اللاسلكية Soundcore X' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'السعر الأحادي', example: 7900 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'الكمية المطلوبة', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'السلع المضافة للسلة', type: [OrderItemDto] })
  @IsArray()
  items: OrderItemDto[];

  @ApiProperty({ description: 'عنوان التوصيل بالتفصيل', example: 'حي المستقبل، مبنى 12، الطابق 2' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'الولاية المستلمة', example: 'الجزائر' })
  @IsNotEmpty()
  @IsString()
  wilaya: string;

  @ApiProperty({ description: 'البلدية أو المقاطعة الفيدرالية', example: 'المرسى' })
  @IsNotEmpty()
  @IsString()
  commune: string;

  @ApiProperty({ description: 'طرق الدفع بالمنصة', enum: ['COD', 'BARIDIMOB', 'CCP'], example: 'COD' })
  @IsEnum(['COD', 'BARIDIMOB', 'CCP'])
  paymentMethod: 'COD' | 'BARIDIMOB' | 'CCP';
}

@ApiTags('إدارة الطلبات والدفع وتتبع التوصيل - Orders & Payments & Shipping')
@Controller('orders')
export class OrdersController {
  private orders: any[] = [
    { id: 5001, customerId: 1, customerName: "عبد الهادي نجم الدين", storeId: 101, storeName: "متجر النور للإلكترونيات", status: "SHIPPING", totalAmount: 10100.00, paymentMethod: "COD", paymentStatus: "PENDING", deliveryFee: 400.0, address: "حي المستقبل، المقابل للدائرة، الطابق الأول", wilaya: "الجزائر", commune: "المرسى", trackingNumber: "DZ-COD-5001-ZALO", timestamp: Date.now() - 3600000 * 4 },
    { id: 5002, customerId: 1, customerName: "عبد الهادي نجم الدين", storeId: 102, storeName: "أخضر بازار للمنتجات الطبيعية", status: "DELIVERED", totalAmount: 3300.00, paymentMethod: "BARIDIMOB", paymentStatus: "CONFIRMED", deliveryFee: 400.0, address: "شارع المجاهدين الشق الأول، هضبة المرسى", wilaya: "الجزائر", commune: "المرسى", trackingNumber: "DZ-BMOB-5002-ZALO", timestamp: Date.now() - 3600000 * 48 }
  ];

  constructor(private auditService: AuditService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على قائمة الطلبيات الخاصة بالمستخدم الحالي' })
  async getMyOrders(@Request() req) {
    if (req.user.role === 'ADMIN') {
      return this.orders;
    }
    if (req.user.role === 'MERCHANT') {
      // Returning orders that belong to the merchant's store (simulated store id 101)
      return this.orders.filter(o => o.storeId === 101);
    }
    return this.orders.filter(o => o.customerId === req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إتمام Checkout وتأسيس طلب شراء جديد بالجزائر' })
  async create(@Body() dto: CreateOrderDto, @Request() req) {
    const subtotal = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 400; // Standard Algerian Wilaya Shipping Fee DZD
    const grandTotal = subtotal + deliveryFee;

    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const paymentSuffix = dto.paymentMethod === 'COD' ? 'COD' : dto.paymentMethod === 'BARIDIMOB' ? 'BMOB' : 'CCP';

    const newOrder = {
      id: 5000 + this.orders.length + 1,
      customerId: req.user.id,
      customerName: req.user.name,
      storeId: 101, // Mock multiple vendor division
      storeName: "متجر النور للإلكترونيات",
      status: "PENDING",
      totalAmount: grandTotal,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === 'COD' ? 'PENDING' : 'PAID', // CCP / BaridiMob auto confirmation simulator
      deliveryFee: deliveryFee,
      address: dto.address,
      wilaya: dto.wilaya,
      commune: dto.commune,
      trackingNumber: `DZ-${paymentSuffix}-${randomId}-ZALO`,
      timestamp: Date.now()
    };

    this.orders.unshift(newOrder);

    this.auditService.log(
      req.user.name,
      'PLACE_ORDER',
      `تم تسجيل طلب شراء جديد برقم تتبع ${newOrder.trackingNumber} وإجمالي ${newOrder.totalAmount} DZD باستخدام الدفع بـ: ${newOrder.paymentMethod}`
    );

    return {
      status: HttpStatus.CREATED,
      message: 'تم إرسال طلب الشراء الخاص بك بنجاح وجاري إعلام البائع ومصلحة التوطيد للتوصيل! 📦',
      order: newOrder
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['MERCHANT', 'ADMIN'])
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث حالة تتبع التوصيل والطلب (قيد التجهيز، جاري الشحن، تم التسليم)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
    const order = this.orders.find(o => o.id === parseInt(id));
    if (!order) {
      throw new ForbiddenException('الطلب غير متوفر بجدول البيانات');
    }
    const oldStatus = order.status;
    order.status = status;

    if (status === 'DELIVERED') {
      order.paymentStatus = 'CONFIRMED';
    }

    this.auditService.log(
      req.user.name,
      'UPDATE_ORDER_STATUS',
      `تم ترقية الطلب رقم ${order.id} من حالة ${oldStatus} إلى حالة التوصيل الحالية: ${status}`
    );

    return {
      message: 'تم تحديث حالة الشحنة والطلب بنجاح وإشعار المستفيد',
      order
    };
  }
}

import { ForbiddenException } from '@nestjs/common';
