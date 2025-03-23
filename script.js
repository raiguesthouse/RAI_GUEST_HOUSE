console.log('script.js loaded'); // Debugging

let cart = [];
let menuItems = []; // Global menu storage
let currentCategory = 'All'; // Default category

// **Categories ko render karne ka function**
function renderCategories() {
    const categories = ['All', 'Beverages', 'Main Course', 'Roti', 'Rice', 'Dal'];
    const categoryContainer = document.getElementById('category-buttons');
    if (!categoryContainer) {
        console.error('Category container not found!');
        return;
    }

    categoryContainer.innerHTML = ''; // Purane buttons clear karo

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.classList.add('category-btn', 'px-4', 'py-2', 'mr-2', 'rounded', 'transition', 'duration-300', 'bg-gray-200', 'hover:bg-gray-400');

        if (category === currentCategory) {
            button.classList.add('bg-gray-500', 'text-white');
        }

        button.addEventListener('click', () => {
            currentCategory = category;
            renderCategories(); // Buttons refresh
            displayMenu(); // Menu filter karke render karo
        });

        categoryContainer.appendChild(button);
    });
}

// **Menu items fetch & display function**
async function displayMenu() {
    console.log('Fetching menu items...');
    try {
        const response = await fetch('https://rai-guest-house-proxy-7txh8o9rp-raiguesthouses-projects.vercel.app/menu');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        menuItems = await response.json();
        console.log('Menu fetched:', menuItems);

        if (!Array.isArray(menuItems) || menuItems.length === 0) {
            document.getElementById('menu-items').innerHTML = '<p>No menu items available.</p>';
            return;
        }

        document.getElementById('menu-items').innerHTML = ''; // Clear previous content
        renderCategories(); // Render categories

        const filteredItems = currentCategory === 'All' ? menuItems : menuItems.filter(item => item.category === currentCategory);

        filteredItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('menu-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center', 'transition', 'duration-300', 'hover:shadow-lg');
            div.innerHTML = `
                <span>${item.name} - ₹${item.price}</span>
                <div>
                    <input type="number" min="1" value="1" id="qty-${index}" class="border p-1 rounded w-12">
                    <button onclick="addToCart('${item.name}', ${item.price}, 'qty-${index}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Add to Cart</button>
                </div>
            `;
            document.getElementById('menu-items').appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        document.getElementById('menu-items').innerHTML = '<p>Error loading menu.</p>';
    }
}

// **Cart functionalities**
function addToCart(name, price, quantityId) {
    const quantity = parseInt(document.getElementById(quantityId).value);
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
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('cart-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center');
        li.innerHTML = `
            <span>${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <div>
                <button onclick="updateQuantity(${index}, -1)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">-</button>
                <button onclick="updateQuantity(${index}, 1)" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">+</button>
                <button onclick="removeFromCart(${index})" class="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600">Remove</button>
            </div>
        `;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;
}

function updateQuantity(index, change) {
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

// **Order placement functionality**
async function submitOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const roomNumber = document.getElementById('room-number').value.trim();
    const mobileNumber = document.getElementById('mobile-number').value.trim();
    if (!roomNumber || !mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
        alert('Please enter valid room & mobile number!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = { cart, total, roomNumber, mobileNumber };

    try {
        const response = await fetch('https://rai-guest-house-proxy-e0r0828mq-raiguesthouses-projects.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Order placed successfully!');
            cart = [];
            document.getElementById('room-number').value = '';
            document.getElementById('mobile-number').value = '';
            updateCart();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Order submission error:', error.message);
        alert('Error placing order.');
    }
}

// **Event listeners & Initializations**
document.getElementById('submit-order').addEventListener('click', submitOrder);
displayMenu(); // Load menu initially