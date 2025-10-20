const API_URL = 'https://makeup-api.herokuapp.com/api/v1/products.json';

let __productData = []; 
let __isDataLoaded = false;

async function initializeAppData() {
    if (__isDataLoaded) {
        console.log("Data är redan laddad.");
        return;
    }

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP-fel! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        __productData = data;
        __isDataLoaded = true;

        document.dispatchEvent(new CustomEvent('appDataLoaded'));

    } catch (error) {
        console.error("FEL: Kunde inte initiera appdata. Kontrollera API-anslutningen.", error);
        document.dispatchEvent(new CustomEvent('appDataError', { detail: { message: error.message } }));
    }
}

function getProductData() {
    if (!__isDataLoaded) {
        console.warn("Försöker hämta data innan den är klar. Använd 'appDataLoaded' händelsen.");
    }
    return __productData;
}

window.initializeAppData = initializeAppData;
window.getProductData = getProductData;

window.addEventListener('load', initializeAppData); 
