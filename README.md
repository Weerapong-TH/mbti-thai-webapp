# MBTI Thai Quiz

เว็บแอพ MVP สำหรับทำแบบทดสอบ MBTI ภาษาไทยแบบทีละข้อ ใช้ HTML5, Vanilla JavaScript, Tailwind CSS ผ่าน CDN และไฟล์ CSV เป็นแหล่งข้อมูล ไม่มี backend, database server หรือ framework

ระบบใช้ `questions.csv` เป็นคลังคำถาม 80 ข้อ และสุ่มคำถามรอบละ 16 ข้อ โดยบาลานซ์ครบ 4 มิติ มิติละ 4 ข้อ พร้อมพยายามเลี่ยงคำถามจากรอบล่าสุด

> แบบทดสอบนี้เป็นเครื่องมือช่วยสะท้อนตัวเองเบื้องต้น ไม่ใช่การวินิจฉัยทางจิตวิทยา

## วิธีเปิดใช้งานบนเครื่อง

ควรรันผ่าน local server เพื่อให้ browser โหลด `questions.csv` และ `results.csv` ได้ถูกต้อง

วิธีที่ง่ายที่สุดบน Windows คือดับเบิลคลิกไฟล์นี้:

```text
start-server.bat
```

หรือรันจาก PowerShell:

```powershell
cd "D:\AI World\New folder\mbti-thai-webapp"
.\start-server.bat
```

ถ้าต้องการใช้ PowerShell script โดยตรง ให้ใช้คำสั่งนี้เพื่อข้าม Execution Policy เฉพาะครั้งนี้:

```powershell
cd "D:\AI World\New folder\mbti-thai-webapp"
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

สคริปต์จะลองใช้ `python`, `py` และ Python bundled ของ Codex ตามลำดับ

ถ้าเครื่องติดตั้ง Python ไว้และเรียกได้ตามปกติ สามารถใช้คำสั่งตรงนี้ได้เช่นกัน:

```powershell
cd "D:\AI World\New folder\mbti-thai-webapp"
python -m http.server 8000
```

จากนั้นเปิด:

```text
http://localhost:8000
```

ถ้าไม่มี Python สามารถใช้ VS Code Live Server หรือคำสั่งอื่นที่เปิด static server ได้ เช่น:

```powershell
npx serve .
```

## โครงสร้างไฟล์

```text
mbti-thai-webapp/
├── assets/
│   └── mbti-characters/
├── index.html
├── app.js
├── questions.csv
├── results.csv
└── README.md
```

## วิธีแก้คำถามใน `questions.csv`

ไฟล์คำถามต้องใช้ UTF-8 และมี columns ตามนี้:

```csv
id,dimension,question,a_text,b_text,a_type,b_type
```

ความหมายของแต่ละ column:

- `id`: ลำดับคำถาม ไม่ควรซ้ำ
- `dimension`: มิติของคำถาม เช่น `EI`, `SN`, `TF`, `JP`
- `question`: คำถามภาษาไทย
- `a_text`: ข้อความตัวเลือกฝั่ง A
- `b_text`: ข้อความตัวเลือกฝั่ง B
- `a_type`: ตัวอักษร MBTI ที่ฝั่ง A แทน เช่น `I`
- `b_type`: ตัวอักษร MBTI ที่ฝั่ง B แทน เช่น `E`

ตัวอย่าง:

```csv
1,EI,"หลังจากสัปดาห์ที่วุ่นวาย คุณมักเติมพลังด้วยวิธีไหน","ออกไปเจอเพื่อนหรือทำกิจกรรมกับผู้คน","พักเงียบ ๆ อยู่กับตัวเองหรือคนสนิทไม่กี่คน",E,I
```

ถ้าข้อความมี comma ให้ครอบค่านั้นด้วย double quote เสมอ

คำแนะนำสำหรับคลังคำถาม:

- ควรมีมากกว่า 16 ข้อ เพื่อให้การสุ่มมีความหมาย
- ควรมีจำนวนใกล้เคียงกันในแต่ละมิติ เช่น `EI`, `SN`, `TF`, `JP`
- เวอร์ชันปัจจุบันมี 80 ข้อ แบ่งเป็นมิติละ 20 ข้อ
- แอพจะสุ่มใช้มิติละ 4 ข้อในแต่ละรอบ
- ถ้าคลังคำถามในมิติใดมีน้อยกว่า 4 ข้อ แอพจะเลือกได้เท่าที่มี ทำให้แบบทดสอบรอบนั้นอาจสั้นหรือไม่สมดุล

## โฟลเดอร์รูป Pixel Art

เตรียมโฟลเดอร์ไว้สำหรับตัวละคร MBTI:

```text
assets/mbti-characters/
```

ชื่อไฟล์ที่แนะนำคือใช้ MBTI type เป็นตัวพิมพ์ใหญ่ เช่น:

```text
INTJ.jpg
ENFP.png
ISTJ.webp
ESFP.jpg
```

Supported result image extensions: `.jpg`, `.png`, `.webp`.

แนะนำให้ใช้ `.png` พื้นหลังโปร่งใส ขนาดต้นฉบับ `512x512` หรือ `1024x1024` แล้วค่อยย่อเป็น asset ตามต้องการ

## วิธีเพิ่มผลลัพธ์ใน `results.csv`

ไฟล์ผลลัพธ์ต้องใช้ UTF-8 และมี columns ตามนี้:

```csv
type,title,summary,strengths,cautions,career_fit
```

ต้องมีข้อมูลครบ 16 MBTI types:

```text
ISTJ, ISFJ, INFJ, INTJ, ISTP, ISFP, INFP, INTP,
ESTP, ESFP, ENFP, ENTP, ESTJ, ESFJ, ENFJ, ENTJ
```

ความหมายของแต่ละ column:

- `type`: MBTI type ตัวพิมพ์ใหญ่ 4 ตัวอักษร
- `title`: ชื่อผลลัพธ์ภาษาไทย
- `summary`: สรุปบุคลิกภาพ
- `strengths`: จุดแข็ง แยกหลายรายการด้วย `|` หรือ comma
- `cautions`: จุดที่ควรระวัง แยกหลายรายการด้วย `|` หรือ comma
- `career_fit`: งานหรือบทบาทที่เหมาะสม แยกหลายรายการด้วย `|` หรือ comma

ตัวอย่าง:

```csv
INTJ,"นักวางกลยุทธ์","ชอบคิดเป็นระบบ มองระยะยาว ใช้เหตุผลและข้อมูลในการตัดสินใจ","คิดเชิงระบบ|วางแผนเก่ง|เรียนรู้ด้วยตัวเองได้ดี","คิดเยอะก่อนลงมือ|อาจดูนิ่งหรือห่างเหิน","Planning|Data Analyst|Process Improvement"
```

## การให้คะแนน

ผู้ใช้เลือกคำตอบ 5 ระดับ:

- `A มาก`: +2 ให้ `a_type`
- `A นิดหน่อย`: +1 ให้ `a_type`
- `ก้ำกึ่ง`: 0
- `B นิดหน่อย`: +1 ให้ `b_type`
- `B มาก`: +2 ให้ `b_type`

เมื่อทำครบทุกข้อ ระบบจะรวมคะแนนของ `E/I`, `S/N`, `T/F`, `J/P` แล้วสรุปเป็น MBTI type 4 ตัวอักษร

## ข้อจำกัดของ MVP

- ไม่มีระบบ login หรือบันทึกผลถาวร
- ไม่มี backend, database หรือ dashboard
- ผลลัพธ์ขึ้นกับคุณภาพของคำถามและคำอธิบายใน CSV
- การเปิดไฟล์ `index.html` โดยตรงอาจโหลด CSV ไม่ได้ในบาง browser
- Tailwind CDN เหมาะกับ MVP/prototype มากกว่าการ optimize สำหรับ production

## แนวทางพัฒนา Phase 2

- บันทึกผลลง Google Sheets
- Export ผลลัพธ์เป็น PDF
- แชร์ผลลัพธ์เป็นรูปภาพ
- เพิ่มระบบ Admin สำหรับแก้คำถาม
- เพิ่ม dashboard สถิติผู้ตอบ
- เพิ่ม localStorage สำหรับเก็บผลล่าสุด
- เพิ่มชุดทดสอบอัตโนมัติสำหรับ CSV parser และ scoring logic

## QA checklist สำหรับ redesign แนว ThreadWeave

Reference: `https://designmd.ai/chef/threadweave`

