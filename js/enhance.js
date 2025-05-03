/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 强化系统 - 负责处理装备的强化升级
 */
class EnhanceSystem {
    constructor(gameData) {
        this.gameData = gameData;
        this.enhanceCost = {
            base: 50,   // 基础强化费用
            ratePerLevel: 1.5  // 每级强化费用增长率
        };
    }
    
    /**
     * 显示强化装备窗口
     * @param {Object} student - 要强化装备的学生
     */
    showEnhanceWindow(student) {
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // 添加标题和关闭按钮
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close-btn';
        closeSpan.innerHTML = '&times;';
        closeSpan.addEventListener('click', () => modal.remove());
        
        const title = document.createElement('h2');
        title.textContent = `${student.name} 的装备强化`;
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 显示当前金币
        const goldInfo = document.createElement('p');
        goldInfo.textContent = `当前金币: ${this.gameData.teamGold}`;
        goldInfo.style.color = '#F1C40F';  // 金色
        goldInfo.style.fontWeight = 'bold';
        modalContent.appendChild(goldInfo);
        
        // 创建装备选择区域
        this.createEquipmentSelection(modalContent, student);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'action-btn';
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => modal.remove());
        modalContent.appendChild(closeButton);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    /**
     * 创建装备选择区域
     * @param {Element} container - 容器元素
     * @param {Object} student - 学生对象
     */
    createEquipmentSelection(container, student) {
        // 获取学生的所有装备
        const equippedItems = [];
        
        // 定义装备槽位
        const equipmentSlots = [
            { id: 'weapon', name: '武器' },
            { id: 'armor', name: '护甲' },
            { id: 'gloves', name: '手套' },
            { id: 'pants', name: '裤子' },
            { id: 'shoes', name: '鞋子' }
        ];
        
        // 检查每个槽位是否有装备
        equipmentSlots.forEach(slot => {
            const equipmentName = student[slot.id];
            if (equipmentName) {
                const equipment = this.gameData.getEquipmentByName(equipmentName);
                if (equipment) {
                    equippedItems.push({
                        name: equipmentName,
                        data: equipment,
                        slot: slot.id,
                        slotName: slot.name
                    });
                }
            }
        });
        
        if (equippedItems.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '没有可强化的装备';
            container.appendChild(emptyMessage);
            return;
        }
        
        // 创建装备列表
        const equipmentList = document.createElement('div');
        equipmentList.className = 'equipment-grid';
        
        equippedItems.forEach(item => {
            // 获取当前强化等级
            const enhancedLevel = this.getEnhancedLevel(item.name);
            
            // 创建装备卡片
            const equipmentCard = document.createElement('div');
            equipmentCard.className = 'equipment-slot';
            
            // 显示装备图片
            const itemImage = document.createElement('img');
            itemImage.src = `assets/equipment/${item.data.image}`;
            itemImage.alt = item.name;
            itemImage.className = 'equipment-image';
            equipmentCard.appendChild(itemImage);
            
            // 显示装备名称和槽位
            const itemName = document.createElement('p');
            itemName.textContent = `${item.name} (${item.slotName})`;
            equipmentCard.appendChild(itemName);
            
            // 显示强化等级
            const levelText = document.createElement('p');
            levelText.textContent = `强化等级: +${enhancedLevel}`;
            levelText.style.color = enhancedLevel > 0 ? '#E74C3C' : '#7F8C8D';
            equipmentCard.appendChild(levelText);
            
            // 显示当前属性
            const currentStats = document.createElement('p');
            const enhancedAttack = this.calculateEnhancedStat(item.data.attack, enhancedLevel);
            const enhancedDefense = this.calculateEnhancedStat(item.data.defense, enhancedLevel);
            
            currentStats.textContent = `攻击: ${enhancedAttack} | 防御: ${enhancedDefense}`;
            equipmentCard.appendChild(currentStats);
            
            // 计算强化费用
            const enhanceCost = this.calculateEnhanceCost(enhancedLevel);
            
            // 显示强化后的属性
            const nextLevelStats = document.createElement('p');
            const nextLevelAttack = this.calculateEnhancedStat(item.data.attack, enhancedLevel + 1);
            const nextLevelDefense = this.calculateEnhancedStat(item.data.defense, enhancedLevel + 1);
            
            nextLevelStats.textContent = `强化后: 攻击 +${nextLevelAttack - enhancedAttack}, 防御 +${nextLevelDefense - enhancedDefense}`;
            nextLevelStats.style.color = '#3498DB'; // 蓝色
            equipmentCard.appendChild(nextLevelStats);
            
            // 显示强化费用
            const costText = document.createElement('p');
            costText.textContent = `强化费用: ${enhanceCost} 金币`;
            costText.style.color = this.gameData.teamGold >= enhanceCost ? '#2ECC71' : '#E74C3C';
            equipmentCard.appendChild(costText);
            
            // 添加强化按钮
            const enhanceBtn = document.createElement('button');
            enhanceBtn.className = 'action-btn';
            enhanceBtn.textContent = '强化';
            enhanceBtn.disabled = this.gameData.teamGold < enhanceCost;
            enhanceBtn.style.opacity = this.gameData.teamGold < enhanceCost ? '0.5' : '1';
            enhanceBtn.addEventListener('click', () => {
                // 尝试强化装备
                const success = this.enhanceEquipment(item.name);
                if (success) {
                    // 重新显示强化窗口
                    container.innerHTML = '';
                    container.appendChild(closeSpan);
                    container.appendChild(title);
                    
                    // 更新金币显示
                    goldInfo.textContent = `当前金币: ${this.gameData.teamGold}`;
                    container.appendChild(goldInfo);
                    
                    // 重新创建装备选择区域
                    this.createEquipmentSelection(container, student);
                    
                    // 添加关闭按钮
                    container.appendChild(closeButton);
                }
            });
            equipmentCard.appendChild(enhanceBtn);
            
            // 如果金币不足，添加提示
            if (this.gameData.teamGold < enhanceCost) {
                const warningText = document.createElement('p');
                warningText.textContent = '金币不足!';
                warningText.style.color = '#E74C3C';
                warningText.style.fontSize = '12px';
                equipmentCard.appendChild(warningText);
            }
            
            equipmentList.appendChild(equipmentCard);
        });
        
        container.appendChild(equipmentList);
    }
    
