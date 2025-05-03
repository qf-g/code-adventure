/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 问题模块 - 负责处理游戏中的问答挑战
 */
class QuestionSystem {
    constructor(gameData) {
        console.log('QuestionSystem constructor invoked, gameData.questions:', gameData && gameData.questions);
        this.gameData = gameData;
        this.language = gameData ? gameData.language : "python";
        this.questionLevel = 1;
        this.currentQuestion = null;
        // 初始化题库
        this.initQuestionBank();
    }

    /**
     * 初始化题库数据
     */
    initQuestionBank() {
        if (this.gameData && this.gameData.questions) {
            this.questionBank = this.gameData.questions;
        } else {
            console.error("无法加载题库：缺少 gameData.questions");
            this.questionBank = { "python": {}, "cpp": {} };  // 修改: 键名从"c++"改为"cpp"
        }
    }

    /**
     * 设置当前编程语言
     * @param {string} language - 编程语言
     */
    setLanguage(language) {
        this.language = language.toLowerCase();
    }
    
    /**
     * 设置问题等级
     * @param {number} level - 问题等级
     */
    setQuestionLevel(level) {
        this.questionLevel = level;
    }
    
    /**
     * 获取随机问题
     * @returns {Object|null} 问题对象
     */
    getRandomQuestion() {
        // 确保题库已初始化
        if (!this.questionBank) {
            this.initQuestionBank();
        }
        
        // 获取当前语言的题库
        const languageQuestions = this.questionBank[this.language];
        if (!languageQuestions) {
            console.error(`未找到${this.language}的题库`);
            return null;
        }
        
        // 获取当前等级的题目，如果没有则尝试取第1级题目
        let questions = languageQuestions[this.questionLevel];
        if (!questions || questions.length === 0) {
            questions = languageQuestions["1"];
            if (!questions || questions.length === 0) {
                console.error(`未找到等级${this.questionLevel}或默认等级的题目`);
                return null;
            }
            console.warn(`未找到等级${this.questionLevel}的题目，使用默认题目`);
        }
        
        // 随机选择一道题
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
    }
    
    /**
     * 显示问题，并处理用户回答
     * @param {number} level - 问题等级
     * @param {function} callback - 答题结果回调，参数为是否回答正确(boolean)
     * @param {Element} container - 可选，问题显示的容器元素
     */
    showQuestion(level, callback, container = null) {
        console.log('QuestionSystem.showQuestion invoked, level:', level);
        // 确保题库已初始化
        this.initQuestionBank();

        // 设置问题等级
        this.setQuestionLevel(level);
        this.questionCallback = callback;
        
        // 获取随机问题
        const question = this.getRandomQuestion();
        if (!question) {
            console.error('无法获取问题：题库为空或加载失败');
            alert('无法获取题库，请检查网络或服务器状态');
            if (callback) callback(false);
            return;
        }
        this.currentQuestion = question;
        
        // 创建问题内容
        const questionContent = document.createElement('div');
        questionContent.className = 'question-content';
        
        // 添加题目标题和编程语言
        const questionHeader = document.createElement('div');
        questionHeader.className = 'question-header';
        
        const questionTitle = document.createElement('h3');
        questionTitle.textContent = `${this.language.toUpperCase()} 问题 (Level ${level})`;
        questionHeader.appendChild(questionTitle);
        questionContent.appendChild(questionHeader);
        
        // 添加题目内容
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = this.formatQuestionText(question.question);
        questionContent.appendChild(questionText);
        
        // 添加选项
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'question-options';
        
        if (question.options && question.options.length > 0) {
            // 多选题
            question.options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.dataset.option = option.charAt(0); // 取选项的第一个字符作为选项值
                
                optionBtn.addEventListener('click', () => {
                    this.checkAnswer(optionBtn.dataset.option);
                    
                    // 如果在容器内，则清空容器内容
                    if (container) {
                        container.innerHTML = '<h3>答题完成</h3><p>正在计算结果...</p>';
                    }
                });
                
                optionsContainer.appendChild(optionBtn);
            });
        } else {
            // 没有选项，创建简单的A/B/C/D按钮
            ['A', 'B', 'C', 'D'].forEach(option => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.dataset.option = option;
                
                optionBtn.addEventListener('click', () => {
                    this.checkAnswer(option);
                    
                    // 如果在容器内，则清空容器内容并显示加载中
                    if (container) {
                        container.innerHTML = '<h3>答题完成</h3><p>正在计算结果...</p><div class="loading-spinner"></div>';
                    }
                });
                
                optionsContainer.appendChild(optionBtn);
            });
        }
        
        questionContent.appendChild(optionsContainer);
        
        // 添加计时器（如果需要）
        const timerContainer = document.createElement('div');
        timerContainer.className = 'question-timer';
        timerContainer.textContent = '剩余时间：30秒';
        questionContent.appendChild(timerContainer);
        
        // 如果提供了容器，则在容器内显示问题
        if (container) {
            container.innerHTML = '';
            container.appendChild(questionContent);
        } else {
            // 否则创建模态窗口
            const modal = document.createElement('div');
            modal.className = 'modal question-modal';
            modal.style.display = 'block';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.appendChild(questionContent);
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 记录模态窗口以便稍后清理
            this.questionModal = modal;
        }
        
        // 设置计时器（可选）
        let timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            if (timerContainer) {
                timerContainer.textContent = `剩余时间：${timeLeft}秒`;
                
                // 当时间少于10秒时，添加警告样式
                if (timeLeft <= 10) {
                    timerContainer.style.color = '#f44336';
                    timerContainer.style.fontWeight = 'bold';
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.checkAnswer(null); // 超时，自动提交空答案
                
                // 清理UI
                if (this.questionModal) {
                    this.questionModal.remove();
                    this.questionModal = null;
                } else if (container) {
                    container.innerHTML = '<h3>时间到！</h3><p>未能在规定时间内作答</p>';
                }
            }
        }, 1000);
        
        // 存储计时器引用，以便在cleanup时清除
        this.questionTimer = timer;
    }
    
    /**
     * 检查答案是否正确
     * @param {string} answer - 用户选择的答案
     */
    checkAnswer(answer) {
        // 清除计时器
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        if (!this.currentQuestion) return;
        
        const correctAnswer = this.currentQuestion.answer;
        const isCorrect = answer === correctAnswer;
        
        // 播放音效
        if (window.audioManager) {
            if (isCorrect) {
                window.audioManager.playSFX('correct_answer');
            } else {
                window.audioManager.playSFX('wrong_answer');
            }
        }
        
        // 调用回调函数
        if (this.questionCallback) {
            this.questionCallback(isCorrect);
        }
        
        this.currentQuestion = null;
    }
    
    /**
     * 格式化问题文本
     * @param {string} text - 原始文本
     * @returns {string} 格式化后的HTML
     */
    formatQuestionText(text) {
        if (!text) return '';
        
        // 处理代码块
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                  .replace(/\n/g, '<br>');
        return text;
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        // 清除计时器
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // 移除模态窗口（如果存在）
        if (this.questionModal) {
            this.questionModal.remove();
            this.questionModal = null;
        }
        
        this.currentQuestion = null;
        this.questionCallback = null;
    }
}

// 将类导出到全局作用域
window.QuestionSystem = QuestionSystem;
