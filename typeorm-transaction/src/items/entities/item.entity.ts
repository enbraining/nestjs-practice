import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product)
  product: Product;

  @OneToOne(() => Order)
  order: Order;

  @Column()
  quantity: number;
}
