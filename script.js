console.log('script.js loaded'); // Debugging ke liye console mein message

let cart = []; // Cart array banaye jisme items store honge

// Menu ko fetch karne ka function
async function displayMenu() {
    console.log('Fetching menu items...'); // Menu fetch hone ka message
    try {
        // Vercel proxy se menu fetch karo
        const response = await fetch('https://rai-guest-house-proxy-3zk0bmew6-raiguesthouses-projects.vercel.app/menu');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const menuItems = await response.json();
        console.log('Menu fetched:', menuItems); // Fetched menu ko console mein dikhao

        // Agar menu items array nahi hai ya khali hai, to message dikhao
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
            document.getElementById('menu-items').innerHTML = '<p>No menu items available.</p>';
            return;
        }

        const menuContainer = document.getElementById('menu-items');
        if (!menuContainer) {
            console.error('Menu container not found!'); // Agar menu container nahi mila to error
            return;
        }
        menuContainer.innerHTML = ''; // Purana content clear karo

        // Menu items ko dynamically add karo
        menuItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('menu-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center');
            div.innerHTML = `
                <span>${item.name} - ₹${item.price}</span>
                <div>
                    <input type="number" min="1" value="1" id="qty-${index}" class="border p-1 rounded w-12">
                    <button onclick="addToCart('${item.name}', ${item.price}, 'qty-${index}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Add to Cart</button>
                </div>
            `;
            menuContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching menu:', error.message); // Menu fetch mein error aaye to log karo
        const menuContainer = document.getElementById('menu-items');
        if (menuContainer) {
            menuContainer.innerHTML = '<p>Error loading menu.</p>';
        }
    }
}

// Cart mein item add karne ka function
function addToCart(name, price, quantityId) {
    const quantity = parseInt(document.getElementById(quantityId).value);
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += quantity; // Agar item pehle se cart mein hai to quantity badhao
    } else {
        cart.push({ name, price, quantity }); // Naya item cart mein add karo
    }
    updateCart(); // Cart ko update karo
}

// Cart ko update karne ka function
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) {
        console.error('Cart elements not found!'); // Agar cart elements nahi mile to error
        return;
    }
    cartItems.innerHTML = ''; // Purana content clear karo
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

    cartTotal.textContent = total; // Total amount update karo
}

// Cart item ki quantity update karne ka function
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // Agar quantity 0 ya kam ho to item remove karo
    }
    updateCart(); // Cart ko update karo
}

// Cart se item remove karne ka function
function removeFromCart(index) {
    cart.splice(index, 1); // Item ko cart se hatao
    updateCart(); // Cart ko update karo
}

// Order submit karne ka function
async function submitOrder() {
    // Agar cart khali hai to alert dikhao
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const roomNumber = document.getElementById('room-number').value.trim();
    const mobileNumber = document.getElementById('mobile-number').value.trim();
    // Room number aur mobile number validate karo
    if (!roomNumber || !mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
        alert('Please enter valid room & mobile number!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = { cart, total, roomNumber, mobileNumber }; // Order data banaye

    try {
        // Vercel proxy pe order submit karo
        const response = await fetch('https://rai-guest-house-proxy-3zk0bmew6-raiguesthouses-projects.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        // Agar response mein status success hai to order successful hai
        if (result.status === 'success') {
            alert('Order placed successfully!');
            cart = []; // Cart khali karo
            document.getElementById('room-number').value = ''; // Room number field khali karo
            document.getElementById('mobile-number').value = ''; // Mobile number field khali karo
            updateCart(); // Cart ko update karo
        } else {
            // Agar error aaya to exact error message dikhao
            alert('Error placing order: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        // Agar request fail ho jaye to error log karo aur alert dikhao
        console.error('Order submission error:', error.message);
        alert('Error placing order: ' + error.message);
    }
}

// DOM fully load hone ke baad displayMenu call karo
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit-order').addEventListener('click', submitOrder);
    displayMenu(); // DOM load hone ke baad menu load karo
});