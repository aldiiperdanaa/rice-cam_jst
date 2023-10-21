let globalPredictions = [];

// LOKASI
const translationDictionary = {
    "South Sulawesi": "Sulawesi Selatan",
};

var stateProvince = "";
document.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const state = data.address.state || data.address.city;
                const translatedState = translationDictionary[state] || state;
                stateProvince = translatedState;
            })
            .catch(() => {
                console.log("Error fetching data from API Nominatim");
            });
    });
});

function gantiGambar(dataURL) {
    const imgElements = document.querySelectorAll(".img-change");
    imgElements.forEach((imgElement) => {
        imgElement.setAttribute("src", dataURL);
    });
}

document.getElementById("input-image").addEventListener("change", function () {
    const uploadedFile = this.files[0];
    const fileName = uploadedFile.name;

    localStorage.setItem("uploaded-file-name", fileName);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
        localStorage.setItem("image-detection", reader.result);
        gantiGambar(reader.result);
        location.reload();
    });

    reader.readAsDataURL(uploadedFile);
});

const noneDetect = document.getElementById("none-detect");
const loadDetect = document.getElementById("load-detect");

document.addEventListener("DOMContentLoaded", () => {
    const recentImageDataUrl = localStorage.getItem("image-detection");
    if (recentImageDataUrl) {
        gantiGambar(recentImageDataUrl);
        noneDetect.style.display = "none";
        detectObjects(recentImageDataUrl);
    } else {
        loadDetect.style.display = "none";
        noneDetect.style.display = "block";
    }

    const recentFileName = localStorage.getItem("uploaded-file-name");
    if (recentFileName) {
        const fileName = document.getElementById('file-name');
        fileName.textContent = recentFileName
    }
});

