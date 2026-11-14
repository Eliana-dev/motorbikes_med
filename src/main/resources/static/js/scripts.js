/*!
* Basado en Start Bootstrap - Agency v7.0.12 (MIT)
* Simplificado para un sitio de varias páginas.
*/
window.addEventListener('DOMContentLoaded', () => {

    // En móvil, cerrar el menú desplegable al tocar un enlace
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    document.querySelectorAll('#navbarResponsive .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
