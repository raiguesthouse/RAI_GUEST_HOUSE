// Log karo taaki confirm ho ki script load ho gaya hai.
console.log('script.js loaded');

// Global variables cart aur menu items ke liye.
// cart: User ke cart mein add hue items store karta hai.
// menuItems: Fetched menu items store karta hai taaki category ke hisaab se filter kar sakein.
let cart = [];
let menuItems = [];

// Yeh function menu items fetch karta hai Vercel proxy ke /menu endpoint se.
// Jab menu fetch ho raha hota hai tab loading spinner dikhata hai aur phir menu items render karta hai.
// Agar menu fetch karne ka tareeka change karna hai (jaise API endpoint change karna ya aur fields add karna jaise images), to is function ko update kar do.
async function displayMenu() {
    console.log('Starting to fetch menu...');
    
    // Menu fetch hone ke dauraan loading spinner dikhao.
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'block';

    try {
        // Vercel proxy se menu data fetch karo.
        // Agar Vercel proxy ka URL ya endpoint change hota hai, to yeh URL update kar do.
        const response = await fetch('https://rai-guest-house-proxy.vercel.app/menu', {
            method: 'GET',
        });
        console.log('Response status:', response.status);
        console.log('Response type:', response.type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Fetched menu items ko global menuItems variable mein store karo.
        menuItems = await response.json();
        console.log('Menu fetched:', menuItems);

        // Check karo ki fetched data array hai ya nahi.
        if (!Array.isArray(menuItems)) {
            console.error('Menu data is not an array:', menuItems);
            const menuContainer = document.getElementById('menu');
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="text-red-500">Error: Menu data is not in the correct format.</p>';
            }
            return;
        }

        // Check karo ki menu khali to nahi hai.
        if (menuItems.length === 0) {
            console.warn('Menu is empty:', menuItems);
            const menuContainer = document.getElementById('menu');
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="text-yellow-500">No menu items available.</p>';
            }
            return;
        }

        // Default mein saare menu items dikhao.
        filterCategory('all');
    } catch (error) {
        // Koi error aaye to log karo aur website pe error message dikhao.
        console.error('Error fetching menu:', error.message);
        console.error('Error details:', error);
        const menuContainer = document.getElementById('menu');
        if (menuContainer) {
            menuContainer.innerHTML = '<p class="text-red-500">Error loading menu. Please try again later.</p>';
        }
    } finally {
        // Fetching complete hone ke baad loading spinner chhupa do.
        spinner.style.display = 'none';
    }
}

// Yeh function menu items ko category ke hisaab se filter karta hai aur page pe render karta hai.
// Jab category tab (jaise All, Beverages, Roti) pe click hota hai tab yeh call hota hai.
// Agar categories filter karne ka tareeka ya menu items ka display change karna hai (jaise images add karna, styling change karna), to is function ko update kar do.
function filterCategory(category) {
    const menuContainer = document.getElementById('menu');
    if (!menuContainer) {
        console.error('Menu container not found!');
        return;
    }
    menuContainer.innerHTML = '';

    // Active tab ka styling update karo.
    // Agar index.html mein categories add ya remove karte ho, to yahan tab names match karo.
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(`'${category}'`)) {
            tab.classList.add('active');
        }
    });

    // Selected category ke hisaab se items filter karo.
    const filteredItems = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);

    // Filtered items ko cards ke roop mein render karo.
    filteredItems.forEach((item, index) => {
        console.log(`Rendering menu item ${index}:`, item);
        const sanitizedId = `item-${index}`;
        const div = document.createElement('div');
        div.classList.add('menu-item', 'hover-effect');
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-sm">${item.name} - ₹${item.price}</span>
                <div class="flex items-center gap-2">
                    <input type="number" min="1" value="1" id="qty-${sanitizedId}" class="w-12 p-1 rounded text-black">
                    <button onclick="addToCart('${item.name}', ${item.price}, '${sanitizedId}')" class="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-3 py-1 rounded">Add to Cart</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(div);
    });
}

