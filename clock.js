$(document).ready(function () {
    // 檢查瀏覽器是否支持 Fullscreen API
    function openFullscreen() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari 和 Opera
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
      }
}

// 觸發全螢幕
openFullscreen();

    function getModeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode') || "1"; // 預設為 1（時鐘）
    }

    function updateMode(mode) {
        const newUrl = window.location.pathname + "?mode=" + mode;
        window.history.pushState({ mode: mode }, "", newUrl); // 更新網址
        applyMode(mode);
    }

    function applyMode(mode) {
        if (mode === "1") {
            $("#clock-form").hide();
        } else {
            $("#clock-form").show();
        }
    }

    $("#mode-change").on("click", function () {
        let currentMode = getModeFromURL();
        let newMode = (parseInt(currentMode) % 3) + 1; // 循環切換 1→2→3→1
        updateMode(newMode);
    });

    applyMode(getModeFromURL());
});

let is24HourFormat = localStorage.getItem('is24HourFormat') !== 'false';
let countdown;
let timerRunning = false;

function startTimer() {
    if (timerRunning) return; // 避免重複啟動

    let minutes = parseInt($("#timer-minutes").val()) || 0;
    let seconds = parseInt($("#timer-seconds").val()) || 0;
    let totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) return;

    timerRunning = true;
    $("#timer-start").text("暫停");

    countdown = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(countdown);
            $("#clock-number div").css("background-color", "red"); // 讓數字閃爍提醒
            setTimeout(() => $("#clock-number div").css("background-color", ""), 500);
            timerRunning = false;
            $("#timer-start").text("開始");
            return;
        }

        totalSeconds--;
        let displayMinutes = Math.floor(totalSeconds / 60);
        let displaySeconds = totalSeconds % 60;
        $("#timer-minutes").val(displayMinutes);
        $("#timer-seconds").val(displaySeconds);

        updateSegmentDisplay(Math.floor(displayMinutes / 10), "1");
        updateSegmentDisplay(displayMinutes % 10, "2");
        updateSegmentDisplay(Math.floor(displaySeconds / 10), "3");
        updateSegmentDisplay(displaySeconds % 10, "4");

    }, 1000);
}

function resetTimer() {
    clearInterval(countdown);
    timerRunning = false;
    $("#timer-start").text("開始");
    $("#timer-minutes").val("5"); // 預設 5 分鐘
    $("#timer-seconds").val("00");
    updateSegmentDisplay(0, "1");
    updateSegmentDisplay(5, "2");
    updateSegmentDisplay(0, "3");
    updateSegmentDisplay(0, "4");
}

$("#timer-start").on("click", function () {
    if (timerRunning) {
        clearInterval(countdown);
        timerRunning = false;
        $("#timer-start").text("開始");
    } else {
        startTimer();
    }
});

$("#timer-reset").on("click", resetTimer);

const digitSegments = {
    0: ['A', 'B', 'C', 'D', 'E', 'F'],
    1: ['B', 'C'],
    2: ['A', 'B', 'D', 'E', 'G'],
    3: ['A', 'B', 'C', 'D', 'G'],
    4: ['B', 'C', 'F', 'G'],
    5: ['A', 'C', 'D', 'F', 'G'],
    6: ['A', 'C', 'D', 'E', 'F', 'G'],
    7: ['A', 'B', 'C'],
    8: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    9: ['A', 'B', 'C', 'D', 'F', 'G']
};

function updateSegmentDisplay(digit, itemValue) {
    const segments = digitSegments[digit];
    const $display = $('[data-item="' + itemValue + '"]');
    if ($display.length === 0) return;
    $display.find('[data-number]').each(function () {
        const segment = $(this).data('number');
        $(this).css('backgroundColor', segments.includes(segment) ? '#ece473' : '#5a5a5a42');
    });
}

function updateColon() {
    const $colonDivs = $('#clock-colon div');
    let isLit = false;
    setInterval(function () {
        $colonDivs.each(function () {
            $(this).css('backgroundColor', isLit ? '#ece473' : '#5a5a5a42');
        });
        isLit = !isLit;
    }, 500);
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();

    const $amEl = $('#AM');
    const $pmEl = $('#PM');

    if (!is24HourFormat) {
        // 12 小時制轉換
        hours = hours % 12 || 12;

        // 設置 AM 或 PM 顯示顏色
        if (hours < 12) {
            $amEl.css('color', '#ece473');
            $pmEl.css('color', '#5a5a5a42');
        } else {
            $amEl.css('color', '#5a5a5a42');
            $pmEl.css('color', '#ece473');
        }
    } else {
        // 如果是 24 小時制，AM/PM 的顏色都設為灰色
        $amEl.css('color', '#5a5a5a42');
        $pmEl.css('color', '#5a5a5a42');
    }

    // 更新時鐘顯示
    updateSegmentDisplay(Math.floor(hours / 10), "1");
    updateSegmentDisplay(hours % 10, "2");
    updateSegmentDisplay(Math.floor(minutes / 10), "3");
    updateSegmentDisplay(minutes % 10, "4");

    updateDay();
}

function updateDay() {
    const days = ["SUN", "MON", "TUE", "WEN", "THU", "FRI", "SAT"];
    const today = new Date().getDay(); // 0: SUN, 1: MON, ..., 6: SAT

    days.forEach((day, index) => {
        const $dayEl = $('#d-' + day);
        if ($dayEl.length > 0) {
            $dayEl.css('color', index === today ? '#ece473' : '#5a5a5a42');
        }
    });
}

function toggleTimeUnit() {
    is24HourFormat = !is24HourFormat;
    localStorage.setItem('is24HourFormat', is24HourFormat);
    $('#time-unit-btn span').text(is24HourFormat ? '24hr' : '12hr');
    updateClock();
}

$('#time-unit-btn span').text(is24HourFormat ? '24hr' : '12hr');
$('#time-unit-btn').on('click', toggleTimeUnit);
setInterval(updateClock, 1000);
updateClock();
updateColon();
