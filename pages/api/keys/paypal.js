import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send('Registro Requerido');
  }
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
};
export default handler;
