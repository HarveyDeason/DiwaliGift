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

            // Reset cursor to default firework style
            customCursor.style.display = 'block'; 
            customCursor.style.width = '10px'; 
            customCursor.style.height = '10px';
            customCursor.style.borderRadius = '50%';
            customCursor.style.backgroundImage = 'none';
            customCursor.style.transform = 'translate(-50%, -50%)'; 
            
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
        // Since Rangoli is removed, we just move the firework cursor
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#firework-menu') && !e.target.closest('.diya-base')) {
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
    
    // NOTE: All previous Rangoli modal functions (openRangoliModal, closeRangoliModal, loadDesignFromURL) 
    // and listeners have been completely removed.
});