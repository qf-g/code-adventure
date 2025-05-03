/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 游戏数据管理器 - 负责加载和保存游戏数据
 */
class GameData {
    constructor(saveName) {
        console.log('GameData constructor:', saveName);
        // 存档名称
        this.saveName = saveName || 'default';
        
        // 初始化团队金币
        this.teamGold = 0;
        
        // 初始化装备强化数据
        this.enhancedEquipment = {};
        
        // 语言设置
        this.language = 'python';
        
        // 地图数据
        this.maps = [
            {
                name: "风原旷野",
                levelRange: [1, 5],
                image: "assets/maps/风原旷野.png",
                description: "初学者友好的区域，适合刚开始编程冒险的新手"
            },
            {
                name: "影歌古林",
                levelRange: [6, 10],
                image: "assets/maps/影歌古林.png",
                description: "有些挑战的森林区域，对基础知识有一定要求"
            },
            {
                name: "晶簇深渊",
                levelRange: [11, 15],
                image: "assets/maps/晶簇深渊.png",
                description: "神秘的洞穴系统，充满了更复杂的编程谜题"
            },
            {
                name: "幽影泥沼",
                levelRange: [16, 20],
                image: "assets/maps/幽影泥沼.png",
                description: "危险的沼泽地带，需要扎实的编程基础才能通过"
            },
            {
                name: "熔核裂谷",
                levelRange: [21, 25],
                image: "assets/maps/熔核裂谷.png",
                description: "炽热的火山地带，考验高级编程技巧"
            },
            {
                name: "怒涛回廊",
                levelRange: [26, 30],
                image: "assets/maps/怒涛回廊.png",
                description: "最终挑战区域，只有精通编程的冒险者才能征服"
            }
        ];
        
        // 加载所有数据
        this.loadAllData();
    }
    
    /**
     * 加载所有游戏数据
     */
    async loadAllData() {
        try {
            // 加载学生数据
            this.students = await this.loadStudents();
            
            // 加载装备数据
            this.equipmentData = await this.loadEquipmentData();
            
            // 加载怪物数据
            this.monsters = await this.loadMonsterData();
            
            // 加载存档数据
            await this.loadSaveData();
            
            // 加载问题数据
            this.questions = await this.loadQuestionData();
            
            // 新增：打印前十道题到控制台
            console.log('题库已加载，汇总统计:');
            if (this.questions) {
                // 打印每种语言的题目总数
                Object.entries(this.questions).forEach(([lang, langBank]) => {
                    let total = 0;
                    Object.values(langBank).forEach(list => total += (Array.isArray(list) ? list.length : 0));
                    console.log(`${lang}语言题库共有 ${total} 道题目`);
                });
                
                // 合并所有题目并打印前十个
                const allQuestions = [];
                Object.values(this.questions).forEach(langBank => {
                    Object.values(langBank).forEach(list => {
                        if (Array.isArray(list)) {
                            allQuestions.push(...list);
                        } else {
                            console.warn('题库结构异常，预期是数组但获得:', typeof list, list);
                        }
                    });
                });
                
                console.log(`合并后题库共有 ${allQuestions.length} 道题`);
                console.log('示例前十题:');
                for (let i = 0; i < 10 && i < allQuestions.length; i++) {
                    console.log(`题目 ${i+1}:`, allQuestions[i]);
                }
            }
            
            // 触发数据加载完成事件
            const event = new CustomEvent('dataLoaded');
            document.dispatchEvent(event);
        } catch (error) {
            console.error('加载游戏数据失败:', error);
        }
    }
    
