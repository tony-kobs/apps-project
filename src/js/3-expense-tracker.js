const balanceEl = document.getElementById('balance');
const incomeAmountEl = document.getElementById('income-amount');
const expenseAmountEl = document.getElementById('expense-amount');
const transactionListEl = document.getElementById('transaction-list');
const transactionFormEl = document.getElementById('transaction-form');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');

const STORAGE_KEY = 'transactions';

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// submit form
transactionFormEl.addEventListener('submit', addTransaction);

// delete transaction (event delegation)
transactionListEl.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.dataset.id);
    removeTransaction(id);
  }
});

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  // validation
  if (!description || isNaN(amount)) {
    alert('Please fill all fields correctly');
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
  };

  transactions.push(transaction);

  saveToLocalStorage();

  updateTransactionList();
  updateSummary();

  transactionFormEl.reset();
}

function updateTransactionList() {
  transactionListEl.innerHTML = '';

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach(transaction => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}

function createTransactionElement(transaction) {
  const li = document.createElement('li');

  li.classList.add('transaction');
  li.classList.add(transaction.amount > 0 ? 'income' : 'expense');

  li.innerHTML = `
    <span>${transaction.description}</span>
    <span class="amount">
      ${formatCurrency(transaction.amount)}
      <button class="delete-btn" data-id="${transaction.id}">×</button>
    </span>
  `;

  return li;
}

function updateSummary() {
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  const income = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}

function formatCurrency(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);

  saveToLocalStorage();

  updateTransactionList();
  updateSummary();
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// initial render
updateTransactionList();
updateSummary();
