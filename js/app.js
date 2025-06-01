// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------------------
    // SELEKSI ELEMEN DOM
    // ----------------------------------------------------------------------------------
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const seekBar = document.getElementById('seekBar');
    const volumeBar = document.getElementById('volumeBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const playerCover = document.getElementById('playerCover');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerBarSongInfo = document.getElementById('playerBarSongInfo'); // Trigger Now Playing Focus

    const songListContainer = document.querySelector('#home .song-list-container');
    const playlistGridContainer = document.querySelector('.playlist-grid-container');
    const playlistDetailContainer = document.querySelector('.playlist-detail-container');
    const songListContainerPlaylist = document.querySelector('.song-list-container-playlist');
    const playlistDetailTitle = document.getElementById('playlistDetailTitle');
    const backToPlaylistsBtn = document.getElementById('backToPlaylists');

    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');

    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const searchInput = document.getElementById('searchInput');

    // Statistik & Pengaturan
    const totalSongsStat = document.getElementById('totalSongsStat');
    const totalPlaylistsStat = document.getElementById('totalPlaylistsStat');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Modal Tambah ke Playlist
    const addToPlaylistModal = document.getElementById('addToPlaylistModal');
    const closeModalBtn = addToPlaylistModal.querySelector('.close-modal-btn');
    const modalExistingPlaylistList = document.getElementById('modalExistingPlaylistList');
    const newPlaylistNameModalInput = document.getElementById('newPlaylistNameModalInput');
    const createNewPlaylistModalBtn = document.getElementById('createNewPlaylistModalBtn');

    // Form Buat Playlist Global
    const showCreatePlaylistFormBtn = document.getElementById('showCreatePlaylistFormBtn');
    const createPlaylistFormContainer = document.getElementById('createPlaylistFormContainer');
    const newPlaylistNameInputGlobal = document.getElementById('newPlaylistNameInputGlobal');
    const createNewPlaylistBtnGlobal = document.getElementById('createNewPlaylistBtnGlobal');
    const cancelCreatePlaylistBtnGlobal = document.getElementById('cancelCreatePlaylistBtnGlobal');

    // Tombol Hamburger & Sidebar
    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContentForSidebarClose = document.querySelector('.main-content');

    // Elemen Halaman Lirik
    const lyricsPageBackBtn = document.getElementById('lyricsPageBackBtn');
    const lyricsSongTitle = document.getElementById('lyricsSongTitle');
    const lyricsSongArtist = document.getElementById('lyricsSongArtist');
    const lyricsTextDisplay = document.getElementById('lyricsTextDisplay');

    // Elemen Halaman Now Playing Focus
    const nowPlayingFocusBackBtn = document.getElementById('nowPlayingFocusBackBtn');
    const nowPlayingFocusCover = document.getElementById('nowPlayingFocusCover');
    const nowPlayingFocusTitle = document.getElementById('nowPlayingFocusTitle');
    const nowPlayingFocusArtist = document.getElementById('nowPlayingFocusArtist');
    const nowPlayingFocusCurrentTime = document.getElementById('nowPlayingFocusCurrentTime');
    const nowPlayingFocusSeekBar = document.getElementById('nowPlayingFocusSeekBar');
    const nowPlayingFocusDuration = document.getElementById('nowPlayingFocusDuration');
    const nowPlayingFocusShuffleBtn = document.getElementById('nowPlayingFocusShuffleBtn');
    const nowPlayingFocusPrevBtn = document.getElementById('nowPlayingFocusPrevBtn');
    const nowPlayingFocusPlayPauseBtn = document.getElementById('nowPlayingFocusPlayPauseBtn');
    const nowPlayingFocusNextBtn = document.getElementById('nowPlayingFocusNextBtn');
    const nowPlayingFocusRepeatBtn = document.getElementById('nowPlayingFocusRepeatBtn');
    const nowPlayingFocusVolumeBar = document.getElementById('nowPlayingFocusVolumeBar');
    // const playerBar = document.querySelector('.player-bar'); // Jika ingin menyembunyikan player-bar

    // ----------------------------------------------------------------------------------
    // STATE APLIKASI
    // ----------------------------------------------------------------------------------
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 0;
    let currentSongList = [];
    const originalSongList = [...songs]; // songs dari songs.js
    let songIdToAddToPlaylist = null;
    let playlists = []; // playlists dari localStorage atau defaultPlaylists dari songs.js
    let previousPageId = 'home';

    // ----------------------------------------------------------------------------------
    // INISIALISASI
    // ----------------------------------------------------------------------------------
    function init() {
        loadPlaylistsFromStorage();
        currentSongList = [...originalSongList];
        loadSongList(currentSongList, songListContainer, null);
        loadPlaylistsUI();

        if (originalSongList.length > 0) {
            loadSong(currentSongIndex);
        } else {
            playerTitle.textContent = "Tidak ada lagu";
            playerArtist.textContent = "";
            playerCover.src = 'images/placeholder-cover.png';
            playerCover.alt = "Tidak ada cover lagu";
            // Nonaktifkan tombol jika tidak ada lagu
            [playPauseBtn, prevBtn, nextBtn, shuffleBtn, repeatBtn, seekBar, volumeBar,
             nowPlayingFocusPlayPauseBtn, nowPlayingFocusPrevBtn, nowPlayingFocusNextBtn,
             nowPlayingFocusShuffleBtn, nowPlayingFocusRepeatBtn, nowPlayingFocusSeekBar, nowPlayingFocusVolumeBar
            ].forEach(btn => { if (btn) btn.disabled = true; });
        }

        updateStats();
        setupEventListeners();
        if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Putar');
        updateNowPlayingFocusControlsState(); // Sinkronkan kontrol Now Playing Focus

        if (localStorage.getItem('darkMode') === 'true' && darkModeToggle) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    }

    // ----------------------------------------------------------------------------------
    // FUNGSI MANAJEMEN PLAYLIST (localStorage, UI, CRUD)
    // ----------------------------------------------------------------------------------
    function loadPlaylistsFromStorage() {
        const storedPlaylists = localStorage.getItem('kuroUserPlaylists');
        if (storedPlaylists) {
            playlists = JSON.parse(storedPlaylists);
        } else {
            playlists = typeof defaultPlaylists !== 'undefined' ? defaultPlaylists.map(p => ({...p})) : [];
            savePlaylistsToStorage();
        }
    }

    function savePlaylistsToStorage() {
        localStorage.setItem('kuroUserPlaylists', JSON.stringify(playlists));
        updateStats();
        loadPlaylistsUI();
    }

    function loadPlaylistsUI() {
        if (!playlistGridContainer) return;
        playlistGridContainer.innerHTML = '';
        playlists.forEach(playlist => {
            const playlistCard = document.createElement('div');
            playlistCard.classList.add('playlist-card');
            playlistCard.setAttribute('role', 'button');
            playlistCard.setAttribute('tabindex', '0');
            playlistCard.dataset.playlistId = playlist.id;
            playlistCard.innerHTML = `
                <i class="fas fa-compact-disc" aria-hidden="true"></i>
                <h4>${playlist.name}</h4>
                <p class="playlist-song-count">${playlist.songIds.length} lagu</p>
            `;
            playlistCard.addEventListener('click', () => showPlaylistDetail(playlist));
            playlistCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') playlistCard.click(); });
            playlistGridContainer.appendChild(playlistCard);
        });
    }

    function showPlaylistDetail(playlist) {
        if (playlistGridContainer) playlistGridContainer.style.display = 'none';
        if (createPlaylistFormContainer) createPlaylistFormContainer.style.display = 'none';
        if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.style.display = 'none';
        if (playlistDetailContainer) playlistDetailContainer.style.display = 'block';
        if (playlistDetailTitle) playlistDetailTitle.textContent = playlist.name;

        const songsInPlaylist = playlist.songIds.map(id => originalSongList.find(song => song.id === id)).filter(Boolean);
        currentSongList = [...songsInPlaylist];
        loadSongList(currentSongList, songListContainerPlaylist, playlist.name);
        currentSongIndex = 0;
        if (currentSongList.length > 0) {
            loadSong(currentSongIndex);
        } else {
            songListContainerPlaylist.innerHTML = "<p>Playlist ini kosong.</p>";
            // Reset info di player bar jika playlist kosong yang dibuka
            if (playerTitle) playerTitle.textContent = "Playlist Kosong";
            if (playerArtist) playerArtist.textContent = "";
            if (playerCover) {
                playerCover.src = 'images/placeholder-cover.png';
                playerCover.alt = "Tidak ada cover lagu";
            }
        }
    }

    if (backToPlaylistsBtn) {
        backToPlaylistsBtn.addEventListener('click', () => {
            if (playlistGridContainer) playlistGridContainer.style.display = 'grid';
            if (playlistDetailContainer) playlistDetailContainer.style.display = 'none';
            if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.style.display = 'inline-block';
            currentSongList = isShuffle ? currentSongList : [...originalSongList]; // Kembali ke konteks lagu Beranda
        });
    }

    function openAddToPlaylistModal(songId) {
        songIdToAddToPlaylist = songId;
        if (!modalExistingPlaylistList || !addToPlaylistModal) return;
        modalExistingPlaylistList.innerHTML = '';
        if (playlists.length === 0) {
            modalExistingPlaylistList.innerHTML = "<p>Belum ada playlist.</p>";
        } else {
            playlists.forEach(playlist => {
                const playlistItem = document.createElement('div');
                playlistItem.classList.add('modal-playlist-item');
                playlistItem.textContent = playlist.name;
                playlistItem.dataset.playlistId = playlist.id;
                playlistItem.setAttribute('role', 'button');
                playlistItem.setAttribute('tabindex', '0');
                playlistItem.addEventListener('click', () => addSongToExistingPlaylist(playlist.id, songIdToAddToPlaylist));
                playlistItem.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') playlistItem.click(); });
                modalExistingPlaylistList.appendChild(playlistItem);
            });
        }
        if (newPlaylistNameModalInput) newPlaylistNameModalInput.value = '';
        addToPlaylistModal.style.display = 'flex';
    }

    function closeAddToPlaylistModal() {
        if (addToPlaylistModal) addToPlaylistModal.style.display = 'none';
        songIdToAddToPlaylist = null;
    }

    function addSongToExistingPlaylist(playlistId, songId) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist && songId) {
            if (!playlist.songIds.includes(songId)) {
                playlist.songIds.push(songId);
                savePlaylistsToStorage();
                alert(`Lagu ditambahkan ke "${playlist.name}"!`);
            } else {
                alert('Lagu sudah ada di playlist ini.');
            }
            closeAddToPlaylistModal();
            if (document.getElementById('playlists').classList.contains('active-page') &&
                playlistDetailContainer.style.display === 'block' &&
                playlistDetailTitle.textContent === playlist.name) {
                showPlaylistDetail(playlist);
            }
        }
    }

    function createNewPlaylist(name, songIdToAdd = null, fromModal = true) {
        const playlistName = name.trim();
        if (!playlistName) { alert('Nama playlist tidak boleh kosong!'); return false; }
        if (playlists.some(p => p.name.toLowerCase() === playlistName.toLowerCase())) { alert('Playlist dengan nama ini sudah ada!'); return false; }

        const newPlaylist = { id: Date.now(), name: playlistName, songIds: songIdToAdd ? [songIdToAdd] : [] };
        playlists.push(newPlaylist);
        savePlaylistsToStorage();
        alert(`Playlist "${playlistName}" dibuat${songIdToAdd ? ' dan lagu ditambahkan' : ''}!`);

        if (fromModal && newPlaylistNameModalInput) newPlaylistNameModalInput.value = '';
        else if (!fromModal && newPlaylistNameInputGlobal) newPlaylistNameInputGlobal.value = '';

        if (fromModal) closeAddToPlaylistModal();
        else {
            if (createPlaylistFormContainer) createPlaylistFormContainer.style.display = 'none';
            if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.style.display = 'inline-block';
        }
        loadPlaylistsUI();
        return true;
    }

    // ----------------------------------------------------------------------------------
    // FUNGSI PEMUTAR MUSIK (MEMUAT, MEMUTAR, KONTROL, UI)
    // ----------------------------------------------------------------------------------
    function loadSongList(songsToLoad, container, playlistName = null) {
        if (!container) return;
        container.innerHTML = '';
        songsToLoad.forEach((song) => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.dataset.songId = song.id;
            const globalIndex = originalSongList.findIndex(s => s.id === song.id);
            songItem.dataset.index = globalIndex;
            songItem.setAttribute('role', 'button');
            songItem.setAttribute('tabindex', '0');
            songItem.innerHTML = `
                <img src="${song.cover || 'images/placeholder-cover.png'}" alt="Cover lagu ${song.title}" class="song-item-cover">
                <div class="song-item-info">
                    <p class="song-item-title">${song.title}</p>
                    <p class="song-item-artist">${song.artist}</p>
                </div>
                <i class="fas fa-play-circle song-item-play-indicator" aria-hidden="true"></i>
            `;
            if (!playlistName) { // Hanya tampilkan tombol "+" jika di Beranda
                const addToPlaylistBtn = document.createElement('button');
                addToPlaylistBtn.classList.add('song-item-add-playlist-btn');
                addToPlaylistBtn.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i>';
                addToPlaylistBtn.title = "Tambahkan ke playlist";
                addToPlaylistBtn.setAttribute('aria-label', `Tambahkan lagu ${song.title} ke playlist`);
                addToPlaylistBtn.addEventListener('click', (e) => { e.stopPropagation(); openAddToPlaylistModal(song.id); });
                songItem.appendChild(addToPlaylistBtn);
            }
            songItem.addEventListener('click', () => {
                if (playlistName) { currentSongList = [...songsToLoad]; }
                else { currentSongList = isShuffle ? currentSongList : [...originalSongList]; }
                const indexInActiveList = currentSongList.findIndex(s => s.id === song.id);
                if (indexInActiveList !== -1) { currentSongIndex = indexInActiveList; loadSong(currentSongIndex); playSong(); }
            });
            songItem.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') songItem.click(); });
            container.appendChild(songItem);
        });
    }

    function loadSong(indexInActiveList) {
        const songToLoad = currentSongList[indexInActiveList];
        if (!songToLoad) {
            console.warn("Gagal memuat lagu, index:", indexInActiveList, "pada currentSongList:", currentSongList);
            if (playerTitle) playerTitle.textContent = "Lagu tidak valid";
            if (playerArtist) playerArtist.textContent = "";
            return;
        }
        currentSongIndex = indexInActiveList;

        if (playerTitle) playerTitle.textContent = songToLoad.title;
        if (playerArtist) playerArtist.textContent = songToLoad.artist;
        if (playerCover) {
            playerCover.src = songToLoad.cover || 'images/placeholder-cover.png';
            playerCover.alt = `Cover lagu ${songToLoad.title}`;
        }
        audioPlayer.src = songToLoad.src;

        const globalIndex = originalSongList.findIndex(s => s.id === songToLoad.id);
        updatePlayingUIState(false, globalIndex);
        updateLyricsPageOnDataChange(songToLoad);
        updateNowPlayingFocusPageOnDataChange(songToLoad);

        audioPlayer.onloadedmetadata = () => {
            const duration = audioPlayer.duration;
            if (durationDisplay) durationDisplay.textContent = formatTime(duration);
            if (seekBar) seekBar.max = duration;
            if (nowPlayingFocusDuration) nowPlayingFocusDuration.textContent = formatTime(duration);
            if (nowPlayingFocusSeekBar) nowPlayingFocusSeekBar.max = duration;
        };
         audioPlayer.oncanplay = () => { // Untuk memastikan tombol tidak disabled jika lagu bisa diputar
            [playPauseBtn, seekBar, volumeBar, nowPlayingFocusPlayPauseBtn, nowPlayingFocusSeekBar, nowPlayingFocusVolumeBar]
            .forEach(btn => { if(btn) btn.disabled = false; });
        };
    }

    function playSong() {
        if (!currentSongList[currentSongIndex]) { console.warn("Tidak ada lagu valid untuk diputar."); return; }
        if (!audioPlayer.src || audioPlayer.src.endsWith('/')) { loadSong(currentSongIndex); } // Muat jika src kosong

        isPlaying = true;
        audioPlayer.play().catch(error => console.error("Error memutar lagu:", error));
        if (playPauseBtn) { playPauseBtn.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>'; playPauseBtn.setAttribute('aria-label', 'Jeda'); }
        if (nowPlayingFocusPlayPauseBtn) { nowPlayingFocusPlayPauseBtn.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>'; nowPlayingFocusPlayPauseBtn.setAttribute('aria-label', 'Jeda'); }
        const globalIndex = originalSongList.findIndex(s => s.id === currentSongList[currentSongIndex]?.id);
        updatePlayingUIState(true, globalIndex);
    }

    function pauseSong() {
        isPlaying = false;
        audioPlayer.pause();
        if (playPauseBtn) { playPauseBtn.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>'; playPauseBtn.setAttribute('aria-label', 'Putar'); }
        if (nowPlayingFocusPlayPauseBtn) { nowPlayingFocusPlayPauseBtn.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>'; nowPlayingFocusPlayPauseBtn.setAttribute('aria-label', 'Putar'); }
        const globalIndex = originalSongList.findIndex(s => s.id === currentSongList[currentSongIndex]?.id);
        updatePlayingUIState(false, globalIndex);
    }

    function updatePlayingUIState(playing, globalSongIndexToMark) {
        if (globalSongIndexToMark === undefined || globalSongIndexToMark < 0) {
            const currentLoadedSong = currentSongList[currentSongIndex];
            if (currentLoadedSong) globalSongIndexToMark = originalSongList.findIndex(s => s.id === currentLoadedSong.id);
            else {
                document.querySelectorAll('.song-item').forEach(item => { item.classList.remove('playing'); const pi = item.querySelector('.song-item-play-indicator'); if (pi) pi.style.display = 'none'; });
                return;
            }
        }
        document.querySelectorAll('.song-item').forEach(item => {
            const itemGlobalIndex = parseInt(item.dataset.index);
            const playIndicator = item.querySelector('.song-item-play-indicator');
            item.classList.toggle('playing', itemGlobalIndex === globalSongIndexToMark && playing);
            if (playIndicator) playIndicator.style.display = (itemGlobalIndex === globalSongIndexToMark && playing) ? 'block' : 'none';
        });
    }

    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) currentSongIndex = currentSongList.length - 1;
        if(currentSongList.length > 0) { loadSong(currentSongIndex); playSong(); }
    }

    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex >= currentSongList.length) {
            if (repeatMode === 1) currentSongIndex = 0;
            else { pauseSong(); currentSongIndex = currentSongList.length - 1; if(currentSongList.length > 0) loadSong(currentSongIndex); return; }
        }
        if(currentSongList.length > 0) { loadSong(currentSongIndex); playSong(); }
    }

    function updateProgressBar() {
        if (audioPlayer.duration && seekBar) {
            const currentTime = audioPlayer.currentTime;
            seekBar.value = currentTime;
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(currentTime);
            if (nowPlayingFocusSeekBar) nowPlayingFocusSeekBar.value = currentTime;
            if (nowPlayingFocusCurrentTime) nowPlayingFocusCurrentTime.textContent = formatTime(currentTime);
        } else if (seekBar) {
            seekBar.value = 0;
            if (currentTimeDisplay) currentTimeDisplay.textContent = "0:00";
            if (durationDisplay) durationDisplay.textContent = "0:00";
            if (nowPlayingFocusSeekBar) nowPlayingFocusSeekBar.value = 0;
            if (nowPlayingFocusCurrentTime) nowPlayingFocusCurrentTime.textContent = "0:00";
            if (nowPlayingFocusDuration) nowPlayingFocusDuration.textContent = "0:00";
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function setSongPosition() { if (audioPlayer.duration && seekBar) audioPlayer.currentTime = seekBar.value; }
    function setNowPlayingFocusSongPosition() { if (audioPlayer.duration && nowPlayingFocusSeekBar) audioPlayer.currentTime = nowPlayingFocusSeekBar.value; }

    function setVolume() {
        audioPlayer.volume = volumeBar.value / 100;
        if (nowPlayingFocusVolumeBar) nowPlayingFocusVolumeBar.value = volumeBar.value;
    }
    function setNowPlayingFocusVolume() {
        audioPlayer.volume = nowPlayingFocusVolumeBar.value / 100;
        if (volumeBar) volumeBar.value = nowPlayingFocusVolumeBar.value;
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        const songBeforeToggle = currentSongList[currentSongIndex];
        if (shuffleBtn) { shuffleBtn.classList.toggle('active', isShuffle); shuffleBtn.setAttribute('aria-pressed', isShuffle.toString()); }
        if (nowPlayingFocusShuffleBtn) { nowPlayingFocusShuffleBtn.classList.toggle('active', isShuffle); nowPlayingFocusShuffleBtn.setAttribute('aria-pressed', isShuffle.toString()); }

        if (isShuffle) {
            currentSongList = [...originalSongList].sort(() => Math.random() - 0.5);
        } else {
            currentSongList = [...originalSongList];
        }
        // Cari lagu yang tadi aktif di daftar baru
        if (songBeforeToggle) {
            const newIdx = currentSongList.findIndex(s => s.id === songBeforeToggle.id);
            currentSongIndex = (newIdx !== -1) ? newIdx : 0;
        } else {
            currentSongIndex = 0;
        }

        if (document.getElementById('home').classList.contains('active-page')) {
            loadSongList(currentSongList, songListContainer, null);
        }
        if (currentSongList.length > 0) {
            loadSong(currentSongIndex); // Muat lagu dengan index baru
            if (isPlaying) playSong(); // Lanjutkan play jika sedang play
            else {
                const globalIndex = originalSongList.findIndex(s => s.id === currentSongList[currentSongIndex]?.id);
                updatePlayingUIState(false, globalIndex);
            }
        }
    }

    function toggleRepeat() {
        repeatMode = (repeatMode + 1) % 3;
        const isActive = repeatMode !== 0;
        let iconClass = 'fa-redo', ariaLabel = 'Ulangi (Nonaktif)';
        if (repeatMode === 1) { iconClass = 'fa-redo-alt'; ariaLabel = 'Ulangi Semua'; }
        else if (repeatMode === 2) { iconClass = 'fa-retweet'; ariaLabel = 'Ulangi Satu Lagu'; }
        [repeatBtn, nowPlayingFocusRepeatBtn].forEach(btn => {
            if (btn) { btn.classList.toggle('active', isActive); btn.innerHTML = `<i class="fas ${iconClass}" aria-hidden="true"></i>`; btn.setAttribute('aria-label', ariaLabel); }
        });
    }

    function handleSongEnd() {
        if (repeatMode === 2) { if(currentSongList.length > 0) {loadSong(currentSongIndex); playSong();} }
        else { nextSong(); }
    }

    // ----------------------------------------------------------------------------------
    // FUNGSI UNTUK HALAMAN LIRIK & NOW PLAYING FOCUS (KONTEN)
    // ----------------------------------------------------------------------------------
    function updateLyricsPageOnDataChange(song) {
        if (!song) {
            if(lyricsSongTitle) lyricsSongTitle.textContent = "Pilih lagu";
            if(lyricsSongArtist) lyricsSongArtist.textContent = "";
            if(lyricsTextDisplay) lyricsTextDisplay.textContent = "Lirik akan muncul di sini.";
            return;
        }
        if (lyricsSongTitle) lyricsSongTitle.textContent = song.title;
        if (lyricsSongArtist) lyricsSongArtist.textContent = song.artist;
        if (lyricsTextDisplay) lyricsTextDisplay.textContent = song.lyrics || "Lirik tidak tersedia untuk lagu ini.";
    }

    function updateNowPlayingFocusPageOnDataChange(song) {
        if (!song) {
            if(nowPlayingFocusCover) {nowPlayingFocusCover.src = 'images/placeholder-cover.png'; nowPlayingFocusCover.alt = 'Tidak ada lagu';}
            if(nowPlayingFocusTitle) nowPlayingFocusTitle.textContent = "Tidak ada lagu";
            if(nowPlayingFocusArtist) nowPlayingFocusArtist.textContent = "";
            return;
        }
        if (nowPlayingFocusCover) { nowPlayingFocusCover.src = song.cover || 'images/placeholder-cover.png'; nowPlayingFocusCover.alt = `Cover lagu ${song.title}`; }
        if (nowPlayingFocusTitle) nowPlayingFocusTitle.textContent = song.title;
        if (nowPlayingFocusArtist) nowPlayingFocusArtist.textContent = song.artist;
    }

    function updateNowPlayingFocusControlsState() {
        if (nowPlayingFocusVolumeBar) nowPlayingFocusVolumeBar.value = audioPlayer.volume * 100;
        if (nowPlayingFocusShuffleBtn) { nowPlayingFocusShuffleBtn.classList.toggle('active', isShuffle); nowPlayingFocusShuffleBtn.setAttribute('aria-pressed', isShuffle.toString()); }
        if (nowPlayingFocusRepeatBtn) {
            const isActive = repeatMode !== 0; let iconClass = 'fa-redo', ariaLabel = 'Ulangi (Nonaktif)';
            if (repeatMode === 1) { iconClass = 'fa-redo-alt'; ariaLabel = 'Ulangi Semua'; } else if (repeatMode === 2) { iconClass = 'fa-retweet'; ariaLabel = 'Ulangi Satu Lagu'; }
            nowPlayingFocusRepeatBtn.classList.toggle('active', isActive); nowPlayingFocusRepeatBtn.innerHTML = `<i class="fas ${iconClass}" aria-hidden="true"></i>`; nowPlayingFocusRepeatBtn.setAttribute('aria-label', ariaLabel);
        }
        if (nowPlayingFocusPlayPauseBtn) {
            nowPlayingFocusPlayPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause" aria-hidden="true"></i>' : '<i class="fas fa-play" aria-hidden="true"></i>';
            nowPlayingFocusPlayPauseBtn.setAttribute('aria-label', isPlaying ? 'Jeda' : 'Putar');
        }
    }

    // ----------------------------------------------------------------------------------
    // FUNGSI UI LAINNYA (NAVIGASI, STATS)
    // ----------------------------------------------------------------------------------
    function switchPage(pageId) {
        const currentPage = document.querySelector('.page.active-page');
        if (currentPage && currentPage.id !== pageId) previousPageId = currentPage.id;

        pages.forEach(page => page.classList.remove('active-page'));
        const activePage = document.getElementById(pageId);
        if (activePage) activePage.classList.add('active-page');

        navLinks.forEach(link => link.classList.toggle('active-link', link.dataset.page === pageId));

        if (pageId !== 'playlists' && playlistDetailContainer) {
            if (playlistGridContainer) playlistGridContainer.style.display = 'grid';
            if (playlistDetailContainer) playlistDetailContainer.style.display = 'none';
            if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.style.display = 'inline-block';
            if (createPlaylistFormContainer) createPlaylistFormContainer.style.display = 'none';
        }
        if (pageId === 'home') {
            currentSongList = isShuffle ? currentSongList : [...originalSongList]; // Pastikan context list benar
            loadSongList(currentSongList, songListContainer, null);
            // Update playing UI state
            const songInPlayer = currentSongList[currentSongIndex];
            if(songInPlayer) {
                const globalIndex = originalSongList.findIndex(s => s.id === songInPlayer.id);
                updatePlayingUIState(isPlaying, globalIndex);
           }
        }
        if (pageId === 'lyricsPage') updateLyricsPageOnDataChange(currentSongList[currentSongIndex]);
        if (pageId === 'nowPlayingFocusPage') { updateNowPlayingFocusPageOnDataChange(currentSongList[currentSongIndex]); updateNowPlayingFocusControlsState(); }
    }

    function updateStats() {
        if(totalSongsStat) totalSongsStat.textContent = originalSongList.length;
        if(totalPlaylistsStat) totalPlaylistsStat.textContent = playlists.length;
    }

    // ----------------------------------------------------------------------------------
    // SETUP EVENT LISTENERS
    // ----------------------------------------------------------------------------------
    function setupEventListeners() {
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => { isPlaying ? pauseSong() : playSong(); });
        if (prevBtn) prevBtn.addEventListener('click', prevSong);
        if (nextBtn) nextBtn.addEventListener('click', nextSong);
        if (seekBar) seekBar.addEventListener('input', setSongPosition);
        if (volumeBar) volumeBar.addEventListener('input', setVolume);
        if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
        if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

        audioPlayer.addEventListener('timeupdate', updateProgressBar);
        audioPlayer.addEventListener('ended', handleSongEnd);
        audioPlayer.addEventListener('error', (e) => {
            console.error("Error Audio Player:", audioPlayer.error);
            if (playerTitle) playerTitle.textContent = "Error Lagu";
            if (playerArtist) playerArtist.textContent = "Tidak bisa dimuat";
            if (isPlaying) pauseSong();
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => { e.preventDefault(); switchPage(link.dataset.page); });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (document.getElementById('home').classList.contains('active-page')) {
                    const filtered = originalSongList.filter(s => s.title.toLowerCase().includes(searchTerm) || s.artist.toLowerCase().includes(searchTerm));
                    currentSongList = [...filtered]; // Update currentSongList untuk Beranda yang terfilter
                    loadSongList(currentSongList, songListContainer, null);
                    // Update UI playing state setelah filter
                     const songInPlayer = currentSongList[currentSongIndex]; // Cek apakah lagu yg main ada di filtered list
                     if(songInPlayer){
                        const globalIndex = originalSongList.findIndex(s => s.id === songInPlayer.id);
                        updatePlayingUIState(isPlaying, globalIndex);
                     } else {
                        // Jika lagu yang sedang diputar tidak ada di hasil filter,
                        // tandai lagu yang sedang diputar (jika ada) di daftar asli (tidak terlihat di UI)
                        // atau bersihkan semua tanda 'playing' jika mau.
                        // Untuk simpel, kita biarkan state UI seperti apa adanya di daftar terfilter
                        // atau bisa cari index global dari currentSongList[currentSongIndex] dari original list:
                        if(currentSongList.length > 0 && currentSongList[currentSongIndex]){ // Jika currentSongIndex masih valid
                             const actuallyPlayingSongId = currentSongList[currentSongIndex].id;
                             const globalIndexOfActuallyPlaying = originalSongList.findIndex(s=>s.id === actuallyPlayingSongId);
                             updatePlayingUIState(isPlaying, globalIndexOfActuallyPlaying); // Ini akan menandai lagu yg benar jika masih di DOM
                        } else {
                             updatePlayingUIState(false, -1); // Bersihkan semua jika tidak ada lagu yang valid
                        }
                     }
                }
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode', document.body.classList.contains('dark-mode')); });
        }

        // Event Listener Modal & Form Playlist
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddToPlaylistModal);
        if (createNewPlaylistModalBtn) createNewPlaylistModalBtn.addEventListener('click', () => createNewPlaylist(newPlaylistNameModalInput.value, songIdToAddToPlaylist, true));
        if (addToPlaylistModal) addToPlaylistModal.addEventListener('click', (event) => { if (event.target === addToPlaylistModal) closeAddToPlaylistModal(); });
        if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.addEventListener('click', () => { if (createPlaylistFormContainer) createPlaylistFormContainer.style.display = 'flex'; showCreatePlaylistFormBtn.style.display = 'none'; });
        if (cancelCreatePlaylistBtnGlobal) cancelCreatePlaylistBtnGlobal.addEventListener('click', () => { if (createPlaylistFormContainer) createPlaylistFormContainer.style.display = 'none'; if (newPlaylistNameInputGlobal) newPlaylistNameInputGlobal.value = ''; if (showCreatePlaylistFormBtn) showCreatePlaylistFormBtn.style.display = 'inline-block'; });
        if (createNewPlaylistBtnGlobal) createNewPlaylistBtnGlobal.addEventListener('click', () => createNewPlaylist(newPlaylistNameInputGlobal.value, null, false));

        // Event Listener Halaman Baru
        if (lyricsPageBackBtn) lyricsPageBackBtn.addEventListener('click', () => switchPage(previousPageId === 'lyricsPage' ? 'home' : previousPageId));
        if (nowPlayingFocusBackBtn) nowPlayingFocusBackBtn.addEventListener('click', () => switchPage(previousPageId === 'nowPlayingFocusPage' ? 'home' : previousPageId)); // Atau selalu ke 'home'
        if (playerBarSongInfo) {
            playerBarSongInfo.addEventListener('click', () => { if (originalSongList.length > 0 && currentSongList[currentSongIndex]) switchPage('nowPlayingFocusPage'); });
            playerBarSongInfo.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && originalSongList.length > 0 && currentSongList[currentSongIndex]) { e.preventDefault(); switchPage('nowPlayingFocusPage'); }});
        }

        // Event Listener Kontrol di Now Playing Focus Page
        if (nowPlayingFocusPlayPauseBtn) nowPlayingFocusPlayPauseBtn.addEventListener('click', () => { isPlaying ? pauseSong() : playSong(); });
        if (nowPlayingFocusPrevBtn) nowPlayingFocusPrevBtn.addEventListener('click', prevSong);
        if (nowPlayingFocusNextBtn) nowPlayingFocusNextBtn.addEventListener('click', nextSong);
        if (nowPlayingFocusShuffleBtn) nowPlayingFocusShuffleBtn.addEventListener('click', toggleShuffle);
        if (nowPlayingFocusRepeatBtn) nowPlayingFocusRepeatBtn.addEventListener('click', toggleRepeat);
        if (nowPlayingFocusSeekBar) nowPlayingFocusSeekBar.addEventListener('input', setNowPlayingFocusSongPosition);
        if (nowPlayingFocusVolumeBar) nowPlayingFocusVolumeBar.addEventListener('input', setNowPlayingFocusVolume);

        // Event Listener Menu Mobile
        if (menuToggleBtn && sidebar) {
            menuToggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                const isExpanded = sidebar.classList.contains('open');
                menuToggleBtn.setAttribute('aria-expanded', isExpanded.toString());
                if (mainContentForSidebarClose) mainContentForSidebarClose.classList.toggle('sidebar-open-overlay', isExpanded);
            });
        }
        if (mainContentForSidebarClose && sidebar) {
            mainContentForSidebarClose.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && menuToggleBtn && !menuToggleBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
                    mainContentForSidebarClose.classList.remove('sidebar-open-overlay');
                }
            });
        }
    }

    // ----------------------------------------------------------------------------------
    // JALANKAN APLIKASI
    // ----------------------------------------------------------------------------------
    init();
});