function validateForm() {
    let valid = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    emailError.innerText = "";
    passwordError.innerText = "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailError.innerText = "Por favor, ingrese un email válido.";
        valid = false;
    }

    if (password.length < 6) {
        passwordError.innerText = "La contraseña debe tener al menos 6 caracteres.";
        valid = false;
    }

    if (valid) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
    }

    return valid;
}