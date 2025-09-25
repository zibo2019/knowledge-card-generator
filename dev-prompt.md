# 任务描述

## 相关文件

- 开发要求（系统提示词）：`system-prompt.md`
- 用户想法（用户消息）：`idea.md`

## 实施步骤

1. 先后读取【开发要求】和【用户想法】；
2、完成开发任务。

---

调整与修复：
  1、点击“生成知识卡片”之后需要有处理中的动效，即loading，要不然用户没感觉，不知道是否开始了任务；
  2、API Key的小眼睛，点击无效，无法查看和隐藏API Key；
  3、点击“生成知识卡片”按钮之后，没有真正发起http请求，调取大模型。
  
---

调整或修复：

- API 配置支持保存功能，点击保存将配置内容保存到localstorage，每次渲染html时先从本地加载配置

---

调整或修复：

-  两个按钮点击无效，控制台报错：
  index.html:117 Uncaught ReferenceError: saveConfiguration is not defined
    at HTMLButtonElement.onclick (index.html:117:26)
  index.html:154 Uncaught ReferenceError: generateKnowledgeCards is not defined
    at HTMLButtonElement.onclick (index.html:154:18)
	
---


调整或修复：
index.html:117 Uncaught ReferenceError: saveConfiguration is not defined
    at HTMLButtonElement.onclick (index.html:117:26)
onclick @ index.html:117
index.html:154 Uncaught ReferenceError: generateKnowledgeCards is not defined
    at HTMLButtonElement.onclick (index.html:154:18)

另一个错误：
Uncaught SyntaxError: Invalid or unexpected token (at index.html:297:37)

---

需求：
1、调整排版：输入框放在最上面，知识卡片列表放在下面，API配置不常用，使用对话框形式配置；
2、定制输入框滚动条，使得风格一致；
3、如果文件太大，你可以进行文件拆分。

---

知识卡片支持一键切换显示与隐藏答案，每一个知识卡片支持单独的显示与隐藏答案

---

/git-acp

---

你实现了单独知识卡片的显示与隐藏，但是没有实现一键显示与隐藏所有知识卡片的答案，请你实现