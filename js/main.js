/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 主游戏脚本 - 负责游戏初始化和界面控制
 */
console.log('main.js loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    // 游戏状态变量
    let gameState = {
        initialized: false,
        currentScreen: 'start-screen',
        selectedLanguage: null,
        gameData: null, // 将在初始化后存储GameData实例
        battleSystem: null, // 战斗系统实例
        equipmentSystem: null, // 装备系统实例
        backpackSystem: null, // 背包系统实例
        enhanceSystem: null, // 强化系统实例
        shopSystem: null, // 商店系统实例
        questSystem: null, // 任务系统实例
        questionSystem: null, // 问题系统实例
        sceneManager: null, // 场景管理器实例
    };

    /**
     * 预加载游戏资源
     */
    async function preloadResources() {
        // 显示加载屏幕
        loadingScreen.show('加载游戏资源中...');
        
        try {
            // 模拟资源加载进度
            for (let i = 0; i <= 100; i += 5) {
                await new Promise(resolve => setTimeout(resolve, 50));
                loadingScreen.showWithProgress(i, '初始化游戏资源...');
            }
            
            // 完成加载后，隐藏加载屏幕
            loadingScreen.hide();
            
            // 播放背景音乐
            audioManager.playMusic('main_theme', true);
            
            return true;
        } catch (error) {
            console.error('资源预加载失败:', error);
            loadingScreen.hide();
            return false;
        }
    }

    // DOM元素引用
    const screens = {
        start: document.getElementById('start-screen'),
        main: document.getElementById('main-screen'),
        battle: document.getElementById('battle-screen')
    };
    
    const languageButtons = document.querySelectorAll('.language-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const saveNameInput = document.getElementById('save-name');
    
    // 地图和团队状态容器
    const mapContainer = document.getElementById('map-container');
    const teamMembersContainer = document.getElementById('team-members');
    const teamGoldValue = document.getElementById('team-gold-value');
    
    // 战斗相关元素
    const monsterDisplay = document.getElementById('monster-display');
    const battleLogContent = document.getElementById('battle-log-content');
    const startBattleBtn = document.getElementById('start-battle-btn');
    // 移除已经不存在的flee-battle-btn的引用
    
    // 商店和任务按钮
    const shopBtn = document.getElementById('shop-btn');
    const questBtn = document.getElementById('quest-btn');

    /**
     * 渲染本地存档列表
     */
    function renderSaveList() {
        const list = document.getElementById('save-list');
        list.innerHTML = '';
        const saves = new Set();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const match = key.match(/^re0-students-(.+)$/);
            if (match) saves.add(match[1]);
        }
        saves.forEach(name => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = name;
            btn.addEventListener('click', () => {
                saveNameInput.value = name;
                startGame();
            });
            li.appendChild(btn);
            list.appendChild(li);
        });
    }

    /**
     * 初始化游戏
     */
    async function initGame() {
        // 预加载资源
        await preloadResources();
        renderSaveList();
        
        // 设置语言按钮事件
        languageButtons.forEach(button => {
            button.addEventListener('click', () => selectLanguage(button.dataset.language));
        });
        
        // 设置开始游戏按钮事件
        startGameBtn.addEventListener('click', startGame);
        
        // 设置商店和任务按钮事件
        shopBtn.addEventListener('click', () => {
            if (gameState.shopSystem) {
                gameState.shopSystem.openShop();
                audioManager.playSFX('click');
            }
        });
        
        questBtn.addEventListener('click', () => {
            if (gameState.questSystem) {
                gameState.questSystem.openQuestWindow();
                audioManager.playSFX('click');
            }
        });
        
        // 设置战斗按钮事件
        startBattleBtn.addEventListener('click', () => {
            if (gameState.battleSystem) {
                // 播放战斗开始音效
                audioManager.playSFX('battle_start');
                gameState.battleSystem.startBattle();
                audioManager.playSFX('click');
            }
        });
        
        // 移除对已经不存在的flee-battle-btn的事件绑定
        
        // 设置设置按钮事件
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (window.settingsManager) {
                    window.settingsManager.showSettingsPanel();
                    audioManager.playSFX('click');
                }
            });
        }
        
        // 初始化场景管理器
        gameState.sceneManager = null;
        
        // 添加数据加载完成事件监听
        document.addEventListener('dataLoaded', () => {
            console.log('Game data loaded');
            initGameSystems();
            
            // 初始化场景管理器
            gameState.sceneManager = new SceneManager(gameState.gameData);
            
            // 更新团队状态和地图
            updateTeamStatus();
            renderMapSelection();
            gameState.initialized = true;
            
            // 播放背景音乐（如果尚未播放）
            if (audioManager.currentMusic === null) {
                audioManager.playMusic('main_theme');
            }
        });
    }

    /**
     * 选择编程语言
     */
    function selectLanguage(language) {
        // 播放点击音效
        audioManager.playSFX('click');
        
        // 移除其他按钮的选中状态
        languageButtons.forEach(btn => btn.classList.remove('selected'));
        
        // 添加当前按钮的选中状态
        const selectedBtn = document.querySelector(`.language-btn[data-language="${language}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            gameState.selectedLanguage = language;
            console.log(`Selected language: ${language}`);
        }
    }

    /**
     * 开始游戏
     */
    async function startGame() {
        // 播放点击音效
        audioManager.playSFX('click');
        
        const saveName = saveNameInput.value.trim();
        if (!saveName) {
            if (gameState.sceneManager) {
                gameState.sceneManager.showNotification('请输入存档名称！', 'error');
            } else {
                alert('请输入存档名称！');
            }
            return;
        }
        
        // 显示加载画面
        loadingScreen.show('正在加载游戏数据...');
        
        // 创建游戏数据管理器（自动加载存档时包含已保存的 language）
        gameState.gameData = new GameData(saveName);
        
        // 切换到主游戏界面（数据加载完成后自动触发）
        if (gameState.sceneManager) {
            gameState.sceneManager.switchTo('main');
        } else {
            switchScreen('start-screen', 'main-screen');
        }
    }

    /**
     * 显示加载中信息
     */
    function showLoadingMessage() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.textContent = '正在加载游戏数据...';
        loadingMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
        `;
        document.body.appendChild(loadingMessage);
        
        // 数据加载完成后移除加载信息
        document.addEventListener('dataLoaded', () => {
            loadingMessage.remove();
        }, { once: true });
    }
    
    /**
     * 尝试播放背景音乐
     */
    function tryPlayBackgroundMusic() {
        const bgm = document.getElementById('bgm-main');
        if (bgm) {
            // 设置音量为50%
            bgm.volume = 0.5;
            
            // 用户交互后播放音乐
            document.addEventListener('click', () => {
                if (bgm.paused) {
                    bgm.play().catch(err => console.log('无法播放背景音乐:', err));
                }
            }, { once: true });
        }
    }

    /**
     * 初始化游戏系统
     */
    function initGameSystems() {
        // 初始化各个游戏系统
        gameState.battleSystem = new BattleSystem(gameState.gameData);
        gameState.equipmentSystem = new EquipmentSystem(gameState.gameData);
        gameState.backpackSystem = new BackpackSystem(gameState.gameData);
        gameState.enhanceSystem = new EnhanceSystem(gameState.gameData);
        gameState.shopSystem = new ShopSystem(gameState.gameData);
        gameState.questSystem = new QuestSystem(gameState.gameData);
        gameState.questionSystem = new QuestionSystem(gameState.gameData);
        
        // 设置问题系统语言
        gameState.questionSystem.setLanguage(gameState.gameData.language || "python");
        
        // 隐藏加载画面
        loadingScreen.hide();
        
        // 显示欢迎信息
        if (gameState.sceneManager) {
            gameState.sceneManager.showNotification('游戏数据加载完成！', 'success');
        }
    }

    /**
     * 切换游戏界面
     */
    function switchScreen(fromId, toId) {
        const fromScreen = document.getElementById(fromId);
        const toScreen = document.getElementById(toId);
        
        if (fromScreen && toScreen) {
            fromScreen.classList.remove('active');
            toScreen.classList.add('active');
            gameState.currentScreen = toId;
            console.log(`Screen switched from ${fromId} to ${toId}`);
        }
    }

    /**
     * 更新团队状态
     */
    function updateTeamStatus() {
        if (!gameState.gameData) return;
        
        // 更新团队金币显示
        teamGoldValue.textContent = gameState.gameData.teamGold;
        
        // 清空当前团队成员显示
        teamMembersContainer.innerHTML = '';
        
        // 添加所有团队成员
        gameState.gameData.students.forEach(student => {
            const memberElement = createTeamMemberElement(student);
            teamMembersContainer.appendChild(memberElement);
        });
    }

    /**
     * 渲染地图选择界面
     */
    function renderMapSelection() {
        if (!gameState.gameData) return;
        
        // 清空地图容器
        mapContainer.innerHTML = '';
        
        // 添加CSS类使布局为每行3个，共2行
        mapContainer.className = 'maps-grid three-columns';
        
        // 添加所有地图
        gameState.gameData.maps.forEach(map => {
            const mapCard = document.createElement('div');
            mapCard.className = 'map-card';
            
            // 添加地图图片
            const mapImage = document.createElement('img');
            mapImage.src = map.image;
            mapImage.alt = map.name;
            mapCard.appendChild(mapImage);
            
            // 创建地图信息容器
            const mapInfo = document.createElement('div');
            mapInfo.className = 'map-info';
            
            // 添加地图名称
            const mapName = document.createElement('h3');
            mapName.textContent = map.name;
            mapInfo.appendChild(mapName);
            
            // 添加地图等级范围
            const mapLevel = document.createElement('p');
            mapLevel.textContent = `等级: ${map.levelRange[0]}-${map.levelRange[1]}`;
            mapInfo.appendChild(mapLevel);
            
            // 添加地图描述（如果有）
            if (map.description) {
                const mapDesc = document.createElement('p');
                mapDesc.className = 'map-description';
                mapDesc.textContent = map.description;
                mapInfo.appendChild(mapDesc);
            }
            
            mapCard.appendChild(mapInfo);
            
            // 添加点击事件
            mapCard.addEventListener('click', () => {
                if (gameState.battleSystem) {
                    gameState.battleSystem.selectMap(map);
                    // 进入战斗界面时切换为战斗音乐
                    audioManager.playMusic('battle_theme', true);
                }
            });
            
            mapContainer.appendChild(mapCard);
        });
    }

    /**
     * 创建团队成员元素
     * @param {Object} student - 学生对象
     * @returns {HTMLElement} 团队成员元素
     */
    function createTeamMemberElement(student) {
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
        detailsButton.addEventListener('click', () => showStudentDetails(student));
        
        const backpackButton = document.createElement('button');
        backpackButton.className = 'member-btn';
        backpackButton.textContent = '背包';
        backpackButton.addEventListener('click', () => {
            if (gameState.backpackSystem) {
                gameState.backpackSystem.showBackpack(student);
                audioManager.playSFX('click');
            }
        });
        
        buttonsDiv.appendChild(detailsButton);
        buttonsDiv.appendChild(backpackButton);
        memberDiv.appendChild(buttonsDiv);

        // 添加鼠标悬停效果
        memberDiv.addEventListener('mouseenter', () => {
            memberDiv.style.transform = 'translateY(-5px)';
            memberDiv.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            memberDiv.style.backgroundColor = '#FFE4E1';
        });
        
        memberDiv.addEventListener('mouseleave', () => {
            memberDiv.style.transform = '';
            memberDiv.style.boxShadow = '';
            memberDiv.style.backgroundColor = '';
        });
        
        return memberDiv;
    }

    /**
     * 显示学生详情
     * @param {Object} student - 学生对象
     */
    function showStudentDetails(student) {
        // 播放点击音效
        audioManager.playSFX('click');
        
        // 创建模态窗口
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // 添加关闭按钮
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        });
        modalContent.appendChild(closeBtn);
        
        // 创建详情内容区域
        const detailsContent = document.createElement('div');
        detailsContent.className = 'student-details';
        modalContent.appendChild(detailsContent);
        
        // 添加学生信息
        const studentInfo = document.createElement('div');
        studentInfo.className = 'student-info';
        
        // 添加头像和基本信息
        studentInfo.innerHTML = `
            <div class="student-header">
                <img src="${student.image}" alt="${student.name}" class="student-avatar">
                <div class="student-basic-info">
                    <h2>${student.name}</h2>
                    <p>等级: ${student.level}</p>
                    <p>金币: ${student.gold || 0}</p>
                </div>
            </div>
            
            <div class="student-stats">
                <div class="progress-bar health-bar">
                    <div class="progress-fill" style="width: ${student.health / student.maxHealth * 100}%"></div>
                    <div class="progress-text">生命: ${student.health}/${student.maxHealth}</div>
                </div>
                
                <div class="progress-bar exp-bar">
                    <div class="progress-fill" style="width: ${student.exp / (student.level * 100) * 100}%"></div>
                    <div class="progress-text">经验: ${student.exp}/${student.level * 100}</div>
                </div>
            </div>
        `;
        detailsContent.appendChild(studentInfo);
        
        // 添加装备信息
        const equipmentSection = document.createElement('div');
        equipmentSection.className = 'equipment-section';
        equipmentSection.innerHTML = '<h3>装备信息</h3>';
        
        // 创建装备网格
        const equipmentGrid = document.createElement('div');
        equipmentGrid.className = 'equipment-grid';
        
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
                const equipmentData = gameState.gameData.getEquipmentByName(equippedItem);
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
                }
            } else {
                // 显示空槽位
                const emptyText = document.createElement('p');
                emptyText.textContent = '未装备';
                emptyText.className = 'empty-slot';
                equipmentSlot.appendChild(emptyText);
            }
            
            equipmentGrid.appendChild(equipmentSlot);
        });
        
        equipmentSection.appendChild(equipmentGrid);
        
        // 添加强化按钮
        const enhanceButton = document.createElement('button');
        enhanceButton.textContent = '强化装备';
        enhanceButton.className = 'action-btn';
        enhanceButton.addEventListener('click', () => {
            // 关闭详情窗口
            modal.style.display = 'none';
            // 打开强化界面
            if (gameState.enhanceSystem) {
                gameState.enhanceSystem.showEnhanceWindow(student);
                audioManager.playSFX('click');
            }
        });
        
        equipmentSection.appendChild(enhanceButton);
        detailsContent.appendChild(equipmentSection);
        
        // 添加总属性信息
        const totalStatsSection = document.createElement('div');
        totalStatsSection.className = 'total-stats-section';
        
        // 计算总攻击和防御
        let totalAttack = 7 + student.level * 3; // 基础攻击
        let totalDefense = 10; // 基础防御
        
        // 添加装备属性
        equipmentSlots.forEach(slot => {
            const equippedItem = student[slot.id];
            if (equippedItem) {
                const equipmentData = gameState.gameData.getEquipmentByName(equippedItem);
                if (equipmentData) {
                    totalAttack += equipmentData.attack || 0;
                    totalDefense += equipmentData.defense || 0;
                }
            }
        });
        
        // 检查强化属性
        if (gameState.gameData.enhancedEquipment) {
            equipmentSlots.forEach(slot => {
                const equippedItem = student[slot.id];
                if (equippedItem) {
                    const enhanceLevel = gameState.gameData.enhancedEquipment[equippedItem] || 0;
                    if (enhanceLevel > 0) {
                        const equipmentData = gameState.gameData.getEquipmentByName(equippedItem);
                        if (equipmentData) {
                            // 强化每级增加基础属性10%
                            totalAttack += Math.floor(equipmentData.attack * enhanceLevel * 0.1);
                            totalDefense += Math.floor(equipmentData.defense * enhanceLevel * 0.1);
                        }
                    }
                }
            });
        }
        
        totalStatsSection.innerHTML = `
            <h3>总属性</h3>
            <p>攻击力: ${totalAttack}</p>
            <p>防御力: ${totalDefense}</p>
        `;
        
        detailsContent.appendChild(totalStatsSection);
        
        // 组装并显示模态窗口
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    /**
     * 设置保存游戏的事件监听器
     */
    function setupSaveGameListener() {
        // 监听页面关闭事件
        window.addEventListener('beforeunload', (event) => {
            if (gameState.gameData && gameState.initialized) {
                gameState.gameData.saveGameData();
            }
        });

        // 设置定期自动保存
        setInterval(() => {
            if (gameState.gameData && gameState.initialized) {
                gameState.gameData.saveGameData();
                gameState.sceneManager.showNotification('游戏数据已自动保存', 'info');
            }
        }, 300000); // 每5分钟保存一次
    }

    /**
     * 播放音效
     * @param {string} id - 音效ID
     */
    function playSoundEffect(id) {
        audioManager.playSFX(id);
    }

    // 绑定全局辅助函数
    window.showStudentDetails = showStudentDetails;
    window.playSoundEffect = playSoundEffect;

    // 初始化游戏
    initGame().then(() => {
        setupSaveGameListener();
    });
});
