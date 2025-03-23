// Script load hone ka message console mein dikhao (debugging ke liye)
console.log('script.js loaded'); // Debugging ke liye console mein message

// Cart array banaye jisme items store honge
let cart = []; // Cart array banaye jisme items store honge

// Menu ko fetch karne ka function banaye
async function displayMenu() {
    // Menu fetch hone ka message console mein dikhao
    console.log('Fetching menu items...'); // Menu fetch hone ka message
    try {
        // Vercel proxy se menu fetch karo (GET request bhejo)
        const response = await fetch('https://rai-guest-house-proxy-d1sguox7v-raiguesthouses-projects.vercel.app/menu');
        // Agar response sahi nahi aaya to error throw karo
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        // Response ko JSON format mein parse karo
        const menuItems = await response.json();
        // Fetched menu ko console mein dikhao (debugging ke liye)
        console.log('Menu fetched:', menuItems); // Fetched menu ko console mein dikhao

        // Agar menu items array nahi hai ya khali hai, to message dikhao
        if (!Array.isArray(menuItems) || menuItems.length === 0) {
            // Menu items container mein "No menu items available" message daalo
            document.getElementById('menu-items').innerHTML = '<p>No menu items available.</p>';
            return;
        }

        // Menu items ke liye container select karo
        const menuContainer = document.getElementById('menu-items');
        // Agar menu container nahi mila to error log karo
        if (!menuContainer) {
            console.error('Menu container not found!'); // Agar menu container nahi mila to error
            return;
        }
        // Purana content clear karo taaki naye items add ho sakein
        menuContainer.innerHTML = ''; // Purana content clear karo

        // Menu items ko dynamically add karo (har item ke liye ek div banaye)
        menuItems.forEach((item, index) => {
            // Naya div element banaye
            const div = document.createElement('div');
            // Div ko styling classes daalo
            div.classList.add('menu-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center');
            // Div ke andar HTML content daalo (item ka naam, price, quantity input, aur add to cart button)
            div.innerHTML = `
                <span>${item.name} - ₹${item.price}</span>
                <div>
                    <input type="number" min="1" value="1" id="qty-${index}" class="border p-1 rounded w-12">
                    <button onclick="addToCart('${item.name}', ${item.price}, 'qty-${index}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Add to Cart</button>
                </div>
            `;
            // Div ko menu container mein add karo
            menuContainer.appendChild(div);
        });
    } catch (error) {
        // Menu fetch mein error aaye to console mein log karo
        console.error('Error fetching menu:', error.message); // Menu fetch mein error aaye to log karo
        // Menu container select karo
        const menuContainer = document.getElementById('menu-items');
        // Agar container mila to error message dikhao
        if (menuContainer) {
            menuContainer.innerHTML = '<p>Error loading menu.</p>';
        }
    }
}

// Cart mein item add karne ka function banaye
function addToCart(name, price, quantityId) {
    // Quantity input field se value lo aur integer mein convert karo
    const quantity = parseInt(document.getElementById(quantityId).value);
    // Cart mein check karo ki item pehle se hai ya nahi
    const existingItem = cart.find(item => item.name === name);

    // Agar item pehle se cart mein hai to uski quantity badhao
    if (existingItem) {
        existingItem.quantity += quantity; // Agar item pehle se cart mein hai to quantity badhao
    } else {
        // Naya item cart mein add karo
        cart.push({ name, price, quantity }); // Naya item cart mein add karo
    }
    // Cart ko update karo taaki nayi items dikhein
    updateCart(); // Cart ko update karo
}

// Cart ko update karne ka function banaye
function updateCart() {
    // Cart items aur total ke liye elements select karo
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    // Agar cart elements nahi mile to error log karo
    if (!cartItems || !cartTotal) {
        console.error('Cart elements not found!'); // Agar cart elements nahi mile to error
        return;
    }
    // Purana content clear karo taaki naye items add ho sakein
    cartItems.innerHTML = ''; // Purana content clear karo
    // Total amount ke liye variable banaye
    let total = 0;

    // Cart ke har item ke liye loop chalao
    cart.forEach((item, index) => {
        // Naya list item (li) element banaye
        const li = document.createElement('li');
        // List item ko styling classes daalo
        li.classList.add('cart-item', 'border', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between', 'items-center');
        // List item ke andar HTML content daalo (item ka naam, quantity, total price, aur buttons)
        li.innerHTML = `
            <span>${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <div>
                <button onclick="updateQuantity(${index}, -1)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">-</button>
                <button onclick="updateQuantity(${index}, 1)" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">+</button>
                <button onclick="removeFromCart(${index})" class="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600">Remove</button>
            </div>
        `;
        // List item ko cart items container mein add karo
        cartItems.appendChild(li);
        // Total amount calculate karo
        total += item.price * item.quantity;
    });

    // Total amount ko cart total element mein daalo
    cartTotal.textContent = total; // Total amount update karo
}

// Cart item ki quantity update karne ka function banaye
function updateQuantity(index, change) {
    // Cart ke specific item ki quantity update karo
    cart[index].quantity += change;
    // Agar quantity 0 ya kam ho jaye to item remove karo
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // Agar quantity 0 ya kam ho to item remove karo
    }
    // Cart ko update karo taaki changes dikhein
    updateCart(); // Cart ko update karo
}

// Cart se item remove karne ka function banaye
function removeFromCart(index) {
    // Cart se specific item hatao
    cart.splice(index, 1); // Item ko cart se hatao
    // Cart ko update karo taaki changes dikhein
    updateCart(); // Cart ko update karo
}

// Order submit karne ka function banaye
async function submitOrder() {
    // Agar cart khali hai to alert dikhao
    if (cart.length === 0) {
        alert('Your cart is empty!'); // Cart khali hai to message dikhao
        return;
    }

    // Room number aur mobile number input fields se values lo
    const roomNumber = document.getElementById('room-number').value.trim();
    const mobileNumber = document.getElementById('mobile-number').value.trim();
    // Room number aur mobile number validate karo
    if (!roomNumber || !mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
        alert('Please enter valid room & mobile number!'); // Agar validation fail ho to alert dikhao
        return;
    }

    // Total amount calculate karo
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Order data object banaye
    const orderData = { cart, total, roomNumber, mobileNumber }; // Order data banaye

    try {
        // Vercel proxy pe order submit karo (POST request bhejo)
        const response = await fetch('https://rai-guest-house-proxy-d1sguox7v-raiguesthouses-projects.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' },
        });

        // Response ko JSON format mein parse karo
        const result = await response.json();
        // Agar response mein status success hai to order successful hai
        if (result.status === 'success') {
            alert('Order placed successfully!'); // Success message dikhao
            cart = []; // Cart khali karo
            document.getElementById('room-number').value = ''; // Room number field khali karo
            document.getElementById('mobile-number').value = ''; // Mobile number field khali karo
            updateCart(); // Cart ko update karo
        } else {
            // Agar error aaya to exact error message dikhao
            alert('Error placing order: ' + (result.message || 'Unknown error')); // Error message dikhao
        }
    } catch (error) {
        // Agar request fail ho jaye to error log karo aur alert dikhao
        console.error('Order submission error:', error.message); // Error ko console mein log karo
        alert('Error placing order: ' + error.message); // Error message dikhao
    }
}

// DOM fully load hone ke baad events aur functions call karo
document.addEventListener('DOMContentLoaded', () => {
    // Submit order button pe click event add karo
    document.getElementById('submit-order').addEventListener('click', submitOrder);
    // DOM load hone ke baad menu load karo
    displayMenu(); // DOM load hone ke baad menu load karo
});