let cart = [];
let total = 0;

// Add at the start of file
function showInitialWarning() {
    const agreed = localStorage.getItem('warningAgreed');
    if (!agreed) {
        const result = confirm("जरूरी सूचना (Important Notice):\n\n" + 
            "कृपया सुनिश्चित करें:\n" +
            "- वही मोबाइल नंबर डालें जो आपने check-in के समय दिया था\n" +
            "- सही रूम नंबर चुनें\n\n" +
            "अगर ये details गलत होंगी तो आपका ऑर्डर process नहीं होगा,\n" +
            "चाहे website success message दिखाए।\n\n" +
            "OK दबाकर आगे बढ़ें।");
        if (result) {
            localStorage.setItem('warningAgreed', 'true');
        }
    }
}

// Modify fetchMenu function
async function fetchMenu() {
    try {
        showInitialWarning(); // Page load pe warning dikhayega
        const response = await fetch('https://rai-guest-house-proxy-666k9kuwo-raiguesthouses-projects.vercel.app/menu');
        const menuItems = await response.json();
        displayMenu(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';

    // Categories ke hisaab se menu items group karo
    const categories = [...new Set(menuItems.map(item => item.Category))]; // Changed from 'category' to 'Category'
    categories.forEach(category => {
        // Category header with better styling
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryHeader.className = 'text-xl font-bold mb-4 mt-6 text-yellow-800 border-b-2 border-yellow-800 pb-2';
        menuDiv.appendChild(categoryHeader);

        // Us category ke items display karo
        const categoryItems = menuItems.filter(item => item.Category === category); // Changed from 'category' to 'Category'
        categoryItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item bg-white p-4 rounded shadow-sm flex justify-between items-center';
            itemDiv.innerHTML = `
                <span class="text-lg">${item.name} - ₹${item.price}</span>
                <button onclick="addToCart('${item.name}', ${item.price})" 
                        class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    + Add
                </button>
            `;
            menuDiv.appendChild(itemDiv);
        });
    });
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    total += price;
    updateCart();
}

function updateCart() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <button onclick="removeFromCart('${item.name}', ${item.price})">Remove</button>
        `;
        cartDiv.appendChild(itemDiv);
    });
    document.getElementById('cart-total').textContent = total;
}

function removeFromCart(name, price) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity -= 1;
        total -= price;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.name !== name);
        }
        updateCart();
    }
}

async function submitOrder() {
    const roomNumber = document.getElementById('room-number').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;

    // Basic validation
    if (!roomNumber || !mobileNumber) {
        alert('कृपया रूम नंबर और मोबाइल नंबर दोनों भरें');
        return;
    }

    if (!termsAccepted) {
        alert('कृपया नीचे दिए गए checkbox को टिक करें');
        return;
    }

    const orderData = {
        cart: cart,
        total: total,
        roomNumber: roomNumber,
        mobileNumber: mobileNumber
    };

    try {
        const response = await fetch('https://rai-guest-house-proxy-666k9kuwo-raiguesthouses-projects.vercel.app/submit-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert('Order placed successfully!');
            cart = [];
            total = 0;
            updateCart();
        } else {
            alert('Error placing order: ' + result.message);
        }
    } catch (error) {
        alert('Error placing order: ' + error.message);
    }
}

// Fetch menu on page load
fetchMenu();