    /**
     * 加载学生数据
     * @returns {Promise<Array>} 学生数据数组
     */
    async loadStudents() {
        try {
            // 检查本地存储中是否有已保存的学生数据
            const savedData = this.loadFromLocalStorage(`re0-students-${this.saveName}`);
            if (savedData) {
                console.log('从本地存储加载学生数据');
                return savedData;
            }

            // 如果没有保存的数据，则创建默认学生数据
            console.log('创建默认学生数据');
            return [
                {
                    name: "初学者",
                    level: 1,
                    exp: 0,
                    health: 100,
                    maxHealth: 100,
                    gold: 50,
                    backpack: ["木剑"],
                    weapon: null,
                    armor: null,
                    gloves: null,
                    pants: null,
                    shoes: null,
                    weapon_attack: 0,
                    weapon_defense: 0,
                    image: "assets/characters/boy.png"
                },
                {
                    name: "菜鸟程序员",
                    level: 1,
                    exp: 0,
                    health: 110,
                    maxHealth: 110,
                    gold: 30,
                    backpack: ["法杖"],
                    weapon: null,
                    armor: null,
                    gloves: null,
                    pants: null,
                    shoes: null,
                    weapon_attack: 0,
                    weapon_defense: 0,
                    image: "assets/characters/girl.png"
                }
            ];
        } catch (error) {
            console.error('加载学生数据失败:', error);
            return [];
        }
    }
    
    /**
     * 加载装备数据
     * @returns {Promise<Object>} 装备数据对象
     */
    async loadEquipmentData() {
        console.log('GameData.loadEquipmentData invoked with saveName:', this.saveName);
        try {
            // 修改: 从js/data目录加载JSON文件
            const data = await Utils.loadJSON('js/data/equipment.json');
            console.log('装备数据加载成功', data);
            return data;
        } catch (error) {
            console.error('加载装备数据失败:', error);
            // 显示错误信息到UI
            if (window.sceneManager) {
                window.sceneManager.showNotification(`装备数据加载失败: ${error.message}`, 'error');
            }
            // 返回空对象，表示无数据
            return {};
        }
    }
    
    /**
     * 加载怪物数据
     * @returns {Promise<Object>} 怪物数据对象
     */
    async loadMonsterData() {
        try {
            // 修改: 从js/data目录加载JSON文件
            const data = await Utils.loadJSON('js/data/monsters.json');
            console.log('怪物数据加载成功');
            return data;
        } catch (error) {
            console.error('加载怪物数据失败:', error);
            // 显示错误信息到UI
            if (window.sceneManager) {
                window.sceneManager.showNotification(`怪物数据加载失败: ${error.message}`, 'error');
            }
            // 返回空对象，表示无数据
            return {};
        }
    }
    
    /**
     * 加载问题数据
     * @returns {Promise<Object>} 问题数据对象
     */
    async loadQuestionData() {
        try {
            // 直接从 JSON 文件加载
            console.log('开始加载题库...');
            
            // 尝试加载Python题库
            let pythonQuestions = {};
            try {
                // 修改: 从js/data目录加载JSON文件
                pythonQuestions = await Utils.loadJSON('js/data/python.json');
                console.log('Python题库加载结果:', pythonQuestions);
                
                // 检查题库数据有效性
                if (Object.keys(pythonQuestions).length === 0) {
                    throw new Error('Python题库为空');
                }
                
                console.log('Python题库包含级别:', Object.keys(pythonQuestions));
                
                // 检查每个级别的题目数量
                Object.entries(pythonQuestions).forEach(([level, questions]) => {
                    if (Array.isArray(questions)) {
                        console.log(`Python Level ${level}: ${questions.length} 道题目`);
                    }
                });
            } catch (pythonError) {
                console.error('Python题库加载失败:', pythonError);
                if (window.sceneManager) {
                    window.sceneManager.showNotification(`Python题库加载失败: ${pythonError.message}`, 'error');
                }
            }
            
            // 尝试加载C++题库
            let cppQuestions = {};
            try {
                // 修改: 从js/data目录加载JSON文件
                cppQuestions = await Utils.loadJSON('js/data/cpp.json');
                console.log('C++题库加载结果:', cppQuestions);
                
                // 检查题库数据
                if (Object.keys(cppQuestions).length === 0) {
                    console.warn('C++题库为空');
                } else {
                    console.log('C++题库包含级别:', Object.keys(cppQuestions));
                }
            } catch (cppError) {
                console.error('C++题库加载失败:', cppError);
                if (window.sceneManager) {
                    window.sceneManager.showNotification(`C++题库加载失败: ${cppError.message}`, 'warning');
                }
            }
            
            return {
                "python": pythonQuestions,
                "cpp": cppQuestions  // 修改: 键名从"c++"改为"cpp"
            };
        } catch (error) {
            console.error('加载问题数据失败:', error);
            if (window.sceneManager) {
                window.sceneManager.showNotification(`题库加载总体失败: ${error.message}`, 'error');
            }
            return { "python": {}, "cpp": {} };  // 修改: 键名从"c++"改为"cpp"
        }
    }
    