// Yeh function item ko cart mein add karta hai jab "Add to Cart" button pe click hota hai.
// Cart ko update karta hai aur cart section ko re-render karta hai.
// Agar cart mein items add karne ka tareeka change karna hai (jaise validation add karna, aur item details store karna), to is function ko update kar do.
function addToCart(name, price, sanitizedId) {
    const quantity = parseInt(document.getElementById(`qty-${sanitizedId}`).value);
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    updateCart();
}

// Yeh function cart section ko page pe update karta hai.
// Cart items ko render karta hai, total calculate karta hai, aur total price display karta hai.
// Agar cart ka display change karna hai (jaise aur item details add karna, styling change karna), to is function ko update kar do.
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) {
        console.error('Cart elements not found!');
        return;
    }
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('cart-item', 'flex', 'justify-between', 'items-center');
        div.innerHTML = `
            <span class="text-sm">${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <div class="flex gap-2">
                <button onclick="adjustQuantity(${index}, -1)" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-1 rounded">-</button>
                <button onclick="adjustQuantity(${index}, 1)" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 py-1 rounded">+</button>
                <button onclick="removeFromCart(${index})" class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-2 py-1 rounded">Remove</button>
            </div>
        `;
        cartItems.appendChild(div);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;
}

// Yeh function cart mein item ki quantity adjust karta hai.
// Jab cart mein "+" ya "-" buttons pe click hota hai tab yeh call hota hai.
// Agar quantity adjustments ka tareeka change karna hai (jaise minimum/maximum limits add karna), to is function ko update kar do.
function adjustQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

// Yeh function cart se item remove karta hai.
// Jab cart mein "Remove" button pe click hota hai tab yeh call hota hai.
// Agar items remove karne ka tareeka change karna hai (jaise confirmation prompt add karna), to is function ko update kar do.
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Yeh function order ko Vercel proxy ke /submit-order endpoint pe submit karta hai.
// Cart, total, room number, aur mobile number ko Apps Script ko bhejta hai recording ke liye.
// Agar order submission ka tareeka change karna hai (jaise aur validation add karna, extra data bhejna), to is function ko update kar do.
async function submitOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const roomNumber = document.getElementById('room-number').value.trim();
    if (!roomNumber) {
        alert('Please enter your room number!');
        return;
    }

    const mobileNumber = document.getElementById('mobile-number').value.trim();
    if (!mobileNumber) {
        alert('Please enter your mobile number!');
        return;
    }

    const mobileNumberPattern = /^[0-9]{10}$/;
    if (!mobileNumberPattern.test(mobileNumber)) {
        alert('Please enter a valid 10-digit mobile number!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = { cart, total, roomNumber, mobileNumber };

    try {
        // Order ko Vercel proxy pe submit karo.
        // Agar Vercel proxy ka URL ya endpoint change hota hai, to yeh URL update kar do.
        const response = await fetch('https://rai-guest-house-proxy.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (result.status === 'success') {
            // Detailed confirmation message dikhao with order summary.
            const orderSummary = cart.map(item => `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`).join('\n');
            alert(`Order submitted successfully!\n\nRoom Number: ${roomNumber}\nMobile Number: ${mobileNumber}\n\nOrder Details:\n${orderSummary}\n\nTotal: ₹${total}`);

            // Successful order submission pe fireworks effect dikhao.
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Cart ko clear karo aur form reset karo.
            cart = [];
            document.getElementById('room-number').value = '';
            document.getElementById('mobile-number').value = '';
            updateCart();
        } else {
            alert('Error submitting order: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting order:', error.message);
        alert('Error submitting order. Please try again later.');
    }
}

// "Place Order" button pe event listener add karo taaki submitOrder function call ho.
document.getElementById('submit-order').addEventListener('click', submitOrder);

// Page load hote hi displayMenu call karo taaki menu load ho jaye.
displayMenu();