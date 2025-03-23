let cart = [];
let total = 0;

// Add at the start of file
function showInitialWarning() {
    const agreed = localStorage.getItem('warningAgreed');
    if (!agreed) {
        const hindiMessage = "जरूरी सूचना (Important Notice):\n\n" + 
            "कृपया सुनिश्चित करें:\n" +
            "- वही मोबाइल नंबर डालें जो आपने check-in के समय दिया था\n" +
            "- सही रूम नंबर चुनें\n\n" +
            "अगर ये details गलत होंगी तो आपका ऑर्डर process नहीं होगा,\n" +
            "चाहे website success message दिखाए।\n\n" +
            "OK दबाकर आगे बढ़ें।";

        const englishMessage = "Important Notice:\n\n" +
            "Please ensure:\n" +
            "- Enter the SAME mobile number you provided during check-in\n" +
            "- Select your correct room number\n\n" +
            "Your order will NOT be processed if these details don't match,\n" +
            "even if you receive a success message.\n\n" +
            "Click OK to proceed.";

        const languageChoice = confirm("Choose language / भाषा चुनें:\n\n" +
            "OK = English\n" +
            "Cancel = हिंदी");

        const result = confirm(languageChoice ? englishMessage : hindiMessage);
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

    // Group by categories
    const groupedItems = {};
    menuItems.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });

    // Display each category
    Object.keys(groupedItems).forEach(category => {
        // Add category header
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section mb-8';
        categoryDiv.innerHTML = `
            <h2 class="text-2xl font-bold text-yellow-800 mb-4 border-b-2 border-yellow-600 pb-2">
                ${category}
            </h2>
        `;
        menuDiv.appendChild(categoryDiv);

        // Add items in this category
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        groupedItems[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white p-4 rounded-lg shadow-md';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-base font-semibold">${item.name}</span>  // Changed from text-lg to text-base
                    <button onclick="addToCart('${item.name}', ${item.price})" 
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                        ₹${item.price}
                    </button>
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });
        
        categoryDiv.appendChild(itemsContainer);
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
    if (cart.length === 0) {
        alert('कृपया कुछ आइटम्स ऑर्डर करें');
        return;
    }

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

    // Add this inside submitOrder() after the first validation
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
        alert('कृपया सही मोबाइल नंबर डालें (10 अंकों का)');
        return;
    }

    const orderData = {
        cart: cart,
        total: total,
        roomNumber: roomNumber,
        mobileNumber: mobileNumber,
        // Add sheet details that you can modify
        sheetDetails: {
            spreadsheetName: prompt ('FOOD ORDERS'),
            sheetName: prompt ('Guest Orders')
        }
    };

    try {
        const response = await fetch('https://rai-guest-house-proxy-666k9kuwo-raiguesthouses-projects.vercel.app/submit-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
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

// Add this near the end of the file, just before fetchMenu()
document.getElementById('submit-order').addEventListener('click', submitOrder);

// Fetch menu on page load
fetchMenu();