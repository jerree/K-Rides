/* ===========================
    SORT CARS
=========================== */

const sort = document.getElementById("sort");
const carGrid = document.querySelector(".cars-car-grid");

function sortCars(){
    if (!sort || !carGrid) return;

    const value = sort.value;

    // Sort only the currently filtered set so active filters are preserved
    switch(value){
        case "low":
            filteredCars.sort((a,b)=>
                Number(a.dataset.price)-Number(b.dataset.price)
            );
            break;

        case "high":
            filteredCars.sort((a,b)=>
                Number(b.dataset.price)-Number(a.dataset.price)
            );
            break;

        case "new":
            filteredCars.sort((a,b)=>
                Number(b.dataset.year)-Number(a.dataset.year)
            );
            break;

        case "old":
            filteredCars.sort((a,b)=>
                Number(a.dataset.year)-Number(b.dataset.year)
            );
            break;

        default:
            // No sort selected — re-apply current filters to restore original / filtered order
            filterCars();
            return;
    }
    // Re-order DOM to match sorted filteredCars (visible + hidden both re-appended in sorted order,
    // hidden ones stay hidden via displayCars)
    filteredCars.forEach(car=>{
        carGrid.appendChild(car);
    });
    // Also keep the hidden non-filtered cars after them to preserve stable DOM
    const hiddenCars = [...document.querySelectorAll(".car-card")].filter(c => !filteredCars.includes(c));
    hiddenCars.forEach(car=> carGrid.appendChild(car));

    currentPage = 1;
    displayCars();
}


/* ===========================
   FILTER CARS
=========================== */

const search = document.getElementById("search");
const brand = document.getElementById("brand");
const fuel = document.getElementById("fuel");
const transmission = document.getElementById("transmission");
const price = document.getElementById("price");

const cars = document.querySelectorAll(".car-card");
let allCars = [...cars];

function filterCars(){

    // Always filter from the live DOM order so current sort is preserved
    allCars = [...document.querySelectorAll(".car-card")];

    filteredCars = [...allCars].filter(car => {

        const carBrand = car.dataset.brand || "";
        const carFuel = car.dataset.fuel || "";
        const carTransmission = car.dataset.transmission || "";
        const carPrice = Number(car.dataset.price);
        const carYear = car.dataset.year || "";
        // normalize helper: lower, hyphens→spaces, collapse spaces
        const norm = s => s.toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
        const carName = norm(car.querySelector("h3")?.textContent || "");
        const carModel = norm(car.dataset.model || "");
        const carDesc = norm(car.dataset.description || "");
        const brandN = norm(carBrand);
        const fuelN = norm(carFuel);
        const transN = norm(carTransmission);

        if (search.value) {
            const q = norm(search.value);
            if (!q) { /* empty */ }
            else {
                // search only on car name (h3)
                const hay = carName;
                if (!hay.includes(q)) return false;
            }
        }

        if (
            brand.value &&
            carBrand !== brand.value
        ){
            return false;
        }

        if (
            fuel.value &&
            carFuel !== fuel.value
        ){
            return false;
        }

        if (
            transmission.value &&
            carTransmission !== transmission.value
        ){
            return false;
        }

        if (price.value) {
            const pv = price.value;
            if (pv.includes("-")) {
                const [minStr, maxStr] = pv.split("-");
                const min = Number(minStr), max = Number(maxStr);
                if (carPrice < min || carPrice > max) return false;
            } else if (pv.endsWith("+")) {
                const min = Number(pv.replace("+",""));
                if (carPrice < min) return false;
            } else {
                if (carPrice > Number(pv)) return false;
            }
        }

        return true;

    });

    currentPage = 1;

    // Re-apply sort after filtering so sort order is not lost
    if (sort && sort.value) {
        const v = sort.value;
        if (v === "low") filteredCars.sort((a,b)=> Number(a.dataset.price)-Number(b.dataset.price));
        else if (v === "high") filteredCars.sort((a,b)=> Number(b.dataset.price)-Number(a.dataset.price));
        else if (v === "new") filteredCars.sort((a,b)=> Number(b.dataset.year)-Number(a.dataset.year));
        else if (v === "old") filteredCars.sort((a,b)=> Number(a.dataset.year)-Number(b.dataset.year));
        // Re-order filtered DOM nodes to sorted order
        filteredCars.forEach(car=> { if (carGrid) carGrid.appendChild(car); });
    }

    displayCars();
}


