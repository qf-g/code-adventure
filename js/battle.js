/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 战斗系统 - 负责处理战斗逻辑和问答挑战
 */
class BattleSystem {
    constructor(gameData) {
        this.gameData = gameData;
        this.monster = null;
        this.selectedMap = null;
        this.battleStarted = false;
        this.battleMode = 'team'; // 'team' 或 'single'
        this.selectedStudent = null;
        this.battleResult = null;
        
        // 创建问题系统实例
        this.questionSystem = new QuestionSystem(gameData);
        
        // DOM元素引用 - 会在相应方法中获取
        this.monsterDisplay = null;
        this.battleLogContent = null;
        this.battleScreen = null;
        this.mainScreen = null;
        this.playerHealthDisplay = null;
        this.questionContainer = null;
    }
    
    /**
     * 选择地图并开始准备战斗
     */
    selectMap(map) {
        console.log(`选择地图: ${map.name}`);
        this.currentMap = map;
        
        // 播放点击音效
        audioManager.playSFX('click');
        
        // 切换到战斗界面
        if (this.sceneManager) {
            this.sceneManager.switchTo('battle');
            
            // 切换到战斗音乐
            audioManager.playMusic('battle_theme', true);
        }
        
        this.selectedMap = map;
        this.generateMonster(map.levelRange);
        this.showBattleScreen();
    }
    
    /**
     * 生成怪物
     */
    generateMonster(levelRange) {
        // 获取当前等级范围内的有效怪物
        const validMonsters = this.gameData.getValidMonstersForMap(levelRange);
        
        if (validMonsters.length === 0) {
            console.error("没有找到适合该等级范围的怪物");
            return null;
        }
        
        // 随机选择一个怪物
        const randomIndex = Math.floor(Math.random() * validMonsters.length);
        const monsterName = validMonsters[randomIndex];
        const monsterData = this.gameData.getMonsterByName(monsterName);
        
        if (!monsterData) {
            console.error(`找不到怪物数据: ${monsterName}`);
            return null;
        }
        
        // 创建一个怪物实例，随机生成血量、攻击和防御值
        const monster = {
            name: monsterName,
            level: monsterData.level,
            health: this.getRandomInRange(monsterData.health_range),
            maxHealth: this.getRandomInRange(monsterData.health_range),
            attack: this.getRandomInRange(monsterData.attack_range),
            defense: this.getRandomInRange(monsterData.defense_range),
            exp: monsterData.exp,
            gold: monsterData.gold,
            image: monsterData.image
        };
        
        this.monster = monster;
        return monster;
    }
    
    /**
     * 获取范围内的随机数
     */
    getRandomInRange(range) {
        return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    }
    
    /**
     * 显示战斗屏幕
     */
    showBattleScreen() {
        // 获取DOM元素
        this.battleScreen = document.getElementById('battle-screen');
        this.mainScreen = document.getElementById('main-screen');
        this.monsterDisplay = document.getElementById('monster-display');
        this.playerHealthDisplay = document.getElementById('player-health-display');
        this.battleLogContent = document.getElementById('battle-log-content');
        this.questionContainer = document.getElementById('question-container');
        
        // 隐藏主屏幕，显示战斗屏幕
        this.mainScreen.classList.remove('active');
        this.battleScreen.classList.add('active');
        
        // 清空显示区域
        this.monsterDisplay.innerHTML = '';
        this.battleLogContent.innerHTML = '';
        this.playerHealthDisplay.innerHTML = '';
        this.questionContainer.innerHTML = '<h3>准备答题...</h3><p>点击"开始战斗"开始答题挑战！</p>';
        
        // 显示怪物信息
        this.updateMonsterDisplay();
        
        // 显示玩家信息
        this.updatePlayerDisplay();
        
        // 添加战斗日志
        this.addBattleLog(`你遇到了 ${this.monster.name}！`);
        this.addBattleLog(`${this.monster.name} 等级: ${this.monster.level} | 血量: ${this.monster.health}`);
        this.addBattleLog('-------------------------------');
        this.addBattleLog('请选择"开始战斗"进行战斗，或者"逃跑"返回地图选择。');

        // 设置默认语言
        this.questionSystem.setLanguage(this.gameData.language || "python");
    }
    
