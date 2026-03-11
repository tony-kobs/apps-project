const form = document.querySelector('.feedback-form');
const storageKey = 'feedback-form-state';

let formData = { email: '', message: '' };

const savedData = localStorage.getItem(storageKey);
if (savedData) {
  const parsedData = JSON.parse(savedData);
  formData = parsedData;

  form.elements.email.value = parsedData.email || '';
  form.elements.message.value = parsedData.message || '';
}

form.addEventListener('input', event => {
  const { name, value } = event.target;

  formData[name] = value.trim();
  localStorage.setItem(storageKey, JSON.stringify(formData));
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const { email, message } = formData;

  if (!email || !message) {
    alert(`Fill please all fields`);
    return;
  }

  console.log(formData);
  localStorage.removeItem(storageKey);
  form.reset();
  formData = { email: '', message: '' };
});
