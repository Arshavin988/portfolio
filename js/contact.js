// COS 106 - Web Technologies: Contact Form Client-Side Validation
// Student: Adebayo Elisha

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('contactToast');

  if (!form) return;

  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('emailAddress');
  const phoneInput = document.getElementById('phoneNumber');
  const messageInput = document.getElementById('messageText');

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone must contain only digits (allows optional leading + or space, but requires pure digits)
  const phoneRegex = /^[0-9+ ]{7,15}$/;

  function setFieldError(inputElement, errorMessage) {
    const parent = inputElement.closest('.field-block');
    if (!parent) return;

    parent.classList.add('has-error');
    const errorSpan = parent.querySelector('.field-error-text');
    if (errorSpan) {
      errorSpan.textContent = errorMessage;
    }
  }

  function clearFieldError(inputElement) {
    const parent = inputElement.closest('.field-block');
    if (!parent) return;

    parent.classList.remove('has-error');
    const errorSpan = parent.querySelector('.field-error-text');
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  // Clear errors on input
  [nameInput, emailInput, phoneInput, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => clearFieldError(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // 1. Name Check (Cannot be empty)
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      setFieldError(nameInput, 'Full Name is required.');
      isValid = false;
    } else if (nameVal.length < 2) {
      setFieldError(nameInput, 'Full Name must be at least 2 characters.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    // 2. Email Check (Cannot be empty and must be valid email format)
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setFieldError(emailInput, 'Email Address is required.');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      setFieldError(emailInput, 'Please enter a valid email address (e.g., student@miva.edu.ng).');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    // 3. Phone Number Check (Cannot be empty and must contain only digits)
    const phoneVal = phoneInput.value.trim();
    const cleanDigits = phoneVal.replace(/^\+/, '').replace(/\s+/g, '');
    if (!phoneVal) {
      setFieldError(phoneInput, 'Phone Number is required.');
      isValid = false;
    } else if (!/^\d+$/.test(cleanDigits) || cleanDigits.length < 7 || cleanDigits.length > 15) {
      setFieldError(phoneInput, 'Phone number must contain only digits (between 7 and 15 numbers).');
      isValid = false;
    } else {
      clearFieldError(phoneInput);
    }

    // 4. Message Check (Cannot be empty)
    const messageVal = messageInput.value.trim();
    if (!messageVal) {
      setFieldError(messageInput, 'Message is required.');
      isValid = false;
    } else if (messageVal.length < 10) {
      setFieldError(messageInput, 'Message must be at least 10 characters long.');
      isValid = false;
    } else {
      clearFieldError(messageInput);
    }

    // If all validation rules pass
    if (isValid) {
      showToast('Thank you, ' + nameVal + '! Your message was validated and recorded (Coursework Demo). Direct: e.adebayo6885@miva.edu.ng');
      form.reset();
    }
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
