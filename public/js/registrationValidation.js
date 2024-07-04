document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    const pais = document.getElementById('pais');
    const terminos = document.getElementById('terminos');
    const errorTexts = document.querySelectorAll('.error-text');

    form.addEventListener('submit', function(event) {
        // Reset error messages
        errorTexts.forEach(errorText => errorText.textContent = '');

        let hasError = false;

        // Validate nombre
        if (nombre.value.trim() === '') {
            nombre.nextElementSibling.textContent = 'El nombre es obligatorio';
            hasError = true;
        }

        // Validate apellido
        if (apellido.value.trim() === '') {
            apellido.nextElementSibling.textContent = 'El apellido es obligatorio';
            hasError = true;
        }

        // Validate email
        if (!validateEmail(email.value)) {
            email.nextElementSibling.textContent = 'El email no es válido';
            hasError = true;
        }

        // Validate password
        if (password.value.length < 6) {
            password.nextElementSibling.textContent = 'La contraseña debe tener al menos 6 caracteres';
            hasError = true;
        }

        // Validate fecha de nacimiento
        if (!validateDate(fechaNacimiento.value)) {
            fechaNacimiento.nextElementSibling.textContent = 'La fecha de nacimiento no es válida';
            hasError = true;
        }

        // Validate pais
        if (pais.value === '') {
            pais.nextElementSibling.textContent = 'El país es obligatorio';
            hasError = true;
        }

        // Validate terminos
        if (!terminos.checked) {
            terminos.nextElementSibling.textContent = 'Debe aceptar los términos y condiciones';
            hasError = true;
        }

        if (hasError) {
            event.preventDefault();
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateDate(date) {
        const re = /^\d{4}-\d{2}-\d{2}$/;
        return re.test(date);
    }
});