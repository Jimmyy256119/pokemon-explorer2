# Pokémon Explorer v2 (React + Vite + Express)

รัน: `npm install` แล้ว `npm run dev` (เว็บ http://localhost:5173, API http://localhost:3001)
Production: `npm run build` แล้ว `npm start` (Express เสิร์ฟโฟลเดอร์ dist)

## Component Tree
```
App                      (state: ชื่อที่เลือก, สถานะโหลด, Stack ดูล่าสุด, dark mode)
├─ SearchBox             (autocomplete: debounce, คีย์บอร์ด ↑ ↓ Enter Esc)
├─ Detail                (loading / error+retry / success)
│  └─ Status
├─ Evolution             (ผังแตกกิ่งตามระดับ + ร่างอื่น)
├─ Featured              (loading / empty / error+retry / success)
│  └─ Status
└─ Recent                (Stack + เลือกเรียงลำดับ)
   └─ Status
```
Backend (server/index.js): `/api/search` `/api/pokemon/:name` `/api/featured`
= validate + cache (LRU) + ประมวลผล (Trie, BFS) + รวมข้อมูลให้ client เรียกครั้งเดียว

## Before → After
| ข้อแนะนำ / จุดแก้ | Before | After |
|---|---|---|
| 1.1 UI/UX | การ์ดเรียบ ไม่มีสถานะชัดเจน | ธีมใหม่ แถบสถานะ stat สีตามธาตุ responsive ทุกส่วนมี loading/empty/error/success |
| 1.2 ค้นหา | ต้องพิมพ์ชื่อเต็มเป๊ะ | autocomplete พิมพ์ "pik" ได้รายชื่อทันที |
| Backend | ส่งต่อ PokéAPI เฉย ๆ | validate, cache, รวม endpoint |
| หน้าแรก | 20+ request ทุกครั้ง | 1 request, ครั้งต่อไปจาก cache |
| Evolution | ต่อเป็นเส้นตรง (Eevee ผิด) | แสดงเป็นแผนผังแตกกิ่ง |
| Recently Viewed | sort แล้วลำดับ Stack เสีย | sort สำเนา Stack เดิมไม่เปลี่ยน |

## DSA และ Big-O
| โครงสร้าง | ที่ไหน | Before → After |
|---|---|---|
| Tree (Trie) | server autocomplete | วนทุกชื่อ O(N·L) → O(L + k) |
| Hash Table (Map + LRU) | server cache | เรียก PokéAPI 3 ครั้ง/คลิก → hit เป็น O(1) ไม่ยิง API |
| Queue (BFS) | server แปลง evolution chain | วน recursive ต่อเป็นเส้นตรง → ได้ระดับของต้นไม้ O(n) |
| Stack | client Recently Viewed | push / ย้ายตัวซ้ำขึ้นบน / จำกัดขนาด |
| Sorting (Merge Sort) | client Recent | O(n log n) stable (n เล็ก ประโยชน์หลักคือไม่ทำลาย Stack) |
