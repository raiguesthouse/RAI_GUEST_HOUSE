console.log('script.js loaded'); // Debug to confirm script is loaded

let cart = [];
let menuItems = []; // Menu items ko store karne ke liye global array
let currentCategory = 'All'; // Default category

// Categories ke buttons banane ke liye function
function renderCategories() {
    const categories = ['All', 'Beverages', 'Main Course', 'Roti', 'Rice', 'Dal'];
    const menuContainer = document.getElementById('menu-items');
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-buttons', 'mb-4');

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.classList.add('category-btn', 'px-4', 'py-2', 'mr-2', 'rounded', 'bg-gray-200', 'hover:bg-gray-300');
        if (category === currentCategory) {
            button.classList.add('bg-gray-400');
        }
        button.addEventListener('click', () => {
            currentCategory = category;
            renderCategories(); // Buttons ko refresh karo
            displayMenu(); // Menu ko filter karke dobara render karo
        });
        categoryContainer.appendChild(button);
    });

    menuContainer.prepend(categoryContainer);
}

async function displayMenu() {
    console.log('Starting to fetch menu...');
    try {
        const response = await fetch('https://rai-guest-house-proxy-qdjl5wprl-raiguesthouses-projects.vercel.app', {
            method: 'GET',
        });
        console.log('Response status:', response.status);
        console.log('Response type:', response.type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        menuItems = await response.json();
        console.log('Menu fetched:', menuItems);

        // Add debugging to check the menu data
        if (!Array.isArray(menuItems)) {
            console.error('Menu data is not an array:', menuItems);
            const menuContainer = document.getElementById('menu-items');
            if (menuContainer) {
                menuContainer.innerHTML = '<p>Error: Menu data is not in the correct format.</p>';
            }
            return;
        }

        if (menuItems.length === 0) {
            console.warn('Menu is empty:', menuItems);
            const menuContainer = document.getElementById('menu-items');
            if (menuContainer) {
                menuContainer.innerHTML = '<p>No menu items available.</p>';
            }
            return;
        }

        const menuContainer = document.getElementById('menu-items');
        if (!menuContainer) {
            console.error('Menu container not found!');
            return;
        }
        menuContainer.innerHTML = ''; // Clear previous content

        // Categories ke buttons render karo
        renderCategories();

        // Filter menu items based on current category
        const filteredItems = currentCategory === 'All' 
            ? menuItems 
            : menuItems.filter(item => item.category === currentCategory);

        filteredItems.forEach((item, index) => {
            console.log(`Rendering menu item ${index}:`, item); // Debug each item
            const sanitizedId = `item-${index}`;
            const div = document.createElement('div');
            div.classList.add('menu-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center');
            div.innerHTML = `
                <span>${item.name} (Qty: 1) - ₹${item.price}</span>
                <div>
                    <input type="number" min="1" value="1" id="qty-${sanitizedId}" style="width: 50px;" class="border p-1 rounded">
                    <button onclick="addToCart('${item.name}', ${item.price}, '${sanitizedId}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Add to Cart</button>
                </div>
            `;
            menuContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        console.error('Error details:', error);
        const menuContainer = document.getElementById('menu-items');
        if (menuContainer) {
            menuContainer.innerHTML = '<p>Error loading menu. Please try again later.</p>';
        }
    }
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

    // Validate mobile number (10 digits)
    const mobileNumberPattern = /^[0-9]{10}$/;
    if (!mobileNumberPattern.test(mobileNumber)) {
        alert('Please enter a valid 10-digit mobile number!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = { cart, total, roomNumber, mobileNumber }; // Include room number and mobile number in the order data

    try {
        const response = await fetch('https://rai-guest-house-proxy-<new-hash>.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Order submitted successfully!');
            cart = []; // Clear the cart
            document.getElementById('room-number').value = ''; // Clear the room number input
            document.getElementById('mobile-number').value = ''; // Clear the mobile number input
            updateCart();
        } else {
            alert('Error submitting order: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting order:', error.message);
        alert('Error submitting order. Please try again later.');
    }
}

// Add event listener for the Submit Order button
console.log('Adding event listener for submit-order button');
document.getElementById('submit-order').addEventListener('click', submitOrder);

// Call displayMenu immediately to ensure it runs
console.log('Calling displayMenu immediately');
displayMenu();