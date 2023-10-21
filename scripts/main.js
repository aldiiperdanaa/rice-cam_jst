// BUTTON MORE
document.addEventListener("DOMContentLoaded", function () {
    const moreButton = document.getElementById("more-button");
    const buttonMore = document.getElementById("button-more");
    const shareButton = document.querySelector("#button-more .button-icon:nth-child(1)");
    const infoButton = document.querySelector("#button-more .button-icon:nth-child(2)");
    const imageButton = document.querySelector("#button-more .button-icon:last-child");

    moreButton.addEventListener("click", function () {
        buttonMore.classList.toggle("more-hidden");
    });

    function closeButtonMore() {
        buttonMore.classList.add("more-hidden");
    }

    shareButton.addEventListener("click", closeButtonMore);
    infoButton.addEventListener("click", closeButtonMore);
    imageButton.addEventListener("click", closeButtonMore);

    document.addEventListener("click", function (event) {
        if (!moreButton.contains(event.target) && !buttonMore.contains(event.target)) {
            buttonMore.classList.add("more-hidden");
        }
    });
});

// SHARE
document.querySelector("#button-more .button-icon:nth-child(1)").addEventListener("click", function () {
    if (navigator.share) {
        navigator.share({
            title: 'KeDai Hackathon',
            text: 'Berikut adalah aplikasi pendeteksi kualitas beras',
            url: 'https://www.example.com'
        })
            .then(() => console.log('Berhasil membagikan'))
            .catch((error) => console.error('Gagal membagikan', error));
    } else {
        alert('Fungsionalitas berbagi tidak didukung di browser ini.');
    }
});


// MODAL
const modalContainerImage = document.querySelector(".modal-container-image"),
    imageModal = document.querySelector(".image-modal"),
    imageOver = document.querySelector(".image-over"),
    modalContainerInfo = document.querySelector(".modal-container-info"),
    modalInfo = document.querySelector(".modal-info"),
    addInfo = document.querySelector("#add-info"),
    closeInfo = document.querySelector("#close-info");

imageOver.addEventListener("click", () => modalContainerImage.classList.add("active"));
addInfo.addEventListener("click", () => modalContainerInfo.classList.add("active"));


imageModal.addEventListener("click", (e) => {
    e.stopPropagation();
});

modalInfo.addEventListener("click", (e) => {
    e.stopPropagation();
});

modalContainerImage.addEventListener("click", () =>
    modalContainerImage.classList.remove("active")
);

modalContainerInfo.addEventListener("click", () =>
    modalContainerInfo.classList.remove("active")
);

closeInfo.addEventListener("click", () =>
    modalContainerInfo.classList.remove("active")
);
