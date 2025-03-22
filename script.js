let cart = [];

async function displayMenu() {
    console.log('Starting to fetch menu...');
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyn5D-4VHShkibvWO7npc_vTeDJQAl5McDyAn-py0eXbpab7kl45RtWxKjt_sE2Fy-a/exec', {
            method: 'GET',
            // mode: 'no-cors', // Comment out no-cors to test if CORS works
        });
        console.log('Response status:', response.status);
        console.log('Response type:', response.type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const menu = await response.json();
        console.log('Menu fetched:', menu);

        const menuContainer = document.getElementById('menu-items');
        if (!menuContainer) {
            console.error('Menu container not found!');
            return;
        }
        menuContainer.innerHTML = '';

        menu.forEach((item, index) => {
            const sanitizedId = `item-${index}`;
            const div = document.createElement('div');
            div.classList.add('menu-item');
            div.innerHTML = `
                <span>${item.name} - ₹${item.price}</span>
                <div>
                    <input type="number" min="1" value="1" id="qty-${sanitizedId}" style="width: 50px;">
                    <button onclick="addToCart('${item.name}', ${item.price}, '${sanitizedId}')">Add to Cart</button>
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

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total;
}

window.onload = displayMenu;