แนวคิดธีม:

- ทำให้ quiz รู้สึกเหมือนพื้นที่สะท้อนตัวเองแบบเป็นลำดับชั้น ไม่ใช่เกมทายบุคลิกที่เสียงดังเกินไป
- ใช้พื้นหลังโทนอุ่นใกล้ `#FAFAF9`, surface สีขาว, indigo เป็นสี action หลัก, amber สำหรับ highlight และ teal สำหรับสถานะสำเร็จหรือ insight เสริม
- ให้ question/result เป็นเหมือนหัวข้อ thread ส่วน choices/helper text เป็นเหมือนคำตอบย่อยที่อ่านตามลำดับได้ง่าย
- disclaimer เรื่อง MBTI ต้องยังมองเห็นง่ายและน้ำเสียงนุ่มนวล: เป็นเครื่องมือชวนสำรวจตัวเอง ไม่ใช่การวินิจฉัย

Visual QA:

- พื้นหลังหน้าใช้ warm neutral ใกล้ `#FAFAF9`; กล่องเนื้อหาเป็นสีขาวพร้อม border/shadow เบา ๆ
- ปุ่มหลัก, progress active, และ selected answer ใช้ indigo ใกล้ `#4338CA`
- amber ใกล้ `#D97706` ใช้เฉพาะ highlight เช่น step ปัจจุบัน, pinned insight, หรือ caution label
- teal ใกล้ `#0F766E` ใช้กับ completion, balanced-score note, หรือ supportive insight
- heading ของคำถามและผลลัพธ์มี hierarchy ชัดกว่าข้อความ body; ถ้าเพิ่ม serif heading ต้องตรวจว่าอ่านภาษาไทยได้ดี
- ไม่มี card ซ้อน card; ถ้าต้องการความเป็น threaded ให้ใช้ indentation, left rail, reply stack, หรือ connected sections
- mobile ต้องเป็น single-column และไม่มีข้อความไทยถูกตัดในปุ่ม, score label, หรือ result chip
- progress indicator ต้องเข้าใจได้โดยไม่พึ่งสีอย่างเดียว

