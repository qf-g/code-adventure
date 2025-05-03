/**
 * RE0：从0开始的异世界编程冒险 - Web版
 * 加载动画组件 - 提供资源加载时的视觉反馈
 */
class LoadingScreen {
    constructor() {
        // 创建加载动画元素
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.style.display = 'none';
        
        // 创建加载动画内容
        const content = document.createElement('div');
        content.className = 'loading-content';
        content.style.textAlign = 'center';
        
        // 创建加载动画
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        content.appendChild(spinner);
        
        // 创建加载文本
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = '加载中...';
        content.appendChild(loadingText);
        
        // 将内容添加到覆盖层
        this.overlay.appendChild(content);
        
        // 提示文本
        this.loadingText = loadingText;
        
        // 将覆盖层添加到文档
        document.body.appendChild(this.overlay);
    }
    
    /**
     * 显示加载动画
     * @param {string} message - 显示的提示信息
     */
    show(message = '加载中...') {
        // 更新提示文本
        this.loadingText.textContent = message;
        
        // 显示加载动画
        this.overlay.style.display = 'flex';
        
        // 禁用页面滚动
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 隐藏加载动画
     */
    hide() {
        // 淡出动画
        this.overlay.style.opacity = '0';
        
        // 延迟后隐藏元素
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.overlay.style.opacity = '1';
            
            // 恢复页面滚动
            document.body.style.overflow = '';
        }, 300);
    }
    
    /**
     * 更新加载文本
     * @param {string} message - 新的加载文本
     */
    updateText(message) {
        this.loadingText.textContent = message;
    }
    
    /**
     * 显示带进度条的加载动画
     * @param {number} progress - 加载进度(0-100)
     * @param {string} message - 加载提示文本
     */
    showWithProgress(progress, message = '加载中...') {
        // 如果覆盖层尚未显示，先显示它
        if (this.overlay.style.display === 'none') {
            this.show(message);
        }
        
        // 检查是否已有进度条
        let progressBar = this.overlay.querySelector('.loading-progress');
        if (!progressBar) {
            // 创建进度条容器
            progressBar = document.createElement('div');
            progressBar.className = 'loading-progress';
            progressBar.style.width = '80%';
            progressBar.style.height = '10px';
            progressBar.style.backgroundColor = '#ffffff33';
            progressBar.style.borderRadius = '5px';
            progressBar.style.margin = '20px auto 0';
            progressBar.style.position = 'relative';
            
            // 创建进度条填充
            const progressFill = document.createElement('div');
            progressFill.className = 'loading-progress-fill';
            progressFill.style.height = '100%';
            progressFill.style.backgroundColor = '#E67E22';
            progressFill.style.borderRadius = '5px';
            progressFill.style.width = '0%';
            progressFill.style.transition = 'width 0.3s ease';
            
            // 创建进度文本
            const progressText = document.createElement('div');
            progressText.className = 'loading-progress-text';
            progressText.style.position = 'absolute';
            progressText.style.top = '0';
            progressText.style.left = '0';
            progressText.style.width = '100%';
            progressText.style.height = '100%';
            progressText.style.display = 'flex';
            progressText.style.alignItems = 'center';
            progressText.style.justifyContent = 'center';
            progressText.style.color = 'white';
            progressText.style.fontSize = '10px';
            progressText.style.fontWeight = 'bold';
            
            // 将进度条元素添加到容器
            progressBar.appendChild(progressFill);
            progressBar.appendChild(progressText);
            
            // 将进度条添加到内容中
            this.overlay.querySelector('.loading-content').appendChild(progressBar);
        }
        
        // 更新进度条和文本
        const progressFill = progressBar.querySelector('.loading-progress-fill');
        const progressText = progressBar.querySelector('.loading-progress-text');
        
        // 限制进度值在0-100之间
        progress = Math.max(0, Math.min(100, progress));
        
        // 更新进度条宽度
        progressFill.style.width = `${progress}%`;
        
        // 更新进度文本
        progressText.textContent = `${Math.round(progress)}%`;
        
        // 更新加载提示文本
        this.updateText(message);
    }
}

// 创建单例并导出
window.loadingScreen = new LoadingScreen();
