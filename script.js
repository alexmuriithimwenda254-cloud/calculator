const display = document.getElementById('display');
const history = document.getElementById('history');
const themeBtn = document.getElementById('themeBtn');
let expression = '';
let justCalculated = false;

function show(value = expression) {
  display.textContent = value || '0';
}
function addValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) expression = '';
  justCalculated = false;
  const last = expression.slice(-1);
  if (['+', '−', '×', '÷'].includes(value)) {
    if (!expression && value !== '−') return;
    if (['+', '−', '×', '÷'].includes(last)) expression = expression.slice(0, -1);
    expression += value;
  } else if (value === '.') {
    const currentNumber = expression.split(/[+−×÷%]/).pop();
    if (currentNumber.includes('.')) return;
    expression += currentNumber === '' ? '0.' : '.';
  } else {
    expression += value;
  }
  show();
}
function calculate() {
  if (!expression) return;
  try {
    let safe = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    // Convert a trailing or standalone percentage to a decimal percentage.
    safe = safe.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    if (!/^[0-9+*/().\-\s]+$/.test(safe)) throw new Error('Invalid expression');
    const result = Function('"use strict"; return (' + safe + ')')();
    if (!Number.isFinite(result)) throw new Error('Math error');
    history.textContent = expression + ' =';
    expression = String(Number(result.toPrecision(12)));
    show();
    justCalculated = true;
  } catch {
    display.textContent = 'Invalid input';
    expression = '';
    justCalculated = true;
  }
}
function handleAction(action) {
  if (action === 'clear') { expression = ''; history.textContent = ''; show('0'); justCalculated = false; }
  if (action === 'delete') { expression = expression.slice(0, -1); show(); justCalculated = false; }
  if (action === 'equals') calculate();
  if (action === 'sign') {
    if (!expression) return;
    const match = expression.match(/(-?\d*\.?\d+)$/);
    if (match) {
      const number = match[0];
      expression = expression.slice(0, -number.length) + (number.startsWith('-') ? number.slice(1) : '−' + number);
      show();
    }
  }
}
document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) addValue(button.dataset.value);
  if (button.dataset.action) handleAction(button.dataset.action);
});
document.addEventListener('keydown', event => {
  const map = { '*':'×', '/':'÷', '-':'−', '+':'+', '.':'.', '%':'%' };
  if (/^[0-9]$/.test(event.key)) addValue(event.key);
  else if (map[event.key]) { event.preventDefault(); addValue(map[event.key]); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
  else if (event.key === 'Backspace') handleAction('delete');
  else if (event.key === 'Escape') handleAction('clear');
});
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? '☀' : '☾';
});
