
// -------------------------------------------------------------------------
// Init: javascript code always required by the pages
// We can fine the function that permits to add and remove the "responsive"
// icon of the topnav in small devices
//--------------------------------------------------------------------------

/* Toggle between adding and removing the "responsive" class to topnav when the user 
   clicks on the icon on small devices (less than 1024px wide) */
function toggle_icon_menu_topnav() {

    var x = document.getElementById("myTopnav");
    if (x.classList.contains("topnav") && !x.classList.contains("responsive")) {
        x.classList.add("responsive");
    } 
    else {
        x.classList.remove("responsive");
    }
}

var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

document.addEventListener('DOMContentLoaded', () => {
    const popupContainer = document.querySelector('.popup-container');
    const closePopupBtn = document.querySelector('.close-popup');

    // Show popup
    popupContainer.style.display = 'flex';
    popupContainer.style.opacity = '0';
    popupContainer.style.transition = 'opacity 0.5s';

    // Disable scrolling and link clicks
    document.body.classList.add('popup-open');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
        });
    });

    // Hide popup when close button is clicked
    closePopupBtn.addEventListener('click', () => {
        popupContainer.style.opacity = '0';

        // Re-enable scrolling and link clicks
        document.body.classList.remove('popup-open');
        document.body.style.overflow = 'auto';
        document.querySelectorAll('a').forEach(link => {
            link.removeEventListener('click', (event) => {
            event.preventDefault();
            });
        });

        setTimeout(() => {
            popupContainer.style.display = 'none';
        }, 500);
    });

    // Show popup after a short delay
    setTimeout(() => {
        popupContainer.style.opacity = '1';
    }, 1000);
});

// Possible other palette
// const color = d3.scaleOrdinal().range(["#ff595e", "#ff924c", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#606470"])
// const color = d3.scaleOrdinal().range(["#ff595e", "#ff924c", "#8ac926", "#1982c4", "#6a4c93", "#582f0e", "#606470"])
// d3.csv("../data/assign1/assign1-plot1.csv").then(function (data)
// {
    // const trees = [...data.slice(0,6).map(d => d["Species"])]
    // trees.push("Others");
    // color.domain(trees)
// });