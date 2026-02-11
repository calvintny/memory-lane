// UI management for modals and prompts
export class UI {
    constructor() {
        // Picture modal elements
        this.pictureModal = document.getElementById('pictureModal');
        this.modalPicture = document.getElementById('modalPicture');
        this.pictureTitle = document.getElementById('pictureTitle');
        this.pictureDescription = document.getElementById('pictureDescription');
        this.playVideoBtn = document.getElementById('playVideoBtn');

        // Video modal elements
        this.videoModal = document.getElementById('videoModal');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.closeVideoBtn = document.getElementById('closeVideoBtn');

        // Welcome modal elements
        this.welcomeModal = document.getElementById('welcomeModal');

        // Valentine / Redemption modal elements
        this.valentineModal = document.getElementById('valentineModal');
        this.scratchCanvas = null;
        this.scratchIsDrawing = false;
        this.scratchRevealy = false;

        // Prompts
        this.interactPrompt = document.getElementById('interactPrompt');
        this.welcomePrompt = document.getElementById('welcomePrompt');
        this.valentinePrompt = document.getElementById('valentinePrompt');
        this.doorPrompt = document.getElementById('doorPrompt');
        this.exitPrompt = document.getElementById('exitPrompt');
        this.ticketPrompt = document.getElementById('ticketPrompt');
        this.entrancePrompt = document.getElementById('entrancePrompt');
        this.titleOverlay = document.getElementById('titleOverlay');

        // Chain feedback
        this.chainFeedback = document.getElementById('chainFeedback');
        this.chainFeedbackText = document.getElementById('chainFeedbackText');
        this.chainFeedbackTimer = null;

        // Fade overlay
        this.fadeOverlay = document.getElementById('fadeOverlay');

        this.isPictureOpen = false;
        this.isWelcomeOpen = false;
        this.isValentineOpen = false;
        this.isVideoOpen = false;
        this.currentPicture = null;
        this.typewriterInterval = null;

        // Image cache for preloading
        this.imageCache = {};

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Video playback
        this.playVideoBtn.addEventListener('click', () => {
            if (this.currentPicture && this.currentPicture.videoPath) {
                this.openVideoModal(this.currentPicture.videoPath);
            }
        });

        this.closeVideoBtn.addEventListener('click', () => {
            this.closeVideoModal();
        });
    }

    showTitle() {
        this.titleOverlay.classList.remove('hidden');
    }

    hideTitle() {
        this.titleOverlay.classList.add('hidden');
    }

    isTitleVisible() {
        return !this.titleOverlay.classList.contains('hidden');
    }

    showInteractPrompt() {
        this.interactPrompt.classList.remove('hidden');
    }

    hideInteractPrompt() {
        this.interactPrompt.classList.add('hidden');
    }

    showWelcomePrompt() {
        this.welcomePrompt.classList.remove('hidden');
    }

    hideWelcomePrompt() {
        this.welcomePrompt.classList.add('hidden');
    }

    showValentinePrompt() {
        this.valentinePrompt.classList.remove('hidden');
    }

    hideValentinePrompt() {
        this.valentinePrompt.classList.add('hidden');
    }

    hideAllPrompts() {
        this.hideInteractPrompt();
        this.hideWelcomePrompt();
        this.hideValentinePrompt();
        this.hideDoorPrompt();
        this.hideExitPrompt();
        this.hideTicketPrompt();
        this.hideEntrancePrompt();
    }

    showDoorPrompt() {
        this.doorPrompt.classList.remove('hidden');
    }

    hideDoorPrompt() {
        this.doorPrompt.classList.add('hidden');
    }

    showExitPrompt() {
        this.exitPrompt.classList.remove('hidden');
    }

    hideExitPrompt() {
        this.exitPrompt.classList.add('hidden');
    }

    showTicketPrompt() {
        this.ticketPrompt.classList.remove('hidden');
    }

    hideTicketPrompt() {
        this.ticketPrompt.classList.add('hidden');
    }

    showEntrancePrompt() {
        this.entrancePrompt.classList.remove('hidden');
    }

    hideEntrancePrompt() {
        this.entrancePrompt.classList.add('hidden');
    }

    showChainFeedback(text) {
        if (this.chainFeedbackTimer) {
            clearTimeout(this.chainFeedbackTimer);
        }
        this.chainFeedbackText.textContent = text;
        this.chainFeedback.classList.remove('hidden');
        this.chainFeedbackTimer = setTimeout(() => {
            this.chainFeedback.classList.add('hidden');
        }, 2000);
    }

    fadeToBlack() {
        return new Promise(resolve => {
            this.fadeOverlay.classList.remove('hidden');
            this.fadeOverlay.classList.add('visible');
            setTimeout(resolve, 800);
        });
    }

