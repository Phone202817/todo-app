# Todo App (Vue 3 + TypeScript + Vite)
 
ระบบจัดการงาน (Todo) และจัดการผู้ใช้ สร้างด้วย Vue 3 + TypeScript + Vite ใช้ Vuetify 4 (รวมคอมโพเนนต์ Labs เช่น VCalendar, VDatePicker, VTimePicker) และ Firebase (Auth + Firestore)
 
## ภาพรวมสถาปัตยกรรม
- Frontend: Vue 3 + Vite + TypeScript
- UI: Vuetify 4 (รวม Labs components)
- Auth: Firebase Authentication (persisted ด้วย browserLocalPersistence)
- Data: Firestore
- Routing: Vue Router (ป้องกันหน้า requiresAuth และ requiresAdmin)
 
## ฟีเจอร์หลัก
- เข้าสู่ระบบ/สมัครสมาชิก พร้อมบันทึกข้อมูลผู้ใช้ใน Firestore
- หน้าปฏิทินงาน (Overview)
  - แสดงอีเวนต์ในปฏิทิน (Day/Week/Month/4 days)
  - CRUD อีเวนต์: เพิ่ม/แก้ไข/ลบ บันทึกลง Firestore ที่ `users/{uid}/events`
  - สีอีเวนต์อัตโนมัติ:
    - ฟ้า: งานยังไม่ถึงเวลา
    - เหลือง: กำลังอยู่ในช่วงเวลา
    - เขียว: งานถูกติ๊กว่าเสร็จแล้ว (Completed)
    - แดง: งานไม่เสร็จและเกินกำหนด
  - Toggle Completed ได้จากเมนูของอีเวนต์ (อัปเดตทันที)
  - Legend จุดสีตรงกลางการ์ด เพื่ออธิบายสถานะ
  - Search event (autocomplete) เพื่อกระโดดไปวันที่ของอีเวนต์นั้น (เปิดมุมมอง Day ให้)
  - Go to date (datepicker) พร้อมปุ่ม Cancel/OK
  - ปุ่มย้อนกลับจากมุมมอง Day → Month
  - Dialog เพิ่ม/แก้ไข ใช้ DatePicker/TimePicker พร้อมปุ่ม Cancel/OK
  - UI อัปเดตทันทีหลังบันทึก/ลบ โดยไม่ต้องรีเฟรช
- หน้าจัดการผู้ใช้ (UserManage)
  - โหลดรายชื่อผู้ใช้แบบ realtime ด้วย Firestore onSnapshot
  - ค้นหา/แบ่งหน้า (pagination)
  - เพิ่ม/แก้ไข/ลบ และแสดง error ผ่าน snackbar เมื่อสิทธิ์ไม่เพียงพอ

 
## เส้นทางและการป้องกัน (Routing)
- `/login`, `/register`: หน้า public
- `/overview`: ต้องเข้าสู่ระบบ (requiresAuth)
- `/usermanage`: ต้องเป็น admin (requiresAdmin) — แสดงภายใต้ MainLayout และโหลด UserManage เป็นหน้า child
- ระบบจะ redirect:
  - เมื่อเข้าสู่ระบบแล้วห้ามกลับไป `/login` หรือ `/register` จะพาไป `/overview`
  - เมื่อไม่มีสิทธิ์ admin แล้วเข้าหน้า `/usermanage` จะพาไป `/overview`
 
## โครงสร้างข้อมูล Firestore
- ผู้ใช้: `users/{uid}`
  - ตัวอย่างฟิลด์: `uid`, `email`, `displayName`, `role`, `status`, `createdAt`
- งาน (อีเวนต์): `users/{uid}/events/{eventId}`
  - ฟิลด์ที่ใช้:
    - `name` (string): ชื่ออีเวนต์
    - `details` (string): รายละเอียด
    - `startTs` (int): เวลาเริ่ม (timestamp ms)
    - `endTs` (int): เวลาเดดไลน์/สิ้นสุด (timestamp ms)
    - `color` (string): สี (ใช้ค่า default และคำนวณสีแสดงผลแบบอัตโนมัติ)
    - `timed` (bool): เป็นงานตามเวลาหรือไม่
    - `done` (bool): เสร็จแล้วหรือไม่
 
## กฎความปลอดภัย Firestore (แนะนำ)
### เฉพาะเจ้าของเข้าถึง subcollection ใต้ users/{uid}
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
 
    match /users/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
  }
}
```
 
### รองรับ admin override (อ่าน/แก้ไขได้ทั่วระบบ)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
 
    match /users/{userId} {
      allow create: if isOwner(userId);
      allow read: if isOwner(userId) || isAdmin();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
 
    match /users/{userId}/events/{eventId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create, update, delete: if isOwner(userId) || isAdmin();
    }
  }
}
```
 
> หมายเหตุ: หากใช้ validation แบบเข้มงวดสำหรับ `events`, อย่าลืมเพิ่มฟิลด์ `done` ในรายการอนุญาตและตรวจชนิดให้ถูกต้อง
 
## การติดตั้งและรัน
1) ติดตั้ง Node.js (แนะนำ 18+) และ npm  
2) ติดตั้งแพ็กเกจ
```
npm install
```
3) รันโหมดพัฒนา
```
npm run dev
```
4) สร้างโปรดักชันบิลด์
```
npm run build
```
5) พรีวิวโปรดักชันบิลด์
```
npm run preview
```
 
## ไฟล์สำคัญ
- หน้าปฏิทินงาน: `src/components/pages/Overview.vue`
- หน้าจัดการผู้ใช้: `src/components/pages/UserManage.vue`
- เลย์เอาต์หลัก: `src/components/layouts/MainLayout.vue`
- Router และ Routes: `src/components/router/index.ts`, `src/components/router/routes.ts`
- Vuetify plugin: `src/plugins/vuetify.ts` (รวม Labs สำหรับ VCalendar/DatePicker/TimePicker)
- Firebase config: `src/firebase/config.ts`
 
