// المتغيرات العامة
const API_BASE_URL = 'https://fakestoreapi.com';
let products = [];

// عناصر DOM
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const productsGrid = document.getElementById('products-grid');
const productsLoading = document.getElementById('products-loading');
const addProductForm = document.getElementById('add-product-form');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastClose = document.getElementById('toast-close');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');

// عناصر صفحة التفاصيل
const backToProductsBtn = document.getElementById('back-to-products');
const detailProductImage = document.getElementById('detail-product-image');
const detailProductTitle = document.getElementById('detail-product-title');
const detailProductPrice = document.getElementById('detail-product-price');
const detailProductDescription = document.getElementById('detail-product-description');
const detailProductCategory = document.getElementById('detail-product-category');
const detailProductId = document.getElementById('detail-product-id');
const detailCategoryBadge = document.getElementById('detail-category-badge');
const detailProductRating = document.getElementById('detail-product-rating');
const addToCartDetailBtn = document.getElementById('add-to-cart-detail');
const buyNowBtn = document.getElementById('buy-now');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadProducts();
    initializeForm();
    initializeToast();
    initializeSearchAndFilter();
    initializeProductDetails();
});

// إعداد التنقل بين الأقسام
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // إزالة الفئة النشطة من جميع الأزرار
            navButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-white', 'bg-opacity-20');
                btn.classList.add('bg-white', 'bg-opacity-20');
            });
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active', 'bg-white', 'bg-opacity-30');
            this.classList.remove('bg-opacity-20');
            
            // إخفاء جميع الأقسام
            sections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden');
            });
            
            // إظهار القسم المحدد
            const targetSectionElement = document.getElementById(`${targetSection}-section`);
            targetSectionElement.classList.add('active');
            targetSectionElement.classList.remove('hidden');
        });
    });
}

// تحميل المنتجات من API
async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        products = await response.json();
        displayProducts(products);
        showLoading(false);
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showLoading(false);
        showToast('حدث خطأ في تحميل المنتجات', 'error');
    }
}

