import { getToken } from 'next-auth/jwt';
import Product from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('Registro Requerido');
  }

  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, user);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Metodo no permitido' });
  }
};
const getHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
};
const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.store = req.body.store;
    product.value = req.body.value;
    product.paymentType = req.body.paymentType;
    product.typeOfPurchase = req.body.typeOfPurchase;
    product.notes = req.body.notes;
    product.date = req.body.date;
    await product.save();
    await db.disconnect();
    res.send({ message: 'Registro actualizado exiosamente' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Registro no encontrado' });
  }
};
const deleteHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  console.log('Product ID: ', req.query.id); // log the product id
  console.log('Found product: ', product); // log the found product
  if (product) {
    await Product.findByIdAndDelete(req.query.id);
    await db.disconnect();
    res.send({ message: 'Registro borrado exitosamente' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Registro no encontrado' });
  }
};

export default handler;
