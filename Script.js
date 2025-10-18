document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. DIYA (Memory Vault) LOGIC
    // -----------------------------------------------------------------
    const diyas = document.querySelectorAll('.diya-base');
    const videos = document.querySelectorAll('.hidden-video');

    const extinguishOthers = (currentDiya) => {
        diyas.forEach(diya => {
            if (diya !== currentDiya && diya.classList.contains('lit')) {
                diya.classList.remove('lit');
                const videoToStop = document.getElementById(diya.dataset.videoId);
                videoToStop.pause();
                videoToStop.currentTime = 0;
            }
        });
    };

    diyas.forEach(diya => {
        diya.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            const videoId = diya.dataset.videoId;
            const video = document.getElementById(videoId);

            if (diya.classList.contains('lit')) {
                diya.classList.remove('lit');
                video.pause();
                video.currentTime = 0;
            } else {
                extinguishOthers(diya);
                diya.classList.add('lit');
                video.play();
                diya.closest('.hidden-diya-wrapper').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    videos.forEach(video => {
        video.addEventListener('ended', () => {
            const diyaId = video.id;
            const matchingDiya = document.querySelector(`.diya-base[data-video-id="${diyaId}"]`);
            if (matchingDiya) {
                matchingDiya.classList.remove('lit');
            }
        });
    });

    // -----------------------------------------------------------------
    // 2. FIREWORK MENU & LAUNCH LOGIC
    // -----------------------------------------------------------------
    const customCursor = document.getElementById('custom-cursor');
    const menuOptions = document.querySelectorAll('.firework-option');
    
    const fireworkColors = ['#FFD700', '#FF4500', '#FFA07A', '#1E90FF', '#9370DB', '#00FF7F']; 
    let activeFirework = { type: 'rocket', color: '#FFF' }; 

    menuOptions.forEach(option => {
        option.addEventListener('click', () => {
            menuOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            activeFirework = { type: option.dataset.type, color: option.dataset.color };

            customCursor.style.display = 'block'; 
            customCursor.style.width = '10px'; 
            customCursor.style.height = '10px';
            customCursor.style.borderRadius = '50%';
            customCursor.style.backgroundImage = 'none';
            customCursor.style.transform = 'translate(-50%, -50%)'; 
            
            const existingSandStream = customCursor.querySelector('.sand-stream');
            if (existingSandStream) {
                existingSandStream.remove();
            }

            const cursorColor = activeFirework.color === 'multi' ? '#FFF' : activeFirework.color;
            customCursor.style.backgroundColor = cursorColor;
            customCursor.style.boxShadow = `0 0 5px ${cursorColor}, 0 0 10px ${cursorColor}`;
        });
    });
    
    const defaultOption = document.querySelector('.firework-option.active');
    if (defaultOption) {
        const defaultColor = defaultOption.dataset.color === 'multi' ? '#FFF' : defaultOption.dataset.color;
        customCursor.style.backgroundColor = defaultColor;
        customCursor.style.boxShadow = `0 0 5px ${defaultColor}, 0 0 10px ${defaultColor}`;
    }

    document.addEventListener('mousemove', (e) => {
        if (!rangoliModal.classList.contains('active-modal') || (rangoliModal.classList.contains('active-modal') && isDrawing)) {
             customCursor.style.left = `${e.clientX}px`;
             customCursor.style.top = `${e.clientY}px`;
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#firework-menu') && !e.target.closest('.diya-base') && !rangoliModal.classList.contains('active-modal')) {
            const { type, color } = activeFirework;
            
            if (type === 'rocket') {
                launchRocketFirework(e.clientX, e.clientY, color);
            } else {
                launchShapeFirework(e.clientX, e.clientY, color, type);
            }
        }
    });

    // --- Shape Definition Function ---
    function getShapeCoordinates(type, count, scale = 150) {
        const coordinates = [];
        const baseParticles = count; 

        if (type === 'heart') {
            for (let i = 0; i < baseParticles; i++) {
                const t = (i / baseParticles) * (2 * Math.PI); 
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
                
                coordinates.push({ x: x * (scale / 25), y: -y * (scale / 25) });
            }
        } else { 
            for (let i = 0; i < baseParticles; i++) {
                const angle = (i / baseParticles) * (2 * Math.PI);
                const randomRadius = scale * 0.5 + Math.random() * scale * 0.5; 
                const x = Math.cos(angle) * randomRadius;
                const y = Math.sin(angle) * randomRadius;
                coordinates.push({ x, y });
            }
        }
        return coordinates;
    }

    // --- Generic Shape Firework Launcher (Heart and Cosmic Swirl) ---
    function launchShapeFirework(startX, startY, colorOption, type) {
        const targetCoordinates = getShapeCoordinates(type, 80, 200); 
        const particleSize = type === 'heart' ? 4 : 6; 

        targetCoordinates.forEach((coord, index) => {
            const particle = document.createElement('div');
            particle.classList.add('firework-particle');
            
            const finalColor = colorOption === 'multi' 
                ? fireworkColors[index % fireworkColors.length]
                : colorOption;
                
            particle.style.backgroundColor = finalColor;
            
            if (type === 'heart') {
                particle.style.boxShadow = `0 0 5px ${finalColor}, 0 0 10px ${finalColor}`;
            }

            particle.style.width = `${particleSize}px`;
            particle.style.height = `${particleSize}px`;

            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            particle.style.setProperty('--x', `${coord.x}px`);
            particle.style.setProperty('--y', `${coord.y}px`);
            
            particle.style.animation = `explode-and-fall 1.8s ease-out forwards ${Math.random() * 0.3}s`;

            document.body.appendChild(particle);

            setTimeout(() => { particle.remove(); }, 2500); 
        });
    }

    // --- Rocket Firework Launcher (Classic Rocket) ---
    function launchRocketFirework(startX, startY, color) {
        const riseHeight = 300; 
        const rocketDuration = 800; 
        
        const rocket = document.createElement('div');
        rocket.classList.add('firework-particle');
        rocket.style.backgroundColor = color;
        rocket.style.left = `${startX}px`;
        rocket.style.top = `${startY}px`;
        rocket.style.setProperty('--y-rise', `-${riseHeight}px`);
        rocket.style.width = '3px';
        rocket.style.height = '3px';
        rocket.style.animation = `rocket-rise ${rocketDuration / 1000}s ease-in forwards`;
        document.body.appendChild(rocket);

        setTimeout(() => {
            rocket.remove();
            
            const targetCoordinates = getShapeCoordinates('circle', 60, 150);
            
            const explosionX = startX;
            const explosionY = startY - riseHeight;
            
            targetCoordinates.forEach((coord, index) => {
                const particle = document.createElement('div');
                particle.classList.add('firework-particle');
                
                particle.style.backgroundColor = '#FFD700'; 
                
                particle.style.left = `${explosionX}px`;
                particle.style.top = `${explosionY}px`;
                
                particle.style.setProperty('--x', `${coord.x}px`);
                particle.style.setProperty('--y', `${coord.y}px`);
                
                particle.style.animation = `explode-and-fall 1.5s ease-out forwards ${Math.random() * 0.3}s`;

                document.body.appendChild(particle);
                setTimeout(() => { particle.remove(); }, 2000);
            });
        }, rocketDuration);
    }

    // -----------------------------------------------------------------
    // 3. RANGOLI BUILDER LOGIC - MAIN FUNCTIONALITY
    // -----------------------------------------------------------------
    
    const rangoliModal = document.getElementById('rangoli-modal');
    const rangoliCanvas = document.getElementById('rangoli-canvas');
    const ctx = rangoliCanvas.getContext('2d');
    const launchRangoliBtn = document.getElementById('launch-rangoli-btn');
    const closeRangoliBtn = document.getElementById('close-rangoli-btn'); 
    const paletteSwatches = rangoliModal.querySelectorAll('.color-swatch');
    const clearDesignBtn = document.getElementById('clear-design-btn');
    const saveDesignBtn = document.getElementById('save-design-btn');
    const shareLinkMessage = document.getElementById('share-link-message');

    let isDrawing = false;
    let activeBrushColor = '#FFD700'; 
    const BRUSH_BASE_SIZE = 4;
    const BRUSH_JITTER_RANGE = 4;
    const BACKGROUND_COLOR = '#111111';

    // --- Modal Control ---
    function openRangoliModal() {
        rangoliModal.classList.add('active-modal'); 
        
        // Transform custom cursor into the CSS pot
        customCursor.style.width = '30px'; 
        customCursor.style.height = '30px';
        customCursor.style.borderRadius = '0';
        customCursor.style.backgroundColor = 'transparent'; 
        customCursor.style.boxShadow = 'none'; 
        customCursor.style.transform = 'translate(-50%, -50%) rotate(10deg)'; 
        
        // Create and append the sand stream element
        let sandStream = customCursor.querySelector('.sand-stream');
        if (!sandStream) {
            sandStream = document.createElement('span');
            sandStream.classList.add('sand-stream');
            customCursor.appendChild(sandStream);
        }
        sandStream.style.setProperty('--active-brush-color', activeBrushColor);
    }

    function closeRangoliModal() {
        rangoliModal.classList.remove('active-modal'); 
        
        // Remove the sand stream element
        const existingSandStream = customCursor.querySelector('.sand-stream');
        if (existingSandStream) {
            existingSandStream.remove();
        }

        // Reset cursor to default firework mode
        customCursor.style.display = 'block';
        customCursor.style.width = '10px'; 
        customCursor.style.height = '10px';
        customCursor.style.borderRadius = '50%';
        customCursor.style.backgroundImage = 'none';
        
        const currentActiveOption = document.querySelector('.firework-option.active');
        if (currentActiveOption) {
            const cursorColor = currentActiveOption.dataset.color === 'multi' ? '#FFF' : currentActiveOption.dataset.color;
            customCursor.style.backgroundColor = cursorColor;
            customCursor.style.boxShadow = `0 0 5px ${cursorColor}, 0 0 10px ${cursorColor}`;
            customCursor.style.transform = 'translate(-50%, -50%)'; 
        }
        shareLinkMessage.classList.add('hidden-modal');
    }
    
    // Attach event listeners to the launch and close buttons
    launchRangoliBtn.addEventListener('click', () => {
        openRangoliModal();
        // Crucial: Only initialize the canvas to a blank state here, not via the load function
        initCanvas(); 
    });
    
    // FIX: Close button functionality
    closeRangoliBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        closeRangoliModal(); 
    });
    
    // Allows clicking outside the modal to close it (this was already working)
    rangoliModal.addEventListener('click', (e) => { 
        if (e.target.id === 'rangoli-modal') {
            closeRangoliModal();
        }
    });

    // --- Drawing Functions ---
    function initCanvas() {
        rangoliCanvas.width = 500;
        rangoliCanvas.height = 500;
        
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, rangoliCanvas.width, rangoliCanvas.height);
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    // ... (Drawing logic drawSand, event listeners omitted for brevity)

    // --- Palette Control ---
    paletteSwatches.forEach(swatch => {
        const color = swatch.dataset.color;
        swatch.style.backgroundColor = color;
        
        swatch.addEventListener('click', () => {
            paletteSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            activeBrushColor = color;
            const sandStream = customCursor.querySelector('.sand-stream');
            if (sandStream) {
                sandStream.style.setProperty('--active-brush-color', activeBrushColor);
            }
        });
        
        if (swatch.classList.contains('active')) {
            activeBrushColor = color;
        }
    });

    // --- Clear Design ---
    clearDesignBtn.addEventListener('click', () => {
        initCanvas();
        shareLinkMessage.classList.add('hidden-modal');
    });
    
    // --- Save/Share Logic (Uses Canvas Data URL) ---
    saveDesignBtn.addEventListener('click', () => {
        const designDataURL = rangoliCanvas.toDataURL('image/png');
        const shareURL = `${window.location.origin}${window.location.pathname}?rangoli_data=${encodeURIComponent(designDataURL)}`;
        shareLinkMessage.textContent = `Link copied! Share with me to show off your art!`;
        shareLinkMessage.classList.remove('hidden-modal');
        navigator.clipboard.writeText(shareURL)
            .then(() => {})
            .catch(() => {
                 shareLinkMessage.textContent = `[Error: Copy manually] ${shareURL}`;
            });
    });

    // --- Load Design from URL (CORRECTED BEHAVIOR) ---
    function loadDesignFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const designData = urlParams.get('rangoli_data');
        
        if (designData) {
            const img = new Image();
            img.onload = function() {
                // Initialize canvas to clear previous state
                initCanvas(); 
                ctx.drawImage(img, 0, 0, rangoliCanvas.width, rangoliCanvas.height);
                
                // ONLY open the modal if a design is loaded from the URL
                openRangoliModal(); 
                rangoliModal.querySelector('h2').textContent = "Look at the beautiful Rangoli you designed!";
                shareLinkMessage.classList.add('hidden-modal');
            };
            img.src = decodeURIComponent(designData);
        } else {
            // Initialize canvas to blank state on first load if no URL data is present
            initCanvas(); 
        }
    }
    
    // Initial call: This handles loading a shared design OR initializing the page blank.
    loadDesignFromURL(); 
});