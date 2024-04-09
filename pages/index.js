import Layout from '../components/Layout.js';
import Product from '../models/Product.js';
import db from '../utils/db.js';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import { getError } from '../utils/error.js';
import Link from 'next/link.js';
import { useSession } from 'next-auth/react';

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    default:
      return state;
  }
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  const [{ loadingCreate, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
    loadingCreate: false,
  });

  const [categorySpent, setCategorySpent] = useState({});
  const formatNumberWithDots = (number) => {
    if (number === undefined || number === null) {
      return '0';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

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
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const typeOfPurchaseResult = await axios(
          `/api/admin/products?action=aggregateTypeOfPurchase&month=${month}&year=${year}`
        );

        const initialCategorySpent = {
          'Comida y aseo': { spent: 0, maxAmount: 100000 },
          'Extras Casa': { spent: 0, maxAmount: 1000000 },
          Medicinas: { spent: 0, maxAmount: 100000 },
          'Mesada Martina': { spent: 0, maxAmount: 100000 },
          'Mesada Rafaela': { spent: 0, maxAmount: 100000 },
          'Clases Pollos': { spent: 0, maxAmount: 100000 },
          Gasolina: { spent: 0, maxAmount: 100000 },
          Mantenimiento: { spent: 0, maxAmount: 100000 },
          Lavado: { spent: 0, maxAmount: 100000 },
          Parqueadero: { spent: 0, maxAmount: 100000 },
          Peajes: { spent: 0, maxAmount: 100000 },
          Papeles: { spent: 0, maxAmount: 100000 },
          'Ocio General': { spent: 0, maxAmount: 100000 },
          Viajes: { spent: 0, maxAmount: 100000 },
          Cumpleaños: { spent: 0, maxAmount: 100000 },
          'Comidas afuera': { spent: 0, maxAmount: 100000 },
          'Ropa Pollos': { spent: 0, maxAmount: 100000 },
          'Ropa Papás': { spent: 0, maxAmount: 100000 },
          'Comida Perros': { spent: 0, maxAmount: 100000 },
          'Guardería Perros': { spent: 0, maxAmount: 100000 },
          'Medicina Perros': { spent: 0, maxAmount: 100000 },
        };

        // Update spent amounts for each category based on fetched data
        typeOfPurchaseResult.data.consumos.forEach((item) => {
          if (initialCategorySpent[item._id]) {
            initialCategorySpent[item._id].spent = item.totalValue;
          }
        });

        setCategorySpent(initialCategorySpent);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalConsumos, setTotalConsumos] = useState(0);
  const [totalConsumosTCMaster, setTotalConsumosTCMaster] = useState(0);

  const [mesadaRafaela, setMesadaRafaela] = useState(100000);
  const [mesadaMartina, setMesadaMartina] = useState(100000);
  const [mesadaRafaelaTotal, setMesadaRafaelaTotal] = useState(0);
  const [mesadaMartinaTotal, setMesadaMartinaTotal] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const fetchData = async () => {
      try {
        const ingresosResponse = await axios(
          `/api/admin/products?action=aggregateTypeOfPurchase&month=${month}&year=${year}`
        );
        const consumosResponse = await axios(
          `/api/admin/products?action=aggregatePaymentType&month=${month}&year=${year}`
        );

        // Extraer los valores necesarios de la respuesta
        if (
          ingresosResponse.data &&
          typeof ingresosResponse.data === 'object'
        ) {
          const { consumos, mesadaRafaela, mesadaMartina } =
            ingresosResponse.data;

          const totalIngresos = consumos
            .filter((item) =>
              ['Salario FL', 'Salario GM', 'Otro ingreso'].includes(item._id)
            )
            .reduce((sum, item) => sum + item.totalValue, 0);

          setMesadaRafaela(100000 - mesadaRafaela);
          setMesadaMartina(100000 - mesadaMartina);
          setMesadaRafaelaTotal(mesadaRafaela);
          setMesadaMartinaTotal(mesadaMartina);
          setTotalIngresos(totalIngresos);
        }

        if (Array.isArray(consumosResponse.data)) {
          const totalConsumos = consumosResponse.data.reduce(
            (sum, item) => sum + item.totalValue,
            0
          );
          const consumosTCMaster =
            consumosResponse.data.find((item) => item._id === 'TC Master')
              ?.totalValue || 0;

          setTotalConsumos(totalConsumos);
          setTotalConsumosTCMaster(consumosTCMaster);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout title="CASA">
      {!session && (
        <div className="text-center mt-10">
          <h1 className="text-center items-center mb-10">
            For testing purposes, you can login using the following credentials:
            <br />
            email: <strong>testuser@test.com</strong>
            <br />
            password: <strong>TestUser1*</strong>
          </h1>

          <Link href="/Login" className="primary-button mt-2">
            Login
          </Link>
        </div>
      )}
      {session && (
        <>
          <div className="grid grid-cols-3 items-center justify-items-center mt-3">
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className="primary-button text-sm align-middle  w-[100%] "
            >
              {loadingCreate ? 'Loading' : 'Crear'}
            </button>
            <Link
              href="/admin/dashboard"
              className="primary-button align-middle  text-xs text-center w-[100%]"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="primary-button align-middle  text-sm text-center w-[100%]"
            >
              Registros
            </Link>
          </div>

          <div className="grid grid-cols-2 ">
            <div className="w-full px-3 py-2 my-2 leading-tight border rounded shadow  text-center col-span-2">
              <div className="mb-3">
                <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
                  <div className="card p-2 text-center">
                    <h2 className="text-lg font-bold">Resumen </h2>
                    <p className="font-bold">
                      In: ${formatNumberWithDots(totalIngresos)}
                    </p>
                  </div>

                  <div className="card p-2 text-center">
                    <h2 className="text-xl font-bold">TC Master</h2>

                    <p className="font-bold">
                      Out: ${formatNumberWithDots(totalConsumosTCMaster)}
                    </p>
                  </div>
                  <div className="card p-2 text-center">
                    <h2 className="text-xl font-bold">Efectivo</h2>

                    <p className="font-bold">
                      Out: $
                      {formatNumberWithDots(
                        totalConsumos - totalConsumosTCMaster
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="card p-2 text-center">
                    <h2 className="text-xl font-bold">Mesada Rafa</h2>
                    <p>Inicial: ${formatNumberWithDots(100000)}</p>
                    <p>
                      Total Consumos: $
                      {formatNumberWithDots(mesadaRafaelaTotal)}
                    </p>

                    <p>Disponible: ${formatNumberWithDots(mesadaRafaela)}</p>
                  </div>
                  <div className="card p-2 text-center">
                    <h2 className="text-xl font-bold">Mesada Marti</h2>
                    <p>Inicial: ${formatNumberWithDots(100000)}</p>
                    <p>
                      Total Consumos: $
                      {formatNumberWithDots(mesadaMartinaTotal)}
                    </p>

                    <p>Disponible: ${formatNumberWithDots(mesadaMartina)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-3 py-2 my-2 leading-tight border rounded shadow  text-center">
              <h2 className="text-lg font-bold">Rafa</h2>
              <p>In: ${formatNumberWithDots(100000)}</p>
              <p>Out: ${formatNumberWithDots(mesadaRafaelaTotal)}</p>

              <p className="font-bold">
                Saldo: ${formatNumberWithDots(mesadaRafaela)}
              </p>
            </div>
            <div className="w-full px-3 py-2 my-2 leading-tight border rounded shadow text-center">
              <h2 className="text-xl font-bold">Marti</h2>
              <p>In: ${formatNumberWithDots(100000)}</p>
              <p>Out: ${formatNumberWithDots(mesadaMartinaTotal)}</p>

              <p className="font-bold">
                Saldo: ${formatNumberWithDots(mesadaMartina)}
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl my-3 font-bold border-b border-gray-300">
              Presupuesto disponible
            </h1>
            <div>
              <div className="grid grid-cols-3 mb-5 overflow-hidden">
                {Object.entries(categorySpent).map(([category, budget]) => (
                  <div key={category}>
                    {categorySpent[category].maxAmount > 0 && (
                      <div key={category}>
                        <h2 className="text-xl font-bold overflow-hidden">
                          {category}
                        </h2>
                        <p>
                          <span className="font-bold">Gastado:</span> $
                          {formatNumberWithDots(budget.spent)}
                          <br />
                          <span className="font-bold">Máximo:</span> $
                          {formatNumberWithDots(budget.maxAmount)}
                          <br />
                          {budget.maxAmount - budget.spent < 0 && (
                            <div className="text-red-500">
                              <span className="font-bold">Disponible:</span> $
                              {formatNumberWithDots(
                                budget.maxAmount - budget.spent
                              )}
                            </div>
                          )}
                          {budget.maxAmount - budget.spent > 0 && (
                            <div className="text-green-700">
                              <span className="font-bold">Disponible:</span> $
                              {formatNumberWithDots(
                                budget.maxAmount - budget.spent
                              )}
                            </div>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
export async function getServerSideProps() {
  await db.connect();

  const products = await Product.find().sort({ createdAt: -1 }).lean();
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