    /**
     * 更新怪物显示
     */
    updateMonsterDisplay() {
        if (!this.monster || !this.monsterDisplay) return;
        
        // 创建怪物图片
        const monsterImage = document.createElement('img');
        monsterImage.src = `assets/monster/${this.monster.image}`;
        monsterImage.alt = this.monster.name;
        monsterImage.style.maxHeight = '80px';
        
        // 创建怪物信息
        const monsterInfo = document.createElement('div');
        monsterInfo.className = 'monster-info-text';
        
        // 计算血量百分比
        const healthPercent = (this.monster.health / this.monster.maxHealth) * 100;
        
        // 低于20%时显示低血量警告效果
        const fillClass = healthPercent < 20 ? 'progress-fill low-health' : 'progress-fill';
        const barClass = healthPercent < 20 ? 'health-bar low-health' : 'health-bar';
        
        // 创建血条
        monsterInfo.innerHTML = `
            <h3>${this.monster.name} (Lv.${this.monster.level})</h3>
            <div class="${barClass}">
                <div class="${fillClass}" style="width: ${healthPercent}%"></div>
                <div class="progress-text">HP: ${this.monster.health}/${this.monster.maxHealth}</div>
            </div>
            <p>攻击: ${this.monster.attack} | 防御: ${this.monster.defense}</p>
        `;
        
        // 清空并添加新内容
        this.monsterDisplay.innerHTML = '';
        this.monsterDisplay.appendChild(monsterImage);
        this.monsterDisplay.appendChild(monsterInfo);
    }
    
    /**
     * 更新玩家显示
     */
    updatePlayerDisplay() {
        if (!this.playerHealthDisplay) return;
        
        let content = '';
        
        if (this.battleMode === 'single' && this.selectedStudent) {
            const student = this.selectedStudent;
            const healthPercent = (student.health / student.maxHealth) * 100;
            const fillClass = healthPercent < 20 ? 'progress-fill low-health' : 'progress-fill';
            const barClass = healthPercent < 20 ? 'health-bar low-health' : 'health-bar';
            
            content = `
                <h3>${student.name} (Lv.${student.level})</h3>
                <div class="${barClass}">
                    <div class="${fillClass}" style="width: ${healthPercent}%"></div>
                    <div class="progress-text">HP: ${student.health}/${student.maxHealth}</div>
                </div>
            `;
        } else {
            // 团队模式 - 显示所有学生的简要状态
            content = '<div class="team-health-overview">';
            this.gameData.students.forEach(student => {
                const healthPercent = (student.health / student.maxHealth) * 100;
                const fillClass = healthPercent < 20 ? 'progress-fill low-health' : 'progress-fill';
                const barClass = healthPercent < 20 ? 'health-bar mini low-health' : 'health-bar mini';
                
                content += `
                    <div class="team-member-health">
                        <span>${student.name}</span>
                        <div class="${barClass}">
                            <div class="${fillClass}" style="width: ${healthPercent}%"></div>
                            <div class="progress-text">${student.health}/${student.maxHealth}</div>
                        </div>
                    </div>
                `;
            });
            content += '</div>';
        }
        
        this.playerHealthDisplay.innerHTML = content;
    }
    
    /**
     * 添加战斗日志
     */
    addBattleLog(message) {
        if (!this.battleLogContent) return;
        
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        this.battleLogContent.appendChild(logEntry);
        
        // 自动滚动到底部
        this.battleLogContent.scrollTop = this.battleLogContent.scrollHeight;
    }
    
    /**
     * 开始战斗
     */
    startBattle() {
        console.log('开始战斗');
        
        // 播放战斗开始音效
        audioManager.playSFX('battle_start');
        
        if (this.battleStarted) {
            this.addBattleLog("战斗已经开始！");
            return;
        }
        this.battleStarted = true;
        this.battleMode = 'single';
        this.addBattleLog('默认个人模式');
        this.showStudentSelection();
    }
    
