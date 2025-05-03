/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 装备系统 - 负责处理装备的穿戴和卸下
 */
class EquipmentSystem {
    constructor(gameData) {
        this.gameData = gameData;
    }
    
    /**
     * 装备道具
     * @param {Object} student - 要装备的学生
     * @param {string} itemName - 要装备的道具名称
     * @returns {boolean} 是否装备成功
     */
    equipItem(student, itemName) {
        const equipment = this.gameData.getEquipmentByName(itemName);
        
        if (!equipment) {
            console.error(`装备不存在: ${itemName}`);
            return false;
        }
        
        // 检查装备是否在学生的背包中
        if (!student.backpack || !student.backpack.includes(itemName)) {
            console.error(`装备 ${itemName} 不在 ${student.name} 的背包中`);
            return false;
        }
        
        // 获取装备部位
        const part = equipment.part;
        
        // 卸下当前装备的道具（如果有）
        const currentEquipment = student[part];
        if (currentEquipment) {
            this.unequipItem(student, part);
        }
        
        // 装备新道具
        student[part] = itemName;
        
        // 从背包中移除道具
        const index = student.backpack.indexOf(itemName);
        student.backpack.splice(index, 1);
        
        // 如果装备是武器，更新学生的攻击和防御属性
        this.updateStudentStats(student);
        
        console.log(`${student.name} 装备了 ${itemName}`);
        return true;
    }
    
    /**
     * 卸下装备
     * @param {Object} student - 要卸下装备的学生
     * @param {string} part - 要卸下的装备部位
     * @returns {boolean} 是否卸下成功
     */
    unequipItem(student, part) {
        // 检查该部位是否有装备
        const currentEquipment = student[part];
        if (!currentEquipment) {
            console.error(`${student.name} 在 ${part} 部位没有装备`);
            return false;
        }
        
        // 确保学生有背包
        if (!student.backpack) {
            student.backpack = [];
        }
        
        // 将道具放回背包
        student.backpack.push(currentEquipment);
        
        // 卸下装备
        student[part] = null;
        
        // 更新学生的攻击和防御属性
        this.updateStudentStats(student);
        
        console.log(`${student.name} 卸下了 ${currentEquipment}`);
        return true;
    }
    
    /**
     * 更新学生的攻击和防御属性
     * @param {Object} student - 要更新属性的学生
     */
    updateStudentStats(student) {
        // 重置学生的装备属性
        student.weapon_attack = 0;
        student.weapon_defense = 0;
        
        // 获取所有可能的装备部位
        const parts = ['weapon', 'armor', 'gloves', 'pants', 'shoes'];
        
        // 遍历每个部位，累加装备属性
        for (const part of parts) {
            const equipmentName = student[part];
            if (equipmentName) {
                const equipment = this.gameData.getEquipmentByName(equipmentName);
                if (equipment) {
                    student.weapon_attack += equipment.attack || 0;
                    student.weapon_defense += equipment.defense || 0;
                }
            }
        }
    }
    
    /**
     * 获取装备部位的装备
     * @param {Object} student - 学生对象
     * @param {string} part - 装备部位
     * @returns {string|null} 装备名称或null
     */
    getEquipmentInSlot(student, part) {
        return student[part] || null;
    }
    
    /**
     * 获取学生的所有已装备物品
     * @param {Object} student - 学生对象
     * @returns {Object} 装备部位和装备名称的映射
     */
    getAllEquippedItems(student) {
        const equippedItems = {};
        const parts = ['weapon', 'armor', 'gloves', 'pants', 'shoes'];
        
        for (const part of parts) {
            if (student[part]) {
                equippedItems[part] = student[part];
            }
        }
        
        return equippedItems;
    }
    
