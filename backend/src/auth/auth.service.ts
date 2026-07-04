import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './auth.controller';
import { AuditService } from '../audit/audit.service';
import { PasswordHasher } from '../security/password-hasher';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private auditService: AuditService,
    private supabaseService: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Check if user already exists
    const { data: exists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', dto.email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      throw new ConflictException('خطأ في الاتصال بقاعدة البيانات أثناء التحقق من الحساب');
    }

    if (exists) {
      throw new ConflictException('البريد الإلكتروني المدخل مستعمل مسبقاً بالمنصة');
    }

    // 2. Hash the password securely via PasswordHasher
    const hashedPassword = await PasswordHasher.hash(dto.password);

    // 3. Insert user into PostgreSQL users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: dto.name,
        email: dto.email.toLowerCase(),
        password_hash: hashedPassword,
        role: dto.role,
        status: 'ACTIVE',
        wilaya: dto.wilaya,
        commune: dto.commune,
        phone: dto.phone || null,
        loyalty_points: 0,
      })
      .select()
      .single();

    if (insertError || !newUser) {
      throw new ConflictException('تعذر تسجيل الحساب حالياً، يرجى التحقق من المدخلات والمحاولة مجدداً');
    }
    
    // Register audit trace
    this.auditService.log(
      newUser.name,
      'USER_SIGNUP',
      `تم تسجيل حساب مستخدم جديد بنجاح بدور: ${newUser.role} في ولاية: ${newUser.wilaya}`
    );

    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role, name: newUser.name };
    const token = this.jwtService.sign(payload);
    return {
      message: 'تم تسجيل الحساب بنجاح، أهلاً بك في فضاء ZaLo الذكي ✨',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        wilaya: newUser.wilaya,
        commune: newUser.commune
      },
      accessToken: token,
      access_token: token
    };
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Fetch user by email securely
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email.toLowerCase())
      .maybeSingle();

    if (fetchError || !user) {
      // Standardize generic unauthorized error to prevent email harvesting/enumeration
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى إعادة المحاولة');
    }

    // 2. Verify password strictly via PasswordHasher.compare (No backdoors allowed)
    const isPasswordValid = await PasswordHasher.compare(dto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى إعادة المحاولة');
    }

    // Log administrative action
    this.auditService.log(
      user.name,
      'USER_LOGIN',
      `تسجيل دخول حساب مستقر من رتبة: ${user.role} تحت عنوان: ${user.wilaya}`
    );

    const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);
    return {
       message: 'أهلاً بعودتك الميمونة لـ ZaLo Smart! 🌟',
       user: {
         id: user.id,
         name: user.name,
         email: user.email,
         role: user.role,
         wilaya: user.wilaya,
         commune: user.commune,
         loyaltyPoints: user.loyalty_points
       },
       accessToken: token,
       access_token: token
    };
  }

  async findUserById(id: number) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...data,
      passwordHash: data.password_hash,
      loyaltyPoints: data.loyalty_points,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
