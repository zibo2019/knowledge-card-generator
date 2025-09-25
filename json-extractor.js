/**
 * JSON 提取器 - JavaScript版本
 * 从文本中提取 JSON 内容的实用工具类
 *
 * 功能：
 * 1. 检测文本本身是否为JSON格式
 * 2. 提取Markdown代码块中的JSON内容 (```json ... ```)
 * 3. 使用正则表达式匹配JSON格式内容
 * 4. 智能清理和验证提取的JSON数据
 *
 * @author 訾博
 * @date 2024-12-25
 * @slogan 慢慢学，不要停。
 */
class JsonExtractor {

    // JSON正则表达式 - 匹配对象和数组
    static JSON_PATTERN = /\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*/;

    // Markdown JSON代码块正则表达式
    static MARKDOWN_JSON_PATTERN = /```json\s*([\s\S]*?)\s*```/i;

    // 更精确的JSON对象/数组匹配正则
    static PRECISE_JSON_PATTERN = /(\{(?:[^{}]|(?:\{[^{}]*\}))*\}|\[(?:[^\[\]]|(?:\[[^\[\]]*\]))*\])/g;

    /**
     * 判断字符串是否是有效的JSON格式
     * @param {string} jsonString - 待验证的JSON字符串
     * @returns {boolean} true 如果是有效的JSON格式，否则 false
     */
    static isJson(jsonString) {
        if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
            return false;
        }

        try {
            const parsed = JSON.parse(jsonString.trim());
            // 确保解析的结果是对象或数组
            return parsed !== null && (typeof parsed === 'object');
        } catch (error) {
            return false;
        }
    }

    /**
     * 判断字符串中是否包含Markdown格式的JSON内容
     * @param {string} text - 输入文本
     * @returns {boolean} true 如果包含Markdown格式的JSON，否则 false
     */
    static containsMarkdownJson(text) {
        return text.includes('```json') || text.includes('```JSON');
    }

    /**
     * 清理JSON字符串 - 移除多余的空格、换行和注释
     * @param {string} jsonStr - 待清理的JSON字符串
     * @returns {string} 清理后的JSON字符串
     */
    static cleanJsonString(jsonStr) {
        if (!jsonStr) return jsonStr;

        return jsonStr
            // 移除行注释 (// ...)
            .replace(/\/\/.*$/gm, '')
            // 移除块注释 (/* ... */)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // 移除多余的空白字符，但保留字符串内的空格
            .replace(/^\s+|\s+$/gm, '')
            .trim();
    }

    /**
     * 从Markdown代码块中提取JSON内容
     * @param {string} text - 包含Markdown JSON代码块的文本
     * @returns {string|null} 提取的JSON字符串，如果未找到则返回null
     */
    static extractFromMarkdown(text) {
        const match = text.match(this.MARKDOWN_JSON_PATTERN);
        if (match && match[1]) {
            const cleanedJson = this.cleanJsonString(match[1]);
            if (this.isJson(cleanedJson)) {
                return cleanedJson;
            }
        }
        return null;
    }

    /**
     * 使用正则表达式从文本中提取JSON内容
     * @param {string} text - 输入文本
     * @returns {string|null} 提取的JSON字符串，如果未找到则返回null
     */
    static extractWithRegex(text) {
        // 首先尝试精确匹配
        const matches = text.match(this.PRECISE_JSON_PATTERN);
        if (matches) {
            for (const match of matches) {
                const cleanedJson = this.cleanJsonString(match);
                if (this.isJson(cleanedJson)) {
                    return cleanedJson;
                }
            }
        }

        // 退到基础正则匹配
        const basicMatch = text.match(this.JSON_PATTERN);
        if (basicMatch && basicMatch[1]) {
            const cleanedJson = this.cleanJsonString(basicMatch[1]);
            if (this.isJson(cleanedJson)) {
                return cleanedJson;
            }
        }

        return null;
    }

    /**
     * 尝试修复常见的JSON格式问题
     * @param {string} text - 可能包含格式问题的JSON文本
     * @returns {string|null} 修复后的JSON字符串，如果无法修复则返回null
     */
    static tryFixJson(text) {
        if (!text) return null;

        let fixedText = text.trim();

        // 尝试修复常见问题
        const fixes = [
            // 移除尾部逗号
            (str) => str.replace(/,(\s*[}\]])/g, '$1'),

            // 修复单引号为双引号
            (str) => str.replace(/'/g, '"'),

            // 修复属性名缺少引号的问题
            (str) => str.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'),

            // 移除多余的反斜杠
            (str) => str.replace(/\\\\/g, '\\'),
        ];

        for (const fix of fixes) {
            try {
                const attemptFix = fix(fixedText);
                if (this.isJson(attemptFix)) {
                    return attemptFix;
                }
                fixedText = attemptFix;
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * 从文本中提取JSON格式的内容 - 主方法
     * @param {string} text - 输入文本
     * @returns {string|null} 提取的JSON字符串，如果未找到有效JSON则返回null
     */
    static extractJson(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }

        // 步骤1：检查文本本身是否就是JSON格式
        const cleanText = this.cleanJsonString(text);
        if (this.isJson(cleanText)) {
            return cleanText;
        }

        // 步骤2：尝试从Markdown代码块中提取JSON
        if (this.containsMarkdownJson(text)) {
            const markdownJson = this.extractFromMarkdown(text);
            if (markdownJson) {
                return markdownJson;
            }
        }

        // 步骤3：使用正则表达式提取JSON内容
        const regexJson = this.extractWithRegex(text);
        if (regexJson) {
            return regexJson;
        }

        // 步骤4：尝试修复并提取JSON
        const fixedJson = this.tryFixJson(text);
        if (fixedJson) {
            return fixedJson;
        }

        // 如果所有方法都失败，返回null
        return null;
    }

    /**
     * 从文本中提取并解析JSON对象
     * @param {string} text - 输入文本
     * @returns {Object|Array|null} 解析后的JSON对象/数组，失败则返回null
     */
    static extractAndParseJson(text) {
        const jsonStr = this.extractJson(text);
        if (!jsonStr) {
            return null;
        }

        try {
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('JSON解析失败:', error);
            return null;
        }
    }

    /**
     * 批量提取文本中的所有JSON内容
     * @param {string} text - 输入文本
     * @returns {Array} JSON对象数组
     */
    static extractAllJson(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const results = [];
        const matches = text.match(this.PRECISE_JSON_PATTERN);

        if (matches) {
            for (const match of matches) {
                const cleanedJson = this.cleanJsonString(match);
                if (this.isJson(cleanedJson)) {
                    try {
                        results.push(JSON.parse(cleanedJson));
                    } catch (error) {
                        console.warn('JSON解析失败:', error);
                    }
                }
            }
        }

        return results;
    }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonExtractor;
} else if (typeof window !== 'undefined') {
    window.JsonExtractor = JsonExtractor;
}

