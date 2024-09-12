"use client";

import { useState } from 'react';

export default function App() {
  const [numPeople, setNumPeople] = useState(0);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', cost: 0, paidBy: '' });
  const [balances, setBalances] = useState([]);
  const [amountPerPerson, setAmountPerPerson] = useState(0);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Agregar un nuevo item
  const addItem = () => {
    setItems([...items, newItem]);
    setNewItem({ name: '', cost: 0, paidBy: '' }); // Reiniciar los campos
  };

  // Calcular el total sumando los costos de todos los items
  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + parseFloat(item.cost), 0);
  };

  // Calcular cuánto debe cada persona y quién tiene saldo a favor
  const calculate = () => {
    const total = calculateTotal();
    const perPerson = total / numPeople;
    setAmountPerPerson(perPerson);
    let people = {};

    // Inicializar cuánto pagó cada persona
    items.forEach((item) => {
      if (!people[item.paidBy]) {
        people[item.paidBy] = 0;
      }
      people[item.paidBy] += parseFloat(item.cost);
    });

    const results = [];
    Object.keys(people).forEach((person) => {
      const balance = people[person] - perPerson;
      if (balance > 0) {
        results.push(`A ${person} tienen que darle $ ${balance.toFixed(2)}`);
      } else if (balance < 0) {
        results.push(`${person} tiene que poner $ ${Math.abs(balance).toFixed(2)}`);
      } else {
        results.push(`${person} sale derecho`);
      }
    });

    setBalances(results);  // Actualiza el estado con los balances
  };

  return (
    <div className="flex flex-col p-6 text-center">
      <h1 className="text-2xl font-bold mb-4 p-6 uppercase">¿Cuanto cada uno?</h1>

      {/* Número de personas */}
      <div className="mb-4">
        <label className="block mb-2">Cantidad de personas:</label>
        <input
          type="number"
          value={numPeople}
          onChange={(e) => setNumPeople(parseInt(e.target.value))}
          className="border p-2 w-60 text-black text-center rounded-xl"
        />
      </div>

      

      {/* Nuevo item */}
      <div className="mb-4 flex flex-col w-80 mx-auto text-black text-center">
        <input
          type="text"
          name="name"
          placeholder="Nombre del item"
          value={newItem.name}
          onChange={handleInputChange}
          className="border p-2 m-1 rounded-md"
        />
        <input
          type="number"
          name="cost"
          placeholder="Costo"
          value={newItem.cost}
          onChange={handleInputChange}
          className="border p-2 m-1 rounded-md"
        />
        <input
          type="text"
          name="paidBy"
          placeholder="Pagado por"
          value={newItem.paidBy}
          onChange={handleInputChange}
          className="border p-2 m-1 mb-2 rounded-md"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white p-4 rounded-lg"
        >
          Agregar item
        </button>
      </div>

      {/* Items */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Items comprados:</h2>
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 mx-auto justify-center border p-2 mb-2 w-72 rounded-2xl">
            <p>{item.name}</p>
            <p>{item.cost}</p>
            <p><b>Lo pagó:</b> {item.paidBy}</p>
          </div>
        ))}
      </div>

      {/* Botón para finalizar */}
      <button
        onClick={calculate}
        className="bg-green-500 text-white p-4 rounded-xl m-4 w-80 mx-auto uppercase font-bold"
      >
        Calcular
      </button>

      {/* Mostrar total gastado */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4">Total gastado: ${calculateTotal().toFixed(2)}</h3>
        {amountPerPerson ? (
          <h3 className="text-xl font-semibold">Cada uno es: ${amountPerPerson.toFixed(2)}</h3>
        ) : <p></p>}
      </div>




      {/* Mostrar balances */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold">Balances:</h3>
        {balances.length > 0 ? (
          balances.map((balance, index) => (
            <p className='p-2' key={index}>{balance}</p>
          ))
        ) : (
          <p>No se han calculado balances aún.</p>
        )}
      </div>
    </div>
  );
}
