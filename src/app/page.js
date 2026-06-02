"use client";

import { useState, useEffect, useRef } from 'react';

const inputClass =
  "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-300 bg-white transition-shadow";

export default function App() {
  const [numPeople, setNumPeople] = useState('');
  const [knownPeople, setKnownPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', cost: '', paidBy: '', mode: 'exclude', excludedPeople: [], includedPeople: [] });
  const [paidByIsNew, setPaidByIsNew] = useState(false);
  const [newPaidByInput, setNewPaidByInput] = useState('');
  const [showExcludeInput, setShowExcludeInput] = useState(false);
  const [excludeNewInput, setExcludeNewInput] = useState('');
  const [showIncludeInput, setShowIncludeInput] = useState(false);
  const [includeNewInput, setIncludeNewInput] = useState('');
  const [balances, setBalances] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const newPaidByRef = useRef(null);
  const excludeInputRef = useRef(null);
  const includeInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('expenseHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (paidByIsNew && newPaidByRef.current) newPaidByRef.current.focus();
  }, [paidByIsNew]);

  useEffect(() => {
    if (showExcludeInput && excludeInputRef.current) excludeInputRef.current.focus();
  }, [showExcludeInput]);

  useEffect(() => {
    if (showIncludeInput && includeInputRef.current) includeInputRef.current.focus();
  }, [showIncludeInput]);

  const addToKnown = (name) => {
    if (name && !knownPeople.includes(name))
      setKnownPeople(prev => [...prev, name]);
  };

  /* ── PaidBy ── */
  const handlePaidByChange = (value) => {
    if (value === '__new__') {
      setPaidByIsNew(true);
    } else {
      setNewItem(prev => ({ ...prev, paidBy: value }));
    }
  };

  const confirmNewPaidBy = () => {
    const name = newPaidByInput.trim();
    if (!name) return;
    addToKnown(name);
    setNewItem(prev => ({ ...prev, paidBy: name }));
    setPaidByIsNew(false);
    setNewPaidByInput('');
  };

  const cancelNewPaidBy = () => {
    setPaidByIsNew(false);
    setNewPaidByInput('');
  };

  /* ── Exclusiones ── */
  const toggleExclusion = (personName) => {
    setNewItem(prev => ({
      ...prev,
      excludedPeople: prev.excludedPeople.includes(personName)
        ? prev.excludedPeople.filter(p => p !== personName)
        : [...prev.excludedPeople, personName],
    }));
  };

  const confirmExcludeNew = () => {
    const name = excludeNewInput.trim();
    if (!name) return;
    addToKnown(name);
    if (!newItem.excludedPeople.includes(name))
      setNewItem(prev => ({ ...prev, excludedPeople: [...prev.excludedPeople, name] }));
    setShowExcludeInput(false);
    setExcludeNewInput('');
  };

  const toggleInclusion = (personName) => {
    setNewItem(prev => ({
      ...prev,
      includedPeople: prev.includedPeople.includes(personName)
        ? prev.includedPeople.filter(p => p !== personName)
        : [...prev.includedPeople, personName],
    }));
  };

  const confirmIncludeNew = () => {
    const name = includeNewInput.trim();
    if (!name) return;
    addToKnown(name);
    if (!newItem.includedPeople.includes(name))
      setNewItem(prev => ({ ...prev, includedPeople: [...prev.includedPeople, name] }));
    setShowIncludeInput(false);
    setIncludeNewInput('');
  };

  /* ── Items ── */
  const addItem = () => {
    // Auto-confirmar cualquier input de nombre pendiente
    let item = { ...newItem };

    if (paidByIsNew && newPaidByInput.trim()) {
      const name = newPaidByInput.trim();
      addToKnown(name);
      item = { ...item, paidBy: name };
      setPaidByIsNew(false);
      setNewPaidByInput('');
    }
    if (showExcludeInput && excludeNewInput.trim()) {
      const name = excludeNewInput.trim();
      addToKnown(name);
      if (!item.excludedPeople.includes(name))
        item = { ...item, excludedPeople: [...item.excludedPeople, name] };
      setShowExcludeInput(false);
      setExcludeNewInput('');
    }
    if (showIncludeInput && includeNewInput.trim()) {
      const name = includeNewInput.trim();
      addToKnown(name);
      if (!item.includedPeople.includes(name))
        item = { ...item, includedPeople: [...item.includedPeople, name] };
      setShowIncludeInput(false);
      setIncludeNewInput('');
    }

    if (!item.name.trim() || !item.cost || parseFloat(item.cost) <= 0 || !item.paidBy) {
      alert('Por favor, completá todos los campos.');
      return;
    }
    setItems(prev => [...prev, { ...item, cost: parseFloat(item.cost) }]);
    setNewItem(() => ({ name: '', cost: '', paidBy: item.paidBy, mode: 'exclude', excludedPeople: [], includedPeople: [] }));
  };

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  const calculateTotal = () => items.reduce((acc, item) => acc + item.cost, 0);

  /* ── Calcular ── */
  const calculate = () => {
    const n = parseInt(numPeople);
    if (!n || n <= 0) { alert('Ingresá la cantidad de personas.'); return; }
    if (items.length === 0) { alert('Agregá al menos un gasto.'); return; }
    if (knownPeople.length > n) {
      alert(`Hay más nombres cargados (${knownPeople.length}) que el total de personas (${n}).`);
      return;
    }

    const owes = Object.fromEntries(knownPeople.map(p => [p, 0]));
    const paid = Object.fromEntries(knownPeople.map(p => [p, 0]));
    let anonymousOwes = 0;

    items.forEach(item => {
      if (item.mode === 'include') {
        // Solo las personas incluidas pagan este item; anónimos excluidos
        const included = item.includedPeople || [];
        if (included.length === 0) return;
        const share = item.cost / included.length;
        knownPeople.forEach(p => { if (included.includes(p)) owes[p] += share; });
        // anonymousOwes no cambia (anónimos no participan en este gasto)
      } else {
        // Todos menos los excluidos; anónimos siempre participan
        const excluded = item.excludedPeople || [];
        const eligibleCount = n - excluded.length;
        if (eligibleCount <= 0) return;
        const share = item.cost / eligibleCount;
        knownPeople.forEach(p => { if (!excluded.includes(p)) owes[p] += share; });
        anonymousOwes += share;
      }
      if (paid[item.paidBy] !== undefined) paid[item.paidBy] += item.cost;
    });

    const namedResults = knownPeople.map(person => {
      const balance = (paid[person] || 0) - (owes[person] || 0);
      if (balance > 0.005)
        return { person, type: 'receive', text: `Le tienen que dar $${balance.toFixed(2)}` };
      if (balance < -0.005)
        return { person, type: 'pay', text: `Tiene que poner $${Math.abs(balance).toFixed(2)}` };
      return { person, type: 'even', text: 'Sale derecho' };
    });

    const anonymousCount = n - knownPeople.length;
    setBalances({ namedResults, anonymousOwes, anonymousCount });

    const record = {
      date: new Date().toLocaleString(),
      total: calculateTotal(),
      numPeople: n,
      namedResults,
      anonymousOwes,
      anonymousCount,
    };
    const updated = [record, ...history];
    setHistory(updated);
    localStorage.setItem('expenseHistory', JSON.stringify(updated));
  };

  const borrarHistorial = () => {
    localStorage.removeItem('expenseHistory');
    setHistory([]);
  };

  const card = 'bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4';

  const excludableKnown = knownPeople.filter(
    p => p !== newItem.paidBy && !newItem.excludedPeople.includes(p)
  );
  const includableKnown = knownPeople.filter(p => !newItem.includedPeople.includes(p));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto pb-14 px-4">

        {/* Header */}
        <div className="text-center pt-10 pb-6">
          <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center">
            {!logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/ccu.webp"
                alt="CCU"
                className="w-40 h-40 object-contain rounded-2xl"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center select-none">
                <span className="text-white text-2xl font-black tracking-tight">CCU</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Dividí gastos con amigos fácilmente</p>
        </div>

        {/* ① Cantidad de personas */}
        <section className={card}>
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            <StepBadge n={1} /> Cantidad de personas
          </h2>
          <input
            type="number"
            placeholder="Ej: 25"
            value={numPeople}
            onChange={e => setNumPeople(e.target.value)}
            className={inputClass}
          />
          {numPeople > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              Solo cargás los nombres de quienes compraron algo o hay que excluir de algún gasto. Los demás se dividen el resto automáticamente.
            </p>
          )}
        </section>

        {/* ② Agregar gasto */}
        <section className={card}>
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            <StepBadge n={2} /> Agregar gasto
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Descripción (ej: Asado, Alcohol...)"
              value={newItem.name}
              onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
            />

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={newItem.cost}
                onChange={e => setNewItem(prev => ({ ...prev, cost: e.target.value }))}
                className={`${inputClass} pl-7`}
              />
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Pagado por</label>
              {!paidByIsNew ? (
                <select
                  value={newItem.paidBy}
                  onChange={e => handlePaidByChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Seleccionar —</option>
                  {knownPeople.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__new__">+ Nombre nuevo...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={newPaidByRef}
                    type="text"
                    placeholder="Nombre nuevo"
                    value={newPaidByInput}
                    onChange={e => setNewPaidByInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmNewPaidBy(); if (e.key === 'Escape') cancelNewPaidBy(); }}
                    className={inputClass}
                  />
                  <button
                    onClick={confirmNewPaidBy}
                    className="bg-red-600 text-white rounded-xl px-3 text-sm font-semibold hover:bg-red-700 transition-colors"
                  >OK</button>
                  <button
                    onClick={cancelNewPaidBy}
                    className="text-slate-400 hover:text-slate-600 transition-colors px-2 text-lg leading-none"
                  >✕</button>
                </div>
              )}
            </div>

            {/* Participación */}
            {newItem.paidBy && !paidByIsNew && (
              <div className="space-y-2">
                {/* Toggle de modo */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setNewItem(prev => ({ ...prev, mode: 'exclude', includedPeople: [] }))}
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${newItem.mode === 'exclude' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Excluir personas
                  </button>
                  <button
                    onClick={() => setNewItem(prev => ({ ...prev, mode: 'include', excludedPeople: [] }))}
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${newItem.mode === 'include' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Solo consumido por
                  </button>
                </div>

                {/* Modo excluir */}
                {newItem.mode === 'exclude' && (
                  <div>
                    {newItem.excludedPeople.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newItem.excludedPeople.map(person => (
                          <span key={person} className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 rounded-full px-2.5 py-1 text-xs font-medium">
                            {person}
                            <button onClick={() => toggleExclusion(person)} className="hover:text-red-700 leading-none font-bold ml-0.5">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {excludableKnown.map(person => (
                        <button key={person} onClick={() => toggleExclusion(person)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                          {person}
                        </button>
                      ))}
                      {!showExcludeInput ? (
                        <button onClick={() => setShowExcludeInput(true)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 transition-all">
                          + nombre nuevo
                        </button>
                      ) : (
                        <div className="flex gap-2 w-full mt-1">
                          <input ref={excludeInputRef} type="text" placeholder="Nombre a excluir"
                            value={excludeNewInput} onChange={e => setExcludeNewInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmExcludeNew(); if (e.key === 'Escape') { setShowExcludeInput(false); setExcludeNewInput(''); } }}
                            className={inputClass} />
                          <button onClick={confirmExcludeNew} className="bg-red-500 text-white rounded-xl px-3 text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap">OK</button>
                          <button onClick={() => { setShowExcludeInput(false); setExcludeNewInput(''); }} className="text-slate-400 hover:text-slate-600 px-1.5 text-lg leading-none">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modo incluir: solo estas personas */}
                {newItem.mode === 'include' && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Solo pagan quienes lo consumieron:</p>
                    {newItem.includedPeople.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newItem.includedPeople.map(person => (
                          <span key={person} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2.5 py-1 text-xs font-medium">
                            {person}
                            <button onClick={() => toggleInclusion(person)} className="hover:text-red-500 leading-none font-bold ml-0.5">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {includableKnown.map(person => (
                        <button key={person} onClick={() => toggleInclusion(person)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                          {person}
                        </button>
                      ))}
                      {!showIncludeInput ? (
                        <button onClick={() => setShowIncludeInput(true)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 transition-all">
                          + nombre nuevo
                        </button>
                      ) : (
                        <div className="flex gap-2 w-full mt-1">
                          <input ref={includeInputRef} type="text" placeholder="Nombre"
                            value={includeNewInput} onChange={e => setIncludeNewInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmIncludeNew(); if (e.key === 'Escape') { setShowIncludeInput(false); setIncludeNewInput(''); } }}
                            className={inputClass} />
                          <button onClick={confirmIncludeNew} className="bg-emerald-600 text-white rounded-xl px-3 text-xs font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap">OK</button>
                          <button onClick={() => { setShowIncludeInput(false); setIncludeNewInput(''); }} className="text-slate-400 hover:text-slate-600 px-1.5 text-lg leading-none">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={addItem}
              className="w-full bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700 active:scale-95 transition-all"
            >
              + Agregar gasto
            </button>
          </div>
        </section>

        {/* ③ Lista de gastos */}
        {items.length > 0 && (
          <section className={card}>
            <h2 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              <StepBadge n={3} />
              Gastos{' '}
              <span className="text-red-400 font-normal normal-case">({items.length})</span>
            </h2>
            <div className="space-y-2 mb-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-slate-50 rounded-xl p-3 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700">${item.cost.toFixed(2)}</span>
                      {' '}— pagó {item.paidBy}
                    </p>
                    {item.mode === 'include'
                      ? item.includedPeople?.length > 0 && (
                        <p className="text-xs text-emerald-500 mt-0.5">✓ solo: {item.includedPeople.join(', ')}</p>
                      )
                      : item.excludedPeople?.length > 0 && (
                        <p className="text-xs text-red-400 mt-0.5">✕ excluye: {item.excludedPeople.join(', ')}</p>
                      )
                    }
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-slate-300 hover:text-red-400 transition-colors text-xl leading-none shrink-0 pt-0.5"
                  >×</button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mb-3">
              <span className="text-sm text-slate-500 font-medium">Total</span>
              <span className="font-black text-slate-800 text-xl">${calculateTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-slate-800 text-white rounded-xl py-3 text-sm font-black hover:bg-slate-900 active:scale-95 transition-all tracking-widest uppercase"
            >
              Calcular
            </button>
          </section>
        )}

        {/* Resultados */}
        {balances && (
          <section className={card}>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Resultado</h2>
            <div className="space-y-2">
              {balances.namedResults.map((b, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 flex items-center justify-between gap-2 ${b.type === 'receive' ? 'bg-emerald-50 border border-emerald-100' :
                    b.type === 'pay' ? 'bg-red-50 border border-red-100' :
                      'bg-slate-50 border border-slate-100'
                    }`}
                >
                  <span className="text-sm font-bold text-slate-700">{b.person}</span>
                  <span className={`text-sm font-semibold text-right ${b.type === 'receive' ? 'text-emerald-600' :
                    b.type === 'pay' ? 'text-red-500' :
                      'text-slate-400'
                    }`}>{b.text}</span>
                </div>
              ))}
              {balances.anonymousCount > 0 && (
                <div className="rounded-xl p-3 bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-0.5">
                    Los demás ({balances.anonymousCount} {balances.anonymousCount === 1 ? 'persona' : 'personas'})
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    Cada uno pone ${balances.anonymousOwes.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Historial */}
        <section className={card}>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full flex items-center justify-between text-slate-600 font-semibold text-sm"
          >
            <span>Historial de cuentas</span>
            <span className="text-slate-400 text-xs">{showHistory ? '▲' : '▼'}</span>
          </button>

          {showHistory && (
            <div className="mt-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No hay historial todavía.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((record, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">{record.date}</p>
                      <p className="text-sm font-bold text-slate-700 mb-1.5">
                        Total: ${record.total.toFixed(2)} · {record.numPeople} personas
                      </p>
                      {(record.namedResults || record.balances || []).map((b, idx) => (
                        <p key={idx} className="text-xs text-slate-500">
                          {typeof b === 'string' ? b : `${b.person}: ${b.text}`}
                        </p>
                      ))}
                      {record.anonymousCount > 0 && (
                        <p className="text-xs text-slate-500">
                          Los demás ({record.anonymousCount}): ${record.anonymousOwes?.toFixed(2)} c/u
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={borrarHistorial}
                    className="w-full py-2 text-xs text-red-400 hover:text-red-500 transition-colors"
                  >
                    Borrar historial
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

function StepBadge({ n }) {
  return (
    <span className="w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">
      {n}
    </span>
  );
}
