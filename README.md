# RE0：从0开始的异世界编程冒险

## 本地开发说明

### 浏览器访问限制问题

当直接通过`file://`协议打开HTML文件时，现代浏览器的安全策略会阻止JavaScript通过`fetch`或`XMLHttpRequest`加载本地JSON文件。这会导致游戏数据无法正常加载。

### 解决方案

1. **使用内置数据（已实现）**
   - 游戏已内置基础数据，当无法加载外部JSON文件时会自动使用内置数据
   - 这确保了基本功能可用，但可能缺少完整的游戏内容

2. **使用本地Web服务器（推荐）**
   - 通过Web服务器提供文件可以绕过浏览器的安全限制
   - 简单方法：
     ```bash
     # 如果安装了Python 3
     cd /Users/qingfeng/Downloads/RE0：从0开始的异世界编程冒险
     python -m http.server 8000
     # 然后在浏览器访问: http://localhost:8000/web/
     
     # 如果安装了Node.js
     npm install -g http-server
     cd /Users/qingfeng/Downloads/RE0：从0开始的异世界编程冒险
     http-server -p 8000
     # 然后在浏览器访问: http://localhost:8000/web/
     ```

3. **使用VSCode Live Server插件**
   - 安装Live Server插件
   - 右键点击index.html，选择"Open with Live Server"
   
4. **更改浏览器安全设置（不推荐）**
   - Chrome: 使用`--allow-file-access-from-files`启动参数
   - Safari: 在开发者菜单中禁用跨源限制
   - 注意：这会降低浏览器安全性，仅用于开发测试

### 其他注意事项

- 游戏数据存储在localStorage中，不同浏览器之间不共享
- 推荐使用Chrome或Firefox以获得最佳体验
