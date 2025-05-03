/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 任务系统 - 负责处理游戏任务和奖励
 */
class QuestSystem {
    constructor(gameData) {
        this.gameData = gameData;
        this.dailyQuestsCompleted = false;
        this.lastQuestDate = null;
        this.currentQuests = [];
        
        // 任务类型定义
        this.questTypes = [
            {
                type: 'defeat',
                description: '击败{count}个怪物',
                rewards: { exp: 30, gold: 50 }
            },
            {
                type: 'level',
                description: '达到{level}级',
                rewards: { exp: 50, gold: 100 }
            },
            {
                type: 'equipment',
                description: '收集{count}件装备',
                rewards: { exp: 20, gold: 80 }
            }
        ];
        
        // 加载任务数据
        this.loadQuestData();
    }
    
    /**
     * 加载任务数据
     */
    loadQuestData() {
        const savedQuests = localStorage.getItem(`re0-quests-${this.gameData.saveName}`);
        if (savedQuests) {
            const questData = JSON.parse(savedQuests);
            this.dailyQuestsCompleted = questData.dailyQuestsCompleted || false;
            this.lastQuestDate = questData.lastQuestDate ? new Date(questData.lastQuestDate) : null;
            this.currentQuests = questData.currentQuests || [];
            
            // 检查是否需要重置每日任务
            this.checkDailyQuestReset();
        } else {
            this.generateDailyQuests();
        }
    }
    
    /**
     * 保存任务数据
     */
    saveQuestData() {
        const questData = {
            dailyQuestsCompleted: this.dailyQuestsCompleted,
            lastQuestDate: this.lastQuestDate,
            currentQuests: this.currentQuests
        };
        
        localStorage.setItem(`re0-quests-${this.gameData.saveName}`, JSON.stringify(questData));
    }
    
    /**
     * 检查是否需要重置每日任务
     */
    checkDailyQuestReset() {
        if (!this.lastQuestDate) {
            this.generateDailyQuests();
            return;
        }
        
        const now = new Date();
        const lastDate = new Date(this.lastQuestDate);
        
        // 如果不是同一天，重置每日任务
        if (now.getDate() !== lastDate.getDate() || 
            now.getMonth() !== lastDate.getMonth() || 
            now.getFullYear() !== lastDate.getFullYear()) {
            this.generateDailyQuests();
        }
    }
    
    /**
     * 生成每日任务
     */
    generateDailyQuests() {
        this.currentQuests = [];
        this.dailyQuestsCompleted = false;
        this.lastQuestDate = new Date();
        
        // 获取学生最高等级
        const maxLevel = Math.max(...this.gameData.students.map(s => s.level));
        
        // 生成3个随机任务
        for (let i = 0; i < 3; i++) {
            // 随机选择任务类型
            const questTypeIndex = Math.floor(Math.random() * this.questTypes.length);
            const questType = this.questTypes[questTypeIndex];
            
            let quest;
            switch (questType.type) {
                case 'defeat':
                    // 击败怪物任务
                    const monsterCount = Math.floor(maxLevel / 2) + Math.floor(Math.random() * 5) + 3;
                    quest = {
                        id: `defeat_${Date.now()}_${i}`,
                        type: 'defeat',
                        description: questType.description.replace('{count}', monsterCount),
                        target: monsterCount,
                        progress: 0,
                        completed: false,
                        rewards: {
                            exp: questType.rewards.exp * maxLevel,
                            gold: questType.rewards.gold * maxLevel
                        }
                    };
                    break;
                    
                case 'level':
                    // 等级任务
                    const targetLevel = maxLevel + 1;
                    quest = {
                        id: `level_${Date.now()}_${i}`,
                        type: 'level',
                        description: questType.description.replace('{level}', targetLevel),
                        target: targetLevel,
                        progress: maxLevel,
                        completed: false,
                        rewards: {
                            exp: questType.rewards.exp * maxLevel,
                            gold: questType.rewards.gold * maxLevel
                        }
                    };
                    break;
                    
                case 'equipment':
                    // 收集装备任务
                    const equipmentCount = Math.floor(Math.random() * 3) + 1;
                    quest = {
                        id: `equipment_${Date.now()}_${i}`,
                        type: 'equipment',
                        description: questType.description.replace('{count}', equipmentCount),
                        target: equipmentCount,
                        progress: 0,
                        completed: false,
                        rewards: {
                            exp: questType.rewards.exp * maxLevel,
                            gold: questType.rewards.gold * maxLevel
                        }
                    };
                    break;
            }
            
            this.currentQuests.push(quest);
        }
        
        // 保存任务数据
        this.saveQuestData();
    }
    
