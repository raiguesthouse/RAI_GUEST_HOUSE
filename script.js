console.log('script.js loaded'); // Debug to confirm script is loaded

let cart = [];
let menuItems = [];

async function displayMenu() {
    console.log('Starting to fetch menu...');
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'block';

    try {
        const response = await fetch('https://rai-guest-house-proxy.vercel.app/menu', {
            method: 'GET',
        });
        console.log('Response status:', response.status);
        console.log('Response type:', response.type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        menuItems = await response.json();
        console.log('Menu fetched:', menuItems);

        if (!Array.isArray(menuItems)) {
            console.error('Menu data is not an array:', menuItems);
            const menuContainer = document.getElementById('menu');
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="text-red-500">Error: Menu data is not in the correct format.</p>';
            }
            return;
        }

        if (menuItems.length === 0) {
            console.warn('Menu is empty:', menuItems);
            const menuContainer = document.getElementById('menu');
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="text-yellow-500">No menu items available.</p>';
            }
            return;
        }

        filterCategory('all');
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        console.error('Error details:', error);
        const menuContainer = document.getElementById('menu');
        if (menuContainer) {
            menuContainer.innerHTML = '<p class="text-red-500">Error loading menu. Please try again later.</p>';
        }
    } finally {
        spinner.style.display = 'none';
    }
}

function filterCategory(category) {
    const menuContainer = document.getElementById('menu');
    if (!menuContainer) {
        console.error('Menu container not found!');
        return;
    }
    menuContainer.innerHTML = '';

    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(`'${category}'`)) {
            tab.classList.add('active');
        }
    });

    // Filter items
    const filteredItems = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);

    filteredItems.forEach((item, index) => {
        console.log(`Rendering menu item ${index}:`, item);
        const sanitizedId = `item-${index}`;
        const div = document.createElement('div');
        div.classList.add('menu-item', 'hover-effect');
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-base">${item.name} - ₹${item.price}</span>
                <div class="flex items-center gap-2">
                    <input type="number" min="1" value="1" id="qty-${sanitizedId}" class="w-16 p-1 rounded text-black">
                    <button onclick="addToCart('${item.name}', ${item.price}, '${sanitizedId}')" class="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-3 py-1 rounded">Add to Cart</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(div);
    });
}

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
            <span>${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <div class="flex gap-2">
                <button onclick="adjustQuantity(${index}, -1)" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">-</button>
                <button onclick="adjustQuantity(${index}, 1)" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">+</button>
                <button onclick="removeFromCart(${index})" class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded">Remove</button>
            </div>
        `;
        cartItems.appendChild(div);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;
}

function adjustQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

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
        const response = await fetch('https://rai-guest-house-proxy.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (result.status === 'success') {
            const orderSummary = cart.map(item => `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`).join('\n');
            alert(`Order submitted successfully!\n\nRoom Number: ${roomNumber}\nMobile Number: ${mobileNumber}\n\nOrder Details:\n${orderSummary}\n\nTotal: ₹${total}`);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

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

document.getElementById('submit-order').addEventListener('click', submitOrder);
displayMenu();