import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展dayjs插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 时区映射表 - 将我们的简化时区标识符映射到IANA时区标识符
export const TIMEZONE_MAP: { [key: string]: string } = {
  'UTC-12': 'Etc/GMT+12',
  'UTC-11': 'Etc/GMT+11', 
  'UTC-10': 'Pacific/Honolulu',
  'UTC-9': 'America/Anchorage',
  'UTC-8': 'America/Los_Angeles',
  'UTC-7': 'America/Denver',
  'UTC-6': 'America/Chicago',
  'UTC-5': 'America/New_York',
  'UTC-4': 'America/Halifax',
  'UTC-3': 'America/Sao_Paulo',
  'UTC-2': 'Etc/GMT+2',
  'UTC-1': 'Atlantic/Azores',
  'UTC+0': 'Europe/London',
  'UTC+1': 'Europe/Berlin',
  'UTC+2': 'Europe/Athens',
  'UTC+3': 'Europe/Istanbul',
  'UTC+4': 'Asia/Dubai',
  'UTC+5': 'Asia/Karachi',
  'UTC+6': 'Asia/Dhaka',
  'UTC+7': 'Asia/Bangkok',
  'UTC+8': 'Asia/Shanghai',
  'UTC+9': 'Asia/Tokyo',
  'UTC+10': 'Australia/Sydney',
  'UTC+11': 'Pacific/Guadalcanal',
  'UTC+12': 'Pacific/Auckland'
}

// 扩展的TimeSlot接口，包含UTC时间戳
export interface TimezoneAwareTimeSlot {
  date: string // 原始日期字符串 (如 "6/21")
  time: string // 原始时间字符串 (如 "14:00")
  dateIndex: number
  timeIndex: number
  type?: 'available' | 'unavailable'
  utcTimestamp: string // UTC时间戳 (ISO 8601格式)
  originalTimezone: string // 用户选择时的时区
}

/**
 * 将本地时间转换为UTC时间戳
 * @param date 日期字符串 (如 "6/21")
 * @param time 时间字符串 (如 "14:00") 
 * @param userTimezone 用户时区 (如 "UTC+8")
 * @returns UTC时间戳字符串
 */
export const convertToUTC = (date: string, time: string, userTimezone: string): string => {
  const [month, day] = date.split('/').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const year = new Date().getFullYear()
  
  // 获取IANA时区标识符
  const ianaTimezone = TIMEZONE_MAP[userTimezone] || 'UTC'
  
  // 在用户时区创建时间
  const localTime = dayjs.tz(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, ianaTimezone)
  
  // 转换为UTC并返回ISO字符串
  return localTime.utc().toISOString()
}

/**
 * 将UTC时间戳转换为指定时区的本地时间
 * @param utcTimestamp UTC时间戳
 * @param targetTimezone 目标时区 (如 "UTC+8")
 * @returns 本地时间对象 {date: string, time: string}
 */
export const convertFromUTC = (utcTimestamp: string, targetTimezone: string): { date: string, time: string } => {
  // 获取IANA时区标识符
  const ianaTimezone = TIMEZONE_MAP[targetTimezone] || 'UTC'
  
  // 将UTC时间转换为目标时区
  const localTime = dayjs.utc(utcTimestamp).tz(ianaTimezone)
  
  // 格式化为我们需要的格式
  const month = localTime.month() + 1 // dayjs的月份是0-11
  const day = localTime.date()
  const hour = localTime.hour()
  const minute = localTime.minute()
  
  return {
    date: `${month}/${day}`,
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
}

/**
 * 将传统TimeSlot转换为时区感知的TimeSlot
 * @param timeSlot 传统TimeSlot
 * @param userTimezone 用户时区
 * @returns 时区感知的TimeSlot
 */
export const createTimezoneAwareTimeSlot = (
  timeSlot: { date: string, time: string, dateIndex: number, timeIndex: number, type?: 'available' | 'unavailable' },
  userTimezone: string
): TimezoneAwareTimeSlot => {
  const utcTimestamp = convertToUTC(timeSlot.date, timeSlot.time, userTimezone)
  
  return {
    ...timeSlot,
    utcTimestamp,
    originalTimezone: userTimezone
  }
}

/**
 * 生成在指定时区下显示的时间段列表
 * @param startTime 开始时间 (如 "09:00")
 * @param endTime 结束时间 (如 "17:00") 
 * @param eventTimezone 活动创建时的时区
 * @param displayTimezone 当前用户的显示时区
 * @param baseDate 基准日期 (如 "6/21")
 * @returns 时间段列表
 */
export const generateTimezoneAwareTimeSlots = (
  startTime: string,
  endTime: string,
  eventTimezone: string,
  displayTimezone: string,
  baseDate: string = '1/1'
): string[] => {
  const slots: string[] = []
  
  // 将活动时间范围转换为UTC
  const startUTC = convertToUTC(baseDate, startTime, eventTimezone)
  const endUTC = convertToUTC(baseDate, endTime, eventTimezone)
  
  // 转换为显示时区
  const startLocal = convertFromUTC(startUTC, displayTimezone)
  const endLocal = convertFromUTC(endUTC, displayTimezone)
  
  // 解析开始和结束时间
  const [startHour, startMinute] = startLocal.time.split(':').map(Number)
  const [endHour, endMinute] = endLocal.time.split(':').map(Number)
  
  // 生成15分钟间隔的时间段
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`)
    
    // 增加15分钟
    currentMinute += 15
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour++
    }
  }
  
  return slots
}

/**
 * 检查两个时区感知的时间段是否表示同一个UTC时间
 * @param slot1 时间段1
 * @param slot2 时间段2
 * @returns 是否为同一时间
 */
export const isSameUTCTime = (slot1: TimezoneAwareTimeSlot, slot2: TimezoneAwareTimeSlot): boolean => {
  return slot1.utcTimestamp === slot2.utcTimestamp
}

/**
 * 获取用户浏览器的时区
 * @returns 时区标识符 (如 "UTC+8")
 */
export const getUserTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = dayjs().tz(timezone).utcOffset() / 60
    
    if (offset >= 0) {
      return `UTC+${offset}`
    } else {
      return `UTC${offset}` // 负数已经包含了负号
    }
  } catch (error) {
    console.warn('无法获取用户时区，使用默认值 UTC+8', error)
    return 'UTC+8'
  }
}

/**
 * 格式化时区感知的时间显示
 * @param slot 时区感知的时间段
 * @param displayTimezone 显示时区
 * @returns 格式化的时间字符串
 */
export const formatTimezoneAwareSlot = (slot: TimezoneAwareTimeSlot, displayTimezone: string): string => {
  const localTime = convertFromUTC(slot.utcTimestamp, displayTimezone)
  const [month, day] = localTime.date.split('/').map(Number)
  const year = new Date().getFullYear()
  
  const dateObj = new Date(year, month - 1, day)
  const dayName = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' })
  
  return `${dayName} ${year}年${month}月${day}日 ${localTime.time}`
} 