    /**
     * 显示任务窗口
     */
    openQuestWindow() {
        // 先检查是否需要重置每日任务
        this.checkDailyQuestReset();
        
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '800px';
        
        // 添加标题和关闭按钮
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close-btn';
        closeSpan.innerHTML = '&times;';
        closeSpan.addEventListener('click', () => modal.remove());
        
        const title = document.createElement('h2');
        title.textContent = '每日任务';
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 添加任务说明
        const questInfo = document.createElement('p');
        questInfo.textContent = '完成每日任务以获取额外奖励！任务将在每天零点刷新。';
        modalContent.appendChild(questInfo);
        
        // 显示当前任务列表
        if (this.currentQuests.length === 0) {
            const noQuestsMessage = document.createElement('p');
            noQuestsMessage.textContent = '当前没有可用的任务';
            modalContent.appendChild(noQuestsMessage);
        } else {
            // 创建任务列表
            const questList = document.createElement('div');
            questList.className = 'quest-list';
            
            this.currentQuests.forEach(quest => {
                // 创建任务卡片
                const questCard = document.createElement('div');
                questCard.className = 'quest-card';
                questCard.style.cssText = `
                    padding: 15px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: ${quest.completed ? '#E8F6E9' : '#FFF8EE'};
                `;
                
                // 显示任务描述
                const questDescription = document.createElement('h3');
                questDescription.textContent = quest.description;
                questCard.appendChild(questDescription);
                
                // 显示任务进度
                const progressText = document.createElement('p');
                progressText.textContent = `进度: ${quest.progress}/${quest.target}`;
                questCard.appendChild(progressText);
                
                // 添加进度条
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.cssText = `
                    width: 100%;
                    background-color: #f0f0f0;
                    border-radius: 5px;
                    height: 20px;
                    margin: 10px 0;
                    position: relative;
                    overflow: hidden;
                `;
                
                const progressFill = document.createElement('div');
                progressFill.style.cssText = `
                    height: 100%;
                    background-color: ${quest.completed ? '#2ECC71' : '#3498DB'};
                    width: ${(quest.progress / quest.target) * 100}%;
                    position: absolute;
                `;
                progressBar.appendChild(progressFill);
                
                const progressValue = document.createElement('div');
                progressValue.style.cssText = `
                    position: absolute;
                    width: 100%;
                    text-align: center;
                    color: white;
                    font-weight: bold;
                    line-height: 20px;
                `;
                progressValue.textContent = `${Math.round((quest.progress / quest.target) * 100)}%`;
                progressBar.appendChild(progressValue);
                
                questCard.appendChild(progressBar);
                
                // 显示奖励
                const rewardsTitle = document.createElement('h4');
                rewardsTitle.textContent = '奖励:';
                questCard.appendChild(rewardsTitle);
                
                const rewardsList = document.createElement('ul');
                rewardsList.style.cssText = `
                    list-style-type: none;
                    padding-left: 0;
                    margin-top: 5px;
                `;
                
                const goldReward = document.createElement('li');
                goldReward.textContent = `金币: ${quest.rewards.gold}`;
                goldReward.style.color = '#F1C40F';
                rewardsList.appendChild(goldReward);
                
                const expReward = document.createElement('li');
                expReward.textContent = `经验: ${quest.rewards.exp}`;
                expReward.style.color = '#3498DB';
                rewardsList.appendChild(expReward);
                
                questCard.appendChild(rewardsList);
                
                // 添加领取按钮（如果任务已完成但未领取奖励）
                if (quest.completed && !quest.rewarded) {
                    const claimButton = document.createElement('button');
                    claimButton.className = 'action-btn';
                    claimButton.textContent = '领取奖励';
                    claimButton.style.cssText = `
                        background-color: #2ECC71;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 10px;
                    `;
                    
                    claimButton.addEventListener('click', () => {
                        this.claimQuestReward(quest, modalContent);
                    });
                    
                    questCard.appendChild(claimButton);
                } else if (quest.rewarded) {
                    // 显示已领取标记
                    const claimedMark = document.createElement('div');
                    claimedMark.textContent = '✓ 已领取';
                    claimedMark.style.cssText = `
                        color: #2ECC71;
                        font-weight: bold;
                        margin-top: 10px;
                    `;
                    questCard.appendChild(claimedMark);
                }
                
                questList.appendChild(questCard);
            });
            
            modalContent.appendChild(questList);
        }
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'action-btn';
        closeButton.textContent = '关闭';
        closeButton.style.marginTop = '20px';
        closeButton.addEventListener('click', () => modal.remove());
        modalContent.appendChild(closeButton);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 更新任务进度
        this.updateQuestProgress();
    }
    