function detectObjects(imageDataUrl) {
    let img = document.getElementById("img-view");

    roboflow.auth({
        publishable_key: "rf_r1CAhU1Q3m2Sx3d2V0qT"
    });
    roboflow.load({
        model: "ricecam",
        version: 1,
    }).then(model => {
        model.configure({
            threshold: 0.5,
            overlap: 0.5,
            max_objects: 50
        });
        model.detect(img).then(predictions => {
            globalPredictions = predictions;
            document.getElementById("image-box").innerHTML = renderBox(predictions);
            document.getElementById("over-data").innerHTML = renderData(predictions);
            document.getElementById("over-bar").innerHTML = renderBar(predictions);

            // Ikhtisar Identifikasi
            var numPredictions = predictions.length;
            var objectCount = document.querySelector(".overview span"),
                objectSpan = document.querySelector(".header-subtitle span"),
                grainsNum = document.querySelector(".grains-num"),
                countGrains = 0;
            objectCount.textContent = numPredictions;
            objectSpan.textContent = numPredictions;
            predictions.forEach(function (prediction) {
                var className = prediction.class;
                if (className.startsWith("butir_")) {
                    countGrains++;
                }
            });
            grainsNum.textContent = countGrains;

            // KATEGORI
            var kategoriInfo = [];

            predictions.forEach(function (prediction) {
                var kategori = prediction.class;
                var existingCategory = kategoriInfo.find(function (info) {
                    return info.kategori === kategori;
                });

                if (!existingCategory) {
                    kategoriInfo.push({
                        kategori: kategori,
                        count: 1,
                        class: prediction.class,
                    });
                } else {
                    existingCategory.count++;
                }
            });

            var totalCount = kategoriInfo.reduce(function (total, info) {
                return total + info.count;
            }, 0);

            kategoriInfo.forEach(function (info) {
                info.percentage = (info.count / totalCount) * 100;
            });

            // INFORMASI TAMBAHAN
            const segmentInput = document.getElementsByName("segment-input");
            const saveInfo = document.getElementById("save-info");

            var provinsiInput = document.getElementById("province-input");
            provinsiInput.value = stateProvince;

            function initializeData() {
                const storedData = localStorage.getItem("data");
                if (!storedData) {
                    const selectedSegment = Array.from(segmentInput).find(input => input.checked).value;
                    const selectedProvince = provinsiInput.value;

                    const data = {
                        segment: selectedSegment,
                        province: selectedProvince,
                    };

                    localStorage.setItem("data", JSON.stringify(data));
                }
            }

            initializeData();

            function loadInitialData() {
                const storedData = localStorage.getItem("data");
                if (storedData) {
                    const data = JSON.parse(storedData);

                    provinsiInput.value = data.province;
                    Array.from(segmentInput).forEach(input => {
                        if (input.value === data.segment) {
                            input.checked = true;
                        }
                    });
                }
            }

            loadInitialData();

            saveInfo.addEventListener("click", function () {
                const selectedSegment = Array.from(segmentInput).find(input => input.checked).value;
                const selectedProvince = provinsiInput.value;

                const data = {
                    segment: selectedSegment,
                    province: selectedProvince,
                };

                localStorage.setItem("data", JSON.stringify(data));
                window.location.reload();
            });

            const storedData = localStorage.getItem("data");
            const dataInfo = JSON.parse(storedData);
            let provinceDataInfo = dataInfo.province;
            let segmentDataInfo = dataInfo.segment;

            // PENENTUAN KETEGORI SESUAI SYARAT KHUSUS
            var kategoriAkhir = "Bawah"; // Default "bawah"

            var kepalaPercentage = kategoriInfo.find(info => info.kategori === "butir_kepala")?.percentage || 0;
            var patahPercentage = kategoriInfo.find(info => info.kategori === "butir_patah")?.percentage || 0;
            var menirPercentage = kategoriInfo.find(info => info.kategori === "butir_menir")?.percentage || 0;
            var merahPercentage = kategoriInfo.find(info => info.kategori === "butir_merah")?.percentage || 0;
            var rusakPercentage = kategoriInfo.find(info => info.kategori === "butir_rusak")?.percentage || 0;
            var kapurPercentage = kategoriInfo.find(info => info.kategori === "butir_kapur")?.percentage || 0;
            var gabahCount = kategoriInfo.find(info => info.kategori === "butir_gabah")?.count || 0;
            // Benda Asing
            var sekamPercentage = kategoriInfo.find(info => info.kategori === "sekam")?.percentage || 0;
            var kutuPercentage = kategoriInfo.find(info => info.kategori === "kutu")?.percentage || 0;
            var batuPercentage = kategoriInfo.find(info => info.kategori === "batu")?.percentage || 0;

            // Syarat Komponen Mutu
            var isPremium =
                kepalaPercentage >= 85 &&
                patahPercentage <= 14.50 &&
                menirPercentage <= 0.50 &&
                merahPercentage <= 0.50 &&
                rusakPercentage <= 0.50 &&
                kapurPercentage <= 0.50 &&
                // Benda Asing
                sekamPercentage <= 0.01 &&
                kutuPercentage <= 0.01 &&
                batuPercentage <= 0.01 &&
                // Gabah
                gabahCount <= 1;
            var isMedium1 =
                kepalaPercentage >= 80 &&
                patahPercentage <= 18 &&
                menirPercentage <= 2 &&
                merahPercentage <= 2 &&
                rusakPercentage <= 2 &&
                kapurPercentage <= 2 &&
                // Benda Asing
                sekamPercentage <= 0.02 &&
                kutuPercentage <= 0.02 &&
                batuPercentage <= 0.02 &&
                // Gabah
                gabahCount <= 2;
            var isMedium2 =
                kepalaPercentage >= 75 &&
                patahPercentage <= 22 &&
                menirPercentage <= 3 &&
                merahPercentage <= 3 &&
                rusakPercentage <= 3 &&
                kapurPercentage <= 3 &&
                // Benda Asing
                sekamPercentage <= 0.03 &&
                kutuPercentage <= 0.03 &&
                batuPercentage <= 0.03 &&
                // Gabah
                gabahCount <= 3;

            switch (true) {
                case isPremium:
                    kategoriAkhir = "Premium";
                    break;
                case isMedium1:
                    kategoriAkhir = "Medium I";
                    break;
                case isMedium2:
                    kategoriAkhir = "Medium II";
                    break;
            }

            var classCategory = document.querySelector("#class-category");
            classCategory.textContent = kategoriAkhir;

            if (kategoriAkhir === "Premium") {
                classCategory.classList.add("class-premium");
            } else if (kategoriAkhir === "Medium I") {
                classCategory.classList.add("class-medium-i");
            } else if (kategoriAkhir === "Medium II") {
                classCategory.classList.add("class-medium-ii");
            } else if (kategoriAkhir === "Bawah") {
                classCategory.classList.add("class-bawah");
            }

            // =============================================
            var classCounts = {};
            var selectedClassNames = ["butir_kepala", "butir_patah", "butir_menir"]; // Nama-nama className yang Anda inginkan

            predictions.forEach(function (prediction) {
                var className = prediction.class;
                var classId = prediction.color;

                if (selectedClassNames.includes(className)) {
                    if (classCounts.hasOwnProperty(className)) {
                        classCounts[className].count += 1;
                    } else {
                        classCounts[className] = {
                            count: 1,
                            color: classId
                        };
                    }
                }
            });

            // console.log(classCounts);

            var classNamesArray = [];
            var countsArray = [];
            var colorsArray = [];

            for (var className in classCounts) {
                if (classCounts.hasOwnProperty(className)) {
                    classNamesArray.push(className);
                    countsArray.push(classCounts[className].count);
                    colorsArray.push(classCounts[className].color);
                }
            }

            var classInfoArray = [];
            for (var className in classCounts) {
                if (classCounts.hasOwnProperty(className)) {
                    classInfoArray.push({
                        className: className,
                        count: classCounts[className].count,
                        color: classCounts[className].color
                    });
                }
            }

            classInfoArray.sort(function (a, b) {
                return b.count - a.count;
            });

            var sortedClassNamesArray = [];
            var sortedCountsArray = [];
            var sortedColorsArray = [];

            classInfoArray.forEach(function (info) {
                sortedClassNamesArray.push(info.className);
                sortedCountsArray.push(info.count);
                sortedColorsArray.push(info.color);
            });

            var sortedClassNamesArray = sortedClassNamesArray.map(function (className) {
                var words = className.split("_");
                for (var i = 0; i < words.length; i++) {
                    words[i] = words[i][0].toUpperCase() + words[i].slice(1);
                }
                return words.join(" ");
            });

            var grainsCountElement = document.querySelector("#grains-count");
            var dataTerbanyak = sortedClassNamesArray[0];
            grainsCountElement.textContent = dataTerbanyak;

            let grains_options = {
                chart: {
                    height: '380',
                    type: 'donut',
                    fontFamily: 'SF Pro Text, sans-serif',
                },
                colors: sortedColorsArray,
                dataLabels: {
                    dropShadow: {
                        enabled: false
                    },
                },
                legend: {
                    show: true,
                    position: 'bottom',
                    fontSize: '12px',
                    labels: {
                        colors: '#6B7280',
                    },
                    formatter: function (seriesName, opts) {
                        return ['<span class="legend-grains">' + seriesName + '</span>' + '<br>' + opts.w.globals.series[opts.seriesIndex] + ' butir beras']
                    },
                    markers: {
                        width: 4,
                        height: 33,
                        offsetX: -6,
                        offsetY: 1
                    },
                    itemMargin: {
                        horizontal: 16,
                        vertical: 8,
                    },
                    onItemClick: {
                        toggleDataSeries: true
                    },

                },
                series: sortedCountsArray,
                labels: sortedClassNamesArray,
                plotOptions: {
                    pie: {
                        donut: {
                            size: '60%',
                            labels: {
                                show: true,
                                value: {
                                    show: true,
                                    fontSize: '36px',
                                    fontFamily: 'SF Pro Display, sans-serif',
                                    color: undefined,
                                    offsetY: 16,
                                    formatter: function (val) {
                                        return val
                                    }
                                },
                                total: {
                                    show: true,
                                    showAlways: true,
                                    label: 'Butir beras',
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    formatter: function (w) {
                                        return w.globals.seriesTotals.reduce((a, b) => {
                                            return a + b
                                        }, 0)
                                    }
                                },
                            }
                        }
                    }
                },
                tooltip: {
                    fillSeriesColor: false,
                }
            };

            let grains = new ApexCharts(document.querySelector("#chart-grains"), grains_options);
            grains.render();

            // URL API Buatan untuk harga pasar beras
            var apiUrl = 'https://restapi-hargaberas-default-rtdb.firebaseio.com/beras.json';
            var deteksiHarga = 0;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    var qualityCategory = document.querySelector("#class-category").textContent;
                    var province = provinceDataInfo;
                    var segment = segmentDataInfo;

                    if (!province) {
                        province = "Semua Provinsi";
                    }

                    provinceData = Object.values(data).find(item => item.provinsi === province);

                    if (provinceData) {
                        var qualityData = provinceData.harga_pangan.find(function (item) {
                            return item.kualitas === qualityCategory;
                        });

                        if (qualityData) {
                            var priceData = qualityData.jenis.find(function (item) {
                                return item.segmentasi_pasar === segment;
                            });

                            if (priceData) {
                                deteksiHarga = priceData.harga;
                            }
                        }
                    }

                    var formattedHarga = deteksiHarga.toLocaleString('id-ID');
                    var priceNum = document.querySelector(".price-num");
                    priceNum.textContent = formattedHarga;
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            // LOADING
            const loadDetect = document.getElementById("load-detect");
            const completeDetect = document.getElementById("complete-detect");

            loadDetect.style.display = "none";
            completeDetect.style.display = "block";
        }).catch(error => {
            console.error(error);
        });
    }).catch(error => {
        console.error(error);
    });
}

