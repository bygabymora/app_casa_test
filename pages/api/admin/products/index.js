import { getToken } from 'next-auth/jwt';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res.status(401).send('Registro requerido de administrador');
  }
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};
const postHandler = async (req, res) => {
  await db.connect();
  // Find the latest product
  const lastProduct = await Product.findOne({}).sort({ _id: -1 });
  let newSlugNumber = 1; // Default if no products are found

  if (lastProduct && lastProduct.slug) {
    const lastSlugNumber = parseInt(lastProduct.slug.match(/\d+$/), 10);
    if (!isNaN(lastSlugNumber)) {
      newSlugNumber = lastSlugNumber + 1;
    }
  }

  // Construct new slug
  const newSlug = `${newSlugNumber}`;
  const fiveHoursInMilliseconds = 5 * 60 * 60 * 999; // 5 hours in milliseconds
  const newDate = new Date(Date.now() - fiveHoursInMilliseconds);
  console.log('New date: ', newDate);
  const newProduct = new Product({
    name: ' ',
    slug: newSlug,
    store: ' ',
    paymentType: 'TC Master',
    typeOfPurchase: '.',
    notes: ' ',
    date: newDate,
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Registro creado exitosamente', product });
};

const getHandler = async (req, res) => {
  await db.connect();
  const { action, month, year } = req.query;
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  startDate.setUTCHours(startDate.getUTCHours() - 5);
  const endDate = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0));
  endDate.setUTCHours(endDate.getUTCHours() - 6);

  if (action === 'aggregateTypeOfPurchase') {
    const consumos = await Product.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$typeOfPurchase',
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    // Enviar los datos de consumos junto con los totales de las mesadas
    const mesadaRafaela =
      consumos.find((item) => item._id === 'Mesada Rafaela')?.totalValue || 0;
    const mesadaMartina =
      consumos.find((item) => item._id === 'Mesada Martina')?.totalValue || 0;

    await db.disconnect();
    res.send({ consumos, mesadaRafaela, mesadaMartina });
  } else if (action === 'aggregatePaymentType') {
    const exclusionTypes = ['Salario FL', 'Salario GM', 'Otro ingreso'];

    const consumos = await Product.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          typeOfPurchase: { $nin: exclusionTypes },
        },
      },
      {
        $group: {
          _id: '$paymentType',
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    const consumosTCMaster =
      consumos.find((item) => item._id === 'TC Master')?.totalValue || 0;

    await db.disconnect();
    res.send(consumos, consumosTCMaster);
  } else {
    // Else, return the list of products
    const products = await Product.find({});
    await db.disconnect();
    res.send(products);
  }
};

export default handler;