    /**
     * 显示学生选择界面（单人模式）
     */
    showStudentSelection() {
        // 创建学生选择模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // 添加标题和关闭按钮
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close-btn';
        closeSpan.innerHTML = '&times;';
        closeSpan.addEventListener('click', () => {
            modal.remove();
            this.battleStarted = false;
            this.showBattleScreen();
        });
        
        const title = document.createElement('h2');
        title.textContent = '选择单人战斗角色';
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 创建学生选择网格
        const studentsGrid = document.createElement('div');
        studentsGrid.className = 'team-grid';
        
        // 添加所有学生
        this.gameData.students.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'team-member';
            
            // 添加学生头像
            const studentImage = document.createElement('img');
            studentImage.src = student.image;
            studentImage.alt = student.name;
            studentCard.appendChild(studentImage);
            
            // 添加学生信息
            const studentName = document.createElement('h3');
            studentName.textContent = student.name;
            studentCard.appendChild(studentName);
            
            const studentLevel = document.createElement('p');
            studentLevel.textContent = `等级: ${student.level}`;
            studentCard.appendChild(studentLevel);
            
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
            studentCard.appendChild(healthBarContainer);
            
            // 添加选择按钮
            const selectBtn = document.createElement('button');
            selectBtn.className = 'member-btn';
            selectBtn.textContent = '选择';
            selectBtn.addEventListener('click', () => {
                this.selectedStudent = student;
                modal.remove();
                this.addBattleLog(`你选择了 ${student.name} 进行战斗。`);
                this.startQuestionBattle();
            });
            
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'member-buttons';
            buttonsDiv.appendChild(selectBtn);
            studentCard.appendChild(buttonsDiv);
            
            studentsGrid.appendChild(studentCard);
        });
        
        modalContent.appendChild(studentsGrid);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    /**
     * 开始问题挑战
     */
    startQuestionBattle() {
        this.addBattleLog('开始问题挑战！');
        
        // 获取适当等级的问题
        let questionLevel;
        
        if (this.battleMode === 'team') {
            // 团队模式下，取团队中最高等级
            const maxLevel = Math.max(...this.gameData.students.map(s => s.level));
            questionLevel = Math.min(maxLevel, 6);  // 最高6级问题
        } else {
            // 单人模式下，使用所选学生的等级
            questionLevel = Math.min(this.selectedStudent.level, 6);
        }
        
        // 清空问题容器，准备放置新问题
        if (this.questionContainer) {
            this.questionContainer.innerHTML = '<h3>正在准备问题...</h3>';
        }
        
        // 添加战斗中的逃跑按钮
        this.addBattleEscapeButton();
        
        // 使用问题系统显示问题，并处理答题结果
        this.questionSystem.showQuestion(questionLevel, (isCorrect) => {
            if (isCorrect) {
                this.addBattleLog('回答正确！');
                this.processBattleWin();
            } else {
                this.addBattleLog('回答错误！');
                this.processBattleLoss();
            }
        }, this.questionContainer); // 传入问题容器
    }
    
    /**
     * 添加战斗中的逃跑按钮
     */
    addBattleEscapeButton() {
        // 检查是否已经有逃跑按钮
        let escapeBtn = document.querySelector('.battle-escape-button');
        if (escapeBtn) {
            return; // 如果已存在则不添加
        }
        
        // 创建逃跑按钮
        escapeBtn = document.createElement('button');
        escapeBtn.className = 'battle-escape-button';
        escapeBtn.textContent = '尝试逃跑';
        escapeBtn.addEventListener('click', () => this.fleeBattle());
        
        // 添加到问题区域
        const questionArea = document.querySelector('.battle-question-area');
        if (questionArea) {
            questionArea.appendChild(escapeBtn);
        }
    }
    
    /**
     * 逃跑
     */
    fleeBattle() {
        console.log('逃离战斗');
        
        // 播放点击音效
        audioManager.playSFX('click');
        
        // 有20%概率逃跑失败
        const escapeChance = Math.random();
        
        if (escapeChance < 0.2) {
            this.addBattleLog('逃跑失败！');
            
            // 怪物造成伤害
            let damage = Math.max(1, this.monster.attack - 10);
            
            // 随机选择一个角色受到伤害
            const randomIndex = Math.floor(Math.random() * this.gameData.students.length);
            const randomStudent = this.gameData.students[randomIndex];
            
            randomStudent.health -= damage;
            randomStudent.health = Math.max(0, randomStudent.health);
            
            this.addBattleLog(`${this.monster.name} 对 ${randomStudent.name} 造成了 ${damage} 点伤害！`);
            
            // 更新玩家血量显示
            this.updatePlayerDisplay();
            
            // 检查是否死亡
            if (randomStudent.health <= 0) {
                this.addBattleLog(`${randomStudent.name} 被击倒了！`);
            }
            
            // 显示选择弹窗
            this.showBattleOptionsPopup('逃跑失败！', '怪物发现了你，是否继续战斗？');
        } else {
            this.addBattleLog('逃跑成功！');
            this.returnToMap();
        }
        
        // 返回主界面后恢复主题音乐
        audioManager.playMusic('main_theme', true);
    }
    
    /**
     * 显示战斗选择弹窗
     * @param {string} title - 弹窗标题
     * @param {string} message - 弹窗消息
     */
    showBattleOptionsPopup(title, message) {
        // 创建弹窗
        const popup = document.createElement('div');
        popup.className = 'battle-options-popup';
        
        // 设置内容
        popup.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="options-buttons">
                <button class="continue-btn">继续战斗</button>
                <button class="escape-btn">再次尝试逃跑</button>
            </div>
        `;
        
        // 添加按钮事件
        const continueBtn = popup.querySelector('.continue-btn');
        const escapeBtn = popup.querySelector('.escape-btn');
        
        continueBtn.addEventListener('click', () => {
            popup.remove();
            // 继续当前战斗/答题
            if (!this.questionContainer.querySelector('.question-content')) {
                this.startQuestionBattle();
            }
        });
        
        escapeBtn.addEventListener('click', () => {
            popup.remove();
            this.fleeBattle();
        });
        
        // 将弹窗添加到问题区域
        const questionArea = document.querySelector('.battle-question-area');
        if (questionArea) {
            questionArea.appendChild(popup);
        }
    }
    
    /**
     * 处理战斗胜利
     */
    processBattleWin() {
        // 怪物受到伤害
        let damage;
        
        if (this.battleMode === 'team') {
            // 团队模式下，取团队中所有学生的总攻击力
            damage = this.gameData.students.reduce((total, student) => {
                return total + (7 + student.level * 3 + this.getEquipmentAttack(student));
            }, 0);
        } else {
            // 单人模式下，使用所选学生的攻击力
            damage = 7 + this.selectedStudent.level * 3 + this.getEquipmentAttack(this.selectedStudent);
        }
        
        // 考虑怪物防御
        damage = Math.max(1, damage - this.monster.defense);
        
        // 怪物扣血
        this.monster.health -= damage;
        this.monster.health = Math.max(0, this.monster.health);
        
        this.addBattleLog(`你对 ${this.monster.name} 造成了 ${damage} 点伤害！`);
        
        // 更新怪物和玩家显示
        this.updateMonsterDisplay();
        this.updatePlayerDisplay();
        
        // 检查怪物是否死亡
        if (this.monster.health <= 0) {
            this.endBattle(true);
            return;
        }
        
        // 显示提示并继续下一题
        setTimeout(() => {
            // 自动进入下一题
            this.startQuestionBattle();
        }, 1000);
    }
    
    /**
     * 处理战斗失败
     */
    processBattleLoss() {
        // 角色受到伤害
        let damage = Math.max(1, this.monster.attack - 10); // 默认防御值为10
        let deadStudent = null;
        
        if (this.battleMode === 'team') {
            // 团队模式下，所有学生平分伤害
            const damagePerStudent = Math.ceil(damage / this.gameData.students.length);
            
            this.gameData.students.forEach(student => {
                student.health -= damagePerStudent;
                // 记录死亡的学生
                if (student.health <= 0) {
                    student.health = 0;
                    deadStudent = student;
                }
            });
            
            this.addBattleLog(`${this.monster.name} 对你的团队造成了 ${damage} 点伤害！`);
        } else {
            // 单人模式下，所选学生受到全部伤害
            this.selectedStudent.health -= damage;
            
            // 检查是否死亡
            if (this.selectedStudent.health <= 0) {
                this.selectedStudent.health = 0;
                deadStudent = this.selectedStudent;
            }
            
            this.addBattleLog(`${this.monster.name} 对 ${this.selectedStudent.name} 造成了 ${damage} 点伤害！`);
        }
        
        // 更新玩家显示
        this.updatePlayerDisplay();
        
        // 检查是否全员死亡
        if (this.checkTeamDeath()) {
            if (deadStudent) {
                this.addBattleLog(`${deadStudent.name} 被击倒了！`);
                // 显示复活选项
                this.showReviveOptions(deadStudent);
            } else {
                this.endBattle(false);
            }
            return;
        }
        
        // 若有角色死亡但团队未全灭，提示已有角色死亡
        if (deadStudent) {
            this.addBattleLog(`${deadStudent.name} 被击倒了！`);
        }
        
        // 显示提示并继续下一题
        setTimeout(() => {
            // 自动进入下一题
            this.startQuestionBattle();
        }, 1000);
    }
    
    /**
     * 显示复活选项
     * @param {Object} deadStudent - 死亡的学生对象
     */
    showReviveOptions(deadStudent) {
        // 创建复活选项弹窗
        const popup = document.createElement('div');
        popup.className = 'battle-options-popup';
        
        // 定义复活费用
        const reviveCost = 30;
        
        // 设置内容
        popup.innerHTML = `
            <h3>${deadStudent.name} 已经倒下！</h3>
            <p>是否花费 ${reviveCost} 金币复活？(当前金币: ${this.gameData.teamGold})</p>
            <div class="options-buttons">
                <button class="continue-btn" ${this.gameData.teamGold < reviveCost ? 'disabled style="opacity:0.5;"' : ''}>复活 (${reviveCost}金币)</button>
                <button class="escape-btn">退出战斗</button>
            </div>
        `;
        
        // 添加按钮事件
        const reviveBtn = popup.querySelector('.continue-btn');
        const exitBtn = popup.querySelector('.escape-btn');
        
        reviveBtn.addEventListener('click', () => {
            if (this.gameData.teamGold >= reviveCost) {
                // 扣除金币
                this.gameData.teamGold -= reviveCost;
                
                // 恢复角色生命值（恢复50%最大生命值）
                if (this.battleMode === 'team') {
                    this.gameData.students.forEach(student => {
                        if (student.health <= 0) {
                            student.health = Math.ceil(student.maxHealth * 0.5);
                        }
                    });
                } else {
                    this.selectedStudent.health = Math.ceil(this.selectedStudent.maxHealth * 0.5);
                }
                
                // 更新显示
                this.updatePlayerDisplay();
                this.addBattleLog(`${deadStudent.name} 被复活了！生命值恢复到了50%！`);
                
                // 移除弹窗
                popup.remove();
                
                // 继续战斗
                this.startQuestionBattle();
            } else {
                alert('金币不足，无法复活！');
            }
        });
        
        exitBtn.addEventListener('click', () => {
            popup.remove();
            this.endBattle(false);
        });
        
        // 将弹窗添加到问题区域
        const questionArea = document.querySelector('.battle-question-area');
        if (questionArea) {
            questionArea.appendChild(popup);
        }
    }
    
    /**
     * 检查团队是否全员死亡
     * @returns {boolean} 是否全员死亡
     */
    checkTeamDeath() {
        if (this.battleMode === 'team') {
            return this.gameData.students.every(student => student.health <= 0);
        } else {
            return this.selectedStudent.health <= 0;
        }
    }
    
    /**
     * 获取装备的总攻击力
     */
    getEquipmentAttack(student) {
        let attack = 0;
        
        // 检查武器
        if (student.weapon) {
            const weaponData = this.gameData.getEquipmentByName(student.weapon);
            if (weaponData) {
                attack += weaponData.attack;
            }
        }
        
        return attack;
    }
    
    /**
     * 结束战斗
     */
    endBattle(victory) {
        console.log(`战斗结束，胜利: ${victory}`);
        
        // 根据结果播放音效
        if (victory) {
            audioManager.playMusic('victory_theme');
        } else {
            // 失败时可能需要其他音效
        }
        
        this.battleResult = victory;
        
        // 清除战斗控制按钮
        const battleControls = document.querySelector('.battle-controls');
        battleControls.innerHTML = '';
        
        if (victory) {
            this.addBattleLog(`你击败了 ${this.monster.name}！`);
            
            // 获得经验和金币
            const expGained = this.monster.exp;
            const goldGained = this.monster.gold;
            
            if (this.battleMode === 'team') {
                // 团队模式下，所有学生分享经验和金币
                const expPerStudent = Math.floor(expGained / this.gameData.students.length);
                
                this.gameData.students.forEach(student => {
                    student.exp += expPerStudent;
                    this.checkLevelUp(student);
                });
                
                // 金币添加到团队金币
                this.gameData.teamGold += goldGained;
                
                this.addBattleLog(`每位成员获得了 ${expPerStudent} 点经验值！`);
            } else {
                // 单人模式下，所选学生获得全部经验和金币
                this.selectedStudent.exp += expGained;
                this.selectedStudent.gold += goldGained;
                this.checkLevelUp(this.selectedStudent);
                
                this.addBattleLog(`${this.selectedStudent.name} 获得了 ${expGained} 点经验值和 ${goldGained} 金币！`);
            }
            
            this.addBattleLog(`团队获得了 ${goldGained} 金币！`);
            
            // 随机获得装备
            this.tryGetRandomEquipment();
        } else {
            this.addBattleLog('战斗失败！');
        }
        
        // 添加返回按钮
        const returnBtn = document.createElement('button');
        returnBtn.textContent = '返回地图';
        returnBtn.addEventListener('click', () => {
            this.returnToMap();
        });
        
        battleControls.appendChild(returnBtn);
        
        // 延迟后切换回主音乐
        setTimeout(() => {
            audioManager.playMusic('main_theme', true);
        }, 3000);
    }
    
    /**
     * 检查等级提升
     */
    checkLevelUp(student) {
        const result = this.gameData.checkLevelUp(student);
        if (result) {
            this.addBattleLog(`${student.name} 升级了！当前等级: ${student.level}`);
            
            return true;
        }
        return false;
    }
    
    /**
     * 尝试随机获得装备
     */
    tryGetRandomEquipment() {
        // 获取怪物掉落装备的概率 (30%)
        const dropChance = 0.30;
        
        if (Math.random() < dropChance) {
            // 获取适合当前等级的装备
            const maxLevel = Math.max(...this.gameData.students.map(s => s.level));
            const validEquipment = this.gameData.getValidEquipmentForLevel(maxLevel);
            
            if (validEquipment.length > 0) {
                // 随机选择一个装备
                const randomIndex = Math.floor(Math.random() * validEquipment.length);
                const equipmentName = validEquipment[randomIndex];
                
                // 随机选择一个学生获得装备
                const randomStudent = this.gameData.students[Math.floor(Math.random() * this.gameData.students.length)];
                
                // 将装备添加到学生的背包中
                if (!randomStudent.backpack) {
                    randomStudent.backpack = [];
                }
                
                randomStudent.backpack.push(equipmentName);
                
                this.addBattleLog(`${randomStudent.name} 获得了装备: ${equipmentName}！`);
            }
        }
    }
    
    /**
     * 返回地图选择
     */
    returnToMap() {
        this.battleStarted = false;
        this.monster = null;
        this.selectedMap = null;
        
        // 切换回主屏幕
        this.battleScreen.classList.remove('active');
        this.mainScreen.classList.add('active');
        
        // 自动保存游戏
        this.gameData.saveGameData();
        
        // 更新主屏幕显示
        const event = new CustomEvent('battleCompleted');
        document.dispatchEvent(event);
        
        // 清理问题系统资源
        this.questionSystem.cleanup();
    }
}

// 将类导出到全局作用域
window.BattleSystem = BattleSystem;