function capitalizeClassName(className) {
    var words = className.split('_');
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
}

function renderBox(data) {
    var divBox = "";

    data.forEach(function (prediction, index) {
        var className = capitalizeClassName(prediction.class);
        var x = prediction.bbox.x / 1000 * 100;
        var y = prediction.bbox.y / 1000 * 100;
        var w = prediction.bbox.width / 1000 * 100;
        var h = prediction.bbox.height / 1000 * 100;
        var xBox = x - (w / 2);
        var yBox = y - (h / 2);
        var confidence = (prediction.confidence * 100).toFixed(0);

        divBox += "<div data-content=\"" + className + " (" + confidence + "%)\" style=\"top: " + yBox + "%; left: " + xBox + "%; width: " + w + "%; height:" + h + "%;\" class=\"box-color-" + prediction.class + "\">";
        divBox += "</div>";
    });

    return divBox;
}

function renderData(data) {
    var divData = "";
    var kategoriInfo = [];

    // Mengumpulkan informasi tentang setiap kategori
    data.forEach(function (prediction, index) {
        var kategori = prediction.class;
        var existingCategory = kategoriInfo.find(function (info) {
            return info.kategori === kategori;
        });

        if (!existingCategory) {
            kategoriInfo.push({
                kategori: kategori,
                count: 1,
                class: prediction.class,
            });
        } else {
            existingCategory.count++;
        }
    });

    kategoriInfo.sort(function (a, b) {
        return b.count - a.count;
    });

    kategoriInfo.forEach(function (info) {
        var persentase = ((info.count / data.length) * 100).toFixed(2);

        divData += "<div class=\"overview-data\">";
        divData += "<div class=\"overview-name\">";
        divData += "<div class=\"overview-circle circle-color-" + info.class + "\"></div>";
        divData += "<p class=\"text-sm\">" + capitalizeClassName(info.kategori) + "</p>";
        divData += "</div>";
        divData += "<p class=\"text-sm\">" + info.count + "</p>";
        divData += "<p class=\"text-sm\">" + persentase + "%</p>";
        divData += "</div>";
    });

    return divData;
}

function renderBar(data) {
    var divBar = "";
    var kategoriInfo = [];

    data.forEach(function (prediction, index) {
        var kategori = prediction.class;
        var existingCategory = kategoriInfo.find(function (info) {
            return info.kategori === kategori;
        });

        if (!existingCategory) {
            kategoriInfo.push({
                kategori: kategori,
                count: 1,
                class: prediction.class,
            });
        } else {
            existingCategory.count++;
        }
    });

    kategoriInfo.sort(function (a, b) {
        return b.count - a.count;
    });

    kategoriInfo.forEach(function (info) {
        var persentase = ((info.count / data.length) * 100).toFixed(2);
        divBar += "<div class=\"circle-color-" + info.class + "\" style=\"width: " + persentase + "%; \"></div>";
    });

    return divBar;
}
