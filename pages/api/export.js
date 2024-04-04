import mongoose from 'mongoose';
import Product from '../../models/Product';
import ExcelJS from 'exceljs';

const exportData = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await mongoose.connect(process.env.MONGODB_URI);

      const { month, year } = req.query;
      const firstDayOfMonth = new Date(year, month - 1, 1); // Months are 0-indexed in JavaScript
      const lastDayOfMonth = new Date(year, month, 0);

      const data = await Product.find({
        paymentType: 'TC Master',
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      worksheet.columns = [
        { header: 'Nombre', key: 'name', width: 20 },
        { header: 'Tienda', key: 'store', width: 20 },
        { header: 'Valor', key: 'value', width: 15 },
        { header: 'Tipo de Pago', key: 'paymentType', width: 15 },
        { header: 'Tipo de Compra', key: 'typeOfPurchase', width: 15 },
        { header: 'Fecha', key: 'date', width: 15 },
      ];

      data.forEach((item) => {
        worksheet.addRow(item.toObject());
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        'Content-Disposition',
        'attachment; filename="formulario_annar_data.xlsx"'
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.end(buffer);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default exportData;
