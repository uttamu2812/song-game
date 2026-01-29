// Initialize the game variables
let songs = [];
let currentSong = null;
let score = 0;
let usedSongs = [];
let isRolling = false;
let rolledSongs = []; // Track all rolled songs

// Load songs from JSON
$(document).ready(function() {
    loadSongs();
    setupEventListeners();
});

function loadSongs() {
    $.getJSON('https://raw.githubusercontent.com/uttamu2812/song-game/refs/heads/main/songs.json', function(data) {
        songs = data;
    }).fail(function() {
        console.error('Error loading songs.json');
    });
}

function setupEventListeners() {
    $('#rollBtn').click(rollSong);
    $('#showBtn').click(showSong);
}

function playRollingSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create multiple beeps for rolling effect
    const beepTimes = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    
    beepTimes.forEach((time, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Increasing frequency for each beep
        const frequency = 300 + (index * 100);
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + time);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.08);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + 0.08);
    });
}

function rollSong() {
    if(songs.length === 0 || isRolling) return;
    
    isRolling = true;
    
    // Add rolling animation
    $('#rollBtn').addClass('rolling');
    $('#rollBtn').prop('disabled', true);
    
    // Play rolling sound
    playRollingSound();
    
    // Simulate multiple random selections during roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        let randomIndex = Math.floor(Math.random() * songs.length);
        currentSong = songs[randomIndex];
        
        $('#songNumber').text('Song #' + currentSong.id);
        
        rollCount++;
        if(rollCount >= 25) {
            clearInterval(rollInterval);
            
            // Check if song is duplicate
            const isDuplicate = rolledSongs.some(song => song.id === currentSong.id);
            
            if(isDuplicate) {
                alert('⚠️ Duplicate! Song #' + currentSong.id + ' (' + currentSong.title + ') already rolled!');
            }
            
            // Add to rolled songs history
            const songEntry = {
                id: currentSong.id,
                title: currentSong.title,
                prop: currentSong.prop,
                language: currentSong.language
            };
            rolledSongs.push(songEntry);
            
            // Update history display
            updateRolledHistory();
            
            $('#rollResult').removeClass('hidden');
            $('#showBtn').removeClass('hidden');
            $('#songInfo').addClass('hidden');
            $('#playBtn').addClass('hidden');
            
            $('#rollBtn').removeClass('rolling');
            $('#rollBtn').prop('disabled', false);
            isRolling = false;
        }
    }, 60);
}

function updateRolledHistory() {
    let historyHTML = '<h3>Rolled Songs History:</h3><ul>';
    
    rolledSongs.forEach((song, index) => {
        const isDuplicate = rolledSongs.filter(s => s.id === song.id).length > 1;
        const duplicateClass = isDuplicate ? 'duplicate' : '';
        historyHTML += `<li class="${duplicateClass}"><strong>#${song.id}:</strong> ${song.title} (${song.language}) - <em>${song.prop}</em></li>`;
    });
    
    historyHTML += '</ul>';
    $('#rolledHistory').html(historyHTML);
}

function showSong() {
    if(!currentSong) return;
    
    $('#propHint').text(currentSong.prop);
    $('#languageInfo').text(currentSong.language);
    $('#songTitle').text(currentSong.title);
    
    $('#songInfo').removeClass('hidden');
    $('#playBtn').removeClass('hidden');
    $('#showBtn').addClass('hidden');
    
    // Attach play button click event
    $('#playBtn').off('click').click(playSpotify);
}

function playSpotify() {
    if(!currentSong) return;
    
    window.open(currentSong.spotify, '_blank');
    $('#playBtn').text('✓ Opened in Spotify');
}

function resetGame() {
    $('#rollResult').addClass('hidden');
    $('#songInfo').addClass('hidden');
    $('#showBtn').addClass('hidden');
    $('#playBtn').addClass('hidden').text('▶️ Play on Spotify');
    $('#songNumber').text('');
}