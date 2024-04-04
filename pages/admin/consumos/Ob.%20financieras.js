import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useReducer } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/error';
import { BsTrash3 } from 'react-icons/bs';
import { BiSolidEdit } from 'react-icons/bi';
import Product from '../../../models/Product';
import db from '../../../utils/db.js';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      state;
  }
}
export default function ObFinancierasScreen() {
  const [fecha, setFecha] = useState(new Date());
  const monthPlusOne = fecha.getMonth();
  const yearPlusOne = fecha.getFullYear();

  const fechaPlusOneMonth = new Date(
    Date.UTC(yearPlusOne, monthPlusOne, 1, 0, 0, 0, 0)
  );

  const handleDateChange = (e) => {
    const changedDate = new Date(e.target.value);

    const month = changedDate.getUTCMonth();
    const year = changedDate.getUTCFullYear();
    const updatedDate = new Date(year, month, 1, 0, 0, 0, 0);
    setFecha(updatedDate);
    console.log({ updatedDate });
  };

  const router = useRouter();

  const formatNumberWithDots = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [
    { loading, error, products, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  const createHandler = async () => {
    if (!window.confirm('ESTÁ SEGURO?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/products`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('REGISTRO CREADO EXITOSAMENTE');
      router.push(`/admin/product/${data.product._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products`);

        const selectedMonth = fecha.getUTCMonth();
        const selectedYear = fecha.getUTCFullYear();

        const filteredData = data.filter((product) => {
          const productDate = new Date(product.date);
          const productMonth = productDate.getUTCMonth();
          const productYear = productDate.getUTCFullYear();

          return (
            productMonth === selectedMonth &&
            productYear === selectedYear &&
            (product.typeOfPurchase === 'Crédito Bancolombia' ||
              product.typeOfPurchase === 'Crédito Banco Bogotá' ||
              product.typeOfPurchase === 'Pago TC Master' ||
              product.typeOfPurchase === 'Pago TC Visa' ||
              product.typeOfPurchase === 'Pago TC Bancolombia' ||
              product.typeOfPurchase === 'Apto. Cartagena')
          );
        });

        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        dispatch({ type: 'FETCH_SUCCESS', payload: filteredData });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [fecha, successDelete]);

  const deleteHandler = async (productId) => {
    if (!window.confirm('ESTÁ SEGURO?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/products/${productId}`);
      console.log({ productId });
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('REGISTRO BORRADO EXITOSAMENTE');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout>
      <div className="grid md:grid-cols-4 md:gap-2">
        <div>
          <ul className="hidden lg:block">
            <li>
              <Link href="/">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/consumos">Consumos</Link>
            </li>
            <li>
              <Link href="/admin/products" className="font-bold">
                Registros
              </Link>
            </li>
            <li>
              <Link href="/admin/users">Usuarios</Link>
            </li>
          </ul>
        </div>
        <div>
          <input
            type="month"
            value={fechaPlusOneMonth.toISOString().substring(0, 7)}
            onChange={handleDateChange}
          />
        </div>
        <div className="overflow-x-auto md:col-span-3">
          <div className="flex justify-between">
            <h1 className="mb-4 text-xl">Registros</h1>
            {loadingDelete && <div>Borrando item...</div>}
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className="primary-button"
            >
              {loadingCreate ? 'Loading' : 'Crear'}
            </button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <br />
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-left border-r border-gray-300">
                      FECHA
                    </th>

                    <th className="p-2 text-left">DESCRIPCIÓN</th>
                    <th className="p-2 text-left">VALOR</th>

                    <th className="p-2 text-left">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className=" p-2 border-r border-gray-300">
                        {product.date.substring(0, 10)}
                      </td>

                      <td className=" p-2 ">
                        <span className="font-semibold">
                          {product.typeOfPurchase}
                        </span>

                        <br />
                        {product.name}
                      </td>
                      <td className=" p-2 ">
                        ${formatNumberWithDots(product.value)}
                      </td>

                      <td className=" p-5 text-center flex flex-col lg:flex-row">
                        <button
                          onClick={() =>
                            router.push(`/admin/product/${product._id}`)
                          }
                          type="button"
                          className="primary-button font-bold underline  self-center "
                        >
                          <BiSolidEdit />
                        </button>
                        &nbsp;
                        <button
                          onClick={() => deleteHandler(product._id)}
                          className="primary-button font-bold underline self-center"
                          type="button"
                        >
                          <BsTrash3 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();

  const products = await Product.find().sort({ createdAt: 1 }).lean();
  const serializableProducts = products.map((product) => {
    // Convert all Date objects to strings
    Object.keys(product).forEach((key) => {
      if (product[key] instanceof Date) {
        product[key] = product[key].toISOString();
      }
    });
    // Convert Mongoose documents to plain objects
    return db.convertDocToObj(product);
  });

  return {
    props: {
      products: serializableProducts,
    },
  };
}
