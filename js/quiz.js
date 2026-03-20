/* ===============================
   GLOBAL STATE
================================ */
let activePetId = null;
let uploadedImageBase64 = "";
let isEditing = false;

/* ===============================
   USER + FAVORITES HELPERS
================================ */

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("petmatch_user"));
}

function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];

    const allFavs = JSON.parse(localStorage.getItem("favorites")) || {};
    return allFavs[user.email] || [];
}

function saveFavorites(favs) {
    const user = getCurrentUser();
    if (!user) return;

    let allFavs = JSON.parse(localStorage.getItem("favorites")) || {};
    allFavs[user.email] = favs;
    localStorage.setItem("favorites", JSON.stringify(allFavs));
}

/* ===============================
   DATA MANAGEMENT
================================ */

function getPets() {
    const userPosted =
        JSON.parse(localStorage.getItem("user_posted_pets")) || [];
    return [...pets, ...userPosted];
}

/* ===============================
   NAVIGATION
================================ */

function navigate(viewId) {
    document.querySelectorAll(".view").forEach(
        v => (v.style.display = "none")
    );

    const target = document.getElementById("view-" + viewId);
    if (target) target.style.display = "block";

    if (viewId === "home")
        renderCards(getPets(), "home-pets-container");

    if (viewId === "pets")
        renderCards(getPets(), "pets-container");

    if (viewId === "favs")
        renderFavorites();

    if (viewId === "add-pet" && !isEditing) {
        document.querySelector("#view-add-pet form").reset();
        resetUpload();
    }
}

/* ===============================
   IMAGE UPLOAD
================================ */

function previewImage(event) {
    const file = event.target.files
        ? event.target.files[0]
        : event.dataTransfer.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        uploadedImageBase64 = e.target.result;

        document.getElementById("image-preview").src =
            uploadedImageBase64;

        document
            .getElementById("image-preview-container")
            .classList.remove("d-none");

        document.getElementById("drop-zone").classList.add("d-none");
    };

    reader.readAsDataURL(file);
}

function resetUpload() {
    uploadedImageBase64 = "";
    const input = document.getElementById("new-image-file");
    if (input) input.value = "";

    document
        .getElementById("image-preview-container")
        .classList.add("d-none");

    document.getElementById("drop-zone").classList.remove("d-none");
}

/* ===============================
   ADD / EDIT PET
================================ */

function handlePetUpload(event) {
    event.preventDefault();

    if (!uploadedImageBase64) {
        alert("Please upload a photo!");
        return;
    }

    let priceValue =
        document.getElementById("new-cost-input").value;

    if (!priceValue.includes("₹"))
        priceValue = "₹" + priceValue;

    const currentUser = getCurrentUser();

    const petData = {
        id: isEditing ? activePetId : Date.now(),
        isUserGenerated: true,
        name: newName.value,
        species: newSpecies.value,
        breed: newBreed.value,
        location: newLocation.value,
        description: newDescription.value,
        image: uploadedImageBase64,
        cost: priceValue,
        owner: currentUser?.name || "You",
        phone: "919000000000",
        size: "Medium"
    };

    let userPets =
        JSON.parse(localStorage.getItem("user_posted_pets")) || [];

    if (isEditing) {
        const index = userPets.findIndex(p => p.id === activePetId);
        userPets[index] = petData;
        isEditing = false;
    } else {
        userPets.push(petData);
    }

    localStorage.setItem(
        "user_posted_pets",
        JSON.stringify(userPets)
    );

    alert("Listing saved!");
    resetUpload();
    navigate("pets");
}

/* ===============================
   FAVORITES (🔥 FIXED)
================================ */

function toggleFavorite(event, petId) {
    event.stopPropagation();

    const user = getCurrentUser();

    if (!user) {
        alert("Please login first ❤️");
        return;
    }

    let favs = getFavorites();

    if (favs.includes(petId)) {
        favs = favs.filter(id => id !== petId);
    } else {
        favs.push(petId);
    }

    saveFavorites(favs);

    renderCards(getPets(), "pets-container");
    renderCards(getPets(), "home-pets-container");
    renderFavorites();
}

/* ===============================
   RENDER CARDS
================================ */

function renderCards(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const favs = getFavorites();

    container.innerHTML = list.map(pet => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 position-relative">

                <!-- ❤️ FAVORITE BUTTON -->
                <button
                    class="btn position-absolute top-0 end-0 m-2 border-0 bg-white shadow-sm"
                    style="border-radius:50%; z-index:5;"
                    onclick="toggleFavorite(event, ${pet.id})">

                    <i class="bi ${
                        favs.includes(pet.id)
                            ? 'bi-heart-fill text-danger'
                            : 'bi-heart'
                    }"></i>
                </button>

                <!-- CLICKABLE CARD -->
                <div onclick="showPetDetails(${pet.id})" style="cursor:pointer">

                    <div class="pet-card-img position-relative">
                        <img src="${pet.image}" class="w-100">

                        <!-- PRICE BADGE -->
                        <span class="position-absolute bottom-0 start-0 m-2 badge bg-dark opacity-75">
                            ${pet.cost}
                        </span>
                    </div>

                    <div class="card-body">
                        <h5 class="fw-bold mb-1">${pet.name}</h5>
                        <p class="text-muted small mb-0">
                            ${pet.breed} • ${pet.location}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    `).join('');
}

/* ===============================
   FAVORITES PAGE
================================ */

function renderFavorites() {
    const favs = getFavorites();
    const favPets = getPets().filter(p =>
        favs.includes(p.id)
    );

    const container =
        document.getElementById("favs-container");

    if (!container) return;

    if (!favPets.length) {
        container.innerHTML =
            '<p class="text-center py-5">No favorites yet.</p>';
        return;
    }

    renderCards(favPets, "favs-container");
}

/* ===============================
   PET MODAL
================================ */

function showPetDetails(petId) {
    activePetId = petId;
    const pet = getPets().find(p => p.id === petId);

    const modalBody =
        document.getElementById("modal-content-body");

    modalBody.innerHTML = `
        <img src="${pet.image}" class="img-fluid w-100">
        <div class="p-3">
            <h3>${pet.name}</h3>
            <p>${pet.description}</p>
            <p><b>Location:</b> ${pet.location}</p>
        </div>
    `;

    new bootstrap.Modal(
        document.getElementById("petModal")
    ).show();
}

/* ===============================
   AUTH SYSTEM
================================ */

function handleAuth(event, type) {
    event.preventDefault();

    const user = {
        name:
            type === "signup"
                ? event.target.querySelector(
                      'input[type="text"]'
                  ).value
                : "User",
        email: event.target.querySelector(
            'input[type="email"]'
        ).value,
        isLoggedIn: true
    };

    localStorage.setItem(
        "petmatch_user",
        JSON.stringify(user)
    );

    bootstrap.Modal.getInstance(
        document.getElementById("authModal")
    ).hide();

    updateAuthUI();
    alert("Login successful!");
}

function logout() {
    localStorage.removeItem("petmatch_user");
    updateAuthUI();
    navigate("home");
}

function updateAuthUI() {
    const authControls =
        document.getElementById("auth-controls");

    const user = getCurrentUser();

    if (user) {
        authControls.innerHTML = `
            <button class="btn btn-light btn-sm"
            onclick="logout()">
            ${user.name} (Logout)
            </button>`;
    } else {
        authControls.innerHTML = `
            <button class="btn btn-outline-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#authModal">
            Login
            </button>`;
    }
}

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    navigate("home");
});