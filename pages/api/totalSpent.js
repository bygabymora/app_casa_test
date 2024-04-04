import { getToken } from 'next-auth/jwt';
import Product from '../../models/Product';
import db from '../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('Registro Requerido');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Metodo no permitido' });
  }
};

const getHandler = async (req, res) => {
  const { typeOfPurchase } = req.query;
  if (!typeOfPurchase) {
    return res.status(400).send('Tipo de compra requerido');
  }

  await db.connect();

  const startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);

  const totalSpent = await Product.aggregate([
    { $match: { typeOfPurchase, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$value' } } },
  ]);

  await db.disconnect();

  const total = totalSpent.length > 0 ? totalSpent[0].total : 0;
  res.json({ totalSpent: total });
};

export default handler;
