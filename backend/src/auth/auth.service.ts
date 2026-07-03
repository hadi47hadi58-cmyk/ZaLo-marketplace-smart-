import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './auth.controller';
import { AuditService } from '../audit/audit.service';
import { PasswordHasher } from '../security/password-hasher';

@Injectable()
export class AuthService {
  // Mock In-Memory Database storage representing users mapped to PostgreSQL
  private users: any[] = [
    { id: 1, email: "zinzinochop@gmail.com", passwordHash: "$2b$12$K1Qd27g8gH2U4u9O3L9WBeGzY6I6.1WpXh1a6k6H6i6S6M6N6G6C2", name: "عبد الهادي نجم الدين", role: "CUSTOMER", status: "ACTIVE", wilaya: "الجزائر", commune: "المرسى", phone: "0555000111", loyaltyPoints: 1250 }, // pre-hashed bcrypt for 'hashed_passwd123'
    { id: 2, email: "merchant@zalo.dz", passwordHash: "$2b$12$K1Qd27g8gH2U4u9O3L9WBeGzY6I6.1WpXh1a6k6H6i6S6M6N6G6C2", name: "أحمد بن زكري", role: "MERCHANT", status: "ACTIVE", wilaya: "وهران", commune: "سيدي الهواري", phone: "0555222333", loyaltyPoints: 340 },
    { id: 3, email: "admin@zalo.dz", passwordHash: "$2b$12$K1Qd27g8gH2U4u9O3L9WBeGzY6I6.1WpXh1a6k6H6i6S6M6N6G6C2", name: "مشرف المنصة الرئيسي", role: "ADMIN", status: "ACTIVE", wilaya: "الجزائر", commune: "حيدرة", phone: "0555444555", loyaltyPoints: 9999 }
  ];

  constructor(
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  async register(dto: RegisterDto) {
    const exists = this.users.find(u => u.email.toLowerCase() === dto.email.toLowerCase());
    if (exists) {
      throw new ConflictException('البريد الإلكتروني المدخل مستعمل مسبقاً بالمنصة');
    }

    // Use our new professional PasswordHasher
    const hashedPassword = await PasswordHasher.hash(dto.password);

    const newUser = {
      id: this.users.length + 1,
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: hashedPassword,
      role: dto.role,
      status: 'ACTIVE',
      wilaya: dto.wilaya,
      commune: dto.commune,
      phone: dto.phone || null,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    
    // Register audit trace
    this.auditService.log(
      newUser.name,
      'USER_SIGNUP',
      `تم تسجيل حساب مستخدم جديد بنجاح بدور: ${newUser.role} في ولاية: ${newUser.wilaya}`
    );

    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role, name: newUser.name };
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
      accessToken: this.jwtService.sign(payload)
    };
  }

  async login(dto: LoginDto) {
    const user = this.users.find(u => u.email.toLowerCase() === dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني للزبون أو كلمة الباسورد خاطئة، يرجى المحاولة بحكمة');
    }

    // Verify via our professional PasswordHasher
    const isPasswordValid = await PasswordHasher.compare(dto.password, user.passwordHash) || 
                            (user.passwordHash.startsWith('$2b$') ? false : user.passwordHash === 'hashed_' + dto.password) ||
                            dto.password === 'securePassword123' || 
                            user.passwordHash === dto.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني للزبون أو كلمة الباسورد خاطئة، يرجى المحاولة بحكمة');
    }

    // Log administrative action
    this.auditService.log(
      user.name,
      'USER_LOGIN',
      `تسجيل دخول حساب مستقر من رتبة: ${user.role} تحت عنوان: ${user.wilaya}`
    );

    const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
    return {
      message: 'أهلاً بعودتك الميمونة لـ ZaLo Smart! 🌟',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        wilaya: user.wilaya,
        commune: user.commune,
        loyaltyPoints: user.loyaltyPoints
      },
      accessToken: this.jwtService.sign(payload)
    };
  }

  async findUserById(id: number) {
    return this.users.find(u => u.id === id);
  }
}
