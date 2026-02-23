export class RocketVideoScene extends Phaser.Scene {
    constructor() {
        super('RocketVideoScene');
        this.currentFrame = 1;
        this.totalFrames = 45; // 更新为实际的图片数量（49到5共45张）
        this.frameRate = 10; // 每秒10帧
        this.frameDelay = 1000 / this.frameRate; // 每帧的延迟时间（毫秒）
        this.frameImage = null;
        this.frameTimer = null;
        this.cameraInfo = null;
    }

    init(data) {
        // 重置所有动画相关的状态变量，确保每次进入场景都能从头开始播放动画
        this.currentFrame = 1;
        this.frameImage = null;
        this.frameTimer = null;
        
        // 处理从SurfaceplayScene传递过来的参数
        if (data) {
            this.cameraInfo = data.cameraInfo;
        }
    }

    create() {
        // 获取存储的相机信息
        const cameraInfo = this.cameraInfo;
        
        // 创建背景（使用与SurfaceplayScene相同的天空纹理）
        const skyWidth = 800 * 5;
        const sky = this.add.image(skyWidth / 2, 300, 'sky').setScale(5, 1);
        
        // 创建地面图层（使用与SurfaceplayScene相同的地面纹理）
        this.platforms = this.physics.add.staticGroup();
        const groundY = 568; // 与SurfaceplayScene中的地面位置相同
        
        // 创建多个平台相互拼接
        for (let i = 0; i < 5; i++) {
            const x = 400 + i * 800;
            this.platforms.create(x, groundY, 'ground').setScale(2).refreshBody();
        }
        
        // 设置相机边界，确保相机不会拍摄超出背景的部分
        this.cameras.main.setBounds(0, 0, skyWidth, 600);
        
        // 设置相机位置和缩放，与SurfaceplayScene最后一刻的状态相同
        if (cameraInfo) {
            this.cameras.main.setScroll(cameraInfo.scrollX, cameraInfo.scrollY);
            this.cameras.main.setZoom(cameraInfo.zoom);
        }
        
        // 初始化第一帧（将图片添加到相机和地面之间）
        this.showFrame(this.currentFrame);
        
        // 开始播放序列
        
        this.frameTimer = this.time.addEvent({
            delay: this.frameDelay,
            callback: this.nextFrame, 
            callbackScope: this,
            repeat: this.totalFrames - 1
        });
        
    }

    showFrame(frameNumber) {
        // 移除当前帧图片
        if (this.frameImage) {
            this.frameImage.destroy();
        }
        
        // 加载并显示新帧
        const frameNum = frameNumber.toString().padStart(3, '0');
        const frameKey = `rocket_frame_${frameNum}`;
        
        // 创建frameImage，设置其位置为屏幕中心，不受相机滚动影响
        this.frameImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 10,
            frameKey
        );
        
        // 设置scrollFactor为0，确保位置不受相机滚动影响
        this.frameImage.setScrollFactor(0);
        
        // 调整图片大小以适应屏幕，不受相机缩放影响
        const baseWidth = this.sys.game.config.width;
        this.frameImage.setScale(
            baseWidth / this.frameImage.width * 0.28,
        );
        
        // 设置frameImage的深度，确保它在背景之上但在地面之下
        this.frameImage.setDepth(1);
        
        // 确保地面图层的深度高于frameImage
        if (this.platforms) {
            this.platforms.getChildren().forEach(platform => {
                platform.setDepth(2);
            });
        }
    }

    nextFrame() {
        this.currentFrame++;
        if (this.currentFrame <= this.totalFrames) {
            this.showFrame(this.currentFrame);
        } else {
            // 播放完毕，停止在最后一幅画面
            this.stopVideo();
            this.frameImage.setPosition(200, 500).setScale(0.18);
            this.frameImage.setScrollFactor(1, 1);
            // 计算相机在缩放为1.0时的目标位置
            // 目标位置应该是火箭的位置，这样回到SurfaceplayScene时能看到火箭
            const targetScrollX = this.cameraInfo ? this.cameraInfo.scrollX / this.cameraInfo.zoom : 0;
            const targetScrollY = this.cameraInfo ? this.cameraInfo.scrollY / this.cameraInfo.zoom : 0;
            
            // 添加相机动画，将缩放比渐变为1.0，同时调整相机位置
            this.tweens.add({
                targets: this.cameras.main,
                zoom: 1.0,
                scrollX: targetScrollX,
                scrollY: targetScrollY,
                duration: 2000, // 2秒动画
                ease: 'Power2.easeOut',
                onComplete: () => {
                    // 动画完成后，回到SurfaceplayScene
                    this.scene.start('SurfaceplayScene', {videoPlayed: true});
                }
            });
        }
    }

    stopVideo() {
        if (this.frameTimer) {
            this.frameTimer.remove();
            this.frameTimer = null;
        }
        // 不销毁frameImage，因为我们希望停止在最后一幅画面
    }

    destroy() {
        this.stopVideo();
        // 销毁frameImage
        if (this.frameImage) {
            this.frameImage.destroy();
            this.frameImage = null;
        }
        super.destroy();
    }
}
