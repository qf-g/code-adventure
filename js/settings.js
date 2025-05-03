/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 设置管理器 - 负责管理和保存游戏设置
 */
class SettingsManager {
    constructor() {
        // 默认设置
        this.defaultSettings = {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            language: "python",
            displayFps: false,
            textSpeed: "normal", // slow, normal, fast
            autoSave: true
        };
        
        // 当前设置
        this.settings = this.loadSettings() || {...this.defaultSettings};
    }
    
    /**
     * 加载设置
     * @returns {Object|null} 设置对象或null
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('re0-settings');
            return savedSettings ? JSON.parse(savedSettings) : null;
        } catch (error) {
            console.error('加载设置失败:', error);
            return null;
        }
    }
    
    /**
     * 保存设置
     * @returns {boolean} 是否保存成功
     */
    saveSettings() {
        try {
            localStorage.setItem('re0-settings', JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('保存设置失败:', error);
            return false;
        }
    }
    
    /**
     * 修改设置
     * @param {string} key - 设置键
     * @param {any} value - 设置值
     * @returns {boolean} 是否修改成功
     */
    changeSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            
            // 应用设置更改
            this.applySettings();
            
            // 保存设置
            return this.saveSettings();
        }
        return false;
    }
    
    /**
     * 应用设置
     */
    applySettings() {
        // 应用音频设置
        if (window.audioManager) {
            window.audioManager.setMusicVolume(this.settings.musicVolume);
            window.audioManager.setSFXVolume(this.settings.sfxVolume);
        }
    }
    
    /**
     * 重置为默认设置
     * @returns {boolean} 是否重置成功
     */
    resetToDefaults() {
        this.settings = {...this.defaultSettings};
        this.applySettings();
        return this.saveSettings();
    }
    
    /**
     * 获取设置值
     * @param {string} key - 设置键
     * @returns {any} 设置值
     */
    getSetting(key) {
        return this.settings[key];
    }
    
    /**
     * 显示设置面板
     */
    showSettingsPanel() {
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content settings-panel';
        modalContent.style.maxWidth = '500px';
        
        // 添加标题和关闭按钮
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close-btn';
        closeSpan.innerHTML = '&times;';
        closeSpan.addEventListener('click', () => modal.remove());
        
        const title = document.createElement('h2');
        title.textContent = '游戏设置';
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 创建设置项
        this.createVolumeSettings(modalContent);
        this.createTextSpeedSettings(modalContent);
        this.createAutoSaveSettings(modalContent);
        
        // 添加重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = '恢复默认设置';
        resetBtn.addEventListener('click', () => {
            if (confirm('确定要恢复所有设置为默认值吗？')) {
                this.resetToDefaults();
                modal.remove();
                this.showSettingsPanel(); // 重新打开设置面板
            }
        });
        
        // 添加底部按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'settings-buttons';
        buttonContainer.appendChild(resetBtn);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'close-settings-btn';
        closeButton.textContent = '保存并关闭';
        closeButton.addEventListener('click', () => {
            this.saveSettings();
            modal.remove();
        });
        buttonContainer.appendChild(closeButton);
        
        modalContent.appendChild(buttonContainer);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 应用设置项的样式
        this.applySettingPanelStyle(modal);
    }
    
    /**
     * 创建音量设置
     * @param {Element} container - 容器元素
     */
    createVolumeSettings(container) {
        const section = document.createElement('div');
        section.className = 'settings-section';
        
        const title = document.createElement('h3');
        title.textContent = '音量';
        section.appendChild(title);
        
        // 音乐音量
        const musicVolumeContainer = document.createElement('div');
        musicVolumeContainer.className = 'setting-item';
        
        const musicLabel = document.createElement('label');
        musicLabel.textContent = '背景音乐';
        musicLabel.setAttribute('for', 'music-volume');
        
        const musicValue = document.createElement('span');
        musicValue.className = 'volume-value';
        musicValue.textContent = `${Math.round(this.settings.musicVolume * 100)}%`;
        
        musicVolumeContainer.appendChild(musicLabel);
        musicVolumeContainer.appendChild(musicValue);
        
        const musicSlider = document.createElement('input');
        musicSlider.type = 'range';
        musicSlider.id = 'music-volume';
        musicSlider.min = '0';
        musicSlider.max = '100';
        musicSlider.value = this.settings.musicVolume * 100;
        
        musicSlider.addEventListener('input', () => {
            const value = parseInt(musicSlider.value) / 100;
            this.settings.musicVolume = value;
            musicValue.textContent = `${musicSlider.value}%`;
            
            // 实时应用音量变化
            if (window.audioManager) {
                window.audioManager.setMusicVolume(value);
            }
        });
        
        musicVolumeContainer.appendChild(musicSlider);
        section.appendChild(musicVolumeContainer);
        
        // 音效音量
        const sfxVolumeContainer = document.createElement('div');
        sfxVolumeContainer.className = 'setting-item';
        
        const sfxLabel = document.createElement('label');
        sfxLabel.textContent = '音效';
        sfxLabel.setAttribute('for', 'sfx-volume');
        
        const sfxValue = document.createElement('span');
        sfxValue.className = 'volume-value';
        sfxValue.textContent = `${Math.round(this.settings.sfxVolume * 100)}%`;
        
        sfxVolumeContainer.appendChild(sfxLabel);
        sfxVolumeContainer.appendChild(sfxValue);
        
        const sfxSlider = document.createElement('input');
        sfxSlider.type = 'range';
        sfxSlider.id = 'sfx-volume';
        sfxSlider.min = '0';
        sfxSlider.max = '100';
        sfxSlider.value = this.settings.sfxVolume * 100;
        
        sfxSlider.addEventListener('input', () => {
            const value = parseInt(sfxSlider.value) / 100;
            this.settings.sfxVolume = value;
            sfxValue.textContent = `${sfxSlider.value}%`;
            
            // 实时应用音量变化
            if (window.audioManager) {
                window.audioManager.setSFXVolume(value);
            }
        });
        
        sfxVolumeContainer.appendChild(sfxSlider);
        section.appendChild(sfxVolumeContainer);
        
        // 测试音效按钮
        const testSoundContainer = document.createElement('div');
        testSoundContainer.className = 'setting-item test-sound';
        
        const testButton = document.createElement('button');
        testButton.textContent = '测试音效';
        testButton.addEventListener('click', () => {
            if (window.audioManager) {
                window.audioManager.playSFX('click');
            }
        });
        
        testSoundContainer.appendChild(testButton);
        section.appendChild(testSoundContainer);
        
        container.appendChild(section);
    }
    
    /**
     * 创建文本速度设置
     * @param {Element} container - 容器元素
     */
    createTextSpeedSettings(container) {
        const section = document.createElement('div');
        section.className = 'settings-section';
        
        const title = document.createElement('h3');
        title.textContent = '游戏体验';
        section.appendChild(title);
        
        // 文本速度设置
        const textSpeedContainer = document.createElement('div');
        textSpeedContainer.className = 'setting-item';
        
        const textSpeedLabel = document.createElement('label');
        textSpeedLabel.textContent = '文本显示速度';
        
        textSpeedContainer.appendChild(textSpeedLabel);
        
        const speedOptions = [
            { value: 'slow', label: '慢' },
            { value: 'normal', label: '正常' },
            { value: 'fast', label: '快' }
        ];
        
        const speedButtonsContainer = document.createElement('div');
        speedButtonsContainer.className = 'speed-buttons';
        
        speedOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.label;
            button.className = this.settings.textSpeed === option.value ? 'active' : '';
            
            button.addEventListener('click', () => {
                // 清除所有按钮的active类
                speedButtonsContainer.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 设置当前按钮为active
                button.classList.add('active');
                
                // 更新设置
                this.settings.textSpeed = option.value;
            });
            
            speedButtonsContainer.appendChild(button);
        });
        
        textSpeedContainer.appendChild(speedButtonsContainer);
        section.appendChild(textSpeedContainer);
        
        // FPS显示设置
        const fpsDisplayContainer = document.createElement('div');
        fpsDisplayContainer.className = 'setting-item checkbox-setting';
        
        const fpsLabel = document.createElement('label');
        fpsLabel.textContent = '显示FPS';
        fpsLabel.setAttribute('for', 'display-fps');
        
        const fpsCheckbox = document.createElement('input');
        fpsCheckbox.type = 'checkbox';
        fpsCheckbox.id = 'display-fps';
        fpsCheckbox.checked = this.settings.displayFps;
        
        fpsCheckbox.addEventListener('change', () => {
            this.settings.displayFps = fpsCheckbox.checked;
        });
        
        fpsDisplayContainer.appendChild(fpsLabel);
        fpsDisplayContainer.appendChild(fpsCheckbox);
        section.appendChild(fpsDisplayContainer);
        
        container.appendChild(section);
    }
    
    /**
     * 创建自动保存设置
     * @param {Element} container - 容器元素
     */
    createAutoSaveSettings(container) {
        const section = document.createElement('div');
        section.className = 'settings-section';
        
        const title = document.createElement('h3');
        title.textContent = '保存设置';
        section.appendChild(title);
        
        // 自动保存设置
        const autoSaveContainer = document.createElement('div');
        autoSaveContainer.className = 'setting-item checkbox-setting';
        
        const autoSaveLabel = document.createElement('label');
        autoSaveLabel.textContent = '启用自动保存 (每5分钟)';
        autoSaveLabel.setAttribute('for', 'auto-save');
        
        const autoSaveCheckbox = document.createElement('input');
        autoSaveCheckbox.type = 'checkbox';
        autoSaveCheckbox.id = 'auto-save';
        autoSaveCheckbox.checked = this.settings.autoSave;
        
        autoSaveCheckbox.addEventListener('change', () => {
            this.settings.autoSave = autoSaveCheckbox.checked;
        });
        
        autoSaveContainer.appendChild(autoSaveLabel);
        autoSaveContainer.appendChild(autoSaveCheckbox);
        section.appendChild(autoSaveContainer);
        
        container.appendChild(section);
    }
    
    /**
     * 应用设置面板样式
     * @param {Element} modal - 模态窗口元素
     */
    applySettingPanelStyle(modal) {
        // 添加内联样式
        const style = document.createElement('style');
        style.textContent = `
            .settings-panel {
                background-color: #FFF8EE;
                padding: 25px;
            }
            
            .settings-panel h2 {
                color: #E67E22;
                margin-bottom: 25px;
                text-align: center;
            }
            
            .settings-section {
                margin-bottom: 30px;
                padding: 15px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            
            .settings-section h3 {
                color: #3498DB;
                margin-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
                padding-bottom: 10px;
            }
            
            .setting-item {
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .setting-item label {
                flex: 0 0 120px;
                font-weight: bold;
                color: #4A4A4A;
            }
            
            .setting-item input[type="range"] {
                flex: 1;
                height: 8px;
                border-radius: 4px;
                background: #f0f0f0;
                outline: none;
                -webkit-appearance: none;
            }
            
            .setting-item input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #E67E22;
                cursor: pointer;
            }
            
            .volume-value {
                flex: 0 0 60px;
                text-align: right;
                padding-right: 10px;
                color: #7F8C8D;
            }
            
            .checkbox-setting {
                display: flex;
                justify-content: space-between;
            }
            
            .checkbox-setting input[type="checkbox"] {
                width: 20px;
                height: 20px;
            }
            
            .speed-buttons {
                display: flex;
                gap: 10px;
            }
            
            .speed-buttons button {
                padding: 8px 15px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .speed-buttons button.active {
                background-color: #E67E22;
                color: white;
                border-color: #E67E22;
            }
            
            .test-sound {
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }
            
            .test-sound button {
                padding: 8px 15px;
                background-color: #3498DB;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .test-sound button:hover {
                background-color: #2980B9;
            }
            
            .settings-buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            
            .reset-btn {
                padding: 10px 15px;
                background-color: #E74C3C;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            
            .reset-btn:hover {
                background-color: #C0392B;
            }
            
            .close-settings-btn {
                padding: 10px 20px;
                background-color: #27AE60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            
            .close-settings-btn:hover {
                background-color: #2ECC71;
            }
        `;
        
        modal.appendChild(style);
    }
}

// 初始化设置管理器并导出到全局作用域
window.settingsManager = new SettingsManager();
