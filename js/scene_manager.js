/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 场景管理器 - 负责管理游戏中的不同场景和转场效果
 */
class SceneManager {
    constructor(gameData) {
        this.gameData = gameData;
        this.currentScene = 'start'; // 默认从开始场景启动
        this.scenes = {
            'start': document.getElementById('start-screen'),
            'main': document.getElementById('main-screen'),
            'battle': document.getElementById('battle-screen')
        };
        
        // 转场效果配置
        this.transitionDuration = 500; // 毫秒
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 监听战斗完成事件
        document.addEventListener('battleCompleted', () => {
            this.updateGameState();
        });
        
        // 监听数据加载完成事件
        document.addEventListener('dataLoaded', () => {
            console.log('场景管理器：数据加载完成');
        });
    }
    
    /**
     * 切换到指定场景
     * @param {string} sceneName - 场景名称
     * @param {Object} options - 选项参数
     */
    switchTo(sceneName, options = {}) {
        if (!this.scenes[sceneName]) {
            console.error(`场景 ${sceneName} 不存在`);
            return;
        }
        
        // 获取当前场景和目标场景的DOM元素
        const currentSceneElement = this.scenes[this.currentScene];
        const targetSceneElement = this.scenes[sceneName];
        
        // 应用淡出效果
        currentSceneElement.style.transition = `opacity ${this.transitionDuration}ms ease`;
        currentSceneElement.style.opacity = '0';
        
        // 延迟后切换场景并应用淡入效果
        setTimeout(() => {
            // 隐藏当前场景
            currentSceneElement.classList.remove('active');
            currentSceneElement.style.opacity = '';
            currentSceneElement.style.transition = '';
            
            // 调整目标场景初始状态
            targetSceneElement.style.opacity = '0';
            targetSceneElement.style.transition = `opacity ${this.transitionDuration}ms ease`;
            targetSceneElement.classList.add('active');
            
            // 触发回流后应用淡入效果
            setTimeout(() => {
                targetSceneElement.style.opacity = '1';
                
                // 转场完成后清除过渡效果
                setTimeout(() => {
                    targetSceneElement.style.transition = '';
                    targetSceneElement.style.opacity = '';
                    
                    // 执行场景特定初始化
                    this.initializeScene(sceneName, options);
                    
                }, this.transitionDuration);
            }, 20);
            
            // 更新当前场景状态
            this.currentScene = sceneName;
            
            // 发送场景切换事件
            const event = new CustomEvent('sceneChanged', { 
                detail: { from: currentSceneElement.id, to: targetSceneElement.id } 
            });
            document.dispatchEvent(event);
            
        }, this.transitionDuration);
    }
    
    /**
     * 初始化特定场景
     * @param {string} sceneName - 场景名称
     * @param {Object} options - 选项参数
     */
    initializeScene(sceneName, options) {
        switch(sceneName) {
            case 'main':
                this.initializeMainScene(options);
                break;
                
            case 'battle':
                this.initializeBattleScene(options);
                break;
                
            case 'start':
                // 开始场景不需要特殊初始化
                break;
                
            default:
                console.log(`没有为场景 ${sceneName} 定义初始化逻辑`);
        }
    }
    
    /**
     * 初始化主场景
     * @param {Object} options - 选项参数
     */
    initializeMainScene(options) {
        // 更新地图选择显示
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = ''; // 清空现有内容
            
            // 为每个地图创建一个卡片
            this.gameData.maps.forEach(map => {
                const mapCard = document.createElement('div');
                mapCard.className = 'map-card';
                
                // 添加地图图片
                const mapImage = document.createElement('img');
                mapImage.src = map.image;
                mapImage.alt = map.name;
                mapCard.appendChild(mapImage);
                
                // 添加地图名称和等级范围
                const mapInfo = document.createElement('div');
                mapInfo.className = 'map-info';
                
                const mapName = document.createElement('h3');
                mapName.textContent = map.name;
                
                const levelRange = document.createElement('p');
                levelRange.textContent = `等级 ${map.levelRange[0]}-${map.levelRange[1]}`;
                
                mapInfo.appendChild(mapName);
                mapInfo.appendChild(levelRange);
                mapCard.appendChild(mapInfo);
                
                // 添加点击事件
                mapCard.addEventListener('click', () => {
                    if (window.battleSystem) {
                        window.battleSystem.selectMap(map);
                    }
                });
                
                mapContainer.appendChild(mapCard);
            });
        }
        
