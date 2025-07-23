// Product Data
const products = [
    {
        id: 1,
        title: "Graphic T-Shirt",
        price: "$24.99",
        category: "tshirts",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
    },
    {
        id: 2,
        title: "Cotton Shorts",
        price: "$29.99",
        category: "shorts",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea"
    },
    {
        id: 3,
        title: "Snapback Hat",
        price: "$19.99",
        category: "hats",
        image: "https://images.unsplash.com/photo-1521369909029-2afed882baee"
    },
    {
        id: 4,
        title: "Premium T-Shirt",
        price: "$27.99",
        category: "tshirts",
        image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573"
    },
    {
        id: 5,
        title: "Athletic Shorts",
        price: "$34.99",
        category: "shorts",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d"
    },
    {
        id: 6,
        title: "Beanie",
        price: "$16.99",
        category: "hats",
        image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc"
    }
];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize the shop
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    setupFilterButtons();
});

// Display products
function displayProducts(productsToDisplay) {
    productsContainer.innerHTML = '';
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.image}')"></div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Filter products by category
function setupFilterButtons() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            let filteredProducts = products;
            
            if (category !== 'all') {
                filteredProducts = products.filter(product => product.category === category);
            }
            
            displayProducts(filteredProducts);
        });
    });
}

// Shopping cart functionality (basic example)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = e.target.dataset.id;
        const product = products.find(p => p.id == productId);
        alert(`Added ${product.title} to cart!`);
        // Here you would normally add to a cart array or call a cart function
    }
});