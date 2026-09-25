const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const money = n =>
    new Intl.NumberFormat("en-US").format(Number(n)) + " MMK";

const getCart = () =>
    JSON.parse(localStorage.getItem("ctrls_cart") || "[]");

const saveCart = c => {
    localStorage.setItem("ctrls_cart", JSON.stringify(c));
    updateCartCount();
};

const getWish = () =>
    JSON.parse(localStorage.getItem("ctrls_wishlist") || "[]");

const saveWish = w =>
    localStorage.setItem("ctrls_wishlist", JSON.stringify(w));


// ==============================
// Toast Message
// ==============================

function toast(msg) {
    const t = $("#toast");

    if (!t) return;

    t.textContent = msg;
    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 1800);
}


// ==============================
// Cart
// ==============================

function updateCartCount() {
    const n = getCart().reduce((a, x) => a + x.qty, 0);

    $$(".cart-count").forEach(e => {
        e.textContent = n;
    });
}

function addCart(id) {
    let c = getCart();
    let x = c.find(i => i.id == id);

    if (x) {
        x.qty++;
    } else {
        c.push({
            id: id,
            qty: 1
        });
    }

    saveCart(c);
    toast("Added to cart");
}


// ==============================
// Wishlist
// ==============================

function toggleWish(id, btn) {
    let w = getWish();

    if (w.includes(id)) {
        w = w.filter(x => x !== id);
    } else {
        w.push(id);
    }

    saveWish(w);

    if (btn) {
        btn.textContent = w.includes(id) ? "♥" : "♡";
    }

    toast(
        w.includes(id)
            ? "Saved to wishlist"
            : "Removed from wishlist"
    );
}


// ==============================
// Product Helpers
// ==============================

function product(id) {
    return PRODUCTS.find(p => p.id == id);
}


// ==============================
// Game Image
// ==============================

function imageBox(p, large = false) {
    return `
        <div class="game-image-placeholder ${large ? "large" : ""}">
            <img
                src="${p.image}"
                alt="${p.title}"
                onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
            >
        </div>
    `;
}


// ==============================
// Game Card
// ==============================