/* ===========================
    FILTER EVENT LISTENERS
=========================== */
function debounce(fn, ms){
    let t;
    return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
}
// snappier: 60ms for 1-2 letters, 120ms for longer - feels instant but still debounced
const debouncedFilter = debounce(filterCars, 80);
if (search) {
    search.addEventListener("input", debouncedFilter);
    // also filter on clear (× button)
    search.addEventListener("search", filterCars);
}
if (brand) brand.addEventListener("change", filterCars);
if (fuel) fuel.addEventListener("change", filterCars);
if (transmission) transmission.addEventListener("change", filterCars);
if (price) price.addEventListener("change", filterCars);
if (sort) sort.addEventListener("change", sortCars);


/* ===========================
   CAR DETAILS MODAL
=========================== */

const modal = document.getElementById("carModal");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalYear = document.getElementById("modalYear");
const modalTransmission = document.getElementById("modalTransmission");
const modalFuel = document.getElementById("modalFuel");
const modalRating = document.getElementById("modalRating");
const modalDescription = document.getElementById("modalDescription");

const closeModal = document.querySelector(".close-modal");

const detailButtons = document.querySelectorAll(".card-details");


/* ===========================
   CONTACT SELLER MODAL
=========================== */

const contactModal = document.getElementById("contactModal");
const contactSellerBtn = document.getElementById("contactSellerBtn");
const closeContact = document.querySelector(".close-contact");

const contactCarName = document.getElementById("contactCarName");
const contactForm = document.getElementById("contactForm");
const originalContactForm = contactForm ? contactForm.innerHTML : "";
let buyerMessage = document.getElementById("buyerMessage");


/* ===========================
   VIEW DETAILS
=========================== */

detailButtons.forEach(button => {
    button.addEventListener("click", function(e){
        e.preventDefault();
        const card = this.closest(".car-card");
        if (!card || !modal) return;
        if (modalImage) modalImage.src = card.querySelector("img") ? card.querySelector("img").src : "";
        if (modalTitle) modalTitle.textContent = card.dataset.model || "";
        const priceVal = Number(card.dataset.price);
        if (modalPrice) modalPrice.textContent = "₦" + priceVal.toLocaleString();

        if (modalYear) modalYear.textContent = card.dataset.year || "";
        if (modalTransmission) modalTransmission.textContent = card.dataset.transmission || "";
        if (modalFuel) modalFuel.textContent = card.dataset.fuel || "";
        if (modalRating) modalRating.textContent = card.dataset.rating || "";
        if (modalDescription) modalDescription.textContent = card.dataset.description || "";

        if (contactSellerBtn) {
            contactSellerBtn.onclick = function(){
                if (contactCarName) contactCarName.textContent =
                    "You're contacting the seller for " + card.dataset.model;
                // re-query in case form was reset
                buyerMessage = document.getElementById("buyerMessage");
                if (buyerMessage) buyerMessage.value =
                    "Hello, I'm interested in the " +
                    card.dataset.model +
                    ". Please contact me with more information.";

                if (contactModal) {
                    contactModal.style.display = "flex";
                    document.body.style.overflow = "hidden";
                }
            };
        }

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
});


/* ===========================
    RESET CONTACT FORM
=========================== */

function resetContactForm(){
    if (!contactForm) return;
    contactForm.innerHTML = originalContactForm;
    buyerMessage = document.getElementById("buyerMessage");
    // reset() may not exist if original HTML changed; guard
    try { contactForm.reset(); } catch(e) {}
}


/* ===========================
    CLOSE MODALS
=========================== */

function closeCarModal(){
    if (modal) modal.style.display = "none";
    if (!contactModal || contactModal.style.display !== "flex") {
        document.body.style.overflow = "";
    }
}
function closeContactModal(){
    if (contactModal) contactModal.style.display = "none";
    resetContactForm();
    attachContactForm();
    if (!modal || modal.style.display !== "flex") {
        document.body.style.overflow = "";
    }
}

if (closeModal && modal) {
    closeModal.addEventListener("click", closeCarModal);

    window.addEventListener("click", function(e){
        if(e.target === modal){
            closeCarModal();
        }
    });
}

if (closeContact && contactModal) {
    closeContact.addEventListener("click", closeContactModal);

    window.addEventListener("click",function(e){
        if(e.target === contactModal){
            closeContactModal();
        }
    });
}

// ESC to close modals
window.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
        if (modal && modal.style.display === "flex") closeCarModal();
        if (contactModal && contactModal.style.display === "flex") closeContactModal();
    }
});


