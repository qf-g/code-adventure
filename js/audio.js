/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 音频管理模块 - 负责游戏中的音乐和音效
 */
class AudioManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        
        // 音频元素缓存
        this.audioElements = {};
        
        // 音量设置
        this.volumes = {
            music: 0.5,
            sfx: 0.7
        };
        
        // 当前播放的背景音乐
        this.currentMusic = null;
        
        // 是否静音
        this.muted = false;
        
        // 音频是否已初始化
        this.initialized = false;
        
        // 待播放的音乐队列
        this.pendingMusic = null;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化音频管理器
     */
    init() {
        // 尝试初始化Web Audio API
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (error) {
            console.error("Web Audio API不受支持:", error);
        }
        
        // 预加载音频文件
        this.preloadAudio();
        
        // 添加全局用户交互事件监听器，用于激活音频上下文
        const activateAudio = () => {
            this.resumeAudioContext();
            this.initialized = true;
            
            // 如果有待播放的音乐，立即播放
            if (this.pendingMusic) {
                const { name, loop } = this.pendingMusic;
                this.playMusicImmediately(name, loop);
                this.pendingMusic = null;
            }
            
            // 移除事件监听器，因为我们只需要一次用户交互
            document.removeEventListener('click', activateAudio);
            document.removeEventListener('touchstart', activateAudio);
            document.removeEventListener('keydown', activateAudio);
        };
        
        // 监听多种用户交互事件
        document.addEventListener('click', activateAudio);
        document.addEventListener('touchstart', activateAudio);
        document.addEventListener('keydown', activateAudio);
        
        console.log("音频管理器初始化完成，等待用户交互...");
    }
    
    /**
     * 恢复被暂停的音频上下文
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('音频上下文已恢复');
            }).catch(err => {
                console.error('恢复音频上下文失败:', err);
            });
        }
    }
    
    /**
     * 预加载音频文件
     */
    preloadAudio() {
        // 常用音频文件列表
        const audioFiles = {
            // 背景音乐
            "main_theme": "assets/audio/main_theme.mp3",
            "battle_theme": "assets/audio/battle_theme.mp3",
            "victory_theme": "assets/audio/victory_theme.wav",
            
            // 音效
            "click": "assets/audio/click.wav",
            "battle_start": "assets/audio/battle_start.wav",
            "correct_answer": "assets/audio/correct_answer.wav",
            "wrong_answer": "assets/audio/wrong_answer.mp3",
            "level_up": "assets/audio/level_up.wav",
            "item_get": "assets/audio/item_get.mp3"
        };
        
        // 预加载所有音频文件
        for (const [name, path] of Object.entries(audioFiles)) {
            this.loadAudio(name, path);
        }
    }
    
    /**
     * 加载音频文件
     * @param {string} name - 音频名称
     * @param {string} path - 音频文件路径
     */
    loadAudio(name, path) {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        
        // 避免跨域问题
        audio.crossOrigin = 'anonymous';
        
        // 保存到缓存
        this.audioElements[name] = audio;
        
        // 静默加载（触发预加载但不播放）
        audio.load();
        
        console.log(`加载音频: ${name}`);
    }
    
    /**
     * 播放背景音乐
     * @param {string} name - 音乐名称
     * @param {boolean} loop - 是否循环播放
     */
    playMusic(name, loop = true) {
        // 如果音频系统尚未初始化，将音乐添加到待播放队列
        if (!this.initialized) {
            console.log(`音频未初始化，将音乐 ${name} 加入待播放队列`);
            this.pendingMusic = { name, loop };
            return;
        }
        
        // 正常播放音乐
        this.playMusicImmediately(name, loop);
    }
    
    /**
     * 立即播放背景音乐（内部方法）
     * @param {string} name - 音乐名称
     * @param {boolean} loop - 是否循环播放
     */
    playMusicImmediately(name, loop = true) {
        // 如果当前正在播放同一首音乐，则不进行操作
        if (this.currentMusic && this.currentMusic.name === name && !this.currentMusic.paused) {
            return;
        }
        
        // 停止当前播放的音乐
        this.stopMusic();
        
        const audio = this.audioElements[name];
        if (audio) {
            audio.volume = this.muted ? 0 : this.volumes.music;
            audio.loop = loop;
            
            // 尝试播放
            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.error(`播放音乐失败: ${name}`, error);
                    // 在出现错误时尝试再次激活音频上下文
                    this.resumeAudioContext();
                });
            }
            
            // 记录当前播放的音乐
            this.currentMusic = audio;
            this.currentMusic.name = name;
        } else {
            console.warn(`音乐未加载: ${name}`);
        }
    }
    
    /**
     * 停止当前播放的背景音乐
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }
    
    /**
     * 暂停当前播放的背景音乐
     */
    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }
    
    /**
     * 恢复当前暂停的背景音乐
     */
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play().catch(error => {
                console.error('恢复音乐播放失败:', error);
            });
        }
    }
    
    /**
     * 播放音效
     * @param {string} name - 音效名称
     */
    playSFX(name) {
        const audio = this.audioElements[name];
        if (audio) {
            // 克隆音频节点以支持同时播放多个同类音效
            const sfx = audio.cloneNode();
            sfx.volume = this.muted ? 0 : this.volumes.sfx;
            
            // 播放完成后自动移除克隆的节点
            sfx.addEventListener('ended', () => {
                sfx.remove();
            });
            
            sfx.play().catch(error => {
                console.error(`播放音效失败: ${name}`, error);
            });
        } else {
            console.warn(`音效未加载: ${name}`);
        }
    }
    
    /**
     * 设置音乐音量
     * @param {number} volume - 音量值(0-1)
     */
    setMusicVolume(volume) {
        this.volumes.music = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.muted ? 0 : this.volumes.music;
        }
    }
    
    /**
     * 设置音效音量
     * @param {number} volume - 音量值(0-1)
     */
    setSFXVolume(volume) {
        this.volumes.sfx = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 切换静音状态
     * @returns {boolean} 当前的静音状态
     */
    toggleMute() {
        this.muted = !this.muted;
        
        // 更新当前播放音乐的音量
        if (this.currentMusic) {
            this.currentMusic.volume = this.muted ? 0 : this.volumes.music;
        }
        
        return this.muted;
    }
}

// 创建单例并导出
window.audioManager = new AudioManager();

// 添加音频启动按钮
document.addEventListener('DOMContentLoaded', () => {
    const startAudioButton = document.createElement('button');
    startAudioButton.textContent = '启用游戏音频';
    startAudioButton.className = 'audio-start-btn';
    startAudioButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 10px 15px;
        background-color: #E67E22;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        display: none;
    `;
    
    // 如果音频未初始化，显示按钮
    if (!window.audioManager.initialized) {
        startAudioButton.style.display = 'block';
    }
    
    startAudioButton.addEventListener('click', () => {
        window.audioManager.resumeAudioContext();
        window.audioManager.initialized = true;
        
        // 播放主题音乐
        if (window.audioManager.pendingMusic) {
            const { name, loop } = window.audioManager.pendingMusic;
            window.audioManager.playMusicImmediately(name, loop);
            window.audioManager.pendingMusic = null;
        } else {
            window.audioManager.playMusic('main_theme', true);
        }
        
        // 隐藏按钮
        startAudioButton.style.display = 'none';
    });
    
    document.body.appendChild(startAudioButton);
});