    fadeFromBlack() {
        return new Promise(resolve => {
            this.fadeOverlay.classList.remove('visible');
            setTimeout(() => {
                this.fadeOverlay.classList.add('hidden');
                resolve();
            }, 800);
        });
    }

    // Welcome modal
    openWelcomeModal() {
        if (this.isOpen()) return;
        this.isWelcomeOpen = true;
        this.welcomeModal.classList.remove('hidden');
        this.hideAllPrompts();
    }

    closeWelcomeModal() {
        if (!this.isWelcomeOpen) return;
        this.isWelcomeOpen = false;
        this.welcomeModal.classList.add('hidden');
    }

    // Picture modal with auto-sizing for different aspect ratios
    openPictureModal(picture) {
        if (this.isOpen()) return;

        this.isPictureOpen = true;
        this.currentPicture = picture;

        this.pictureTitle.textContent = picture.title;
        this.pictureDescription.textContent = '';

        // Show/hide play video button
        if (picture.videoPath) {
            this.playVideoBtn.classList.remove('hidden');
        } else {
            this.playVideoBtn.classList.add('hidden');
        }

        // Load image or draw abstract art
        if (picture.imagePath) {
            this.loadAndDisplayImage(picture);
        } else {
            this.drawModalArt(picture);
        }

        this.pictureModal.classList.remove('hidden');
        this.hideAllPrompts();

        // Fast typewriter
        this.typewriterEffect(picture.description, 12);
    }

    // Load custom image with auto aspect ratio adjustment
    loadAndDisplayImage(picture) {
        const containerWidth = 280;
        const containerHeight = 210;

        // Check cache first
        if (this.imageCache[picture.imagePath]) {
            this.displayLoadedImage(this.imageCache[picture.imagePath], picture, containerWidth, containerHeight);
            return;
        }

        // Load new image
        const img = new Image();
        img.onload = () => {
            this.imageCache[picture.imagePath] = img;
            this.displayLoadedImage(img, picture, containerWidth, containerHeight);
        };
        img.onerror = () => {
            // Fallback to abstract art if image fails
            this.drawModalArt(picture);
        };
        img.src = picture.imagePath;
    }

    displayLoadedImage(img, picture, containerWidth, containerHeight) {
        const canvas = document.createElement('canvas');
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        const ctx = canvas.getContext('2d');

        // Calculate dimensions to fit image while maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Use "cover" style - fill container, crop excess
        if (imgRatio > containerRatio) {
            // Image is wider - fit height, crop width
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgRatio;
            offsetX = -(drawWidth - containerWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller - fit width, crop height
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgRatio;
            offsetX = 0;
            offsetY = -(drawHeight - containerHeight) / 2;
        }

        // Fill background
        ctx.fillStyle = '#f8f4ef';
        ctx.fillRect(0, 0, containerWidth, containerHeight);

        // Draw image scaled and centered
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Apply to modal
        this.modalPicture.style.backgroundImage = `url(${canvas.toDataURL()})`;
        this.modalPicture.style.backgroundSize = 'cover';
        this.modalPicture.style.backgroundPosition = 'center';
        this.modalPicture.style.borderColor = picture.frameColor;
    }

    drawModalArt(picture) {
        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 210;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f8f4ef';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const seed = picture.id;
        const random = (n) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

        ctx.fillStyle = `rgba(${128 + random(60)}, ${128 + random(60)}, ${128 + random(60)}, 0.3)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = picture.accentColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(70 + random(100), 60 + random(80), 40 + random(35), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${60 + random(60)}, ${60 + random(60)}, ${80 + random(60)}, 0.5)`;
        ctx.fillRect(120 + random(50), 80 + random(40), 70 + random(40), 60 + random(30));

        ctx.strokeStyle = `rgba(${40 + random(40)}, ${40 + random(40)}, ${40 + random(40)}, 0.6)`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(25, canvas.height - 30);
        ctx.lineTo(canvas.width - 25, 40 + random(40));
        ctx.stroke();

        ctx.globalAlpha = 1;

        this.modalPicture.style.backgroundImage = `url(${canvas.toDataURL()})`;
        this.modalPicture.style.backgroundSize = 'cover';
        this.modalPicture.style.borderColor = picture.frameColor;
    }

    typewriterEffect(text, speed = 12) {
        let index = 0;

        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        this.typewriterInterval = setInterval(() => {
            if (index < text.length) {
                this.pictureDescription.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
            }
        }, speed);
    }

    closePictureModal() {
        if (!this.isPictureOpen) return;

        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }

        this.isPictureOpen = false;
        this.currentPicture = null;
        this.pictureModal.classList.add('hidden');
    }