/* ===========================
    CONTACT FORM SUBMISSION
=========================== */

function attachContactForm(){

    const form = document.getElementById("contactForm");
    if (!form) return;

    // Use onsubmit assignment to avoid duplicate listeners after reset
    form.onsubmit = function(e){

        e.preventDefault();

        const button = form.querySelector("button");

        button.textContent = "Sending...";
        button.disabled = true;

        setTimeout(()=>{

            form.innerHTML = `
                <div class="success-message">

                    <i class="fa-solid fa-circle-check"></i>

                    <h2>Request Sent!</h2>

                    <p>
                        The seller has received your request.
                        <br><br>
                        They will contact you shortly.
                    </p>

                    <button type="button" class="btn" id="closeSuccess">
                        Close
                    </button>

                </div>
            `;

            const closeSuccess = document.getElementById("closeSuccess");
            if (closeSuccess) {
                closeSuccess.addEventListener("click", closeContactModal);
            }

        },1200);

    };

}


/* ===========================
   PAGINATION
=========================== */

const pageNumbersContainer = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const carsPerPage = 12;
let currentPage = 1;
let filteredCars = [...cars];

function renderPagination(totalPages){
    if (!pageNumbersContainer) return;
    pageNumbersContainer.innerHTML = "";
    for (let i=1; i<=totalPages; i++){
        const btn = document.createElement("button");
        btn.className = "page-number" + (i===currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => {
            currentPage = i;
            displayCars();
            if (carGrid) carGrid.scrollIntoView({ behavior:"smooth", block:"start" });
        });
        pageNumbersContainer.appendChild(btn);
    }
}

function displayCars(){

    if (!carGrid) return;

    // Hide all first (use live query so sorted order is respected)
    [...document.querySelectorAll(".car-card")].forEach(car=>{
        car.style.display = "none";
    });

    const start = (currentPage - 1) * carsPerPage;
    const end = start + carsPerPage;

    filteredCars.slice(start,end).forEach(car=>{
        car.style.display = "block";
    });

    const totalPages = Math.ceil(filteredCars.length / carsPerPage) || 1;

    // Clamp currentPage if filtering reduced pages
    if (currentPage > totalPages) currentPage = totalPages;

    renderPagination(totalPages);

    if (prevPage) prevPage.disabled = currentPage === 1;
    if (nextPage) nextPage.disabled = currentPage === totalPages || filteredCars.length === 0;

    const noResults = document.getElementById("no-results");
    if (noResults) noResults.style.display = filteredCars.length === 0 ? "block" : "none";

    const rc = document.getElementById("resultsCount");
    if (rc) {
        const q = search ? search.value.trim() : "";
        if (filteredCars.length === 0) rc.textContent = q ? `No cars found for "${q}"` : "No cars found";
        else if (q) rc.textContent = `Found ${filteredCars.length} car${filteredCars.length!==1?'s':''} for "${q}" — page ${currentPage} of ${totalPages}`;
        else rc.textContent = `Showing ${filteredCars.length} cars — page ${currentPage} of ${totalPages}`;
    }
}


/* ===========================
    PAGINATION EVENT LISTENERS
=========================== */

if (prevPage) {
    prevPage.addEventListener("click", () => {
        if(currentPage > 1){
            currentPage--;
            displayCars();
            if (carGrid) carGrid.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });
        }
    });
}

if (nextPage) {
    nextPage.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredCars.length / carsPerPage) || 1;
        if(currentPage < totalPages){
            currentPage++;
            displayCars();
            if (carGrid) carGrid.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });
        }
    });
}


