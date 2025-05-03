/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 语言选择器 - 负责初始化时的语言选择
 */
class LanguageSelector {
    constructor() {
        this.selectedLanguage = null;
        this.availableLanguages = ['python', 'c++'];
        this.availableSaves = this.loadAvailableSaves();
    }
    
    /**
     * 加载可用的存档列表
     * @returns {Array<string>} 存档名称列表
     */
    loadAvailableSaves() {
        // 从localStorage获取所有以"re0-students-"开头的键
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('re0-students-')) {
                saves.push(key.replace('re0-students-', ''));
            }
        }
        return saves;
    }
    
    /**
     * 创建新存档
     * @param {string} saveName - 存档名称
     * @param {string} language - 选择的编程语言
     * @returns {boolean} 是否创建成功
     */
    createNewSave(saveName, language) {
        if (!saveName || !language) return false;
        
        if (this.availableSaves.includes(saveName)) {
            if (!confirm(`存档 "${saveName}" 已存在，要覆盖吗？`)) {
                return false;
            }
        }
        
        // 创建新的存档
        const gameData = new GameData(saveName);
        gameData.language = language;
        gameData.saveGameData();
        
        this.selectedLanguage = language;
        return true;
    }
    
    /**
     * 显示语言选择对话框
     * @returns {Promise<{language: string, save: string}>} 选择的语言和存档
     */
    async showLanguageDialog() {
        return new Promise((resolve) => {
            // 创建模态对话框
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content language-selector';
            
            // 标题
            const title = document.createElement('h2');
            title.textContent = '选择编程语言和存档';
            modalContent.appendChild(title);
            
            // 语言选择部分
            const languageSection = document.createElement('div');
            languageSection.className = 'language-section';
            
            const languageTitle = document.createElement('h3');
            languageTitle.textContent = '选择编程语言:';
            languageSection.appendChild(languageTitle);
            
            const languageOptions = document.createElement('div');
            languageOptions.className = 'language-options';
            
            // 添加语言选项按钮
            this.availableLanguages.forEach(lang => {
                const langBtn = document.createElement('button');
                langBtn.className = 'language-btn';
                langBtn.dataset.language = lang;
                langBtn.textContent = lang === 'python' ? 'Python' : 'C++';
                
                langBtn.addEventListener('click', () => {
                    // 清除所有选中状态
                    document.querySelectorAll('.language-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    
                    // 设置当前按钮为选中状态
                    langBtn.classList.add('selected');
                    this.selectedLanguage = lang;
                });
                
                languageOptions.appendChild(langBtn);
            });
            
            languageSection.appendChild(languageOptions);
            modalContent.appendChild(languageSection);
            
            // 存档选择/创建部分
            const saveSection = document.createElement('div');
            saveSection.className = 'save-section';
            
            const saveTitle = document.createElement('h3');
            saveTitle.textContent = '选择或创建存档:';
            saveSection.appendChild(saveTitle);
            
            // 新建存档输入框
            const newSaveInput = document.createElement('div');
            newSaveInput.className = 'new-save-input';
            
            const saveNameInput = document.createElement('input');
            saveNameInput.type = 'text';
            saveNameInput.placeholder = '输入新存档名称';
            saveNameInput.id = 'new-save-name';
            newSaveInput.appendChild(saveNameInput);
            
            saveSection.appendChild(newSaveInput);
            
            // 已有存档列表
            if (this.availableSaves.length > 0) {
                const existingSaves = document.createElement('div');
                existingSaves.className = 'existing-saves';
                
                const savesTitle = document.createElement('h4');
                savesTitle.textContent = '或选择现有存档:';
                existingSaves.appendChild(savesTitle);
                
                const savesList = document.createElement('ul');
                savesList.className = 'saves-list';
                
                this.availableSaves.forEach(save => {
                    const saveItem = document.createElement('li');
                    saveItem.className = 'save-item';
                    
                    const saveLink = document.createElement('a');
                    saveLink.href = '#';
                    saveLink.textContent = save;
                    saveLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        saveNameInput.value = save;
                    });
                    
                    saveItem.appendChild(saveLink);
                    savesList.appendChild(saveItem);
                });
                
                existingSaves.appendChild(savesList);
                saveSection.appendChild(existingSaves);
            }
            
            modalContent.appendChild(saveSection);
            
            // 确认按钮
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-btn';
            confirmBtn.textContent = '开始游戏';
            confirmBtn.addEventListener('click', () => {
                const saveName = saveNameInput.value.trim();
                if (!saveName) {
                    alert('请输入存档名称！');
                    return;
                }
                
                if (!this.selectedLanguage) {
                    alert('请选择编程语言！');
                    return;
                }
                
                // 关闭对话框并返回结果
                document.body.removeChild(modal);
                resolve({
                    language: this.selectedLanguage,
                    save: saveName
                });
            });
            
            modalContent.appendChild(confirmBtn);
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        });
    }
    
    /**
     * 运行语言选择器
     * @returns {Promise<{language: string, save: string}>} 选择的语言和存档
     */
    async run() {
        return await this.showLanguageDialog();
    }
}

// 将类导出到全局作用域
window.LanguageSelector = LanguageSelector;
