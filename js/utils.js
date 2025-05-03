/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 工具函数模块 - 提供常用工具函数
 */

console.log('utils.js loaded');

/**
 * 加载JSON数据
 * @param {string} path - JSON文件路径
 * @returns {Promise<Object>} 解析后的JSON对象
 */
async function loadJSON(path) {
    try {
        // 处理路径：确保路径格式正确
        const formattedPath = path.startsWith('/') ? path.substring(1) : path;
        
        // 直接使用fetch API加载JSON文件
        console.log(`尝试加载JSON: ${formattedPath}`);
        const response = await fetch(formattedPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`成功加载JSON: ${formattedPath}`);
        return data;
    } catch (error) {
        // 显示详细的错误信息
        console.error(`加载JSON失败 ${path}: ${error.message}`);
        
        // 在UI中显示错误信息
        if (window.sceneManager) {
            window.sceneManager.showNotification(`无法加载 ${path}。错误: ${error.message}`, 'error');
        } else {
            // 如果sceneManager不可用，创建临时通知
            showErrorNotification(`无法加载 ${path}。错误: ${error.message}`);
        }
        
        // 抛出错误，让调用者处理失败情况
        throw error;
    }
}

/**
 * 创建临时错误通知
 * @param {string} message - 错误信息
 */
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 80%;
        text-align: center;
    `;
    notification.textContent = message;
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        display: block;
        margin: 10px auto 0;
        padding: 5px 10px;
        background: white;
        color: #f44336;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // 自动关闭
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 10000);
}

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键名
 * @param {Object} data - 要存储的数据
 * @returns {boolean} 是否保存成功
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`保存数据到localStorage失败:`, error);
        return false;
    }
}

/**
 * 从localStorage加载数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值(当数据不存在时返回)
 * @returns {*} 加载的数据或默认值
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`从localStorage加载数据失败:`, error);
        return defaultValue;
    }
}

/**
 * 生成范围内的随机整数
 * @param {number} min - 最小值(包含)
 * @param {number} max - 最大值(包含)
 * @returns {number} 随机整数
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 格式化游戏时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的时间字符串
 */
function formatGameTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 加载图片资源
 * @param {string} path - 图片路径
 * @returns {Promise<HTMLImageElement>} 图片元素
 */
function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
}

/**
 * 防抖函数 - 用于限制函数调用频率
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * 检查元素是否在视图中
 * @param {Element} element - DOM元素
 * @returns {boolean} 是否在视图中
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * 创建并执行动画
 * @param {number} duration - 动画持续时间(毫秒) 
 * @param {Function} callback - 每帧回调函数，接收进度参数(0-1)
 * @returns {Promise<void>} 动画完成时resolve的Promise
 */
function animate(duration, callback) {
    return new Promise(resolve => {
        const startTime = Date.now();
        
        function step() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            callback(progress);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(step);
    });
}

// 导出工具函数
window.Utils = {
    loadJSON,
    saveToLocalStorage,
    loadFromLocalStorage,
    getRandomInt,
    formatGameTime,
    loadImage,
    debounce,
    isInViewport,
    animate
};
