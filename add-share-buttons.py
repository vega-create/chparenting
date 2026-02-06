#!/usr/bin/env python3
"""
在所有工具頁加入 ShareButtons
用法：cd ~/Desktop/chparenting && python3 add-share-buttons.py
"""

# 工具頁對應的 title
TOOL_TITLES = {
    'affirmation.astro': '✨ 今日正能量卡片',
    'breathing.astro': '🫁 3 分鐘呼吸練習',
    'cheer.astro': '💪 加油打氣卡',
    'emotion-card.astro': '🧒 孩子情緒安撫卡',
    'fortune.astro': '🔮 媽媽運勢卡',
    'jokes.astro': '😆 每日媽媽笑話',
    'mom-type.astro': '🎯 你是哪種媽媽？',
    'mood-diary.astro': '📝 心情日記',
    'priority.astro': '📋 待辦優先排序',
    'quotes.astro': '😂 崩潰語錄產生器',
    'stress-test.astro': '📊 壓力指數測驗',
    'time-calc.astro': '⏰ 角色時間計算器',
    'white-noise.astro': '🌧️ 白噪音播放器',
}

IMPORT_LINE = "import ShareButtons from '../../components/ShareButtons.astro';"
LABEL = "覺得這個工具不錯？分享給需要喘息的媽媽 💛"

import os

tools_dir = 'src/pages/tools'

if not os.path.isdir(tools_dir):
    print(f"❌ 找不到目錄：{tools_dir}")
    print("請確認你在 chparenting 專案根目錄")
    exit(1)

count = 0
skipped = 0

for filename, title in TOOL_TITLES.items():
    filepath = os.path.join(tools_dir, filename)
    
    if not os.path.isfile(filepath):
        print(f"⚠️  跳過（檔案不存在）：{filename}")
        skipped += 1
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 檢查是否已經加過
    if 'ShareButtons' in content:
        print(f"⏭️  已有 ShareButtons：{filename}")
        skipped += 1
        continue
    
    # 1. 在 frontmatter 第二個 --- 前加 import
    first = content.index('---')
    second = content.index('---', first + 3)
    
    before_close = content[:second].rstrip()
    after_close = content[second:]
    content = before_close + '\n' + IMPORT_LINE + '\n' + after_close
    
    # 2. 在 </BaseLayout> 前的最後一個 </div> 前插入 ShareButtons
    share_html = f'    <ShareButtons title="{title}" label="{LABEL}" />'
    
    base_pos = content.rfind('</BaseLayout>')
    if base_pos == -1:
        print(f"⚠️  找不到 </BaseLayout>：{filename}")
        skipped += 1
        continue
    
    last_div = content.rfind('</div>', 0, base_pos)
    if last_div == -1:
        print(f"⚠️  找不到 </div>：{filename}")
        skipped += 1
        continue
    
    content = content[:last_div] + share_html + '\n  ' + content[last_div:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 已加入：{filename} → {title}")
    count += 1

# PostLayout 也加
print("\n--- PostLayout ---")
post_layout = 'src/layouts/PostLayout.astro'
if os.path.isfile(post_layout):
    with open(post_layout, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<ShareButtons' in content and 'title={title}' in content:
        print("⏭️  PostLayout 已有 ShareButtons")
    elif 'import ShareButtons' in content:
        # 已有 import 但模板沒用
        article_end = content.rfind('</article>')
        if article_end != -1:
            tag = '\n    <!-- 社群分享 -->\n    <ShareButtons title={title} />\n  '
            content = content[:article_end] + tag + content[article_end:]
            with open(post_layout, 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ PostLayout → 已加入 <ShareButtons title={title} />")
            count += 1
        else:
            print("⚠️  找不到 </article>，請手動加")
    else:
        print("⚠️  PostLayout 沒有 import ShareButtons，請先手動加 import")
else:
    print(f"⚠️  找不到 {post_layout}")

print(f"\n🎉 完成！共修改 {count} 個檔案，跳過 {skipped} 個")
print(f"\n下一步：")
print(f'  git add -A && git commit -m "feat: 工具頁+文章頁加入社群分享按鈕" && git push')