// عرض المنتجات في الشبكة
function displayProducts(productsToDisplay) {
    productsGrid.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">😔</div>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
                <p class="text-gray-500">جرب البحث بكلمات مختلفة أو اختر فئة أخرى</p>
            </div>
        `;
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer';
    
    card.innerHTML = `
        <div class="relative overflow-hidden" onclick="showProductDetails(${product.id})">
            <img src="${product.image}" alt="${product.title}" 
                 class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                 onerror="this.src='https://via.placeholder.com/400x300/f3f4f6/6b7280?text=صورة+غير+متوفرة'">
            <div class="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                ${getCategoryIcon(product.category)} ${getCategoryName(product.category)}
            </div>
        </div>
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-12 overflow-hidden cursor-pointer" onclick="showProductDetails(${product.id})">
                ${product.title}
            </h3>
            <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-primary-600">$${product.price}</span>
                <div class="flex items-center text-yellow-400">
                    ${generateStars(4.5)}
                </div>
            </div>
            <button onclick="addToCart('${product.title}')" 
                    class="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                🛒 إضافة إلى السلة
            </button>
        </div>
    `;
    
    return card;
}

// الحصول على أيقونة الفئة
function getCategoryIcon(category) {
    const icons = {
        'electronics': '📱',
        'jewelery': '💍',
        'men\'s clothing': '👔',
        'women\'s clothing': '👗'
    };
    return icons[category] || '📦';
}

// الحصول على اسم الفئة بالعربية
function getCategoryName(category) {
    const names = {
        'electronics': 'إلكترونيات',
        'jewelery': 'مجوهرات',
        'men\'s clothing': 'ملابس رجالية',
        'women\'s clothing': 'ملابس نسائية'
    };
    return names[category] || category;
}

// إنشاء النجوم للتقييم
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '☆';
    }
    
    return stars;
}

// إضافة منتج إلى السلة (محاكاة)
function addToCart(productTitle) {
    showToast(`تم إضافة "${productTitle}" إلى السلة بنجاح! 🛒`, 'success');
}

// إعداد النموذج
function initializeForm() {
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const productData = {
            title: formData.get('title'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            category: formData.get('category'),
            image: formData.get('image')
        };
        
        // التحقق من صحة البيانات
        if (!validateProductData(productData)) {
            return;
        }
        
        try {
            await addNewProduct(productData);
            this.reset();
            showToast('تم إضافة المنتج بنجاح! 🎉', 'success');
        } catch (error) {
            console.error('خطأ في إضافة المنتج:', error);
            showToast('حدث خطأ في إضافة المنتج', 'error');
        }
    });
}

// التحقق من صحة بيانات المنتج
function validateProductData(data) {
    if (!data.title || data.title.trim().length < 3) {
        showToast('اسم المنتج يجب أن يكون 3 أحرف على الأقل', 'error');
        return false;
    }
    
    if (!data.price || data.price <= 0) {
        showToast('السعر يجب أن يكون أكبر من صفر', 'error');
        return false;
    }
    
    if (!data.description || data.description.trim().length < 10) {
        showToast('الوصف يجب أن يكون 10 أحرف على الأقل', 'error');
        return false;
    }
    
    if (!data.category) {
        showToast('يرجى اختيار فئة للمنتج', 'error');
        return false;
    }
    
    if (!data.image || !isValidUrl(data.image)) {
        showToast('يرجى إدخال رابط صحيح للصورة', 'error');
        return false;
    }
    
    return true;
}

// التحقق من صحة الرابط
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// إضافة منتج جديد إلى API
async function addNewProduct(productData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newProduct = await response.json();
    
    // إضافة المنتج الجديد إلى القائمة المحلية
    products.unshift(newProduct);
    
    // إعادة تحميل المنتجات إذا كنا في قسم المنتجات
    if (!document.getElementById('products-section').classList.contains('hidden')) {
        displayProducts(products);
    }
    
    return newProduct;
}

// إعداد البحث والتصفية
function initializeSearchAndFilter() {
    // البحث عند النقر على زر البحث
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        searchProducts(query);
    });
    
    // البحث عند الضغط على Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            searchProducts(query);
        }
    });
    
    // التصفية حسب الفئة
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value;
        filterByCategory(selectedCategory);
    });
}

// البحث في المنتجات
function searchProducts(query) {
    if (!query.trim()) {
        displayProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        showToast('لم يتم العثور على منتجات تطابق البحث 🔍', 'error');
    }
}

// تصفية المنتجات حسب الفئة
function filterByCategory(category) {
    if (category === 'all') {
        displayProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.category === category
    );
    
    displayProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        showToast('لا توجد منتجات في هذه الفئة 📂', 'error');
    }
}

// إعداد رسائل التأكيد
function initializeToast() {
    toastClose.addEventListener('click', function() {
        hideToast();
    });
    
    // إخفاء الرسالة تلقائياً بعد 5 ثوان
    setInterval(() => {
        if (!toast.classList.contains('invisible')) {
            hideToast();
        }
    }, 5000);
}

// عرض رسالة تأكيد
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // تغيير لون الرسالة حسب النوع
    const toastContent = toast.querySelector('div');
    if (type === 'error') {
        toastContent.className = 'bg-white rounded-lg shadow-2xl border-l-4 border-red-500 p-4 min-w-80';
    } else {
        toastContent.className = 'bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 min-w-80';
    }
    
    toast.classList.remove('invisible', 'opacity-0');
    toast.classList.add('opacity-100');
}

// إخفاء رسالة التأكيد
function hideToast() {
    toast.classList.add('invisible', 'opacity-0');
    toast.classList.remove('opacity-100');
}

// عرض/إخفاء حالة التحميل
function showLoading(show) {
    if (show) {
        productsLoading.classList.remove('hidden');
        productsGrid.classList.add('hidden');
    } else {
        productsLoading.classList.add('hidden');
        productsGrid.classList.remove('hidden');
    }
}

// إعداد صفحة تفاصيل المنتج
function initializeProductDetails() {
    // زر العودة للمنتجات
    backToProductsBtn.addEventListener('click', function() {
        showSection('products');
    });
    
    // زر إضافة إلى السلة من صفحة التفاصيل
    addToCartDetailBtn.addEventListener('click', function() {
        const productTitle = detailProductTitle.textContent;
        addToCart(productTitle);
    });
    
    // زر شراء الآن
    buyNowBtn.addEventListener('click', function() {
        const productTitle = detailProductTitle.textContent;
        showToast(`تم شراء "${productTitle}" بنجاح! 💳`, 'success');
    });
}

// عرض تفاصيل المنتج
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('لم يتم العثور على المنتج', 'error');
        return;
    }
    
    // ملء بيانات المنتج في صفحة التفاصيل
    detailProductImage.src = product.image;
    detailProductImage.alt = product.title;
    detailProductTitle.textContent = product.title;
    detailProductPrice.textContent = `$${product.price}`;
    detailProductDescription.textContent = product.description;
    detailProductCategory.textContent = getCategoryName(product.category);
    detailProductId.textContent = `#${product.id}`;
    detailCategoryBadge.textContent = `${getCategoryIcon(product.category)} ${getCategoryName(product.category)}`;
    detailProductRating.textContent = generateStars(4.5);
    
    // إظهار صفحة التفاصيل
    showSection('product-details');
}

// إظهار قسم معين
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    // إظهار القسم المحدد
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.remove('hidden');
    }
    
    // تحديث حالة الأزرار في التنقل
    navButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'bg-opacity-20');
        btn.classList.add('bg-white', 'bg-opacity-20');
    });
} 