import React from 'react';

export default function CheckoutWizard({ activeStep = 0 }) {
  return (
    <div className="mb-5 flex flex-wrap">
      {[
        'Ingreso de usuario',
        'Dirección de envío',
        'Método de pago',
        'Comprar',
      ].map((step, index) => (
        <div
          key={step}
          className={` flex-1 border-b-2 text-center 
          ${
            index <= activeStep
              ? 'font-bold text-red-800'
              : 'font-bold text-gray-500'
          }
            `}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
