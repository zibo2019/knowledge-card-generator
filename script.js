// 知识卡片生成器 JavaScript

// 全局变量
let knowledgeCards = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadConfiguration();
    initializeEventListeners();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 监听ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeConfigModal();
        }
    });

    // 点击模态框背景关闭
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeConfigModal();
            }
        });
    }
}

// 显示配置模态框
function showConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('modal-enter');
        // 加载当前配置到模态框表单
        loadConfigToForm();
    }
}

// 关闭配置模态框
function closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.classList.add('modal-exit');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-enter', 'modal-exit');
        }, 200);
    }
}

// 加载配置到表单
function loadConfigToForm() {
    try {
        const saved = localStorage.getItem('knowledgeCardConfig');
        if (saved) {
            const config = JSON.parse(saved);
            document.getElementById('modalBaseUrl').value = config.baseUrl || 'https://api.example.com/v1';
            document.getElementById('modalApiKey').value = config.apiKey || '';
            document.getElementById('modalModelName').value = config.modelName || 'gemini-2.5-pro';
        } else {
            // 默认值
            document.getElementById('modalBaseUrl').value = 'https://api.example.com/v1';
            document.getElementById('modalApiKey').value = '';
            document.getElementById('modalModelName').value = 'gemini-2.5-pro';
        }
    } catch (error) {
        console.error('加载配置失败:', error);
        showMessage('配置加载失败', 'error');
    }
}

