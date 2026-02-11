import { Player } from './player.js';
import { Museum } from './museum.js';
import { SecretRoom } from './secretRoom.js';
import { Outside } from './outside.js';
import { ParticleSystem } from './particles.js';
import { UI } from './ui.js';

// Main game controller
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.gameStarted = false;
        this.lastTime = 0;

        this.museum = new Museum(this.canvas.width, this.canvas.height);
        this.secretRoom = new SecretRoom(this.canvas.width, this.canvas.height);
        this.outside = new Outside(this.canvas.width, this.canvas.height);
        this.player = new Player(180, this.canvas.height * 0.75 - 52);
        this.particles = new ParticleSystem(this.canvas.width, this.canvas.height, 1800);
        this.ui = new UI();

        // Scene management - start outside
        this.currentScene = "outside";
        this.player.setWorldBounds(50, 1700);
        this.isTransitioning = false;

        this.cameraX = 0;
        this.cameraSmoothing = 0.08;

        this.keys = {
            left: false,
            right: false,
            interact: false,
            sprint: false,
            jump: false
        };

        this.setupInput();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    resize() {
        const width = Math.min(1200, window.innerWidth - 40);
        const height = width * 9 / 16;

        this.canvas.width = width;
        this.canvas.height = height;

        if (this.museum) {
            this.museum.screenWidth = width;
            this.museum.screenHeight = height;
        }
        if (this.secretRoom) {
            this.secretRoom.screenWidth = width;
            this.secretRoom.screenHeight = height;
        }
        if (this.outside) {
            this.outside.screenWidth = width;
            this.outside.screenHeight = height;
        }
        if (this.particles) {
            this.particles.screenWidth = width;
            this.particles.screenHeight = height;
        }
        if (this.player) {
            this.player.setBaseY(height * 0.75 - 52);
        }
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Start game
            if (!this.gameStarted && this.ui.isTitleVisible()) {
                this.gameStarted = true;
                this.ui.hideTitle();
                return;
            }

            // Block input during transitions
            if (this.isTransitioning) return;

            // Valentine modal - allow closing
            if (this.ui.isValentineModalOpen()) {
                if (e.key === 'Escape') {
                    this.ui.closeValentineModal();
                }
                return;
            }

            // Video modal - allow closing
            if (this.ui.isVideoModalOpen()) {
                if (e.key === 'Escape') {
                    this.ui.closeVideoModal();
                }
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    this.keys.left = true;
                    break;
                case 'arrowright':
                case 'd':
                    this.keys.right = true;
                    break;
                case 'e':
                    if (!this.keys.interact) {
                        this.keys.interact = true;
                        this.handleInteract();
                    }
                    break;
                case ' ':
                case 'arrowup':
                case 'w':
                    this.keys.jump = true;
                    e.preventDefault();
                    break;
                case 'shift':
                    this.keys.sprint = true;
                    break;
                case 'escape':
                    this.ui.closePictureModal();
                    this.ui.closeWelcomeModal();
                    this.ui.closeValentineModal();
                    this.ui.closeVideoModal();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    this.keys.left = false;
                    break;
                case 'arrowright':
                case 'd':
                    this.keys.right = false;
                    break;
                case 'e':
                    this.keys.interact = false;
                    break;
                case ' ':
                case 'arrowup':
                case 'w':
                    this.keys.jump = false;
                    break;
                case 'shift':
                    this.keys.sprint = false;
                    break;
            }
        });

        this.canvas.addEventListener('click', () => {
            if (!this.gameStarted && this.ui.isTitleVisible()) {
                this.gameStarted = true;
                this.ui.hideTitle();
            }
        });

        // Title overlay tap to start (for mobile - overlay blocks canvas clicks)
        this.ui.titleOverlay.addEventListener('click', () => {
            if (!this.gameStarted && this.ui.isTitleVisible()) {
                this.gameStarted = true;
                this.ui.hideTitle();
            }
        });

        // Setup mobile touch controls
        this.setupTouchInput();
    }

    setupTouchInput() {
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnJump = document.getElementById('btnJump');
        const btnInteract = document.getElementById('btnInteract');
        const btnSprint = document.getElementById('btnSprint');

        if (!btnLeft) return; // Controls not in DOM

        const preventAndDo = (el, keyName, isToggle = false) => {
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();

                // Start game on any button press
                if (!this.gameStarted && this.ui.isTitleVisible()) {
                    this.gameStarted = true;
                    this.ui.hideTitle();
                    return;
                }

                if (this.isTransitioning) return;

                if (isToggle) {
                    this.keys[keyName] = !this.keys[keyName];
                    el.classList.toggle('pressed', this.keys[keyName]);
                } else {
                    this.keys[keyName] = true;
                    el.classList.add('pressed');
                }
            }, { passive: false });

            if (!isToggle) {
                el.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys[keyName] = false;
                    el.classList.remove('pressed');
                }, { passive: false });

                el.addEventListener('touchcancel', (e) => {
                    this.keys[keyName] = false;
                    el.classList.remove('pressed');
                });
            }
        };

        // D-pad buttons: hold to move
        preventAndDo(btnLeft, 'left');
        preventAndDo(btnRight, 'right');

        // Jump: press to jump
        preventAndDo(btnJump, 'jump');

        // Sprint: toggle on/off
        preventAndDo(btnSprint, 'sprint', true);

        // Interact: special — triggers handleInteract
        btnInteract.addEventListener('touchstart', (e) => {
            e.preventDefault();

            // Start game on any button press
            if (!this.gameStarted && this.ui.isTitleVisible()) {
                this.gameStarted = true;
                this.ui.hideTitle();
                return;
            }

            if (this.isTransitioning) return;

            // Close modals on mobile via interact button
            if (this.ui.isValentineModalOpen()) {
                this.ui.closeValentineModal();
                return;
            }
            if (this.ui.isVideoModalOpen()) {
                this.ui.closeVideoModal();
                return;
            }

            if (!this.keys.interact) {
                this.keys.interact = true;
                btnInteract.classList.add('pressed');
                this.handleInteract();
            }
        }, { passive: false });

        btnInteract.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.interact = false;
            btnInteract.classList.remove('pressed');
        }, { passive: false });

        btnInteract.addEventListener('touchcancel', () => {
            this.keys.interact = false;
            btnInteract.classList.remove('pressed');
        });
    }

    handleInteract() {
        if (this.isTransitioning) return;

        // Picture modal (works in both scenes)
        if (this.ui.isPictureModalOpen()) {
            if (this.ui.typewriterInterval) {
                this.ui.skipTypewriter();
            } else {
                this.ui.closePictureModal();
            }
            return;
        }

        // Welcome modal
        if (this.ui.isWelcomeModalOpen()) {
            this.ui.closeWelcomeModal();
            return;
        }

        if (this.currentScene === "outside") {
            this.handleOutsideInteract();
        } else if (this.currentScene === "museum") {
            this.handleMuseumInteract();
        } else if (this.currentScene === "secretRoom") {
            this.handleSecretRoomInteract();
        }
    }

    handleOutsideInteract() {
        const playerX = this.player.getWorldX();

        // Ticket booth
        if (this.outside.isNearTicketBooth(playerX)) {
            if (!this.outside.hasTicket) {
                this.outside.buyTicket();
                this.ui.showChainFeedback("🎟️ Ticket purchased! The museum doors open...");
            } else {
                this.ui.showChainFeedback("You already have a ticket!");
            }
            return;
        }

        // Museum entrance
        if (this.outside.isNearEntrance(playerX) && this.outside.canEnter()) {
            this.transitionToMuseumFromOutside();
            return;
        }

        // If near entrance but no ticket
        if (this.outside.isNearEntrance(playerX) && !this.outside.hasTicket) {
            this.ui.showChainFeedback("You need a ticket to enter.");
        }
    }

    handleMuseumInteract() {
        const playerX = this.player.getWorldX();

        // Check booth interactions
        if (this.museum.isNearWelcomeBooth(playerX)) {
            this.ui.openWelcomeModal();
            return;
        }

        if (this.museum.isNearValentineBooth(playerX)) {
            this.ui.openValentineModal();
            return;
        }

        // Check secret door
        if (this.museum.isNearSecretDoor(playerX)) {
            if (!this.museum.isDoorBroken()) {
                // Break a chain
                const remaining = this.museum.breakChain();
                if (remaining === 2) {
                    this.ui.showChainFeedback("The chains rattle and weaken...");
                } else if (remaining === 1) {
                    this.ui.showChainFeedback("The chains are almost broken...");
                } else if (remaining === 0) {
                    this.ui.showChainFeedback("The chains shatter! The way is open...");
                }
            } else {
                // Door is open — enter secret room
                this.transitionToSecretRoom();
            }
            return;
        }

        // Check pictures
        const nearbyPicture = this.museum.getNearbyPicture(playerX);
        if (nearbyPicture) {
            this.ui.openPictureModal(nearbyPicture);
        }
    }

    handleSecretRoomInteract() {
        const playerX = this.player.getWorldX();

        // Check exit
        if (this.secretRoom.isNearExit(playerX)) {
            this.transitionToMuseum();
            return;
        }

        // Check secret pictures
        const nearbyPicture = this.secretRoom.getNearbyPicture(playerX);
        if (nearbyPicture) {
            // Autoplay video for secret memories
            if (nearbyPicture.videoPath) {
                this.ui.openVideoModal(nearbyPicture.videoPath);
            } else {
                this.ui.openPictureModal(nearbyPicture);
            }
        }
    }

    async transitionToSecretRoom() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.ui.hideAllPrompts();

        await this.ui.fadeToBlack();

        // Switch scene
        this.currentScene = "secretRoom";
        this.player.x = 200;
        this.player.setWorldBounds(50, 4400);
        this.cameraX = 0;
        this.particles.worldWidth = this.secretRoom.worldWidth;

        await this.ui.fadeFromBlack();
        this.isTransitioning = false;
    }

    async transitionToMuseum() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.ui.hideAllPrompts();

        await this.ui.fadeToBlack();

        // Switch scene
        this.currentScene = "museum";
        this.player.x = this.museum.secretDoor.x - 50;
        this.player.setWorldBounds(50, 5000);
        this.cameraX = this.player.x - this.canvas.width / 3;
        this.particles.worldWidth = this.museum.worldWidth;

        await this.ui.fadeFromBlack();
        this.isTransitioning = false;
    }

    async transitionToMuseumFromOutside() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.ui.hideAllPrompts();

        await this.ui.fadeToBlack();

        this.currentScene = "museum";
        this.player.x = 180;
        this.player.setWorldBounds(50, 5000);
        this.cameraX = 0;
        this.particles.worldWidth = this.museum.worldWidth;

        await this.ui.fadeFromBlack();
        this.isTransitioning = false;
    }

    update(deltaTime) {
        if (!this.gameStarted) return;
        if (this.ui.isOpen()) return;
        if (this.isTransitioning) return;

        this.player.update(this.keys);

        // Camera
        let worldWidth;
        if (this.currentScene === "outside") worldWidth = this.outside.worldWidth;
        else if (this.currentScene === "museum") worldWidth = this.museum.worldWidth;
        else worldWidth = this.secretRoom.worldWidth;

        const targetCameraX = this.player.getWorldX() - this.canvas.width / 3;
        const maxCameraX = worldWidth - this.canvas.width;
        const clampedTarget = Math.max(0, Math.min(maxCameraX, targetCameraX));
        this.cameraX += (clampedTarget - this.cameraX) * this.cameraSmoothing;

        // Update current scene
        if (this.currentScene === "outside") {
            this.outside.update(deltaTime);
            this.updateOutsidePrompts();
        } else if (this.currentScene === "museum") {
            this.museum.update(deltaTime);
            this.particles.update(deltaTime, this.cameraX);
            this.updateMuseumPrompts();
        } else {
            this.secretRoom.update(deltaTime);
            this.particles.update(deltaTime, this.cameraX);
            this.updateSecretRoomPrompts();
        }
    }

    updateOutsidePrompts() {
        const playerX = this.player.getWorldX();
        const nearTicket = this.outside.isNearTicketBooth(playerX);
        const nearEntrance = this.outside.isNearEntrance(playerX);

        this.ui.hideAllPrompts();

        if (nearTicket && !this.outside.hasTicket) {
            this.ui.showTicketPrompt();
        } else if (nearEntrance && this.outside.hasTicket) {
            this.ui.showEntrancePrompt();
        } else if (nearEntrance && !this.outside.hasTicket) {
            this.ui.showDoorPrompt();
        }
    }

    updateMuseumPrompts() {
        const playerX = this.player.getWorldX();
        const nearbyPicture = this.museum.getNearbyPicture(playerX);
        const nearWelcome = this.museum.isNearWelcomeBooth(playerX);
        const nearValentine = this.museum.isNearValentineBooth(playerX);
        const nearDoor = this.museum.isNearSecretDoor(playerX);

        this.ui.hideAllPrompts();

        if (nearWelcome) {
            this.ui.showWelcomePrompt();
        } else if (nearValentine) {
            this.ui.showValentinePrompt();
        } else if (nearDoor) {
            this.ui.showDoorPrompt();
        } else if (nearbyPicture) {
            this.ui.showInteractPrompt();
        }
    }

    updateSecretRoomPrompts() {
        const playerX = this.player.getWorldX();
        const nearExit = this.secretRoom.isNearExit(playerX);
        const nearbyPicture = this.secretRoom.getNearbyPicture(playerX);

        this.ui.hideAllPrompts();

        if (nearExit) {
            this.ui.showExitPrompt();
        } else if (nearbyPicture) {
            this.ui.showInteractPrompt();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentScene === "outside") {
            this.outside.draw(this.ctx, this.cameraX, this.player.getWorldX());
        } else if (this.currentScene === "museum") {
            this.museum.draw(this.ctx, this.cameraX, this.player.getWorldX());
            this.particles.draw(this.ctx, this.cameraX);
        } else {
            this.secretRoom.draw(this.ctx, this.cameraX, this.player.getWorldX());
            this.particles.draw(this.ctx, this.cameraX);
        }

        this.player.draw(this.ctx, this.cameraX);
        this.drawVignette();
    }

    drawVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
