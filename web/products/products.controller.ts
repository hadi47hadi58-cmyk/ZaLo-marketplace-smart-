import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, Delete, Put, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'اسم المنتج', example: 'هاتف ذكي بيكسل' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'التفاصيل والمقاسات', example: 'مقاوم للماء سعة 256 جيجا' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'السعر بالدينار الجزائري', example: 45000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'الصنف الرئيسي', example: 'ELECTRONICS' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: 'الكمية بمخزن المتجر', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'رابط الصورة', example: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@ApiTags('إدارة السلع والكتالوج - Products Catalog')
@Controller('products')
export class ProductsController {
  // In-Memory Database representing Postgres state
  private products = [
    { id: 1001, storeId: 101, storeName: "متجر النور للإلكترونيات", name: "سماعات أنكر اللاسلكية Soundcore X", description: "سماعات أصلية مانعة للضوضاء وبطارية تدوم لـ 40 ساعة متواصلة مع شحن سريع جداً وجسد رياضي مقاوم للعرق.", price: 7900.00, category: "ELECTRONICS", stock: 12, salesCount: 45, rating: 4.8, wilaya: "وهران", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
    { id: 1002, storeId: 101, storeName: "متجر النور للإلكترونيات", name: "ساعة شاومي ريدمي الذكية 2", description: "شاشة ملونة، حساس قياس نبضات القلب ونسبة الأكسجين مع تتبع الرياضات وبطارية 14 يوم.", price: 9200.00, category: "ELECTRONICS", stock: 6, salesCount: 22, rating: 4.6, wilaya: "وهران", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" },
    { id: 1003, storeId: 102, storeName: "أخضر بازار للمنتجات الطبيعية", name: "سلة التوفير العائلية الصحية للغذاء", description: "سلة تزن 12 كجم من الخضار الطازج الفاخر بالإضافة لزيت زيتون بكر مضغوط على البارد من مزارع متيجة.", price: 2900.00, category: "FOOD", stock: 20, salesCount: 88, rating: 4.9, wilaya: "الجزائر", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80" }
  ];

  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'تصفح وفلترة المنتجات وفق الصنف، الاسم، أو الولايات الـ 58' })
  async findFiltered(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('wilaya') wilaya?: string,
  ) {
    let result = [...this.products];
    if (search) {
      result = result.filter(p => p.name.includes(search) || p.description.includes(search));
    }
    if (category && category !== 'ALL') {
      result = result.filter(p => p.category === category);
    }
    if (wilaya && wilaya !== 'ALL') {
      result = result.filter(p => p.wilaya === wilaya);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['MERCHANT', 'ADMIN'])
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إضافة منتج جديد للمتجر (خاص بالتجار والمشرفين)' })
  async create(@Body() dto: CreateProductDto, @Request() req) {
    const newProduct = {
      id: this.products.length + 1,
      storeId: req.user.id + 100, // Linking mock store
      storeName: req.user.name + ' لخدماتكم',
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      stock: dto.stock,
      salesCount: 0,
      rating: 5.0,
      wilaya: req.user.wilaya || 'الجزائر',
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80'
    };
    this.products.push(newProduct);

    this.auditService.log(
      req.user.name,
      'CREATE_PRODUCT',
      `تم طرح منتج جديد (${newProduct.name}) بسعر ${newProduct.price} DZD في مخزن المتجر`
    );

    return {
      message: 'تم إضافة سلعتك بنجاح وعرضها لعموم الزبائن بالجزائر 🎉',
      data: newProduct
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['MERCHANT', 'ADMIN'])
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إزالة منتج أو تعطيله نهائياً' })
  async delete(@Param('id') id: string, @Request() req) {
    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new ForbiddenException('المنتج المطلوب حذف غير متوفر بالصنبور');
    }
    const removedProduct = this.products[index];
    this.products.splice(index, 1);
    
    this.auditService.log(
      req.user.name,
      'DELETE_PRODUCT',
      `تم سحب المنتج (${removedProduct.name}) نهائياً من العرض`
    );

    return {
      message: 'تم حذف السلعة بنجاح وتحديث الكتالوج',
    };
  }
}