/* ===========================
   INITIALIZE PAGE
=========================== */

displayCars();
attachContactForm();


/* ===========================
    BACK TO TOP BUTTON
=========================== */

const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", ()=>{
        if(window.scrollY > 500){
            backToTop.classList.add("show");
        }else{
            backToTop.classList.remove("show");
        }
    });

    backToTop.addEventListener("click", ()=>{
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    });
}

/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger = document.getElementById("hamburger");
const navDrawer = document.getElementById("navDrawer");
const navLinksEl = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");
const drawerOverlay = document.getElementById("drawerOverlay");

function closeDrawerCars(){
    if (navDrawer) navDrawer.classList.remove("open");
    if (navLinksEl) navLinksEl.classList.remove("open");
    if (navbar) navbar.classList.remove("menu-open");
    if (hamburger) { hamburger.classList.remove("active"); hamburger.setAttribute("aria-expanded","false"); }
    if (drawerOverlay) drawerOverlay.classList.remove("show");
    if (!modal || modal.style.display !== "flex") {
        if (!contactModal || contactModal.style.display !== "flex") {
            document.body.style.overflow = "";
        }
    } else {
        document.body.style.overflow = "hidden";
    }
}
function openDrawerCars(){
    if (navDrawer) navDrawer.classList.add("open");
    if (navLinksEl) navLinksEl.classList.add("open");
    if (navbar) navbar.classList.add("menu-open");
    if (hamburger) { hamburger.classList.add("active"); hamburger.setAttribute("aria-expanded","true"); }
    if (drawerOverlay) drawerOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

if (hamburger && navDrawer) {
    hamburger.addEventListener("click", () => {
        const isOpen = navDrawer.classList.contains("open");
        if (isOpen) closeDrawerCars(); else openDrawerCars();
    });
    if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawerCars);
    navDrawer.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeDrawerCars();
        });
    });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navDrawer.classList.contains("open")) closeDrawerCars();
    });
    navDrawer.addEventListener("keydown", (e) => {
        if (e.key !== "Tab" || !navDrawer.classList.contains("open")) return;
        const focusables = navDrawer.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeDrawerCars();
        }
    });
}

/* ===========================
   AUTH STATE (localStorage functional)
=========================== */
(function(){
  function getCurrent(){ try{ return JSON.parse(localStorage.getItem('krides_current_user')||'null') || JSON.parse(localStorage.getItem('krides_user')||'null'); }catch(e){ return null; } }
  function updateNav(){
    const user=getCurrent();
    const nav=document.querySelector('.nav-buttons');
    if(!nav) return;
    const carsLink = nav.querySelector('a[href="cars.html"]');
    const carsHTML = carsLink ? carsLink.outerHTML : '<a href="cars.html" class="btn btn-cars">Cars</a>';
    if(user){
      const display=user.name || user.email.split('@')[0];
      nav.innerHTML = `${carsHTML}<span class="nav-user" style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px; padding:0 6px;"><i class="fa-regular fa-user"></i> ${display}</span><a href="#" class="btn btn-login" id="logoutBtn">Logout</a>`;
      const lb=document.getElementById('logoutBtn');
      if(lb) lb.addEventListener('click',(e)=>{ e.preventDefault(); localStorage.removeItem('krides_current_user'); localStorage.removeItem('krides_user'); location.reload(); });
    }
  }
  document.addEventListener('DOMContentLoaded', updateNav);
  setTimeout(updateNav, 150);
})();

/* ===========================
   HEADER TRANSPARENT ON SCROLL
=========================== */
(function(){
  const h = document.querySelector("header");
  if(!h) return;
  const toggle = ()=> { if(window.scrollY>30) h.classList.add("scrolled"); else h.classList.remove("scrolled"); };
  window.addEventListener("scroll", toggle, {passive:true});
  toggle();
})();

/* ===========================
   IMAGE FALLBACK
=========================== */
document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") {
        e.target.style.background = "#E5E7EB";
        e.target.style.display = "block";
        e.target.style.minHeight = "180px";
        e.target.alt = "Image not available";
        e.target.onerror = null;
    }
}, true);