/* ===========================
   NAVBAR INDICATOR
=========================== */

const indicator = document.querySelector(".indicator");
const navLinks = document.querySelectorAll(".nav-item");

let currentActive = document.querySelector(".nav-item.active");

function moveIndicator(link) {
    if (!indicator || !link) return;
    indicator.style.width = link.offsetWidth + "px";
    indicator.style.height = link.offsetHeight + "px";
    indicator.style.left = link.offsetLeft + "px";
    indicator.style.top = link.offsetTop + "px";
}

function setActive(link) {
    if (!link || link === currentActive) return;

    if (currentActive) currentActive.classList.remove("active");

    link.classList.add("active");

    currentActive = link;

    moveIndicator(link);
}


/* ===========================
   PAGE LOAD
=========================== */

// Position the indicator on page load
if (currentActive) moveIndicator(currentActive);


/* ===========================
    SECTION OBSERVER
=========================== */

// Observe only the sections on the home page
// Fix: rootMargin accounts for sticky header (80px), threshold array + pick most-visible to avoid flicker
const observer = new IntersectionObserver((entries) => {
    let bestLink = null;
    let maxRatio = 0;
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const ratio = entry.intersectionRatio;
        if (ratio > maxRatio) {
            const link = document.querySelector(`.nav-item[href="#${entry.target.id}"]`);
            if (link) { maxRatio = ratio; bestLink = link; }
        }
    });
    if (bestLink) setActive(bestLink);
}, {
    threshold: [0, 0.3, 0.6, 1],
    rootMargin: "-80px 0px -40% 0px"
});

document.querySelectorAll("#home, #about, #contact")
.forEach(section => observer.observe(section));


/* ===========================
   WINDOW RESIZE
=========================== */

// Keep indicator aligned if the window is resized
window.addEventListener("resize", () => {
    if (currentActive) moveIndicator(currentActive);
});


/* ===========================
   HEADER TRANSPARENT ON SCROLL
=========================== */
const header = document.querySelector("header");
if (header) {
    const toggleHeader = () => {
        if (window.scrollY > 30) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", toggleHeader, {passive:true});
    toggleHeader();
}

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
   FEATURED CARS - VIEW DETAILS MODAL (HOME)
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

const contactModal = document.getElementById("contactModal");
const contactSellerBtn = document.getElementById("contactSellerBtn");
const closeContact = document.querySelector(".close-contact");
const contactCarName = document.getElementById("contactCarName");
const contactForm = document.getElementById("contactForm");
const originalContactForm = contactForm ? contactForm.innerHTML : "";
let buyerMessage = document.getElementById("buyerMessage");

detailButtons.forEach(button => {
    button.addEventListener("click", function(e){
        e.preventDefault();
        const card = this.closest(".car-card");
        if (!card || !modal) return;
        if (modalImage) modalImage.src = card.querySelector("img") ? card.querySelector("img").src : "";
        if (modalTitle) modalTitle.textContent = card.dataset.model || card.querySelector("h3")?.textContent || "";
        const priceVal = Number(card.dataset.price);
        if (modalPrice) modalPrice.textContent = priceVal ? "₦" + priceVal.toLocaleString() : card.querySelector("p")?.textContent || "";
        if (modalYear) modalYear.textContent = card.dataset.year || "";
        if (modalTransmission) modalTransmission.textContent = card.dataset.transmission || "";
        if (modalFuel) modalFuel.textContent = card.dataset.fuel || "";
        if (modalRating) modalRating.textContent = card.dataset.rating || "";
        if (modalDescription) modalDescription.textContent = card.dataset.description || "";

        if (contactSellerBtn) {
            contactSellerBtn.onclick = function(){
                if (contactCarName) contactCarName.textContent = "You're contacting the seller for " + (card.dataset.model || card.querySelector("h3")?.textContent || "");
                buyerMessage = document.getElementById("buyerMessage");
                if (buyerMessage) buyerMessage.value = "Hello, I'm interested in the " + (card.dataset.model || card.querySelector("h3")?.textContent || "") + ". Please contact me with more information.";
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

function resetContactForm(){
    if (!contactForm) return;
    contactForm.innerHTML = originalContactForm;
    buyerMessage = document.getElementById("buyerMessage");
    try { contactForm.reset(); } catch(e) {}
}

function closeCarModal(){
    if (modal) modal.style.display = "none";
    // only restore scroll if contact modal also hidden
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
    window.addEventListener("click", function(e){ if(e.target === modal) closeCarModal(); });
}
if (closeContact && contactModal) {
    closeContact.addEventListener("click", closeContactModal);
    window.addEventListener("click",function(e){
        if(e.target === contactModal) closeContactModal();
    });
}
window.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
        if (modal && modal.style.display === "flex") closeCarModal();
        if (contactModal && contactModal.style.display === "flex") closeContactModal();
    }
});

function attachContactForm(){
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.onsubmit = function(e){
        e.preventDefault();
        const button = form.querySelector("button");
        if (!button) return;
        button.textContent = "Sending...";
        button.disabled = true;
        setTimeout(()=>{
            form.innerHTML = `
                <div class="success-message">
                    <i class="fa-solid fa-circle-check"></i>
                    <h2>Request Sent!</h2>
                    <p>The seller has received your request.<br><br>They will contact you shortly.</p>
                    <button type="button" class="btn btn-primary" id="closeSuccess">Close</button>
                </div>
            `;
            const closeSuccess = document.getElementById("closeSuccess");
            if (closeSuccess) {
                closeSuccess.addEventListener("click", ()=>{
                    closeContactModal();
                });
            }
        },1200);
    };
}
attachContactForm();

/* ===========================
   HAMBURGER MENU - RIGHT DRAWER
=========================== */
const hamburger = document.getElementById("hamburger");
const navDrawer = document.getElementById("navDrawer");
const navLinksEl = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");
const drawerOverlay = document.getElementById("drawerOverlay");

function closeDrawer(){
    if (navDrawer) navDrawer.classList.remove("open");
    if (navLinksEl) navLinksEl.classList.remove("open");
    if (navbar) navbar.classList.remove("menu-open");
    if (hamburger) { hamburger.classList.remove("active"); hamburger.setAttribute("aria-expanded","false"); }
    if (drawerOverlay) drawerOverlay.classList.remove("show");
    if (!modal || modal.style.display !== "flex") {
        if (!contactModal || contactModal.style.display !== "flex") {
            document.body.style.overflow = "";
        }
    }
}
function openDrawer(){
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
        if (isOpen) closeDrawer(); else openDrawer();
    });
    if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
    // close when nav link or button clicked
    navDrawer.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeDrawer();
        });
    });
    // ESC closes drawer
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navDrawer.classList.contains("open")) {
            closeDrawer();
        }
    });
    // Focus trap inside drawer
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
            closeDrawer();
            if (currentActive) moveIndicator(currentActive);
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