// 保存配置
function saveConfiguration() {
    const baseUrl = document.getElementById('modalBaseUrl').value.trim();
    const apiKey = document.getElementById('modalApiKey').value.trim();
    const modelName = document.getElementById('modalModelName').value.trim();

    if (!baseUrl || !apiKey || !modelName) {
        showMessage('请填写所有配置项', 'error');
        return;
    }

    try {
        const config = {
            baseUrl: baseUrl,
            apiKey: apiKey,
            modelName: modelName,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('knowledgeCardConfig', JSON.stringify(config));
        showMessage('配置已保存', 'success');
        closeConfigModal();
        updateConfigStatus();
    } catch (error) {
        console.error('保存配置失败:', error);
        showMessage('保存配置失败', 'error');
    }
}

// 加载配置
function loadConfiguration() {
    try {
        const saved = localStorage.getItem('knowledgeCardConfig');
        if (saved) {
            const config = JSON.parse(saved);
            updateConfigStatus(true, config.savedAt);
        } else {
            updateConfigStatus(false);
        }
    } catch (error) {
        console.error('加载配置失败:', error);
        updateConfigStatus(false);
    }
}

// 更新配置状态显示
function updateConfigStatus(hasConfig = false, savedAt = null) {
    const statusElement = document.getElementById('configStatus');
    if (statusElement) {
        if (hasConfig && savedAt) {
            const date = new Date(savedAt);
            const timeStr = date.toLocaleString('zh-CN');
            statusElement.innerHTML = `<i class="fas fa-check-circle text-green-400 mr-2"></i>配置已保存 (${timeStr})`;
            statusElement.className = 'text-sm text-green-400';
        } else {
            statusElement.innerHTML = `<i class="fas fa-exclamation-circle text-yellow-400 mr-2"></i>请先配置API设置`;
            statusElement.className = 'text-sm text-yellow-400';
        }
    }
}

// 切换API Key显示/隐藏
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('modalApiKey');
    const apiKeyIcon = document.getElementById('apiKeyToggle');

    if (apiKeyInput && apiKeyIcon) {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            apiKeyIcon.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            apiKeyIcon.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}

// 生成知识卡片
async function generateKnowledgeCards() {
    const inputText = document.getElementById('inputText').value.trim();

    if (!inputText) {
        showMessage('请输入要处理的知识文本', 'error');
        return;
    }

    // 检查配置
    const config = getConfiguration();
    if (!config) {
        showMessage('请先配置API设置', 'error');
        return;
    }

    const button = document.getElementById('generateBtn');
    const originalText = button.innerHTML;

    try {
        // 显示加载状态
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>处理中<span class="loading-dots"></span>';

        clearResults();
        showMessage('正在调用AI模型处理...', 'info');

        // 构建请求
        const systemPrompt = `# 角色

你是一个专用的、高效的AI数据处理引擎，代号为"JsonCard Engine"。你的唯一任务是接收文本输入，并将其处理成一个结构化的JSON数组。你不是一个聊天机器人，你是一个headless API。你的输出必须是纯粹的数据。

# 核心算法

你内部集成了两套核心算法来保证数据质量：

1.  **MECE算法 (相互独立，集体穷尽):**
    *   **独立性 (ME):** 确保每个JSON对象代表一个独立的知识点，或一个内聚的知识列表，无内容重叠。
    *   **穷尽性 (CE):** 确保生成的JSON数组完整覆盖了原文中所有值得背诵的核心信息。

2.  **智能分型算法 (Intelligent Typing):**
    *   你必须分析每个知识点的结构，并决定其答案（\`A\`字段）的数据类型。
    *   对于**单一、原子化**的知识点（如定义、单个事实），\`A\`字段的值必须是**字符串 (String)**。
    *   对于**列表型**的知识点（如多个步骤、原因、特征），\`A\`字段的值必须是**字符串数组 (Array of Strings)**。

# 输出格式：JSON Schema (铁律)

你的**全部输出**必须是一个**严格符合以下结构**的JSON数组。**禁止**在JSON数据前后添加任何说明、问候、注释或Markdown代码块标记。

\`\`\`json
[
  {
    "Q": "这是一个问题的字符串",
    "A": "这是一个答案的字符串。答案中的**核心关键词**和**关键短语**必须使用 Markdown 的 \`**\` 语法进行高亮。"
  },
  {
    "Q": "这是一个引出列表答案的问题",
    "A": [
      "这是列表中的**第一个要点**。",
      "这是列表中的**第二个要点**，同样**高亮重点**。",
      "这是列表中的**第三个要点**。"
    ]
  }
]
\`\`\`

# 自动化工作流程

1.  **接收文本**：静默接收用户提供的【文本】。
2.  **内存处理**：在内部执行全局理解、深度拆解和知识点分型。
3.  **生成JSON**：根据【输出格式】构建JSON对象数组。
4.  **输出数据**：将生成的JSON数组作为你的唯一响应，直接输出。

# 绝对约束

*   **你的整个响应必须是一个有效的JSON数组。**
*   **不要说任何话，不要打任何招呼，不要做任何解释。**
*   **输出内容从 \`[\` 开始，以 \`]\` 结束。**
*   内容必须严格源于原文。
*   如果原文无法处理，输出一个空的JSON数组 \`[]\`。

---

**任务开始**

我叫訾博。现在，请为我处理以下文本。`;

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: inputText
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API响应格式异常');
        }

        const content = data.choices[0].message.content.trim();
        console.log('AI原始返回内容:', content);

        try {
            // 使用JSON提取器从AI返回的内容中提取JSON
            const extractedJson = JsonExtractor.extractJson(content);

            if (!extractedJson) {
                throw new Error('无法从AI返回内容中提取有效的JSON数据');
            }

            // 解析提取的JSON
            knowledgeCards = JSON.parse(extractedJson);

            if (!Array.isArray(knowledgeCards)) {
                throw new Error('提取的JSON不是有效的数组格式');
            }

            if (knowledgeCards.length === 0) {
                showMessage('AI未能从文本中提取到知识点，请尝试提供更详细的内容', 'warning');
            } else {
                showMessage(`成功生成 ${knowledgeCards.length} 张知识卡片`, 'success');
                renderKnowledgeCards();
            }

        } catch (parseError) {
            console.error('JSON提取和解析错误:', parseError);
            console.log('AI返回的原始内容:', content);

            // 提供更详细的错误信息
            let errorMsg = 'AI返回内容解析失败';
            if (content.includes('[') || content.includes('{')) {
                errorMsg += '：检测到JSON格式但解析失败，可能存在格式问题';
            } else {
                errorMsg += '：AI可能返回了非JSON格式的内容';
            }

            throw new Error(errorMsg);
        }

    } catch (error) {
        console.error('生成知识卡片失败:', error);
        showMessage(`生成失败: ${error.message}`, 'error');
        clearResults();
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// 获取配置
function getConfiguration() {
    try {
        const saved = localStorage.getItem('knowledgeCardConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    } catch (error) {
        console.error('获取配置失败:', error);
        return null;
    }
}

// 渲染知识卡片
function renderKnowledgeCards() {
    const container = document.getElementById('cardsContainer');
    if (!container || !knowledgeCards.length) return;

    container.innerHTML = '';

    knowledgeCards.forEach((card, index) => {
        const cardElement = createKnowledgeCardElement(card, index);
        container.appendChild(cardElement);
    });
}

// 创建知识卡片元素
function createKnowledgeCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'knowledge-card bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-200';

    // 问题部分
    const questionDiv = document.createElement('div');
    questionDiv.className = 'mb-4';
    questionDiv.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-blue-400 uppercase tracking-wide">问题 ${index + 1}</span>
            <button onclick="copyToClipboard('card-${index}')"
                    class="text-gray-400 hover:text-blue-400 transition-colors">
                <i class="fas fa-copy"></i>
            </button>
        </div>
        <h3 class="text-lg font-semibold text-gray-100 mb-3">${escapeHtml(card.Q)}</h3>
    `;

    // 答案部分
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-content';

    if (Array.isArray(card.A)) {
        // 列表答案
        const listItems = card.A.map(item =>
            `<li class="text-gray-300 mb-2 leading-relaxed">${renderMarkdown(item)}</li>`
        ).join('');

        answerDiv.innerHTML = `
            <div class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">答案</div>
            <ul class="list-disc list-inside space-y-1">${listItems}</ul>
        `;
    } else {
        // 字符串答案
        answerDiv.innerHTML = `
            <div class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">答案</div>
            <p class="text-gray-300 leading-relaxed">${renderMarkdown(card.A)}</p>
        `;
    }

    // 隐藏的复制内容
    const copyContent = document.createElement('div');
    copyContent.id = `card-${index}`;
    copyContent.className = 'hidden';
    copyContent.textContent = `问题: ${card.Q}\n\n答案: ${Array.isArray(card.A) ? card.A.join('\n• ') : card.A}`;

    cardDiv.appendChild(questionDiv);
    cardDiv.appendChild(answerDiv);
    cardDiv.appendChild(copyContent);

    return cardDiv;
}

// 简单的Markdown加粗渲染
function renderMarkdown(text) {
    return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300 font-semibold">$1</strong>');
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 复制到剪贴板
async function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent;

    try {
        await navigator.clipboard.writeText(text);
        showMessage('已复制到剪贴板', 'success');
    } catch (error) {
        console.error('复制失败:', error);
        showMessage('复制失败，请手动选择文本', 'error');
    }
}

// 清空结果
function clearResults() {
    knowledgeCards = [];
    const container = document.getElementById('cardsContainer');
    if (container) {
        container.innerHTML = '';
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const messageDiv = document.createElement('div');
    const colors = {
        success: 'bg-green-900 border-green-700 text-green-300',
        error: 'bg-red-900 border-red-700 text-red-300',
        warning: 'bg-yellow-900 border-yellow-700 text-yellow-300',
        info: 'bg-blue-900 border-blue-700 text-blue-300'
    };

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    messageDiv.className = `${colors[type]} border rounded-lg p-3 mb-4 flex items-center transition-all duration-300`;
    messageDiv.innerHTML = `
        <i class="${icons[type]} mr-2"></i>
        <span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="ml-auto text-current opacity-70 hover:opacity-100">
            <i class="fas fa-times"></i>
        </button>
    `;

    messageContainer.appendChild(messageDiv);

    // 自动移除消息（除了错误消息）
    if (type !== 'error') {
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// 清空输入
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('inputText').focus();
}