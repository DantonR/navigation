var commercialNav = document.getElementById('commercialNav')
var mainNav = document.getElementById('mainNav')
var productsButton = document.getElementById('productsButton')
var commercialProducts = document.getElementById('commercialProducts')
var commercialProductsDesktop = document.getElementById('commercialProductsDesktop')
var hamburgerMenu = document.getElementById('hamburgerMenu')
var backBtn = document.getElementById('backBtn')
var mobNav = document.getElementById('mobNav')



productsButton.addEventListener('mouseover', function () {
    console.log('works')
    commercialProductsDesktop.classList.add('nav-menu--desktop-show');
    commercialProductsDesktop.classList.remove('nav-menu--desktop');
})
// productsButton.addEventListener('click', function () {
//     mainNav.classList.remove("menu--shown")
//     mainNav.classList.add("menu--hide-left");

//     commercialProducts.classList.add("menu--shown")
// })
// backBtn.addEventListener('click', function () {
//     mainNav.classList.remove("menu--hide-left");
//     mainNav.classList.add("menu--shown")

//     commercialProducts.classList.remove("menu--shown")
//     commercialProducts.classList.add("menu--hide-right")
// })


// if (window.innerWidth <= 768) {

// } else if (window.innerWidth > 768 && window.innerWidth <= 1024) {
//     // Execute code for medium screens
// } else {
//     // Execute code for large screens
// }


// window.addEventListener('resize', function () {
//     if (window.innerWidth <= 768) {
//         // Execute code for small screens
//     } else if (window.innerWidth > 768 && window.innerWidth <= 1024) {
//         // Execute code for medium screens
//     } else {
//         // Execute code for large screens
//     }
// });


hamburgerMenu.addEventListener('change', function () {
    if (this.checked) {
        console.log('Checkbox is checked');
        mobNav.classList.remove("d-none")
        mobNav.classList.add("d-flex")
    } else {
        console.log('Checkbox is unchecked');
        mobNav.classList.remove("d-flex")
        mobNav.classList.add("d-none")
    }
});