    /**
     * 获取装备的强化等级
     * @param {string} equipmentName - 装备名称
     * @returns {number} 强化等级
     */
    getEnhancedLevel(equipmentName) {
        if (!this.gameData.enhancedEquipment) {
            this.gameData.enhancedEquipment = {};
        }
        return this.gameData.enhancedEquipment[equipmentName] || 0;
    }
    
    /**
     * 计算强化后的属性值
     * @param {number} baseStat - 基础属性值
     * @param {number} level - 强化等级
     * @returns {number} 强化后的属性值
     */
    calculateEnhancedStat(baseStat, level) {
        return Math.floor(baseStat * (1 + level * 0.1));
    }
    
    /**
     * 计算强化费用
     * @param {number} currentLevel - 当前强化等级
     * @returns {number} 强化费用
     */
    calculateEnhanceCost(currentLevel) {
        return Math.floor(this.enhanceCost.base * Math.pow(this.enhanceCost.ratePerLevel, currentLevel));
    }
    
    /**
     * 强化装备
     * @param {string} equipmentName - 装备名称
     * @returns {boolean} 是否强化成功
     */
    enhanceEquipment(equipmentName) {
        // 获取当前强化等级
        const currentLevel = this.getEnhancedLevel(equipmentName);
        
        // 计算强化费用
        const enhanceCost = this.calculateEnhanceCost(currentLevel);
        
        // 检查金币是否足够
        if (this.gameData.teamGold < enhanceCost) {
            alert('金币不足，无法强化！');
            return false;
        }
        
        // 扣除金币
        this.gameData.teamGold -= enhanceCost;
        
        // 增加强化等级
        if (!this.gameData.enhancedEquipment) {
            this.gameData.enhancedEquipment = {};
        }
        this.gameData.enhancedEquipment[equipmentName] = currentLevel + 1;
        
        // 保存游戏数据
        this.gameData.saveGameData();
        
        return true;
    }
}

// 将类导出到全局作用域
window.EnhanceSystem = EnhanceSystem;
