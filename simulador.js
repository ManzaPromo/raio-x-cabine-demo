'use strict';

const ids = ['fixo', 'horas', 'duracao', 'direto', 'baixa', 'base', 'alta'];
const byId = id => document.getElementById(id);
const form = byId('simulador');
const resultado = byId('resultado');
const erro = byId('erro');
const estado = byId('estado');
const money = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const number = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 4});
const example = ['3600', '120', '45', '20', '50', '75', '90'];
let ficticio = false;

function parse(id, min, max, label, integer = false) {
  const input = byId(id);
  const raw = input.value.trim();
  const valid = integer ? /^[0-9]+$/ : /^[0-9]+(?:[.,][0-9]{1,2})?$/;
  const value = Number(raw.replace(',', '.'));
  if (!valid.test(raw) || !Number.isFinite(value) || value < min || value > max) {
    throw {id, message: `${label}: informe ${integer ? 'um número inteiro' : 'um número com até duas casas decimais'} entre ${number.format(min)} e ${number.format(max)}.`};
  }
  return value;
}

function simulate() {
  const fixo = parse('fixo', 0, 1e7, 'Custo fixo mensal');
  const horas = parse('horas', .01, 744, 'Horas disponíveis');
  const duracao = parse('duracao', 1, 1440, 'Tempo por atendimento', true);
  const direto = parse('direto', 0, 1e7, 'Custo direto');
  const baixa = parse('baixa', .01, 100, 'Ocupação baixa');
  const base = parse('base', .01, 100, 'Ocupação base');
  const alta = parse('alta', .01, 100, 'Ocupação alta');
  if (baixa >= base) throw {id: 'base', message: 'A ocupação base precisa ser maior que a baixa.'};
  if (base >= alta) throw {id: 'alta', message: 'A ocupação alta precisa ser maior que a base.'};
  if (horas * baixa / 100 + 1e-9 < duracao / 60) {
    throw {id: 'baixa', message: 'No cenário baixo, o tempo ocupado no mês não comporta nem um atendimento. Revise a ocupação, as horas disponíveis ou a duração.'};
  }
  const rows = [baixa, base, alta].map((ocupacao, i) => {
    const pagas = horas * ocupacao / 100;
    const rateio = fixo / pagas * (duracao / 60);
    return {label: ['Baixa', 'Base', 'Alta'][i], ocupacao, rateio, total: direto + rateio};
  });
  return {fixo, horas, duracao, direto, rows};
}

function invalidate() {
  resultado.hidden = true;
  erro.hidden = true;
  erro.textContent = '';
  for (const id of ids) {
    const input = byId(id);
    input.removeAttribute('aria-invalid');
    const describedBy = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(ref => ref && ref !== 'erro');
    input.setAttribute('aria-describedby', describedBy.join(' '));
  }
}

function render(model) {
  byId('premissas').textContent = `${ficticio ? 'Exemplo fictício. ' : ''}Premissas: ${money.format(model.fixo)} de custo fixo mensal; ${number.format(model.horas)} h disponíveis; ${model.duracao} min e ${money.format(model.direto)} de custo direto por atendimento.`;
  byId('cenarios').replaceChildren(...model.rows.map(row => {
    const tr = document.createElement('tr');
    for (const [i, content] of [
      `${row.label} · ${number.format(row.ocupacao)}%`, money.format(row.rateio), money.format(row.total),
    ].entries()) {
      const cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) cell.scope = 'row';
      cell.textContent = content;
      tr.append(cell);
    }
    return tr;
  }));
  const diff = model.rows[0].rateio - model.rows[2].rateio;
  byId('diferenca').textContent = `Diferença estimada entre os cenários baixo e alto: ${money.format(diff)} por atendimento (antes de arredondar os resultados exibidos).`;
  resultado.hidden = false;
  byId('titulo-resultado').focus();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  invalidate();
  estado.textContent = '';
  try {
    render(simulate());
  } catch (err) {
    if (!err.id) throw err;
    erro.textContent = err.message;
    erro.hidden = false;
    const campo = byId(err.id);
    campo.setAttribute('aria-invalid', 'true');
    const describedBy = (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!describedBy.includes('erro')) describedBy.push('erro');
    campo.setAttribute('aria-describedby', describedBy.join(' '));
    campo.focus();
  }
});

form.addEventListener('input', () => {
  const tinhaResultado = !resultado.hidden;
  ficticio = ids.every((id, i) => byId(id).value === example[i]);
  invalidate();
  if (tinhaResultado) estado.textContent = 'Premissas alteradas. Compare novamente para atualizar o resultado.';
  else if (estado.textContent.startsWith('Exemplo')) estado.textContent = '';
});

byId('exemplo').addEventListener('click', () => {
  ids.forEach((id, i) => { byId(id).value = example[i]; });
  ficticio = true;
  invalidate();
  estado.textContent = 'Exemplo fictício preenchido. Use “Comparar cenários” para ver o resultado.';
});

byId('imprimir').addEventListener('click', () => window.print());
