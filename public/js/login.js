document.addEventListener("DOMContentLoaded", function() {
    const header = document.querySelector('.header');
    const listaNav = document.querySelector('.listaNav');

    if (localStorage.getItem('email') && localStorage.getItem('password')) {
        header.classList.add('sesionIniciada');
        listaNav.innerHTML = `
            <li class="listaItem"><a class="linkNav cerrarSesion" href="/">Cerrar Sesión</a></li>
        `;
        
        const cerrarSesionLink = listaNav.querySelector('.cerrarSesion');
        cerrarSesionLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            
            window.location.href = '/';
        });
    }
});