    /**
     * 更新任务进度
     */
    updateQuestProgress() {
        const maxLevel = Math.max(...this.gameData.students.map(s => s.level));
        let allEquipments = [];
        
        // 收集所有装备
        this.gameData.students.forEach(student => {
            if (student.backpack) {
                allEquipments = allEquipments.concat(student.backpack);
            }
        });
        
        // 更新每个任务的进度
        this.currentQuests.forEach(quest => {
            if (quest.completed) return;
            
            switch (quest.type) {
                case 'level':
                    quest.progress = maxLevel;
                    if (maxLevel >= quest.target) {
                        quest.completed = true;
                    }
                    break;
                    
                case 'equipment':
                    quest.progress = allEquipments.length;
                    if (allEquipments.length >= quest.target) {
                        quest.completed = true;
                    }
                    break;
                    
                // 其他任务类型的进度更新可以在相应的地方调用
            }
        });
        
        // 保存任务数据
        this.saveQuestData();
    }
    
    /**
     * 领取任务奖励
     * @param {Object} quest - 任务对象
     * @param {Element} modalContent - 模态窗口内容元素
     */
    claimQuestReward(quest, modalContent) {
        // 标记任务已领取
        quest.rewarded = true;
        
        // 给予奖励
        this.gameData.teamGold += quest.rewards.gold;
        
        // 给所有学生平分经验
        const expPerStudent = Math.floor(quest.rewards.exp / this.gameData.students.length);
        this.gameData.students.forEach(student => {
            student.exp += expPerStudent;
            // 检查升级
            this.gameData.checkLevelUp(student);
        });
        
        // 保存游戏数据和任务数据
        this.gameData.saveGameData();
        this.saveQuestData();
        
        // 显示奖励领取成功消息
        alert(`奖励领取成功!\n获得 ${quest.rewards.gold} 金币和 ${quest.rewards.exp} 经验值!`);
        
        // 刷新任务窗口
        modalContent.parentNode.remove();
        this.openQuestWindow();
    }
    
    /**
     * 更新怪物击败数量
     * @param {number} count - 击败的怪物数量
     */
    updateMonsterDefeated(count = 1) {
        this.currentQuests.forEach(quest => {
            if (quest.type === 'defeat' && !quest.completed) {
                quest.progress += count;
                if (quest.progress >= quest.target) {
                    quest.completed = true;
                }
            }
        });
        
        // 保存任务数据
        this.saveQuestData();
    }
}

// 将类导出到全局作用域
window.QuestSystem = QuestSystem;