function card(p) {
    const d = Math.round(
        (1 - p.price / p.original) * 100
    );

    const w = getWish().includes(p.id);

    return `
        <article class="card">

            <a href="product.html?id=${p.id}">
                ${imageBox(p)}
            </a>

            <div class="card-body">

                <div class="meta">
                    <span>${p.category}</span>
                    <span>★ ${p.rating}</span>
                </div>

                <h3 style="margin:7px 0 4px;font-size:16px">
                    ${p.title}
                </h3>

                <div class="meta">
                    ${p.platform}
                </div>

                <div style="margin-top:10px">

                    <span class="price">
                        ${money(p.price)}
                    </span>

                    <span class="old">
                        ${money(p.original)}
                    </span>

                    <span class="discount">
                        -${d}%
                    </span>

                </div>

                <div class="card-actions">

                    <button
                        class="btn"
                        onclick="location.href='product.html?id=${p.id}'"
                    >
                        View Game
                    </button>

                    <button
                        class="btn heart"
                        data-wish="${p.id}"
                    >
                        ${w ? "♥" : "♡"}
                    </button>

                    <button
                        class="btn primary"
                        data-add="${p.id}"
                    >
                        Add
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ==============================
// Card Events
// ==============================

function wireCards(scope = document) {

    $$("[data-add]", scope).forEach(b => {

        b.onclick = e => {
            e.preventDefault();

            addCart(+b.dataset.add);
        };

    });

    $$("[data-wish]", scope).forEach(b => {

        b.onclick = e => {
            e.preventDefault();

            toggleWish(
                +b.dataset.wish,
                b
            );
        };

    });
}


// ==============================
// Home Page
// ==============================

function renderHome() {

    if (!$("#featured")) return;

    $("#featured").innerHTML =
        PRODUCTS
            .slice(0, 6)
            .map(card)
            .join("");

    $("#popular").innerHTML =
        PRODUCTS
            .slice(6, 12)
            .map(card)
            .join("");

    $("#recent").innerHTML =
        PRODUCTS
            .slice(12, 20)
            .map(card)
            .join("");

    wireCards();
}


// ==============================
// Marketplace
// ==============================

function renderMarket() {

    if (!$("#marketGrid")) return;

    const params =
        new URLSearchParams(location.search);

    if (params.get("q")) {
        $("#marketSearch").value =
            params.get("q");
    }

    if (params.get("category")) {
        $("#category").value =
            params.get("category");
    }

    const draw = () => {

        let q =
            ($("#marketSearch").value || "")
                .toLowerCase();

        let cat =
            $("#category").value || "";

        let plat =
            $("#platform").value || "";

        let max =
            +($("#maxPrice").value || 0);

        let sort =
            $("#sort").value || "";

        let list = PRODUCTS.filter(p =>
            (
                p.title +
                " " +
                p.category +
                " " +
                p.platform
            )
                .toLowerCase()
                .includes(q)

            && (!cat || p.category === cat)

            && (!plat || p.platform.includes(plat))

            && (!max || p.price <= max)
        );

        if (sort === "low") {
            list.sort(
                (a, b) =>
                    a.price - b.price
            );
        }

        if (sort === "high") {
            list.sort(
                (a, b) =>
                    b.price - a.price
            );
        }

        if (sort === "discount") {
            list.sort(
                (a, b) =>
                    (b.original - b.price) -
                    (a.original - a.price)
            );
        }

        $("#marketGrid").innerHTML =
            list.length

                ? list
                    .map(card)
                    .join("")

                : `
                    <div
                        class="empty"
                        style="grid-column:1/-1"
                    >
                        <h2>
                            No games found
                        </h2>

                        <p>
                            Try a different search
                            or filter.
                        </p>
                    </div>
                `;

        $("#resultCount").textContent =
            list.length + " games";

        wireCards();
    };

    [
        "marketSearch",
        "category",
        "platform",
        "maxPrice",
        "sort"
    ].forEach(id => {

        $("#" + id).addEventListener(
            "input",
            draw
        );

    });

    draw();
}


// ==============================
// Product Details
// ==============================

function renderProduct() {

    const box = $("#product");

    if (!box) return;

    const p =
        product(
            new URLSearchParams(
                location.search
            ).get("id")
        ) || PRODUCTS[0];

    box.innerHTML = `

        <div class="product-layout">

            <div>
                ${imageBox(p, true)}
            </div>

            <div class="product-info">

                <span class="eyebrow">
                    ${p.category}
                </span>

                <h1>
                    ${p.title}
                </h1>

                <p class="muted">
                    Pre-owned copy in very good
                    condition. Each listing is checked
                    before it is added to the
                    CTRL S catalog.
                </p>

                <div class="bigprice">

                    ${money(p.price)}

                    <span class="old">
                        ${money(p.original)}
                    </span>

                    <span class="discount">
                        -${Math.round(
                            (1 - p.price / p.original) * 100
                        )}%
                    </span>

                </div>

                <div class="detail-list">

                    <div class="detail">
                        <small>
                            Category
                        </small>

                        <br>

                        <b>
                            ${p.category}
                        </b>
                    </div>

                    <div class="detail">
                        <small>
                            Platform
                        </small>

                        <br>

                        <b>
                            ${p.platform}
                        </b>
                    </div>

                    <div class="detail">
                        <small>
                            Condition
                        </small>

                        <br>

                        <b>
                            ${p.condition}
                        </b>
                    </div>

                    <div class="detail">
                        <small>
                            Rating
                        </small>

                        <br>

                        <b>
                            ★ ${p.rating}/5
                        </b>
                    </div>

                </div>

                <div class="seller">

                    <b>
                        CTRL S Store
                    </b>

                    <p class="muted">
                        Verified game marketplace
                        listing. Contact us through
                        Telegram, Viber, phone or email
                        for availability.
                    </p>

                </div>

                <div class="qty">

                    <button id="minus">
                        −
                    </button>

                    <b id="qty">
                        1
                    </b>

                    <button id="plus">
                        ＋
                    </button>

                    <button
                        class="btn primary"
                        id="addProduct"
                    >
                        Add to Cart
                    </button>

                    <button
                        class="btn"
                        id="buyNow"
                    >
                        Buy Now
                    </button>

                    <button
                        class="btn heart"
                        id="wishProduct"
                    >
                        ${
                            getWish().includes(p.id)
                                ? "♥"
                                : "♡"
                        }
                    </button>

                </div>

            </div>

        </div>

        <div class="section">

            <div class="section-head">

                <div>

                    <span class="eyebrow">
                        More to play
                    </span>

                    <h2>
                        Related games
                    </h2>

                </div>

            </div>

            <div class="grid">

                ${
                    PRODUCTS
                        .filter(
                            x => x.id !== p.id
                        )
                        .slice(0, 4)
                        .map(card)
                        .join("")
                }

            </div>

        </div>
    `;

    let q = 1;

    $("#plus").onclick = () => {
        $("#qty").textContent = ++q;
    };

    $("#minus").onclick = () => {
        $("#qty").textContent =
            Math.max(1, --q);
    };

    $("#addProduct").onclick = () => {

        let c = getCart();

        let x =
            c.find(i => i.id == p.id);

        if (x) {
            x.qty += q;
        } else {
            c.push({
                id: p.id,
                qty: q
            });
        }

        saveCart(c);

        toast("Added to cart");
    };

    $("#buyNow").onclick = () => {

        let c = getCart();

        let x =
            c.find(i => i.id == p.id);

        if (x) {
            x.qty += q;
        } else {
            c.push({
                id: p.id,
                qty: q
            });
        }

        saveCart(c);

        location.href = "cart.html";
    };

    $("#wishProduct").onclick = () => {

        toggleWish(
            p.id,
            $("#wishProduct")
        );

    };

    wireCards();
}


// ==============================
// Cart Page
// ==============================

function renderCart() {

    const box = $("#cartItems");

    if (!box) return;

    const c = getCart();

    if (!c.length) {

        box.innerHTML = `

            <div class="empty">

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Pick a game and add it
                    to your cart.
                </p>

                <a
                    class="btn primary"
                    href="marketplace.html"
                >
                    Browse Games
                </a>

            </div>
        `;

        updateTotals();

        return;
    }

    box.innerHTML = c.map(i => {

        const p = product(i.id);

        return `

            <div class="cart-item">

                <div>
                    ${imageBox(p)}
                </div>

                <div>

                    <b>
                        ${p.title}
                    </b>

                    <div class="muted">
                        ${p.platform}
                    </div>

                    <div style="margin-top:8px">

                        <b>
                            ${money(p.price)}
                        </b>

                    </div>

                </div>

                <div>

                    <div class="qty">

                        <button
                            onclick="changeQty(
                                ${p.id},
                                -1
                            )"
                        >
                            −
                        </button>

                        <b>
                            ${i.qty}
                        </b>

                        <button
                            onclick="changeQty(
                                ${p.id},
                                1
                            )"
                        >
                            ＋
                        </button>

                    </div>

                    <button
                        class="btn remove"
                        style="margin-top:9px"
                        onclick="removeCart(${p.id})"
                    >
                        Remove
                    </button>

                </div>

            </div>

        `;

    }).join("");

    updateTotals();
}


// ==============================
// Cart Totals
// ==============================

function updateTotals() {

    const c = getCart();

    const subtotal =
        c.reduce(
            (a, i) =>
                a +
                (product(i.id)?.price || 0) *
                i.qty,
            0
        );

    const delivery =
        subtotal ? 1500 : 0;

    const service =
        subtotal
            ? Math.round(subtotal * 0.02)
            : 0;

    const total =
        subtotal +
        delivery +
        service;

    if ($("#subtotal")) {
        $("#subtotal").textContent =
            money(subtotal);
    }

    if ($("#delivery")) {
        $("#delivery").textContent =
            money(delivery);
    }

    if ($("#service")) {
        $("#service").textContent =
            money(service);
    }

    if ($("#total")) {
        $("#total").textContent =
            money(total);
    }

    if ($("#itemCount")) {
        $("#itemCount").textContent =
            c.reduce(
                (a, x) => a + x.qty,
                0
            );
    }

    if ($("#checkout")) {

        $("#checkout").onclick = () => {

            if (!c.length) {
                toast("Your cart is empty");
                return;
            }

            localStorage.setItem(
                "ctrls_orders",
                String(
                    (+localStorage.getItem(
                        "ctrls_orders"
                    ) || 0) + 1
                )
            );

            localStorage.removeItem(
                "ctrls_cart"
            );

            toast(
                "Order placed in demo mode"
            );

            setTimeout(
                () => location.reload(),
                600
            );
        };
    }
}


// ==============================
// Change Cart Quantity
// ==============================

function changeQty(id, n) {

    let c = getCart();

    let x =
        c.find(i => i.id == id);

    if (x) {

        x.qty += n;

        if (x.qty <= 0) {

            c = c.filter(
                i => i.id !== id
            );

        }
    }

    saveCart(c);

    renderCart();
}


// ==============================
// Remove Cart Item
// ==============================

function removeCart(id) {

    saveCart(
        getCart().filter(
            i => i.id !== id
        )
    );

    toast("Removed from cart");

    renderCart();
}


// ==============================
// Authentication
// ==============================

function auth() {

    const f = $("#authForm");

    if (!f) return;

    f.onsubmit = e => {

        e.preventDefault();

        const email =
            $("#email").value.trim();

        const pass =
            $("#password").value;

        if (
            !email ||
            pass.length < 6
        ) {

            toast(
                "Use a valid email and 6+ character password"
            );

            return;
        }

        localStorage.setItem(
            "ctrls_user",
            email.split("@")[0]
        );

        toast(
            "Welcome to CTRL S"
        );

        setTimeout(
            () => location.href = "profile.html",
            600
        );
    };
}


// ==============================
// Profile
// ==============================

function profile() {

    if (!$("#username")) return;

    const user =
        localStorage.getItem(
            "ctrls_user"
        ) || "Guest";

    $("#username").textContent =
        user;

    $("#profileEmail").textContent =
        localStorage.getItem(
            "ctrls_user"
        )
            ? user + "@demo.ctrls"
            : "Sign in to save your profile";

    const w = getWish();

    $("#wishCount").textContent =
        w.length;

    $("#orderCount").textContent =
        localStorage.getItem(
            "ctrls_orders"
        ) || 0;

    $("#wishlistGrid").innerHTML =
        w.length

            ? PRODUCTS
                .filter(
                    p => w.includes(p.id)
                )
                .map(card)
                .join("")

            : `
                <div class="empty">

                    <h2>
                        No saved games
                    </h2>

                    <p>
                        Your wishlist will
                        appear here.
                    </p>

                </div>
            `;

    wireCards();
}


// ==============================
// Page Initialization
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        renderHome();

        renderMarket();

        renderProduct();

        renderCart();

        auth();

        profile();

        $$(".mobile-toggle").forEach(b => {

            b.onclick = () => {

                $("#navlinks")
                    ?.classList
                    .toggle("open");

            };

        });

    }
);