Interaction QA:

- ยังเข้าถึง loading state, CSV error state, start state, quiz state, result state, และ restart flow ได้ครบ
- ผู้ใช้กดถัดไปไม่ได้ถ้ายังไม่เลือกคำตอบ และ state นี้ต้องมี copy ที่ชัดเจน
- ปุ่มย้อนกลับต้องคงคำตอบเดิมและแสดง selected state ถูกต้อง
- answer scale ใช้ได้กับ keyboard focus, screen reader, และ touch target บนมือถือ
- restart ต้องสร้างชุดคำถามใหม่และไม่ทำให้ดูเหมือนคำตอบเก่ายัง active อยู่
- recent-question avoidance ยังทำงานหลัง redesign

Content และ data QA:

- `questions.csv` และ `results.csv` ยังโหลดผ่าน local server ไม่ใช่เปิดไฟล์ตรง
- quiz ยังเลือกได้สูงสุด 4 คำถามต่อ dimension ครบ `EI`, `SN`, `TF`, `JP`
- result lookup ยังรองรับครบทั้ง 16 MBTI types
- ข้อความผลลัพธ์ภาษาไทยที่ยาวต้อง wrap ดีใน summary, strengths, cautions, และ career sections
- missing result fallback ต้องอ่านเข้าใจ และไม่ควรถูกออกแบบให้เหมือนผลลัพธ์ที่สมบูรณ์แล้ว

Accessibility QA:

- ตรวจ contrast ของ indigo, amber, teal, muted text, border, และ disabled controls
- มี visible focus state สำหรับ CTA, answer buttons, back/next, และ restart
- `aria-live` ยังนุ่มนวล ไม่ประกาศถี่เกินไปเมื่อ UI เปลี่ยนทีละเล็กน้อย
- heading order ไล่จาก quiz title ไป question, choices, result sections อย่างสมเหตุผล
- section ที่ใช้สีต้องมี text label เช่น "จุดแข็ง", "สิ่งที่ควรระวัง", และ "บทบาทที่อาจเข้ากับคุณ"

Microcopy ที่เสนอ:

- Start title: "ค้นหาแพตเทิร์นการตัดสินใจของคุณ"
- Start description: "ตอบ 16 สถานการณ์สั้น ๆ เพื่อดูแนวโน้ม MBTI ของคุณในมุมที่อ่านง่ายและเอาไปสะท้อนตัวเองต่อได้"
- Disclaimer: "ผลลัพธ์นี้เป็นแนวทางชวนสำรวจตัวเอง ไม่ใช่การวินิจฉัยหรือข้อสรุปถาวร"
- Primary CTA: "เริ่มสำรวจตัวเอง"
- Loading: "กำลังเตรียมชุดคำถาม..."
- Progress label: "คำถามที่ {current} จาก {total}"
- Choice A label: "ฝั่ง A"
- Choice B label: "ฝั่ง B"
- Neutral choice label: "ใกล้เคียงทั้งสองฝั่ง"
- Next CTA: "ไปข้อถัดไป"
- Result CTA: "ดูผลลัพธ์ของฉัน"
- Previous CTA: "ย้อนกลับ"
- Restart CTA: "ทำแบบทดสอบใหม่"
- Result eyebrow: "ผลลัพธ์เบื้องต้น"
- Strengths heading: "จุดแข็งที่มักเห็น"
- Cautions heading: "จุดที่น่าระวัง"
- Career heading: "บทบาทที่อาจเข้ากับคุณ"
- Tie note: "คะแนนบางมิติใกล้กันมาก ลองอ่านทั้งสองฝั่งเป็นพื้นที่ให้สำรวจต่อ"
- CSV error: "โหลดข้อมูลแบบทดสอบไม่สำเร็จ กรุณาเปิดผ่าน local server แล้วลองอีกครั้ง"

UX notes สำหรับ implement:

- Start screen สามารถยืม metaphor จาก ThreadWeave โดยวาง "ชุดคำถามวันนี้" เป็น pinned thread และวาง disclaimer เป็น note ขนาดเล็กใต้ CTA
- Quiz choices ควรจัดเหมือน reply cards สองฝั่งใต้คำถาม โดยมี 5-level scale เป็น connected control ระหว่างสองตัวเลือก
- Result page ควรอ่านเหมือน thread summary: type badge, short interpretation, score breakdown, แล้วตามด้วย insight sections แบบ nested
- หลีกเลี่ยงคำ forum ที่ไม่เข้ากับ MBTI เช่น "โพสต์", "รีพลาย", หรือ "moderator" เว้นแต่จะเปลี่ยน concept ทั้ง product
