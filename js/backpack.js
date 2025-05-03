/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 背包系统 - 负责管理玩家背包
 */
class BackpackSystem {
    constructor(gameData) {
        this.gameData = gameData;
    }
    
    /**
     * 向学生背包中添加物品
     * @param {Object} student - 学生对象
     * @param {string} itemName - 物品名称
     * @returns {boolean} 是否添加成功
     */
    addItem(student, itemName) {
        // 确保学生有背包
        if (!student.backpack) {
            student.backpack = [];
        }
        
        // 将物品添加到背包
        student.backpack.push(itemName);
        console.log(`${itemName} 已添加到 ${student.name} 的背包`);
        return true;
    }
    
    /**
     * 从学生背包中移除物品
     * @param {Object} student - 学生对象
     * @param {string} itemName - 物品名称
     * @returns {boolean} 是否移除成功
     */
    removeItem(student, itemName) {
        // 检查学生是否有背包
        if (!student.backpack || student.backpack.length === 0) {
            console.error(`${student.name} 的背包是空的`);
            return false;
        }
        
        // 查找物品索引
        const index = student.backpack.indexOf(itemName);
        if (index === -1) {
            console.error(`${itemName} 不在 ${student.name} 的背包中`);
            return false;
        }
        
        // 移除物品
        student.backpack.splice(index, 1);
        console.log(`${itemName} 已从 ${student.name} 的背包中移除`);
        return true;
    }
    
    /**
     * 显示学生背包
     * @param {Object} student - 学生对象
     */
    showBackpack(student) {
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
        title.textContent = `${student.name} 的背包`;
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 创建背包内容区域
        const backpackContent = document.createElement('div');
        backpackContent.className = 'backpack-contents';
        
        // 检查背包是否为空
        if (!student.backpack || student.backpack.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '背包是空的';
            backpackContent.appendChild(emptyMessage);
        } else {
            // 创建物品网格
            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'backpack-grid';
            
            // 按物品类型分类显示
            const equipmentItems = [];
            const otherItems = [];
            
            // 将物品分类
            student.backpack.forEach(itemName => {
                const equipmentData = this.gameData.getEquipmentByName(itemName);
                if (equipmentData) {
                    equipmentItems.push({ name: itemName, data: equipmentData });
                } else {
                    otherItems.push(itemName);
                }
            });
            
            // 显示装备物品
            if (equipmentItems.length > 0) {
                const equipmentSection = document.createElement('div');
                equipmentSection.innerHTML = '<h3>装备物品</h3>';
                
                equipmentItems.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'backpack-item';
                    
                    // 显示物品图片
                    const itemImage = document.createElement('img');
                    itemImage.src = `assets/equipment/${item.data.image}`;
                    itemImage.alt = item.name;
                    itemImage.className = 'item-image';
                    itemElement.appendChild(itemImage);
                    
                    // 显示物品名称和属性
                    const itemNameElem = document.createElement('p');
                    itemNameElem.textContent = item.name;
                    itemElement.appendChild(itemNameElem);
                    
                    const itemStats = document.createElement('p');
                    itemStats.textContent = `攻击: +${item.data.attack} | 防御: +${item.data.defense}`;
                    itemElement.appendChild(itemStats);
                    
                    // 添加装备按钮
                    const equipBtn = document.createElement('button');
                    equipBtn.className = 'action-btn';
                    equipBtn.textContent = '装备';
                    equipBtn.addEventListener('click', () => {
                        // 使用装备系统来装备物品
                        if (window.equipmentSystem) {
                            window.equipmentSystem.equipItem(student, item.name);
                            // 重新显示背包
                            modal.remove();
                            this.showBackpack(student);
                        }
                    });
                    itemElement.appendChild(equipBtn);
                    
                    // 添加丢弃按钮
                    const discardBtn = document.createElement('button');
                    discardBtn.className = 'action-btn';
                    discardBtn.textContent = '丢弃';
                    discardBtn.addEventListener('click', () => {
                        if (confirm(`确定要丢弃 ${item.name} 吗？`)) {
                            this.removeItem(student, item.name);
                            // 重新显示背包
                            modal.remove();
                            this.showBackpack(student);
                        }
                    });
                    itemElement.appendChild(discardBtn);
                    
                    itemsGrid.appendChild(itemElement);
                });
                
                equipmentSection.appendChild(itemsGrid);
                backpackContent.appendChild(equipmentSection);
            }
            
            // 显示其他物品
            if (otherItems.length > 0) {
                const otherSection = document.createElement('div');
                otherSection.innerHTML = '<h3>其他物品</h3>';
                
                const otherItemsList = document.createElement('ul');
                otherItems.forEach(itemName => {
                    const listItem = document.createElement('li');
                    listItem.textContent = itemName;
                    
                    // 添加使用和丢弃按钮
                    const buttonGroup = document.createElement('div');
                    buttonGroup.className = 'item-buttons';
                    
                    const useBtn = document.createElement('button');
                    useBtn.className = 'action-btn';
                    useBtn.textContent = '使用';
                    useBtn.addEventListener('click', () => {
                        alert(`使用 ${itemName}`); // 这里可以添加使用物品的逻辑
                    });
                    buttonGroup.appendChild(useBtn);
                    
                    const discardBtn = document.createElement('button');
                    discardBtn.className = 'action-btn';
                    discardBtn.textContent = '丢弃';
                    discardBtn.addEventListener('click', () => {
                        if (confirm(`确定要丢弃 ${itemName} 吗？`)) {
                            this.removeItem(student, itemName);
                            // 重新显示背包
                            modal.remove();
                            this.showBackpack(student);
                        }
                    });
                    buttonGroup.appendChild(discardBtn);
                    
                    listItem.appendChild(buttonGroup);
                    otherItemsList.appendChild(listItem);
                });
                
                otherSection.appendChild(otherItemsList);
                backpackContent.appendChild(otherSection);
            }
        }
        
        modalContent.appendChild(backpackContent);
        
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
     * 将物品从一个学生的背包转移到另一个学生的背包
     * @param {Object} fromStudent - 物品来源学生
     * @param {Object} toStudent - 物品目标学生
     * @param {string} itemName - 物品名称
     * @returns {boolean} 是否成功转移
     */
    transferItem(fromStudent, toStudent, itemName) {
        // 检查源学生是否拥有该物品
        if (!fromStudent.backpack || !fromStudent.backpack.includes(itemName)) {
            console.error(`${itemName} 不在 ${fromStudent.name} 的背包中`);
            return false;
        }
        
        // 从源学生背包中移除物品
        if (!this.removeItem(fromStudent, itemName)) {
            return false;
        }
        
        // 添加到目标学生的背包
        if (!this.addItem(toStudent, itemName)) {
            // 如果添加失败，将物品归还给源学生
            this.addItem(fromStudent, itemName);
            return false;
        }
        
        console.log(`${itemName} 已从 ${fromStudent.name} 转移到 ${toStudent.name}`);
        return true;
    }
}

// 将类导出到全局作用域
window.BackpackSystem = BackpackSystem;
