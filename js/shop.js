/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 商店系统 - 负责处理装备和物品的购买
 */
class ShopSystem {
    constructor(gameData) {
        this.gameData = gameData;
        this.shopDiscount = 0.9;  // 商店折扣，90%的原价
        this.currentModal = null; // 跟踪当前打开的模态窗口
    }
    
    /**
     * 打开商店
     */
    openShop() {
        // 关闭之前可能存在的商店窗口
        this.closeShop();
        
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
        closeSpan.addEventListener('click', () => this.closeShop());
        
        const title = document.createElement('h2');
        title.textContent = '冒险者商店';
        
        modalContent.appendChild(closeSpan);
        modalContent.appendChild(title);
        
        // 显示当前金币
        const goldInfo = document.createElement('p');
        goldInfo.textContent = `当前团队金币: ${this.gameData.teamGold}`;
        goldInfo.style.color = '#F1C40F';  // 金色
        goldInfo.style.fontWeight = 'bold';
        modalContent.appendChild(goldInfo);
        
        // 创建商店物品区域
        this.createShopItems(modalContent);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'action-btn';
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => this.closeShop());
        modalContent.appendChild(closeButton);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 保存当前模态窗口引用
        this.currentModal = modal;
    }
    
    /**
     * 关闭商店
     */
    closeShop() {
        // 移除当前模态窗口（如果存在）
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
        
        // 检查并移除其他可能存在的商店相关弹窗
        document.querySelectorAll('.modal').forEach(modal => {
            // 检查是否包含商店相关内容
            if (modal.querySelector('.modal-content')?.querySelector('h2')?.textContent.includes('商店') ||
                modal.querySelector('.modal-content')?.querySelector('h2')?.textContent.includes('确认购买')) {
                modal.remove();
            }
        });
    }
    
    /**
     * 创建商店物品
     * @param {Element} container - 容器元素
     */
    createShopItems(container) {
        // 获取所有团队成员的最高等级
        const maxLevel = Math.max(...this.gameData.students.map(s => s.level));
        
        // 创建恢复道具区域
        const potionSectionTitle = document.createElement('h3');
        potionSectionTitle.textContent = '恢复道具';
        container.appendChild(potionSectionTitle);
        
        // 创建回血药
        const potionContainer = document.createElement('div');
        potionContainer.className = 'potions-grid';
        
        const healingPotion = {
            name: '回血药水',
            price: 10,
            effect: '恢复100点生命值',
            image: 'healing_potion.png',  // 确保有这个图片或替换为实际图片
            description: '由炼金术师特制，带有甜甜的草莓味'
        };
        
        const potionCard = document.createElement('div');
        potionCard.className = 'equipment-slot';
        
        // 显示药水图片
        const potionImage = document.createElement('img');
        potionImage.src = `assets/items/${healingPotion.image}`;
        potionImage.alt = healingPotion.name;
        potionImage.className = 'equipment-image';
        potionImage.onerror = () => {
            // 如果图片加载失败，显示默认图像
            potionImage.src = 'assets/items/default_potion.png';
        };
        potionCard.appendChild(potionImage);
        
        // 显示药水名称
        const potionName = document.createElement('p');
        potionName.textContent = healingPotion.name;
        potionName.style.fontWeight = 'bold';
        potionCard.appendChild(potionName);
        
        // 显示药水效果
        const potionEffect = document.createElement('p');
        potionEffect.textContent = healingPotion.effect;
        potionCard.appendChild(potionEffect);
        
        // 显示药水价格
        const priceText = document.createElement('p');
        priceText.textContent = `价格: ${healingPotion.price} 金币`;
        priceText.style.color = this.gameData.teamGold >= healingPotion.price ? '#2ECC71' : '#E74C3C';
        potionCard.appendChild(priceText);
        
        // 添加购买按钮
        const buyButton = document.createElement('button');
        buyButton.className = 'action-btn';
        buyButton.textContent = '购买';
        buyButton.disabled = this.gameData.teamGold < healingPotion.price;
        buyButton.style.opacity = this.gameData.teamGold < healingPotion.price ? '0.5' : '1';
        buyButton.addEventListener('click', () => {
            this.showPotionBuyConfirmation(healingPotion, container);
        });
        potionCard.appendChild(buyButton);
        
        potionContainer.appendChild(potionCard);
        container.appendChild(potionContainer);
        
        // 添加分隔线
        const divider = document.createElement('hr');
        divider.style.margin = '20px 0';
        divider.style.borderTop = '1px solid #eee';
        container.appendChild(divider);
        
        // 获取等级适合的装备
        const availableEquipment = [];
        for (const [name, data] of Object.entries(this.gameData.equipmentData)) {
            if (data.difficulty <= maxLevel * 1.5) {  // 允许购买高1.5倍等级的装备
                availableEquipment.push({
                    name,
                    data
                });
            }
        }
        
        if (availableEquipment.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = '没有适合等级的装备出售';
            container.appendChild(emptyMessage);
            return;
        }
        
        // 创建标签
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = '可购买的装备';
        container.appendChild(sectionTitle);
        
        // 创建装备列表
        const equipmentGrid = document.createElement('div');
        equipmentGrid.className = 'equipment-grid';
        
        // 对装备进行排序，按照难度（等级要求）
        availableEquipment.sort((a, b) => a.data.difficulty - b.data.difficulty);
        
        availableEquipment.forEach(item => {
            // 创建装备卡片
            const equipmentCard = document.createElement('div');
            equipmentCard.className = 'equipment-slot';
            
            // 显示装备图片
            const itemImage = document.createElement('img');
            itemImage.src = `assets/equipment/${item.data.image}`;
            itemImage.alt = item.name;
            itemImage.className = 'equipment-image';
            equipmentCard.appendChild(itemImage);
            
            // 显示装备名称
            const itemName = document.createElement('p');
            itemName.textContent = item.name;
            itemName.style.fontWeight = 'bold';
            equipmentCard.appendChild(itemName);
            
            // 显示装备类型
            const itemType = document.createElement('p');
            itemType.textContent = `类型: ${this.getPartTranslation(item.data.part)}`;
            equipmentCard.appendChild(itemType);
            
            // 显示装备属性
            const itemStats = document.createElement('p');
            itemStats.textContent = `攻击: ${item.data.attack} | 防御: ${item.data.defense}`;
            equipmentCard.appendChild(itemStats);
            
            // 显示等级要求
            const levelReq = document.createElement('p');
            levelReq.textContent = `等级要求: ${item.data.difficulty}`;
            levelReq.style.color = maxLevel >= item.data.difficulty ? '#2ECC71' : '#E74C3C';
            equipmentCard.appendChild(levelReq);
            
            // 显示价格
            const price = Math.floor(item.data.shop_price * this.shopDiscount);
            const priceText = document.createElement('p');
            priceText.textContent = `价格: ${price} 金币`;
            priceText.style.color = this.gameData.teamGold >= price ? '#2ECC71' : '#E74C3C';
            equipmentCard.appendChild(priceText);
            
            // 添加购买按钮
            const buyButton = document.createElement('button');
            buyButton.className = 'action-btn';
            buyButton.textContent = '购买';
            buyButton.disabled = this.gameData.teamGold < price;
            buyButton.style.opacity = this.gameData.teamGold < price ? '0.5' : '1';
            buyButton.addEventListener('click', () => {
                this.showBuyConfirmation(item.name, price, container, closeButton);
            });
            equipmentCard.appendChild(buyButton);
            
            equipmentGrid.appendChild(equipmentCard);
        });
        
        container.appendChild(equipmentGrid);
    }
    
    /**
     * 获取部位翻译
     * @param {string} part - 部位英文名
     * @returns {string} 部位中文名
     */
    getPartTranslation(part) {
        const partMap = {
            'weapon': '武器',
            'armor': '护甲',
            'gloves': '手套',
            'pants': '裤子',
            'shoes': '鞋子'
        };
        
        return partMap[part] || part;
    }
    
    /**
     * 显示购买确认窗口
     * @param {string} itemName - 物品名称
     * @param {number} price - 价格
     * @param {Element} container - 容器元素
     * @param {Element} closeButton - 关闭按钮
     */
    showBuyConfirmation(itemName, price, container, closeButton) {
        // 保存当前内容
        const currentContent = container.innerHTML;
        
        // 清空容器
        container.innerHTML = '';
        
        // 添加确认标题
        const confirmTitle = document.createElement('h2');
        confirmTitle.textContent = '确认购买';
        container.appendChild(confirmTitle);
        
        // 显示物品信息
        const itemData = this.gameData.getEquipmentByName(itemName);
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-confirmation';
        
        // 显示物品图片
        if (itemData && itemData.image) {
            const itemImage = document.createElement('img');
            itemImage.src = `assets/equipment/${itemData.image}`;
            itemImage.alt = itemName;
            itemImage.className = 'equipment-image';
            itemInfo.appendChild(itemImage);
        }
        
        // 显示物品名称和价格
        const infoText = document.createElement('div');
        infoText.innerHTML = `
            <h3>${itemName}</h3>
            <p>价格: ${price} 金币</p>
            <p>类型: ${this.getPartTranslation(itemData.part)}</p>
            <p>攻击: ${itemData.attack} | 防御: ${itemData.defense}</p>
        `;
        itemInfo.appendChild(infoText);
        
        container.appendChild(itemInfo);
        
        // 显示选择学生提示
        const selectPrompt = document.createElement('p');
        selectPrompt.textContent = '选择要将装备放入哪个学生的背包:';
        container.appendChild(selectPrompt);
        
        // 显示学生选择列表
        const studentList = document.createElement('div');
        studentList.className = 'student-selection';
        
        this.gameData.students.forEach(student => {
            const studentOption = document.createElement('div');
            studentOption.className = 'student-option';
            
            // 显示学生头像
            const studentImage = document.createElement('img');
            studentImage.src = student.image;
            studentImage.alt = student.name;
            studentOption.appendChild(studentImage);
            
            // 显示学生名称
            const studentName = document.createElement('p');
            studentName.textContent = student.name;
            studentOption.appendChild(studentName);
            
            // 添加点击事件
            studentOption.addEventListener('click', () => {
                // 购买物品
                if (this.buyEquipment(itemName, price, student)) {
                    this.showPurchaseSuccess(
                        container,
                        '购买成功',
                        `<h3>购买成功!</h3>
                        <p>${itemName} 已放入 ${student.name} 的背包中!</p>`
                    );
                }
            });
            
            studentList.appendChild(studentOption);
        });
        
        container.appendChild(studentList);
        
        // 添加取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.className = 'action-btn';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', () => {
            // 恢复原始内容
            container.innerHTML = currentContent;
        });
        
        container.appendChild(cancelButton);
    }
    
    /**
     * 显示药水购买确认窗口
     * @param {Object} potion - 药水信息对象
     * @param {Element} container - 容器元素
     */
    showPotionBuyConfirmation(potion, container) {
        // 保存当前内容
        const currentContent = container.innerHTML;
        
        // 清空容器
        container.innerHTML = '';
        
        // 添加确认标题
        const confirmTitle = document.createElement('h2');
        confirmTitle.textContent = '确认购买';
        container.appendChild(confirmTitle);
        
        // 显示物品信息
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-confirmation';
        
        // 显示物品图片
        const itemImage = document.createElement('img');
        itemImage.src = `assets/items/${potion.image}`;
        itemImage.alt = potion.name;
        itemImage.className = 'equipment-image';
        itemImage.onerror = () => {
            itemImage.src = 'assets/items/default_potion.png';
        };
        itemInfo.appendChild(itemImage);
        
        // 显示物品名称和价格
        const infoText = document.createElement('div');
        infoText.innerHTML = `
            <h3>${potion.name}</h3>
            <p>价格: ${potion.price} 金币</p>
            <p>效果: ${potion.effect}</p>
            <p class="item-desc">${potion.description}</p>
        `;
        itemInfo.appendChild(infoText);
        
        container.appendChild(itemInfo);
        
        // 显示选择学生提示
        const selectPrompt = document.createElement('p');
        selectPrompt.textContent = '选择要使用药水的学生:';
        container.appendChild(selectPrompt);
        
        // 显示学生选择列表
        const studentList = document.createElement('div');
        studentList.className = 'student-selection';
        
        this.gameData.students.forEach(student => {
            const studentOption = document.createElement('div');
            studentOption.className = 'student-option';
            
            // 显示学生头像
            const studentImage = document.createElement('img');
            studentImage.src = student.image;
            studentImage.alt = student.name;
            studentOption.appendChild(studentImage);
            
            // 显示学生名称和生命值
            const studentInfo = document.createElement('div');
            studentInfo.innerHTML = `
                <p>${student.name}</p>
                <p>生命值: ${student.health}/${student.maxHealth}</p>
            `;
            studentOption.appendChild(studentInfo);
            
            // 如果学生已满血，灰色显示
            if (student.health >= student.maxHealth) {
                studentOption.style.opacity = '0.5';
                studentInfo.innerHTML += '<p class="full-hp">已满血</p>';
            } else {
                // 添加点击事件
                studentOption.addEventListener('click', () => {
                    // 购买药水并使用
                    if (this.buyAndUsePotion(potion, student)) {
                        this.showPurchaseSuccess(
                            container,
                            '购买成功',
                            `<h3>购买成功!</h3>
                            <p>${student.name} 使用了 ${potion.name}，恢复了100点生命值!</p>
                            <p>当前生命值: ${student.health}/${student.maxHealth}</p>`
                        );
                    }
                });
            }
            
            studentList.appendChild(studentOption);
        });
        
        container.appendChild(studentList);
        
        // 添加取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.className = 'action-btn';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', () => {
            // 恢复原始内容
            container.innerHTML = currentContent;
        });
        
        container.appendChild(cancelButton);
    }
    
    /**
     * 显示购买成功界面，并提供返回商店选项
     * @param {Element} container - 容器元素
     * @param {string} title - 标题文本
     * @param {string} message - 成功消息
     */
    showPurchaseSuccess(container, title, message) {
        // 清空容器
        container.innerHTML = '';
        
        // 添加标题
        const successTitle = document.createElement('h2');
        successTitle.textContent = title;
        container.appendChild(successTitle);
        
        // 显示当前金币
        const goldInfo = document.createElement('p');
        goldInfo.textContent = `当前团队金币: ${this.gameData.teamGold}`;
        goldInfo.style.color = '#F1C40F';  // 金色
        goldInfo.style.fontWeight = 'bold';
        container.appendChild(goldInfo);
        
        // 显示成功消息
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = message;
        container.appendChild(successMessage);
        
        // 添加返回按钮
        const backButton = document.createElement('button');
        backButton.className = 'action-btn';
        backButton.textContent = '返回商店';
        backButton.addEventListener('click', () => {
            // 关闭并重新打开商店
            this.openShop();
        });
        
        container.appendChild(backButton);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'action-btn';
        closeButton.style.marginLeft = '10px';
        closeButton.textContent = '关闭商店';
        closeButton.addEventListener('click', () => this.closeShop());
        container.appendChild(closeButton);
    }
    
    /**
     * 购买并使用药水
     * @param {Object} potion - 药水信息对象
     * @param {Object} student - 学生对象
     * @returns {boolean} 是否购买成功
     */
    buyAndUsePotion(potion, student) {
        // 检查金币是否足够
        if (this.gameData.teamGold < potion.price) {
            alert('金币不足，无法购买！');
            return false;
        }
        
        // 检查角色是否满血
        if (student.health >= student.maxHealth) {
            alert('该角色已满血，不需要恢复！');
            return false;
        }
        
        // 扣除金币
        this.gameData.teamGold -= potion.price;
        
        // 恢复生命值
        student.health += 100;
        if (student.health > student.maxHealth) {
            student.health = student.maxHealth;
        }
        
        // 保存游戏数据
        this.gameData.saveGameData();
        
        // 如果是在模态窗口中
        if (this.currentModal?.querySelector('.modal-content')) {
            const container = this.currentModal.querySelector('.modal-content');
            this.showPurchaseSuccess(
                container,
                '购买成功',
                `<h3>购买成功!</h3>
                <p>${student.name} 使用了 ${potion.name}，恢复了100点生命值!</p>
                <p>当前生命值: ${student.health}/${student.maxHealth}</p>`
            );
        }
        
        return true;
    }
    
    /**
     * 购买装备
     * @param {string} itemName - 装备名称
     * @param {number} price - 价格
     * @param {Object} student - 学生对象
     * @returns {boolean} 是否购买成功
     */
    buyEquipment(itemName, price, student) {
        // 检查金币是否足够
        if (this.gameData.teamGold < price) {
            alert('金币不足，无法购买！');
            return false;
        }
        
        // 确保学生有背包
        if (!student.backpack) {
            student.backpack = [];
        }
        
        // 添加到学生背包
        student.backpack.push(itemName);
        
        // 扣除金币
        this.gameData.teamGold -= price;
        
        // 保存游戏数据
        this.gameData.saveGameData();
        
        // 如果是在模态窗口中
        if (this.currentModal?.querySelector('.modal-content')) {
            const container = this.currentModal.querySelector('.modal-content');
            this.showPurchaseSuccess(
                container,
                '购买成功',
                `<h3>购买成功!</h3>
                <p>${itemName} 已放入 ${student.name} 的背包中!</p>`
            );
        }
        
        return true;
    }
}

// 将类导出到全局作用域
window.ShopSystem = ShopSystem;
