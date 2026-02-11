import { secretPictures, frameConfig } from './pictures.js';

// Dark underground secret room
export class SecretRoom {
    constructor(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.worldWidth = 4500;

        // Dark color palette
        this.colors = {
            ceiling: "#0a0a0f",
            wall: "#1a1518",
            wallAccent: "#15121a",
            floor: "#2a2020",
            floorAccent: "#201818",
            baseboard: "#1a1212"
        };

        // Torches
        this.torches = this.generateTorches();

        // Exit staircase position (left side)
        this.exitStairs = { x: 100 };

        // Image cache
        this.imageCache = {};
        this.loadPictureImages();
    }

    loadPictureImages() {
        secretPictures.forEach(pic => {
            if (pic.imagePath && !this.imageCache[pic.imagePath]) {
                const img = new Image();
                img.onload = () => {
                    this.imageCache[pic.imagePath] = img;
                };
                img.src = pic.imagePath;
            }
        });
    }

    generateTorches() {
        const torches = [];
        for (let x = 250; x < this.worldWidth; x += 350) {
            torches.push({
                x: x,
                flicker: Math.random(),
                flickerSpeed: 0.003 + Math.random() * 0.002
            });
        }
        return torches;
    }

    update(deltaTime) {
        this.torches.forEach(torch => {
            torch.flicker = 0.7 + Math.sin(Date.now() * torch.flickerSpeed + torch.x) * 0.3;
        });
    }

    draw(ctx, cameraX, playerX) {
        // Dark background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
        bgGradient.addColorStop(0, this.colors.ceiling);
        bgGradient.addColorStop(0.15, this.colors.ceiling);
        bgGradient.addColorStop(0.18, this.colors.wall);
        bgGradient.addColorStop(0.75, this.colors.wallAccent);
        bgGradient.addColorStop(0.78, this.colors.floor);
        bgGradient.addColorStop(1, this.colors.floorAccent);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // Stone ceiling line
        ctx.fillStyle = "rgba(80, 60, 50, 0.3)";
        ctx.fillRect(0, this.screenHeight * 0.15, this.screenWidth, 6);

        // Baseboard
        ctx.fillStyle = this.colors.baseboard;
        ctx.fillRect(0, this.screenHeight * 0.75 - 12, this.screenWidth, 12);

        // Dark floor tiles
        this.drawFloorTiles(ctx, cameraX);

        // Cracks in walls
        this.drawWallCracks(ctx, cameraX);

        // Torches with glow
        this.drawTorches(ctx, cameraX);

        // Exit staircase
        this.drawExitStairs(ctx, cameraX, playerX);

        // Secret picture frames
        this.drawPictureFrames(ctx, cameraX, playerX);

        // Dark vignette overlay (extra heavy for underground feel)
        this.drawDarkOverlay(ctx, cameraX);
    }

    drawFloorTiles(ctx, cameraX) {
        const tileWidth = 60;
        const floorY = this.screenHeight * 0.78;
        const floorHeight = this.screenHeight * 0.22;

        for (let x = -cameraX % tileWidth - tileWidth; x < this.screenWidth + tileWidth; x += tileWidth) {
            const tileIndex = Math.floor((x + cameraX) / tileWidth);
            ctx.fillStyle = tileIndex % 2 === 0 ? "rgba(0, 0, 0, 0.15)" : "rgba(40, 30, 25, 0.1)";
            ctx.fillRect(x, floorY, tileWidth - 2, floorHeight);
        }
    }

