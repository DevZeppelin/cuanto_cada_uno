"use client";

import { useState, useEffect } from 'react';
import { SiFoodpanda } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import CustomButton from './components/CustomButton';

export default function App() {
  const [numPeople, setNumPeople] = useState(0);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', cost: 0, paidBy: '' });
  const [balances, setBalances] = useState([]);
  const [amountPerPerson, setAmountPerPerson] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Cargar historial del localStorage al cargar la aplicación
    const savedHistory = JSON.parse(localStorage.getItem("expenseHistory"));
    if (savedHistory) {
      setHistory(savedHistory);
    }
  }, []);
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };
  // Agregar un nuevo item
  const addItem = () => {
    if (!newItem.name || newItem.cost == 0 || !newItem.paidBy) {
      alert("Por favor, completa todos los campos correctamente.");
      return; // Detener la función si algún campo está vacío o el costo es 0 o negativo
    }
    setItems([...items, newItem]);
    setNewItem({ name: '', cost: 0, paidBy: '' }); // Reiniciar los campos
  };
  // Calcular el total sumando los costos de todos los items
  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + parseFloat(item.cost), 0);
  };
  // Calcular cuánto debe cada persona y quién tiene saldo a favor
  const calculate = () => {

    if (numPeople <= 0 || !numPeople ) {
      alert("Por favor, ingresa el numero de personas en las que se dividira la cuenta.");
      return; // Detener la función si algún campo está vacío o el costo es 0 o negativo
    }

    const total = calculateTotal();
    const perPerson = total / numPeople;
    setAmountPerPerson(perPerson);
    let personalBalance = {};

    // Inicializar cuánto pagó cada persona
    items.forEach((item) => {
      if (!personalBalance[item.paidBy]) {
        personalBalance[item.paidBy] = 0;
      }
      //Se suma todo lo que pago esa persona
      personalBalance[item.paidBy] += parseFloat(item.cost);
    });

    const results = [];
    Object.keys(personalBalance).forEach((person) => {
      const balance = personalBalance[person] - perPerson;
      if (balance > 0) {
        results.push(`A ${person} tienen que darle $ ${balance.toFixed(2)}`);
      } else if (balance < 0) {
        results.push(`${person} tiene que poner $ ${Math.abs(balance).toFixed(2)}`);
      } else {
        results.push(`${person} sale derecho`);
      }
    });

    setBalances(results);  // Actualiza el estado con los balances
    saveToHistory(total, perPerson, results); // Guarda el resultado en el historial
  };
  const saveToHistory = (total, perPerson, results) => {
    
    const newRecord = {
      date: new Date().toLocaleString(),
      total,
      perPerson,
      balances: results
    };

    const updatedHistory = [newRecord, ...history];

    setHistory(updatedHistory);
    localStorage.setItem("expenseHistory", JSON.stringify(updatedHistory));
  };
  const borrarHistorial = () => {
    localStorage.removeItem('historial');  // Eliminar del localStorage
    setHistory([]);  // Limpiar el estado del historial
  };

  return (
    <div className="flex flex-col p-6 text-center">
      <div className="mb-4 p-6 ">
        <SiFoodpanda className="text-6xl mx-auto m-2 " />
        <h1 className="text-2xl font-bold uppercase text-textColor">
          ¿Cuanto cada uno?
        </h1>
      </div>

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
      <div className="mb-4 flex flex-col mx-auto text-black text-center">
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

        <CustomButton text="Agregar item" onClick={addItem} />
      </div>

      {/* Items */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Items comprados:</h2>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 mx-auto justify-center border p-2 mb-2 w-72 rounded-2xl"
          >
            <p>{item.name}</p>
            <p>{item.cost}</p>
            <p>
              <b>Lo pagó:</b> {item.paidBy}
            </p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <CustomButton text="Calcular" onClick={calculate} />
      </div>
      {/* Mostrar total gastado */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4">
          Total gastado: ${calculateTotal().toFixed(2)}
        </h3>
        {amountPerPerson ? (
          <h3 className="text-xl font-semibold">
            Cada uno es: ${amountPerPerson.toFixed(2)}
          </h3>
        ) : (
          <p></p>
        )}
      </div>

      {/* Mostrar balances */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold">Balances:</h3>
        {balances.length > 0 ? (
          balances.map((balance, index) => (
            <p className="p-2" key={index}>
              {balance}
            </p>
          ))
        ) : (
          <p>No se han calculado balances aún.</p>
        )}
      </div>

      {/* Historial de cuentas */}
      <div className="mt-12 mx-auto ">
        <CustomButton
          text={"Historial de cuentas " + (showHistory ? "▲" : "▼")}
          onClick={() => setShowHistory(!showHistory)}
        />
        {showHistory && (
          <div>
            {history.length > 0 ? (
              history.map((record, index) => (
                <div
                  key={index}
                  className="p-4 m-2 border rounded-md text-left "
                >
                  <p>
                    <b>Fecha:</b> {record.date}
                  </p>
                  <p>
                    <b>Total gastado:</b> ${record.total.toFixed(2)}
                  </p>
                  <p>
                    <b>Por persona:</b> ${record.perPerson.toFixed(2)}
                  </p>
                  <div>
                    <b>Balances:</b>
                  </div>
                  {record.balances.map((balance, idx) => (
                    <p key={idx}>- {balance}</p>
                  ))}
                </div>
              ))
            ) : (
              <p>No hay historial de cuentas.</p>
            )}
            <div>
              {history.length > 0 ? (
                <MdDelete
                  className="text-4xl mx-auto m-2 "
                  onClick={borrarHistorial}
                />
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
