<template>
  <v-container fluid>
    <v-card class="pa-3 my-3 d-flex justify-space-between align-center">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-btn
          v-if="type === 'day'"
          icon
          variant="text"
          density="comfortable"
          @click="backToMonth"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>Calendars</div>
      </div>
      <div class="d-flex align-center" style="gap: 12px;">
        <div class="d-flex align-center" style="gap: 6px;">
          <v-icon color="blue" size="small">mdi-circle</v-icon>
          <span class="text-caption">Upcoming</span>
        </div>
        <div class="d-flex align-center" style="gap: 6px;">
          <v-icon color="yellow" size="small">mdi-circle</v-icon>
          <span class="text-caption">Ongoing</span>
        </div>
        <div class="d-flex align-center" style="gap: 6px;">
          <v-icon color="green" size="small">mdi-circle</v-icon>
          <span class="text-caption">Done</span>
        </div>
        <div class="d-flex align-center" style="gap: 6px;">
          <v-icon color="red" size="small">mdi-circle</v-icon>
          <span class="text-caption">Overdue</span>
        </div>
      </div>
      <div class="d-flex align-center" style="gap: 12px;">
        <v-autocomplete
          v-model="searchSelectedId"
          :items="searchItems"
          item-title="title"
          item-value="id"
          density="comfortable"
          variant="outlined"
          hide-details
          clearable
          placeholder="Search event..."
          style="min-width: 260px;"
          @update:modelValue="onSelectSearch"
        />
        <v-btn color="primary" @click="openAdd">ADD TODO</v-btn>
      </div>
  </v-card>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat>
          <v-btn
            class="me-4"
            color="grey-darken-2"
            variant="outlined"
            @click="setToday"
          >
            Today
          </v-btn>
          <v-btn
            color="grey-darken-2"
            size="small"
            variant="text"
            icon
            @click="prev"
          >
            <v-icon size="small">
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            color="grey-darken-2"
            size="small"
            variant="text"
            icon
            @click="next"
          >
            <v-icon size="small">
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="calendar">
            {{ calendar.title }}
          </v-toolbar-title>
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                color="grey-darken-2"
                variant="outlined"
                v-bind="props"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon end>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu v-model="goDateMenu" location="bottom end" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="ms-2" variant="outlined" color="grey-darken-2">
                Go to date
              </v-btn>
            </template>
            <v-card>
              <v-date-picker v-model="goDateDraft" />
              <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="goDateMenu = false">Cancel</v-btn>
                <v-btn color="primary" @click="onConfirmGoDate">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet class="flex-grow-1">
        <v-calendar
          ref="calendar"
          v-model="focus"
          :event-color="getEventColor"
          :events="events"
          :type="type"
          color="primary"
          @change="updateRange"
          @click:date="viewDay"
          @click:event="showEvent"
          @click:more="viewDay"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :activator="selectedElement"
          :close-on-content-click="false"
          location="end"
        >
          <v-card
            color="grey-lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <span v-html="selectedEvent.details"></span>
              <v-switch
                v-model="selectedEventDone"
                inset
                label="Completed"
                @update:modelValue="onToggleDone"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="text" @click="onEdit">Edit</v-btn>
              <v-btn color="error" variant="text" @click="onDelete">Delete</v-btn>
              <v-btn
                color="secondary"
                variant="text"
                @click="selectedOpen = false"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <v-dialog v-model="dialogOpen" max-width="500">
          <v-card>
            <v-card-title>{{ isEdit ? 'Edit Event' : 'Add Event' }}</v-card-title>
            <v-card-text>
              <v-text-field v-model="form.name" label="Title" variant="outlined" />
              <v-textarea v-model="form.details" label="Details" variant="outlined" rows="2" />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-menu v-model="startDateMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-bind="props" label="Start date" variant="outlined" readonly :model-value="form.startDate" />
                    </template>
                    <v-card>
                      <v-date-picker v-model="form.startDate" />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" @click="cancelStartDate">Cancel</v-btn>
                        <v-btn color="primary" @click="confirmStartDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="startTimeMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-bind="props" label="Start time" variant="outlined" readonly :model-value="form.startTime" />
                    </template>
                    <v-card>
                      <v-time-picker v-model="form.startTime" format="24hr" />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" @click="cancelStartTime">Cancel</v-btn>
                        <v-btn color="primary" @click="confirmStartTime">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-menu v-model="endDateMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-bind="props" label="Deadline date" variant="outlined" readonly :model-value="form.endDate" />
                    </template>
                    <v-card>
                      <v-date-picker v-model="form.endDate" />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" @click="cancelEndDate">Cancel</v-btn>
                        <v-btn color="primary" @click="confirmEndDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="endTimeMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field v-bind="props" label="Deadline time" variant="outlined" readonly :model-value="form.endTime" />
                    </template>
                    <v-card>
                      <v-time-picker v-model="form.endTime" format="24hr" />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" @click="cancelEndTime">Cancel</v-btn>
                        <v-btn color="primary" @click="confirmEndTime">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
              <v-btn color="primary" @click="saveEvent" :loading="saving" :disabled="saving">{{ isEdit ? 'Update' : 'Create' }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar v-model="errorOpen" color="error" timeout="4000">
          {{ errorText }}
        </v-snackbar>
        <v-snackbar v-model="successOpen" color="success" timeout="3000">
          {{ successText }}
        </v-snackbar>
      </v-sheet>
    </v-col>
  </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, nextTick, watch } from 'vue'
  import { auth, db } from '../../firebase/config'
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
  } from 'firebase/firestore'

  type CalendarViewType = 'month' | 'week' | 'day' | '4day'
  type MyCalendarEvent = {
    name: string
    start: Date | string
    end: Date | string
    color: string
    timed: boolean
    details?: string
    id?: string
    done?: boolean
  }

  const calendar = ref<any>(null)

  const typeToLabel = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    '4day': '4 Days',
  }

  const focus = ref<string>('')
  const type = ref<CalendarViewType>('month')
  const selectedEvent = ref<MyCalendarEvent>({} as MyCalendarEvent)
  const selectedElement = ref<Element | undefined>(undefined)
  const selectedOpen = ref(false)
  const events = ref<MyCalendarEvent[]>([])
  const dialogOpen = ref(false)
  const isEdit = ref(false)
  const saving = ref(false)
  const selectedEventDone = ref(false)
  const searchSelectedId = ref<string | null>(null)
  const goDateMenu = ref(false)
  const goDateDraft = ref<string | null>(null)
  const startDateMenu = ref(false)
  const startTimeMenu = ref(false)
  const endDateMenu = ref(false)
  const endTimeMenu = ref(false)
  const backupStartDate = ref('')
  const backupStartTime = ref('')
  const backupEndDate = ref('')
  const backupEndTime = ref('')
  const form = ref({
    id: undefined as string | undefined,
    name: '',
    details: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    color: 'blue',
    timed: true,
    done: false,
  })
  const errorOpen = ref(false)
  const errorText = ref('')
  function showError(message: string) {
    errorText.value = message
    errorOpen.value = true
  }
  const successOpen = ref(false)
  const successText = ref('')
  function showSuccess(message: string) {
    successText.value = message
    successOpen.value = true
  }

  onMounted(async () => {
    await nextTick()
    if (calendar.value && typeof calendar.value.checkChange === 'function') {
      calendar.value.checkChange()
    }
  })

  watch(goDateMenu, (v) => {
    if (v) {
      goDateDraft.value = focus.value || toLocalDate(new Date())
    }
  })
  watch(startDateMenu, (v) => {
    if (v) backupStartDate.value = form.value.startDate
  })
  watch(startTimeMenu, (v) => {
    if (v) backupStartTime.value = form.value.startTime
  })
  watch(endDateMenu, (v) => {
    if (v) backupEndDate.value = form.value.endDate
  })
  watch(endTimeMenu, (v) => {
    if (v) backupEndTime.value = form.value.endTime
  })

  const searchItems = computed(() => {
    return events.value.map(e => {
      const d = new Date(e.start)
      const label = `${e.name} (${formatDateLabel(d)})`
      return { id: e.id, title: label }
    }).filter(it => it.id)
  })

  function viewDay (_nativeEvent: Event, { date }: { date: string }) {
    focus.value = date
    type.value = 'day'
  }
  function getEventColor (event: any) {
    const now = Date.now()
    const start = new Date(event.start).getTime()
    const end = new Date(event.end).getTime()
    if (event.done) return 'green'
    if (now < start) return 'blue'
    if (now >= start && now <= end) return 'yellow'
    if (now > end) return 'red'
    return 'blue'
  }
  function onSelectSearch (id: string | null) {
    if (!id) return
    const ev = events.value.find(x => x.id === id)
    if (!ev) return
    focus.value = toLocalDate(new Date(ev.start as any))
    type.value = 'day'
    if (calendar.value) calendar.value.checkChange()
  }
  function onConfirmGoDate() {
    if (!goDateDraft.value) return
    focus.value = goDateDraft.value
    type.value = 'day'
    goDateMenu.value = false
    if (calendar.value) calendar.value.checkChange()
  }
  function setToday () {
    focus.value = ''
  }
  function prev () {
    calendar.value.prev()
  }
  function next () {
    calendar.value.next()
  }
  function backToMonth () {
    type.value = 'month'
    if (calendar.value) calendar.value.checkChange()
  }
  function showEvent (nativeEvent: Event, { event }: any) {
    const open = () => {
      selectedEvent.value = event
      selectedEventDone.value = !!event.done
      selectedElement.value = nativeEvent.target as Element
      requestAnimationFrame(() => requestAnimationFrame(() => selectedOpen.value = true))
    }
    if (selectedOpen.value) {
      selectedOpen.value = false
      requestAnimationFrame(() => requestAnimationFrame(() => open()))
    } else {
      open()
    }
    nativeEvent.stopPropagation()
  }
  async function onToggleDone (val: boolean | null) {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const ev: any = selectedEvent.value
    if (!ev?.id) return
    try {
      const newVal = !!val
      await updateDoc(doc(db, 'users', uid, 'events', ev.id), { done: newVal })
      ev.done = newVal
      if (calendar.value) calendar.value.checkChange()
    } catch (e: any) {
      selectedEventDone.value = !val
      showError(e?.message || 'อัปเดตสถานะไม่สำเร็จ')
    }
  }
  async function updateRange ({ start, end }: any) {
    const min = new Date(`${start.date}T00:00:00`).getTime()
    const max = new Date(`${end.date}T23:59:59`).getTime()
    const uid = auth.currentUser?.uid
    if (!uid) {
      events.value = []
      return
    }
    const col = collection(db, 'users', uid, 'events')
    try {
      const q = query(col, where('startTs', '>=', min), where('startTs', '<=', max), orderBy('startTs', 'asc'))
      const snap = await getDocs(q)
      const list: MyCalendarEvent[] = []
      snap.forEach(d => {
        const data: any = d.data()
        list.push({
          id: d.id,
          name: data.name,
          details: data.details || '',
          start: new Date(data.startTs),
          end: new Date(data.endTs),
          color: data.color || 'blue',
          timed: data.timed !== false,
          done: data.done === true,
        })
      })
      events.value = list
    } catch (e: any) {
      events.value = []
      showError(e?.message || 'ไม่สามารถโหลดอีเวนต์ได้ (อาจไม่มีสิทธิ์เข้าถึง)')
    }
  }

  function openAdd () {
    isEdit.value = false
    form.value = {
      id: undefined,
      name: '',
      details: '',
      startDate: toLocalDate(new Date()),
      startTime: toLocalTime(new Date()),
      endDate: toLocalDate(new Date(new Date().getTime() + 60 * 60 * 1000)),
      endTime: toLocalTime(new Date(new Date().getTime() + 60 * 60 * 1000)),
      color: 'blue',
      timed: true,
      done: false,
    }
    dialogOpen.value = true
  }
  function onEdit () {
    selectedOpen.value = false
    if (!selectedEvent.value) return
    const ev: any = selectedEvent.value
    isEdit.value = true
    form.value = {
      id: ev.id,
      name: ev.name || '',
      details: ev.details || '',
      startDate: toLocalDate(new Date(ev.start)),
      startTime: toLocalTime(new Date(ev.start)),
      endDate: toLocalDate(new Date(ev.end)),
      endTime: toLocalTime(new Date(ev.end)),
      color: ev.color || 'blue',
      timed: ev.timed !== false,
      done: ev.done === true,
    }
    dialogOpen.value = true
  }
  async function onDelete () {
    selectedOpen.value = false
    const uid = auth.currentUser?.uid
    if (!uid) return
    const ev: any = selectedEvent.value
    if (!ev?.id) return
    const ok = typeof window !== 'undefined' ? window.confirm('Delete this event?') : true
    if (!ok) return
    try {
      await deleteDoc(doc(db, 'users', uid, 'events', ev.id))
      events.value = events.value.filter(x => x.id !== ev.id)
      if (calendar.value) calendar.value.checkChange()
    } catch (e: any) {
      showError(e?.message || 'ลบอีเวนต์ไม่สำเร็จ')
    }
  }
  async function saveEvent () {
    const uid = auth.currentUser?.uid
    if (!uid) {
      showError('กรุณาเข้าสู่ระบบก่อนบันทึก')
      return
    }
    saving.value = true
    const s = combineDateTime(form.value.startDate, form.value.startTime)
    const e = combineDateTime(form.value.endDate, form.value.endTime)
    if (!form.value.name || isNaN(s) || isNaN(e) || s > e) {
      showError('กรุณากรอกชื่อและเวลาให้ถูกต้อง')
      saving.value = false
      return
    }
    const payload: any = {
      name: form.value.name,
      details: form.value.details || '',
      startTs: s,
      endTs: e,
      color: form.value.color || 'blue',
      timed: form.value.timed !== false,
      done: form.value.done === true,
    }
    const col = collection(db, 'users', uid, 'events')
    try {
      if (isEdit.value && form.value.id) {
        await updateDoc(doc(db, 'users', uid, 'events', form.value.id), payload)
        const idx = events.value.findIndex(x => x.id === form.value.id)
        if (idx !== -1) {
          const updated: MyCalendarEvent = {
            id: form.value.id,
            name: form.value.name,
            details: form.value.details || '',
            start: new Date(s),
            end: new Date(e),
            color: 'blue',
            timed: form.value.timed !== false,
            done: form.value.done === true,
          }
          events.value.splice(idx, 1, updated)
          events.value = [...events.value]
          if (selectedEvent.value?.id === form.value.id) {
            selectedEvent.value = updated as any
          }
        }
      } else {
        const docRef = await addDoc(col, payload)
        const created: MyCalendarEvent = {
          id: docRef.id,
          name: form.value.name,
          details: form.value.details || '',
          start: new Date(s),
          end: new Date(e),
          color: 'blue',
          timed: form.value.timed !== false,
          done: form.value.done === true,
        }
        events.value = [...events.value, created]
      }
      dialogOpen.value = false
      showSuccess('บันทึกสำเร็จ')
      if (calendar.value) calendar.value.checkChange()
    } catch (e: any) {
      showError(e?.message || 'บันทึกอีเวนต์ไม่สำเร็จ')
    } finally {
      saving.value = false
    }
  }
  function cancelStartDate() {
    form.value.startDate = backupStartDate.value
    startDateMenu.value = false
  }
  function confirmStartDate() {
    startDateMenu.value = false
  }
  function cancelStartTime() {
    form.value.startTime = backupStartTime.value
    startTimeMenu.value = false
  }
  function confirmStartTime() {
    startTimeMenu.value = false
  }
  function cancelEndDate() {
    form.value.endDate = backupEndDate.value
    endDateMenu.value = false
  }
  function confirmEndDate() {
    endDateMenu.value = false
  }
  function cancelEndTime() {
    form.value.endTime = backupEndTime.value
    endTimeMenu.value = false
  }
  function confirmEndTime() {
    endTimeMenu.value = false
  }
  function toLocalDate(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const y = d.getFullYear()
    const m = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    return `${y}-${m}-${day}`
  }
  function toLocalTime(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const h = pad(d.getHours())
    const min = pad(d.getMinutes())
    return `${h}:${min}`
  }
  function combineDateTime(dateVal: any, timeVal: any) {
    const dateStr = normalizeDateInput(dateVal)
    const timeStr = normalizeTimeInput(timeVal)
    if (!dateStr || !timeStr) return NaN as unknown as number
    const iso = `${dateStr}T${timeStr}:00`
    const t = new Date(iso).getTime()
    return t
  }
  function normalizeDateInput(val: any): string {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (val instanceof Date) return toLocalDate(val)
    return ''
  }
  function normalizeTimeInput(val: any): string {
    if (!val) return ''
    if (typeof val === 'string') return val.slice(0,5)
    if (val instanceof Date) return toLocalTime(val)
    return ''
  }
  function formatDateLabel(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  }
</script>