    // Valentine / Redemption modal with scratch card
    openValentineModal() {
        if (this.isOpen()) return;

        this.isValentineOpen = true;
        this.valentineModal.classList.remove('hidden');
        this.hideAllPrompts();

        // Initialize scratch card
        setTimeout(() => this.initScratchCard(), 50);
    }

    closeValentineModal() {
        if (!this.isValentineOpen) return;

        this.isValentineOpen = false;
        this.valentineModal.classList.add('hidden');
        this.cleanupScratchCard();
    }

    initScratchCard() {
        this.scratchCanvas = document.getElementById('scratchCanvas');
        const scratchHint = document.getElementById('scratchHint');
        const scratchRevealed = document.getElementById('scratchRevealed');

        // Reset revealed state
        scratchHint.style.display = '';
        scratchRevealed.classList.add('hidden');

        // Reset prize details
        const prizeDetails = document.getElementById('prizeDetails');
        if (prizeDetails) prizeDetails.classList.add('hidden');

        // Reset accept invitation state
        const acceptInvitation = document.getElementById('acceptInvitation');
        if (acceptInvitation) acceptInvitation.classList.add('hidden');
        const acceptedMessage = document.getElementById('acceptedMessage');
        if (acceptedMessage) acceptedMessage.classList.add('hidden');

        const container = document.getElementById('scratchCardContainer');
        const rect = container.getBoundingClientRect();

        // Set canvas dimensions to match container
        this.scratchCanvas.width = rect.width;
        this.scratchCanvas.height = rect.height;
        this.scratchCanvas.style.display = '';
        this.scratchCanvas.style.transition = '';
        this.scratchCanvas.style.opacity = '';

        const sctx = this.scratchCanvas.getContext('2d');

        // Draw the golden scratch overlay
        const gradient = sctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, '#c9a84c');
        gradient.addColorStop(0.3, '#e8c860');
        gradient.addColorStop(0.5, '#dab548');
        gradient.addColorStop(0.7, '#e8c860');
        gradient.addColorStop(1, '#c9a84c');
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, rect.width, rect.height);

        // Add "SCRATCH HERE" text
        sctx.fillStyle = 'rgba(160, 120, 40, 0.6)';
        sctx.font = "bold 18px 'Quicksand', sans-serif";
        sctx.textAlign = 'center';
        sctx.fillText('SCRATCH HERE', rect.width / 2, rect.height / 2 - 5);

        // Decorative pattern
        sctx.fillStyle = 'rgba(180, 140, 50, 0.3)';
        for (let x = 0; x < rect.width; x += 20) {
            for (let y = 0; y < rect.height; y += 20) {
                if ((x + y) % 40 === 0) {
                    sctx.fillRect(x, y, 10, 10);
                }
            }
        }

        // Sparkle icons
        sctx.fillStyle = 'rgba(255, 230, 150, 0.6)';
        sctx.font = '14px serif';
        sctx.fillText('\u2726', 30, 30);
        sctx.fillText('\u2726', rect.width - 30, 30);
        sctx.fillText('\u2726', 30, rect.height - 20);
        sctx.fillText('\u2726', rect.width - 30, rect.height - 20);

        // State
        this.scratchIsDrawing = false;
        this.scratchRevealy = false;

        // Bind events
        this._scratchMouseDown = (e) => { this.scratchIsDrawing = true; this._doScratch(e); };
        this._scratchMouseMove = (e) => this._doScratch(e);
        this._scratchMouseUp = () => { this.scratchIsDrawing = false; };
        this._scratchTouchStart = (e) => { e.preventDefault(); this.scratchIsDrawing = true; this._doScratch(e.touches[0]); };
        this._scratchTouchMove = (e) => { e.preventDefault(); this._doScratch(e.touches[0]); };
        this._scratchTouchEnd = () => { this.scratchIsDrawing = false; };

        this.scratchCanvas.addEventListener('mousedown', this._scratchMouseDown);
        this.scratchCanvas.addEventListener('mousemove', this._scratchMouseMove);
        this.scratchCanvas.addEventListener('mouseup', this._scratchMouseUp);
        this.scratchCanvas.addEventListener('mouseleave', this._scratchMouseUp);
        this.scratchCanvas.addEventListener('touchstart', this._scratchTouchStart);
        this.scratchCanvas.addEventListener('touchmove', this._scratchTouchMove);
        this.scratchCanvas.addEventListener('touchend', this._scratchTouchEnd);
    }

    _doScratch(e) {
        if (!this.scratchIsDrawing || this.scratchRevealy || !this.scratchCanvas) return;

        const rect = this.scratchCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.scratchCanvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.scratchCanvas.height / rect.height);

        const sctx = this.scratchCanvas.getContext('2d');
        sctx.globalCompositeOperation = 'destination-out';
        sctx.beginPath();
        sctx.arc(x, y, 22, 0, Math.PI * 2);
        sctx.fill();
        sctx.beginPath();
        sctx.arc(x + 5, y - 3, 16, 0, Math.PI * 2);
        sctx.fill();
        sctx.beginPath();
        sctx.arc(x - 5, y + 3, 16, 0, Math.PI * 2);
        sctx.fill();
        sctx.globalCompositeOperation = 'source-over';

        // Check percentage
        this._checkScratchPercent();
    }

    _checkScratchPercent() {
        const sctx = this.scratchCanvas.getContext('2d');
        const imageData = sctx.getImageData(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        const total = pixels.length / 4;

        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) transparent++;
        }

        const sampled = total / 4;
        const percentage = (transparent / sampled) * 100;

        if (percentage > 50 && !this.scratchRevealy) {
            this.scratchRevealy = true;
            this._revealPrize();
        }
    }

    _revealPrize() {
        // Fade out remaining overlay
        this.scratchCanvas.style.transition = 'opacity 0.8s ease';
        this.scratchCanvas.style.opacity = '0';
        setTimeout(() => {
            if (this.scratchCanvas) this.scratchCanvas.style.display = 'none';
        }, 800);

        const scratchHint = document.getElementById('scratchHint');
        const scratchRevealed = document.getElementById('scratchRevealed');
        if (scratchHint) scratchHint.style.display = 'none';
        if (scratchRevealed) scratchRevealed.classList.remove('hidden');

        // Show accept invitation prompt after a short delay
        const acceptInvitation = document.getElementById('acceptInvitation');
        setTimeout(() => {
            if (acceptInvitation) acceptInvitation.classList.remove('hidden');
        }, 1200);

        // Wire up both Yes buttons
        const acceptYes1 = document.getElementById('acceptYes1');
        const acceptYes2 = document.getElementById('acceptYes2');
        const acceptHandler = () => this._onAcceptInvitation();
        if (acceptYes1) acceptYes1.onclick = acceptHandler;
        if (acceptYes2) acceptYes2.onclick = acceptHandler;
    }

    _onAcceptInvitation() {
        const acceptInvitation = document.getElementById('acceptInvitation');
        const acceptedMessage = document.getElementById('acceptedMessage');
        const prizeDetails = document.getElementById('prizeDetails');

        // Hide the accept prompt
        if (acceptInvitation) acceptInvitation.classList.add('hidden');

        // Show accepted message
        if (acceptedMessage) acceptedMessage.classList.remove('hidden');

        // Show details after a moment
        setTimeout(() => {
            if (prizeDetails) prizeDetails.classList.remove('hidden');
        }, 800);
    }

    cleanupScratchCard() {
        if (this.scratchCanvas) {
            this.scratchCanvas.removeEventListener('mousedown', this._scratchMouseDown);
            this.scratchCanvas.removeEventListener('mousemove', this._scratchMouseMove);
            this.scratchCanvas.removeEventListener('mouseup', this._scratchMouseUp);
            this.scratchCanvas.removeEventListener('mouseleave', this._scratchMouseUp);
            this.scratchCanvas.removeEventListener('touchstart', this._scratchTouchStart);
            this.scratchCanvas.removeEventListener('touchmove', this._scratchTouchMove);
            this.scratchCanvas.removeEventListener('touchend', this._scratchTouchEnd);
        }
    }

    // Video modal
    openVideoModal(videoPath) {
        if (!videoPath) return;

        this.isVideoOpen = true;
        this.videoPlayer.src = videoPath;
        this.videoModal.classList.remove('hidden');

        // Auto-play the video
        this.videoPlayer.play().catch(err => {
            console.log('Video autoplay prevented:', err);
        });
    }

    closeVideoModal() {
        if (!this.isVideoOpen) return;

        this.isVideoOpen = false;
        this.videoPlayer.pause();
        this.videoPlayer.src = '';
        this.videoModal.classList.add('hidden');
    }

    isVideoModalOpen() {
        return this.isVideoOpen;
    }

    isOpen() {
        return this.isPictureOpen || this.isWelcomeOpen || this.isValentineOpen || this.isVideoOpen;
    }

    isPictureModalOpen() {
        return this.isPictureOpen;
    }

    isWelcomeModalOpen() {
        return this.isWelcomeOpen;
    }

    isValentineModalOpen() {
        return this.isValentineOpen;
    }

    skipTypewriter() {
        if (this.typewriterInterval && this.currentPicture) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
            this.pictureDescription.textContent = this.currentPicture.description;
        }
    }

    // Preload images for smoother experience
    preloadImages(pictures) {
        pictures.forEach(pic => {
            if (pic.imagePath && !this.imageCache[pic.imagePath]) {
                const img = new Image();
                img.onload = () => {
                    this.imageCache[pic.imagePath] = img;
                };
                img.src = pic.imagePath;
            }
        });
    }
}
