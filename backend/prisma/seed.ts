import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma';

async function main() {
  const category = await prisma.category.create({ data: { name: 'Burgeri' } });

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: 'Cheeseburger',
      description: 'Klasican cheeseburger',
      price: 5.99,
      isAvailable: true,
    },
  });

  const modifier = await prisma.productModifier.create({
    data: { productId: product.id, name: 'Extra sir', price: 1.0 },
  });

  const employeePasswordHash = await bcrypt.hash('employee123', 10);
  const employee = await prisma.employee.create({
    data: {
      firstName: 'Marko',
      lastName: 'Markovic',
      email: 'marko@stop.rs',
      passwordHash: employeePasswordHash,
    },
  });

  console.log(JSON.stringify({ categoryId: category.id, productId: product.id, modifierId: modifier.id, employeeId: employee.id }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
