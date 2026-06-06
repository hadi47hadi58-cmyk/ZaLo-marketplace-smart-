import { Controller, Post, Body, HttpCode, HttpStatus, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsString } from 'class-validator';

// Auth DTO Definitions
export class RegisterDto {
  @ApiProperty({ description: 'الاسم الثلاثي للمستخدم', example: 'عبد الهادي نجم الدين' })
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name: string;

  @ApiProperty({ description: 'البريد الإلكتروني الفريد', example: 'hadi47hadi58@gmail.com' })
  @IsEmail({}, { message: 'بريد إلكتروني غير صالح' })
  email: string;

  @ApiProperty({ description: 'كلمة مرور قوية وحصينة', example: 'securePassword123' })
  @MinLength(6, { message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' })
  password: string;

  @ApiProperty({ description: 'نوع الدور الوظيفي للمستخدم بحساب المنصة', enum: ['CUSTOMER', 'MERCHANT', 'ADMIN'], example: 'CUSTOMER' })
  @IsEnum(['CUSTOMER', 'MERCHANT', 'ADMIN'])
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';

  @ApiProperty({ description: 'ولاية الإقامة أو النشاط من بين الـ 58 ولاية', example: 'الجزائر' })
  @IsNotEmpty({ message: 'الولاية مطلوبة' })
  wilaya: string;

  @ApiProperty({ description: 'البلدية أو المقاطعة', example: 'المرسى' })
  @IsNotEmpty({ message: 'البلدية مطلوبة' })
  commune: string;

  @ApiProperty({ description: 'رقم الهاتف للتواصل المباشر', example: '0555123456', required: false })
  @IsOptional()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'البريد الإلكتروني للتبليغ ودراسة السلة', example: 'hadi47hadi58@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'كلمة المرور المسجلة', example: 'securePassword123' })
  @IsNotEmpty()
  password: string;
}

@ApiTags('التوثيق والتحقق من الهوية - Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'إنشاء حساب مستخدم جديد (مستهلك، تاجر، مشرف)' })
  @ApiResponse({ status: 201, description: 'تم تسجيل الحساب بنجاح، مرحباً بك في عائلة ZaLo ✨' })
  @ApiResponse({ status: 400, description: 'البيانات غير صالحة أو البريد الإلكتروني مسجل مسبقاً' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تسجيل الدخول واستخراج وثيقة الوصول الآمنة JWT Token' })
  @ApiResponse({ status: 200, description: 'تم تسجيل الدخول بنجاح، جاري نقل البيانات لجوالك' })
  @ApiResponse({ status: 401, description: 'البريد الإلكتروني أو كلمة المرور خاطئة' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
