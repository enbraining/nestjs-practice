import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigsModule } from './configs/configs.module';
import { typeOrmConfig } from './configs/typeorm.config';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [ConfigsModule, TypeOrmModule.forRoot(typeOrmConfig), ProductsModule, OrdersModule, ItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}