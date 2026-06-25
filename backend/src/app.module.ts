import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditService } from './audit/audit.service';
import { MerchantModule } from './merchant/merchant.module';
import { DeliveryModule } from './delivery/delivery.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    // Database connection using environment values with local memory fallback
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'zalo_admin',
      password: process.env.DB_PASSWORD || 'zalo_secure_pass',
      database: process.env.DB_NAME || 'zalo_marketplace_smart',
      autoLoadEntities: true,
      synchronize: true, // Auto aligns ORM entities with Postgres columns during runtime
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    SubscriptionsModule,
    ComplaintsModule,
    AnalyticsModule,
    MerchantModule,
    DeliveryModule,
    SupabaseModule,
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AppModule {}
