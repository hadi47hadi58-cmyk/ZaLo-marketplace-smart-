import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [ProductsController],
  providers: [AuditService],
  exports: [ProductsController],
})
export class ProductsModule {}