    drawWallCracks(ctx, cameraX) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        const crackPositions = [300, 700, 1100, 1500, 1800];
        crackPositions.forEach(x => {
            const screenX = x - cameraX;
            if (screenX < -50 || screenX > this.screenWidth + 50) return;

            const wallY = this.screenHeight * 0.18;
            ctx.beginPath();
            ctx.moveTo(screenX, wallY + 20);
            ctx.lineTo(screenX + 8, wallY + 45);
            ctx.lineTo(screenX + 3, wallY + 70);
            ctx.lineTo(screenX + 10, wallY + 100);
            ctx.stroke();
        });
    }

    drawTorches(ctx, cameraX) {
        this.torches.forEach(torch => {
            const screenX = torch.x - cameraX;
            if (screenX < -80 || screenX > this.screenWidth + 80) return;

            const wallY = this.screenHeight * 0.30;

            // Torch bracket
            ctx.fillStyle = "#3a2a1a";
            ctx.fillRect(screenX - 3, wallY - 5, 6, 20);

            // Torch head
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(screenX - 5, wallY - 10, 10, 8);

            // Flame
            const flameHeight = 12 * torch.flicker;
            const gradient = ctx.createRadialGradient(
                screenX, wallY - 15, 0,
                screenX, wallY - 15, flameHeight
            );
            gradient.addColorStop(0, `rgba(255, 200, 50, ${0.9 * torch.flicker})`);
            gradient.addColorStop(0.4, `rgba(255, 120, 20, ${0.7 * torch.flicker})`);
            gradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(screenX, wallY - 15, 6 * torch.flicker, flameHeight, 0, 0, Math.PI * 2);
            ctx.fill();

            // Large wall glow behind torch
            const wallGlow = ctx.createRadialGradient(
                screenX, wallY, 0,
                screenX, wallY, 120 * torch.flicker
            );
            wallGlow.addColorStop(0, `rgba(255, 150, 50, ${0.08 * torch.flicker})`);
            wallGlow.addColorStop(0.5, `rgba(200, 80, 20, ${0.04 * torch.flicker})`);
            wallGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = wallGlow;
            ctx.beginPath();
            ctx.arc(screenX, wallY, 120 * torch.flicker, 0, Math.PI * 2);
            ctx.fill();

            // Floor light pool
            const floorGlow = ctx.createRadialGradient(
                screenX, this.screenHeight * 0.85, 0,
                screenX, this.screenHeight * 0.85, 60
            );
            floorGlow.addColorStop(0, `rgba(255, 150, 50, ${0.06 * torch.flicker})`);
            floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = floorGlow;
            ctx.beginPath();
            ctx.ellipse(screenX, this.screenHeight * 0.85, 60, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawExitStairs(ctx, cameraX, playerX) {
        const screenX = this.exitStairs.x - cameraX;
        if (screenX < -150 || screenX > this.screenWidth + 150) return;

        const wallY = this.screenHeight * 0.15;
        const floorY = this.screenHeight * 0.75;
        const doorWidth = 80;
        const doorLeft = screenX - doorWidth / 2;
        const doorTop = wallY + 10;
        const isNearby = Math.abs(playerX - this.exitStairs.x) < 80;

        // Bright opening (leading up)
        const exitGlow = ctx.createRadialGradient(
            screenX, floorY - 60, 0,
            screenX, floorY - 60, doorWidth
        );
        exitGlow.addColorStop(0, 'rgba(245, 230, 211, 0.15)');
        exitGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = exitGlow;
        ctx.fillRect(doorLeft, doorTop, doorWidth, floorY - doorTop - 12);

        // Archway
        ctx.fillStyle = '#1a180f';
        ctx.beginPath();
        ctx.moveTo(doorLeft, floorY - 12);
        ctx.lineTo(doorLeft, doorTop + 25);
        ctx.quadraticCurveTo(doorLeft, doorTop, screenX, doorTop - 8);
        ctx.quadraticCurveTo(doorLeft + doorWidth, doorTop, doorLeft + doorWidth, doorTop + 25);
        ctx.lineTo(doorLeft + doorWidth, floorY - 12);
        ctx.closePath();
        ctx.fill();

        // Lighter interior (stairs going up)
        ctx.fillStyle = 'rgba(245, 230, 211, 0.05)';
        ctx.fillRect(doorLeft + 5, doorTop + 10, doorWidth - 10, floorY - doorTop - 22);

        // Steps going up
        for (let i = 0; i < 6; i++) {
            const stepY = floorY - 18 - i * 16;
            const alpha = 0.08 + i * 0.015;
            ctx.fillStyle = `rgba(200, 180, 150, ${alpha})`;
            ctx.fillRect(doorLeft + 8, stepY, doorWidth - 16, 3);
        }

        // Stone frame
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(doorLeft - 2, floorY - 12);
        ctx.lineTo(doorLeft - 2, doorTop + 25);
        ctx.quadraticCurveTo(doorLeft - 2, doorTop - 5, screenX, doorTop - 12);
        ctx.quadraticCurveTo(doorLeft + doorWidth + 2, doorTop - 5, doorLeft + doorWidth + 2, doorTop + 25);
        ctx.lineTo(doorLeft + doorWidth + 2, floorY - 12);
        ctx.stroke();

        // "EXIT" text above
        ctx.fillStyle = isNearby ? 'rgba(245, 230, 211, 0.6)' : 'rgba(245, 230, 211, 0.25)';
        ctx.font = "bold 9px 'Quicksand', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('↑ EXIT', screenX, doorTop - 15);

        // Glow when nearby
        if (isNearby) {
            ctx.strokeStyle = 'rgba(245, 230, 211, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(doorLeft - 6, floorY - 12);
            ctx.lineTo(doorLeft - 6, doorTop + 25);
            ctx.quadraticCurveTo(doorLeft - 6, doorTop - 8, screenX, doorTop - 16);
            ctx.quadraticCurveTo(doorLeft + doorWidth + 6, doorTop - 8, doorLeft + doorWidth + 6, doorTop + 25);
            ctx.lineTo(doorLeft + doorWidth + 6, floorY - 12);
            ctx.stroke();
        }
    }

    drawPictureFrames(ctx, cameraX, playerX) {
        secretPictures.forEach(pic => {
            const screenX = pic.x - cameraX;
            if (screenX < -200 || screenX > this.screenWidth + 200) return;

            const frameY = this.screenHeight * 0.22;
            const { width, height, borderWidth } = frameConfig;

            const distance = Math.abs(playerX - pic.x);
            const isNearby = distance < frameConfig.interactionRadius;

            // Frame shadow (darker in secret room)
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(screenX - width / 2 + 4, frameY + 4, width + borderWidth * 2, height + borderWidth * 2);

            // Outer frame
            ctx.fillStyle = pic.frameColor;
            ctx.fillRect(screenX - width / 2 - borderWidth, frameY - borderWidth, width + borderWidth * 2, height + borderWidth * 2);

            // Inner frame accent
            ctx.fillStyle = pic.accentColor;
            ctx.fillRect(screenX - width / 2 - borderWidth / 2, frameY - borderWidth / 2, width + borderWidth, height + borderWidth);

            // Picture area
            ctx.fillStyle = "#1a1818";
            ctx.fillRect(screenX - width / 2, frameY, width, height);

            // Draw image if available
            if (pic.imagePath && this.imageCache[pic.imagePath]) {
                this.drawImageCover(ctx, this.imageCache[pic.imagePath], screenX - width / 2, frameY, width, height);
            } else {
                // Question mark placeholder
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.font = "bold 40px 'Crimson Text', serif";
                ctx.textAlign = 'center';
                ctx.fillText('?', screenX, frameY + height / 2 + 14);
            }

            // Glow when nearby (eerie orange)
            if (isNearby) {
                ctx.strokeStyle = "rgba(255, 150, 50, 0.5)";
                ctx.lineWidth = 3;
                ctx.strokeRect(screenX - width / 2 - borderWidth - 4, frameY - borderWidth - 4, width + borderWidth * 2 + 8, height + borderWidth * 2 + 8);

                // Flicker sparkles
                const sparkleTime = Date.now() * 0.004;
                ctx.fillStyle = "rgba(255, 200, 100, 0.7)";
                for (let i = 0; i < 3; i++) {
                    const angle = sparkleTime + i * Math.PI * 2 / 3;
                    const sparkleX = screenX + Math.cos(angle) * (width / 2 + 20);
                    const sparkleY = frameY + height / 2 + Math.sin(angle) * (height / 2 + 15);
                    ctx.beginPath();
                    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    drawImageCover(ctx, img, x, y, containerWidth, containerHeight) {
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > containerRatio) {
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgRatio;
            offsetX = x - (drawWidth - containerWidth) / 2;
            offsetY = y;
        } else {
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgRatio;
            offsetX = x;
            offsetY = y - (drawHeight - containerHeight) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, containerWidth, containerHeight);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    }

    drawDarkOverlay(ctx, cameraX) {
        // Heavy vignette for underground feel
        const gradient = ctx.createRadialGradient(
            this.screenWidth / 2, this.screenHeight / 2, this.screenHeight * 0.2,
            this.screenWidth / 2, this.screenHeight / 2, this.screenHeight * 0.8
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    }

    getNearbyPicture(playerX) {
        for (const pic of secretPictures) {
            const distance = Math.abs(playerX - pic.x);
            if (distance < frameConfig.interactionRadius) {
                return pic;
            }
        }
        return null;
    }

    isNearExit(playerX) {
        return Math.abs(playerX - this.exitStairs.x) < 80;
    }
}
