// Handles unique male-female pair selection and display
let namesData = null;
let usedPairs = [];
let allPairs = [];

function loadNamesAndInitPairs() {
    $.getJSON('https://raw.githubusercontent.com/uttamu2812/song-game/refs/heads/main/names.json', function(data) {
        namesData = data;
        generateAllPairs();
        showNextPair();
        $('#nextPairBtn').click(showNextPair);
    });
}

function generateAllPairs() {
    allPairs = [];
    if (!namesData) return;
    namesData.male.forEach(male => {
        namesData.female.forEach(female => {
            allPairs.push({ male, female });
        });
    });
    shuffleArray(allPairs);
    usedPairs = [];
}

function showNextPair() {
    if (usedPairs.length === allPairs.length) {
        // All pairs used, reshuffle and restart
        shuffleArray(allPairs);
        usedPairs = [];
    }
    // Find next unused pair
    let nextPair = null;
    for (let i = 0; i < allPairs.length; i++) {
        const pair = allPairs[i];
        if (!usedPairs.some(p => p.male === pair.male && p.female === pair.female)) {
            nextPair = pair;
            usedPairs.push(pair);
            break;
        }
    }
    if (nextPair) {
        $('#maleName .name-text').text(nextPair.male);
        $('#femaleName .name-text').text(nextPair.female);
    }
}

// Fisher-Yates shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Call this in $(document).ready
$(document).ready(function() {
    loadNamesAndInitPairs();
});