    /**
     * 显示装备菜单，用于选择装备
     * @param {Object} student - 要装备的学生
     * @param {function} callback - 操作完成后的回调
     */
    showEquipmentMenu(student, callback) {
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
        closeSpan.addEventListener('click', () => {
            modal.remove();
            if (callback) callback();
        });
        
        const title = document.createElement('h2');
        title.textContent = `${student.name} 的装备菜单`;
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 创建当前装备区域
        const currentEquipmentSection = document.createElement('div');
        currentEquipmentSection.innerHTML = '<h3>当前装备</h3>';
        
        const currentEquipmentGrid = document.createElement('div');
        currentEquipmentGrid.className = 'equipment-grid';
        
        // 定义装备槽位
        const equipmentSlots = [
            { id: 'weapon', name: '武器' },
            { id: 'armor', name: '护甲' },
            { id: 'gloves', name: '手套' },
            { id: 'pants', name: '裤子' },
            { id: 'shoes', name: '鞋子' }
        ];
        
        // 为每个装备槽位创建一个单元格
        equipmentSlots.forEach(slot => {
            const equipmentSlot = document.createElement('div');
            equipmentSlot.className = 'equipment-slot';
            
            const slotName = document.createElement('h4');
            slotName.textContent = slot.name;
            equipmentSlot.appendChild(slotName);
            
            // 检查装备是否存在
            const equippedItem = student[slot.id];
            if (equippedItem) {
                const equipmentData = this.gameData.getEquipmentByName(equippedItem);
                if (equipmentData) {
                    // 显示装备图片
                    const itemImage = document.createElement('img');
                    itemImage.src = `assets/equipment/${equipmentData.image}`;
                    itemImage.alt = equippedItem;
                    itemImage.className = 'equipment-image';
                    equipmentSlot.appendChild(itemImage);
                    
                    // 显示装备名称和属性
                    const itemName = document.createElement('p');
                    itemName.textContent = equippedItem;
                    equipmentSlot.appendChild(itemName);
                    
                    const itemStats = document.createElement('p');
                    itemStats.textContent = `攻击: +${equipmentData.attack} | 防御: +${equipmentData.defense}`;
                    equipmentSlot.appendChild(itemStats);
                    
                    // 添加卸下按钮
                    const unequipBtn = document.createElement('button');
                    unequipBtn.className = 'action-btn';
                    unequipBtn.textContent = '卸下';
                    unequipBtn.addEventListener('click', () => {
                        this.unequipItem(student, slot.id);
                        // 重新显示装备菜单
                        modal.remove();
                        this.showEquipmentMenu(student, callback);
                    });
                    equipmentSlot.appendChild(unequipBtn);
                }
            } else {
                // 显示空槽位
                const emptyText = document.createElement('p');
                emptyText.textContent = '未装备';
                emptyText.className = 'empty-slot';
                equipmentSlot.appendChild(emptyText);
            }
            
            currentEquipmentGrid.appendChild(equipmentSlot);
        });
        
        currentEquipmentSection.appendChild(currentEquipmentGrid);
        modalContent.appendChild(currentEquipmentSection);
        
        // 创建背包区域
        const backpackSection = document.createElement('div');
        backpackSection.innerHTML = '<h3>背包中的装备</h3>';
        
        const backpackGrid = document.createElement('div');
        backpackGrid.className = 'backpack-grid';
        
        // 检查学生背包
        if (student.backpack && student.backpack.length > 0) {
            // 筛选出可装备的物品
            const equipableItems = student.backpack.filter(itemName => {
                const itemData = this.gameData.getEquipmentByName(itemName);
                return itemData !== undefined;
            });
            
            if (equipableItems.length > 0) {
                // 显示可装备物品
                equipableItems.forEach(itemName => {
                    const itemData = this.gameData.getEquipmentByName(itemName);
                    
                    const backpackItem = document.createElement('div');
                    backpackItem.className = 'backpack-item';
                    
                    // 显示物品图片
                    const itemImage = document.createElement('img');
                    itemImage.src = `assets/equipment/${itemData.image}`;
                    itemImage.alt = itemName;
                    itemImage.className = 'item-image';
                    backpackItem.appendChild(itemImage);
                    
                    // 显示物品名称和属性
                    const itemNameElem = document.createElement('p');
                    itemNameElem.textContent = itemName;
                    backpackItem.appendChild(itemNameElem);
                    
                    const itemStats = document.createElement('p');
                    itemStats.textContent = `攻击: +${itemData.attack} | 防御: +${itemData.defense}`;
                    backpackItem.appendChild(itemStats);
                    
                    // 添加装备按钮
                    const equipBtn = document.createElement('button');
                    equipBtn.className = 'action-btn';
                    equipBtn.textContent = '装备';
                    equipBtn.addEventListener('click', () => {
                        this.equipItem(student, itemName);
                        // 重新显示装备菜单
                        modal.remove();
                        this.showEquipmentMenu(student, callback);
                    });
                    backpackItem.appendChild(equipBtn);
                    
                    backpackGrid.appendChild(backpackItem);
                });
            } else {
                const emptyMessage = document.createElement('p');
                emptyMessage.textContent = '背包中没有可装备的物品';
                backpackSection.appendChild(emptyMessage);
            }
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '背包是空的';
            backpackSection.appendChild(emptyMessage);
        }
        
        backpackSection.appendChild(backpackGrid);
        modalContent.appendChild(backpackSection);
        
        // 添加属性总览
        const statsSection = document.createElement('div');
        statsSection.className = 'stats-section';
        statsSection.innerHTML = '<h3>属性总览</h3>';
        
        // 计算总属性
        const baseAttack = 7 + student.level * 3;
        const baseDefense = 10;
        const totalAttack = baseAttack + (student.weapon_attack || 0);
        const totalDefense = baseDefense + (student.weapon_defense || 0);
        
        const statsInfo = document.createElement('div');
        statsInfo.innerHTML = `
            <p>基础攻击力: ${baseAttack} + 装备加成: ${student.weapon_attack || 0} = 总攻击力: ${totalAttack}</p>
            <p>基础防御力: ${baseDefense} + 装备加成: ${student.weapon_defense || 0} = 总防御力: ${totalDefense}</p>
        `;
        statsSection.appendChild(statsInfo);
        
        modalContent.appendChild(statsSection);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'action-btn';
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => {
            modal.remove();
            if (callback) callback();
        });
        modalContent.appendChild(closeButton);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
}

// 将类导出到全局作用域
window.EquipmentSystem = EquipmentSystem;