// 使用示例和测试
if (typeof module !== 'undefined' && require.main === module) {
    // 测试用例
    console.log('=== JSON提取器测试 ===\n');

    // 测试案例1: Markdown格式
    const testCase1 = `
    当然！以下是一个简单的 JSON 示例：

    \`\`\`json
    [
      {
        "Q": "什么是JavaScript？",
        "A": "JavaScript是一种**编程语言**，主要用于**网页开发**。"
      },
      {
        "Q": "JavaScript有哪些特点？",
        "A": [
          "**动态类型**：变量类型在运行时确定",
          "**解释执行**：不需要编译直接运行",
          "**事件驱动**：支持用户交互"
        ]
      }
    ]
    \`\`\`

    这是一个包含知识卡片的JSON数组示例。
    `;

    console.log('测试案例1 - Markdown格式:');
    console.log('提取结果:', JsonExtractor.extractJson(testCase1));
    console.log('\n---\n');

    // 测试案例2: 纯JSON文本
    const testCase2 = `[{"Q": "测试问题", "A": "测试答案"}]`;
    console.log('测试案例2 - 纯JSON:');
    console.log('提取结果:', JsonExtractor.extractJson(testCase2));
    console.log('\n---\n');

    // 测试案例3: AI可能返回的带说明文本的JSON
    const testCase3 = `
    根据您的文本，我生成了以下知识卡片：

    [
        {
            "Q": "什么是人工智能？",
            "A": "人工智能(AI)是一门研究如何让**计算机模拟人类智能**的科学。"
        },
        {
            "Q": "AI的主要应用领域有哪些？",
            "A": [
                "**机器学习**：从数据中学习模式",
                "**自然语言处理**：理解和生成人类语言",
                "**计算机视觉**：处理和分析图像"
            ]
        }
    ]

    这些卡片涵盖了AI的基本概念和应用领域。
    `;

    console.log('测试案例3 - AI返回格式:');
    const result3 = JsonExtractor.extractAndParseJson(testCase3);
    console.log('解析结果:', JSON.stringify(result3, null, 2));
}