    /**
     * 加载存档数据
     */
    async loadSaveData() {
        // 加载团队金币
        this.teamGold = this.loadFromLocalStorage(`re0-teamgold-${this.saveName}`) || 100;
        
        // 加载装备强化数据
        this.enhancedEquipment = this.loadFromLocalStorage(`re0-enhanced-${this.saveName}`) || {};
        
        // 加载语言设置
        this.language = this.loadFromLocalStorage(`re0-language-${this.saveName}`) || this.language;
        
        // 加载任务数据
        this.quests = this.loadFromLocalStorage(`re0-quests-${this.saveName}`) || [];
    }
    
    /**
     * 从LocalStorage加载数据
     * @param {string} key - 存储键值
     * @returns {any} 加载的数据或null
     */
    loadFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error(`解析LocalStorage数据失败: ${key}`, e);
                return null;
            }
        }
        return null;
    }
    
    /**
     * 保存数据到LocalStorage
     * @param {string} key - 存储键值
     * @param {any} data - 要保存的数据
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`保存数据到LocalStorage失败: ${key}`, e);
        }
    }
    
    /**
     * 保存游戏数据
     */
    saveGameData() {
        console.log('保存游戏数据...');
        
        // 保存学生数据
        this.saveToLocalStorage(`re0-students-${this.saveName}`, this.students);
        
        // 保存团队金币
        this.saveToLocalStorage(`re0-teamgold-${this.saveName}`, this.teamGold);
        
        // 保存装备强化数据
        this.saveToLocalStorage(`re0-enhanced-${this.saveName}`, this.enhancedEquipment);
        
        // 保存语言设置
        this.saveToLocalStorage(`re0-language-${this.saveName}`, this.language);
        
        // 保存任务数据
        this.saveToLocalStorage(`re0-quests-${this.saveName}`, this.quests);
        
        console.log('游戏数据保存成功');
        return true;
    }
    
    /**
     * 根据名称获取装备数据
     * @param {string} name - 装备名称
     * @returns {Object|undefined} 装备数据对象
     */
    getEquipmentByName(name) {
        return this.equipmentData[name];
    }
    
    /**
     * 根据名称获取怪物数据
     * @param {string} name - 怪物名称
     * @returns {Object|undefined} 怪物数据对象
     */
    getMonsterByName(name) {
        return this.monsters[name];
    }
    
    /**
     * 获取特定地图可出现的怪物列表
     * @param {Array<number>} levelRange - 等级范围 [最小等级, 最大等级]
     * @returns {Array<string>} 怪物名称数组
     */
    getValidMonstersForMap(levelRange) {
        if (!this.monsters) return [];
        
        return Object.entries(this.monsters)
            .filter(([_, data]) => 
                data.level >= levelRange[0] && data.level <= levelRange[1]
            )
            .map(([name, _]) => name);
    }
    
    /**
     * 获取适合特定等级的装备列表
     * @param {number} level - 角色等级
     * @returns {Array<string>} 装备名称数组
     */
    getValidEquipmentForLevel(level) {
        if (!this.equipmentData) return [];
        
        return Object.entries(this.equipmentData)
            .filter(([_, data]) => data.difficulty <= level)
            .map(([name, _]) => name);
    }
    
    /**
     * 检查并处理等级提升
     * @param {Object} student - 学生对象
     * @returns {boolean} 是否升级
     */
    checkLevelUp(student) {
        const requiredExp = student.level * 100;
        if (student.exp >= requiredExp) {
            student.exp -= requiredExp;
            student.level += 1;
            student.maxHealth = student.level * 100;  // 更新最大生命值
            student.health = student.maxHealth;  // 升级时恢复满血
            return true;
        }
        return false;
    }
}

// 将类导出到全局作用域
window.GameData = GameData;
