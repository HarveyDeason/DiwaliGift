document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. DIYA (Memory Vault) LOGIC
    // -----------------------------------------------------------------
    const diyas = document.querySelectorAll('.diya-base');
    const videos = document.querySelectorAll('.hidden-video');

    const extinguishAll = () => {
        diyas.forEach(diya => diya.classList.remove('lit'));
        videos.forEach(video => {
            video.classList.remove('active');
            video.pause();
            video.currentTime = 0;
        });
    };

    diyas.forEach(diya => {
        const videoId = diya.dataset.videoId;
        const video = document.getElementById(videoId);

        const lightDiyaAndShowVideo = () => {
            if (activeTool !== 'torch') return; // Must be in torch mode

            // Stop any currently playing video/light
            extinguishAll();

            // Light the current diya and show the current video
            diya.classList.add('lit');
            video.classList.add('active');
            video.play();
        };

        const extinguishDiyaAndHideVideo = () => {
            // Only hide/extinguish if the video is paused (user didn't click to keep it open)
            if (activeTool === 'torch' && video.paused) {
                diya.classList.remove('lit');
                video.classList.remove('active');
            }
        };

        // Attach mouseenter (hover) and mouseleave listeners for lighting effect
        diya.addEventListener('mouseenter', lightDiyaAndShowVideo);
        diya.addEventListener('mouseleave', extinguishDiyaAndHideVideo);
        
        // Use a click listener to manually PAUSE/STOP the video when playing
        diya.addEventListener('click', (e) => {
            e.stopPropagation();

            if (video.paused) {
                 // If paused, re-play on click
                 lightDiyaAndShowVideo();
            } else {
                 // If playing, stop it
                video.pause();
                video.currentTime = 0;
                extinguishAll(); // Ensure all are off
            }
        });
    });

    videos.forEach(video => {
        video.addEventListener('ended', () => {
            // When video ends, hide it and remove the light
            video.classList.remove('active');
            const matchingDiya = document.querySelector(`.diya-base[data-video-id="${video.id}"]`);
            if (matchingDiya) {
                matchingDiya.classList.remove('lit');
            }
        });
    });

    // -----------------------------------------------------------------
    // 2. FIREWORK MENU, TORCH & LAUNCH LOGIC
    // -----------------------------------------------------------------
    const customCursor = document.getElementById('custom-cursor');
    const menuOptions = document.querySelectorAll('.firework-option');
    const body = document.body; 
    
    const fireworkColors = ['#FFD700', '#FF4500', '#FFA07A', '#1E90FF', '#9370DB', '#00FF7F']; 
    let activeFirework = { type: 'rocket', color: '#FFF' }; 
    let activeTool = 'firework'; 

    // Initial position to ensure cursor is visible immediately
    customCursor.style.left = '50vw';
    customCursor.style.top = '50vh';

    const setFireworkCursor = () => {
        customCursor.classList.remove('torch-cursor');
        customCursor.style.width = '10px'; 
        customCursor.style.height = '10px';
        customCursor.style.borderRadius = '50%';
        customCursor.style.backgroundImage = 'none';
        customCursor.style.transform = 'translate(-50%, -50%)'; 
        
        const cursorColor = activeFirework.color === 'multi' ? '#FFF' : activeFirework.color;
        customCursor.style.backgroundColor = cursorColor;
        customCursor.style.boxShadow = `0 0 5px ${cursorColor}, 0 0 10px ${cursorColor}`;

        body.classList.remove('torch-active'); // Remove torch glow effect
    };

    const setTorchCursor = () => {
        customCursor.classList.add('torch-cursor');
        body.classList.add('torch-active'); // Add torch glow effect
    };


    menuOptions.forEach(option => {
        option.addEventListener('click', () => {
            extinguishAll(); // Extinguish all videos/lights immediately upon changing the selection

            menuOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            activeFirework = { type: option.dataset.type, color: option.dataset.color };
            activeTool = option.dataset.type === 'torch' ? 'torch' : 'firework';

            if (activeTool === 'torch') {
                setTorchCursor();
            } else {
                setFireworkCursor();
            }
        });
    });
    
    // Set initial cursor based on default active option
    const defaultOption = document.querySelector('.firework-option.active');
    if (defaultOption && defaultOption.dataset.type !== 'torch') { 
        setFireworkCursor();
    }


    document.addEventListener('mousemove', (e) => {
        // Update CSS variables for radial gradient glow
        body.style.setProperty('--mouse-x', `${e.clientX}px`);
        body.style.setProperty('--mouse-y', `${e.clientY}px`);

        // Update fixed cursor position using viewport coordinates
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('click', (e) => {
        // Check if the click is in the menu or on a diya
        const isInteractiveElement = e.target.closest('#firework-menu') || e.target.closest('.diya-base');
        
        if (activeTool === 'firework' && !isInteractiveElement) {
            const { type, color } = activeFirework;
            
            if (type === 'rocket') {
                launchRocketFirework(e.clientX, e.clientY, color);
            } else {
                launchShapeFirework(e.clientX, e.clientY, color, type);
            }
        } 
        
        // TORCH FLARE CLICK: If torch is active and clicked in open space
        else if (activeTool === 'torch' && !isInteractiveElement && !e.target.closest('#coded-note-icon')) {
            // Only launch flare if not clicking on the note icon with the torch
            launchTorchFlare(e.clientX, e.clientY);
        }
    });
    
    // -----------------------------------------------------------------
    // 3. SECRET MESSAGE/NOTE LOGIC
    // -----------------------------------------------------------------
    const codedNoteIcon = document.getElementById('coded-note-icon');
    const messageModal = document.getElementById('message-modal');
    const closeMessageBtn = document.getElementById('close-message-btn');

    // --- NEW: TORCH HOVER (DESTRUCTION) LOGIC ---
    codedNoteIcon.addEventListener('mouseenter', (e) => {
        if (activeTool === 'torch' && !codedNoteIcon.classList.contains('burning')) {
            codedNoteIcon.classList.add('burning');
            // Delay the fire particle launch very slightly to match the hover effect
            setTimeout(() => {
                const noteRect = codedNoteIcon.getBoundingClientRect();
                const noteCenterX = noteRect.left + noteRect.width / 2;
                const noteCenterY = noteRect.top + noteRect.height / 2;
                burnLetter(noteCenterX, noteCenterY);
            }, 100); 
        }
    });
    
    // --- Message Modal Open Logic (Must use NON-TORCH tool) ---
    codedNoteIcon.addEventListener('click', (e) => {
        // Prevent accidental burning if the torch is active
        if (activeTool === 'torch') return; 

        // If the note hasn't been burned yet, open the message modal
        messageModal.classList.add('active');
    });

    closeMessageBtn.addEventListener('click', () => {
        messageModal.classList.remove('active');
        // Reset the note icon after closing the message, so it can be revealed again
        codedNoteIcon.classList.remove('burning');
        // Reset the note back to original position
        codedNoteIcon.style.animation = 'none';
        codedNoteIcon.offsetHeight; // Trigger reflow
        codedNoteIcon.style.animation = '';
    });
    
    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target.id === 'message-modal') {
            messageModal.classList.remove('active');
            codedNoteIcon.classList.remove('burning');
            codedNoteIcon.style.animation = 'none';
            codedNoteIcon.offsetHeight;
            codedNoteIcon.style.animation = '';
        }
    });

    // --- Burning Letter Effect Implementation ---
    function burnLetter(startX, startY) {
        for (let i = 0; i < 30; i++) { // Fire particles
            const fireShard = document.createElement('div');
            fireShard.classList.add('fire-shard');
            document.body.appendChild(fireShard);

            fireShard.style.left = `${startX}px`;
            fireShard.style.top = `${startY}px`;

            const randX = (Math.random() - 0.5) * 150; 
            const randY = (Math.random() - 0.5) * 100 - 50; 
            const randDeg = Math.random() * 360;

            fireShard.style.setProperty('--rand-x', `${randX}px`);
            fireShard.style.setProperty('--rand-y', `${randY}px`);
            fireShard.style.setProperty('--rand-deg', `${randDeg}deg`);
            
            fireShard.style.animationDelay = `${Math.random() * 0.5}s`;

            setTimeout(() => fireShard.remove(), 2000); 
        }
        codedNoteIcon.style.animation = 'burn-fade 0.8s forwards'; // Apply fade/burn animation
    }


    // --- Shape Definition Function (Omitted for brevity) ---
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

    // --- Generic Shape Firework Launcher (Omitted for brevity) ---
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
});