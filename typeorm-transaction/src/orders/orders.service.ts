import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { Product } from 'src/products/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const nowDate = new Date();
    const newOrder = await this.orderRepository.save({
      orderNo: createOrderDto.orderNo,
      date: nowDate,
    });
    const product = await this.productRepository.findOneBy({
      id: createOrderDto.productId,
    });

    // 아이템은 생성되지 않고 오더만 생성된 것을 알 수 있음.
    throw new NotFoundException(
      '트랜젝션이 이루어지지 않다는 것을 확인하기 위한 오류',
    );

    const newItem: Partial<Item> = {
      product: product,
      order: newOrder,
      quantity: createOrderDto.quantity,
    };
    this.itemRepository.save(newItem);
  }

  async createOrderTransaction(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nowDate = new Date();
      const newOrder: Order = await queryRunner.manager.save(Order, {
        orderNo: createOrderDto.orderNo,
        date: nowDate,
      });
      const product: Product = await queryRunner.manager.findOne(Product, {
        where: {
          id: createOrderDto.productId,
        },
      });

      throw new NotFoundException(
        '트랜젝션이 이루어지지 않다는 것을 확인하기 위한 오류',
      );

      const newItem: Partial<Item> = {
        product: product,
        order: newOrder,
        quantity: createOrderDto.quantity,
      };
      queryRunner.manager.save(Item, newItem);

      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new HttpException(err.response.message, err.response.statusCode);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
