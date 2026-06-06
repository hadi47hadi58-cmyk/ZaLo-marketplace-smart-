import { Controller, Get, Param, Param as GetParam, HttpStatus, HttpException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('نظام تتبع وإثبات شحنات الولاية - Delivery Courier Tracking')
@Controller('delivery')
export class DeliveryController {
  private trackingData = {
    'DZ-COD-5001-ZALO': { trackingNumber: 'DZ-COD-5001-ZALO', status: 'SHIPPING', courierName: 'Yassir Express dzd', estimatedDays: 2, currentWilaya: 'الجزائر', lastUpdate: 'مر من مركز فرز رويبة الرئيسي' },
    'DZ-BMOB-5002-ZALO': { trackingNumber: 'DZ-BMOB-5002-ZALO', status: 'DELIVERED', courierName: 'توصيل يالدين Yalidine', estimatedDays: 0, currentWilaya: 'الجزائر', lastUpdate: 'تم التسليم من طرف وكيل ولاية المرسى الفيدرالي ومصادقة الدفع' }
  };

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'تتبع مسار شحنة معينة ومعرفة الموقع والناقل في الـ 58 ولاية' })
  async trackParcel(@Param('trackingNumber') trackingNumber: string) {
    const data = this.trackingData[trackingNumber];
    if (!data) {
      throw new HttpException('رمز الشحنة المدخل غير متوفر بنظام تتبع البريد السريع الإلكتروني', HttpStatus.NOT_FOUND);
    }
    return {
      status: HttpStatus.OK,
      message: 'تم استحضار إحداثيات الشحنة وتفاصيل الناقل التوزيعي بنجاح',
      data
    };
  }
}