        // 更新团队状态显示
        this.updateTeamStatus();
    }
    
    /**
     * 初始化战斗场景
     * @param {Object} options - 选项参数
     */
    initializeBattleScene(options) {
        const monster = options.monster;
        if (monster) {
            // 更新怪物显示
            const monsterDisplay = document.getElementById('monster-display');
            if (monsterDisplay) {
                monsterDisplay.innerHTML = '';
                
                // 添加怪物图片
                const monsterImage = document.createElement('img');
                monsterImage.src = `assets/monster/${monster.image}`;
                monsterImage.alt = monster.name;
                monsterDisplay.appendChild(monsterImage);
                
                // 添加怪物信息
                const monsterInfo = document.createElement('div');
                monsterInfo.className = 'monster-info-text';
                
                const healthPercent = (monster.health / monster.maxHealth) * 100;
                
                monsterInfo.innerHTML = `
                    <h3>${monster.name} (Lv.${monster.level})</h3>
                    <div class="progress-bar health-bar">
                        <div class="progress-fill" style="width: ${healthPercent}%"></div>
                        <div class="progress-text">HP: ${monster.health}/${monster.maxHealth}</div>
                    </div>
                    <p>攻击: ${monster.attack} | 防御: ${monster.defense}</p>
                `;
                
                monsterDisplay.appendChild(monsterInfo);
            }
            
            // 初始化战斗日志
            const battleLogContent = document.getElementById('battle-log-content');
            if (battleLogContent) {
                battleLogContent.innerHTML = '';
                this.addBattleLog(`你遇到了 ${monster.name}！`);
                this.addBattleLog(`${monster.name} 等级: ${monster.level} | 血量: ${monster.health}`);
                this.addBattleLog('-------------------------------');
                this.addBattleLog('请选择"开始战斗"进行战斗，或者"逃跑"返回地图选择。');
            }
        }
    }
    
    /**
     * 添加战斗日志
     * @param {string} message - 日志消息
     */
    addBattleLog(message) {
        const battleLogContent = document.getElementById('battle-log-content');
        if (battleLogContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = message;
            battleLogContent.appendChild(logEntry);
            
            // 自动滚动到底部
            battleLogContent.scrollTop = battleLogContent.scrollHeight;
        }
    }
    
    /**
     * 更新游戏状态 - 在场景切换或重要事件后调用
     */
    updateGameState() {
        // 更新团队状态
        this.updateTeamStatus();
        
        // 检查任务完成状态
        if (window.questSystem) {
            window.questSystem.checkQuestCompletion();
        }
        
        // 保存游戏状态
        if (this.gameData) {
            this.gameData.saveGameData();
        }
    }
    
    /**
     * 更新团队状态显示
     */
    updateTeamStatus() {
        // 更新金币显示
        const teamGoldValue = document.getElementById('team-gold-value');
        if (teamGoldValue && this.gameData) {
            teamGoldValue.textContent = this.gameData.teamGold;
        }
        
        // 更新团队成员显示
        const teamMembersContainer = document.getElementById('team-members');
        if (teamMembersContainer && this.gameData && this.gameData.students) {
            // 清空现有内容
            teamMembersContainer.innerHTML = '';
            
            // 为每个学生创建一个成员卡片
            this.gameData.students.forEach(student => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'team-member';
                
                // 添加学生头像
                const imageUrl = student.image;
                const image = document.createElement('img');
                image.src = imageUrl;
                image.alt = student.name;
                memberDiv.appendChild(image);
                
                // 添加学生姓名
                const nameElement = document.createElement('h3');
                nameElement.textContent = student.name;
                memberDiv.appendChild(nameElement);
                
                // 添加等级信息
                const levelElement = document.createElement('p');
                levelElement.textContent = `等级: ${student.level}`;
                memberDiv.appendChild(levelElement);
                
                // 添加血量条
                const healthBarContainer = document.createElement('div');
                healthBarContainer.className = 'progress-bar health-bar';
                
                const healthFill = document.createElement('div');
                healthFill.className = 'progress-fill';
                const healthRatio = student.health / student.maxHealth;
                healthFill.style.width = `${healthRatio * 100}%`;
                
                const healthText = document.createElement('div');
                healthText.className = 'progress-text';
                healthText.textContent = `${student.health}/${student.maxHealth}`;
                
                healthBarContainer.appendChild(healthFill);
                healthBarContainer.appendChild(healthText);
                memberDiv.appendChild(healthBarContainer);
                
                // 添加经验条
                const expBarContainer = document.createElement('div');
                expBarContainer.className = 'progress-bar exp-bar';
                
                const expFill = document.createElement('div');
                expFill.className = 'progress-fill';
                const requiredExp = student.level * 100;
                const expRatio = student.exp / requiredExp;
                expFill.style.width = `${expRatio * 100}%`;
                
                const expText = document.createElement('div');
                expText.className = 'progress-text';
                expText.textContent = `${student.exp}/${requiredExp}`;
                
                expBarContainer.appendChild(expFill);
                expBarContainer.appendChild(expText);
                memberDiv.appendChild(expBarContainer);
                
                // 添加查看详情和背包按钮
                const buttonsDiv = document.createElement('div');
                buttonsDiv.className = 'member-buttons';
                
                const detailsButton = document.createElement('button');
                detailsButton.className = 'member-btn';
                detailsButton.textContent = '详情';
                detailsButton.addEventListener('click', () => {
                    if (window.showStudentDetails) {
                        window.showStudentDetails(student);
                    }
                });
                
                const backpackButton = document.createElement('button');
                backpackButton.className = 'member-btn';
                backpackButton.textContent = '背包';
                backpackButton.addEventListener('click', () => {
                    if (window.backpackSystem) {
                        window.backpackSystem.showBackpack(student);
                    }
                });
                
                buttonsDiv.appendChild(detailsButton);
                buttonsDiv.appendChild(backpackButton);
                memberDiv.appendChild(buttonsDiv);
                
                // 添加到容器
                teamMembersContainer.appendChild(memberDiv);
            });
        }
    }
    
    /**
     * 显示确认对话框
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @param {function} onConfirm - 确认回调
     * @param {function} onCancel - 取消回调
     */
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        // 创建对话框元素
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialogBox = document.createElement('div');
        dialogBox.className = 'dialog-box';
        
        const dialogTitle = document.createElement('h3');
        dialogTitle.textContent = title;
        dialogBox.appendChild(dialogTitle);
        
        const dialogMessage = document.createElement('p');
        dialogMessage.textContent = message;
        dialogBox.appendChild(dialogMessage);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dialog-buttons';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.className = 'confirm-btn';
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(dialogOverlay);
            if (onConfirm) onConfirm();
        });
        buttonContainer.appendChild(confirmBtn);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialogOverlay);
            if (onCancel) onCancel();
        });
        buttonContainer.appendChild(cancelBtn);
        
        dialogBox.appendChild(buttonContainer);
        dialogOverlay.appendChild(dialogBox);
        document.body.appendChild(dialogOverlay);
        
        // 设置样式
        dialogOverlay.style.position = 'fixed';
        dialogOverlay.style.top = '0';
        dialogOverlay.style.left = '0';
        dialogOverlay.style.width = '100%';
        dialogOverlay.style.height = '100%';
        dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        dialogOverlay.style.display = 'flex';
        dialogOverlay.style.justifyContent = 'center';
        dialogOverlay.style.alignItems = 'center';
        dialogOverlay.style.zIndex = '1000';
        
        dialogBox.style.backgroundColor = '#fff';
        dialogBox.style.borderRadius = '10px';
        dialogBox.style.padding = '20px';
        dialogBox.style.maxWidth = '80%';
        dialogBox.style.width = '400px';
        dialogBox.style.textAlign = 'center';
        
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '15px';
        buttonContainer.style.marginTop = '20px';
        
        const buttonStyle = 'padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;';
        confirmBtn.style.cssText = buttonStyle + 'background-color: #4CAF50; color: white;';
        cancelBtn.style.cssText = buttonStyle + 'background-color: #f44336; color: white;';
    }
    
    /**
     * 显示通知提示
     * @param {string} message - 提示消息
     * @param {string} type - 提示类型('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 设置样式
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        // 根据类型设置背景色
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
        }
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 将类导出到全局作用域
window.SceneManager = SceneManager;
