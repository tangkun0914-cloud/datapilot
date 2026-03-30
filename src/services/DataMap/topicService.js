import { mockTopics, mockAvailableTables } from '@/mock/DataMap/topics.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

let topicsData = structuredClone(mockTopics)

export async function getTopics() {
  if (USE_MOCK) {
    return structuredClone(topicsData)
  }
  // TODO: real API
}

export async function getTopicDetail(id) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(id))
    return topic ? structuredClone(topic) : null
  }
  // TODO: real API
}

export async function createTopic({ name, tags, visibility, description }) {
  if (USE_MOCK) {
    const newTopic = {
      id: Date.now(),
      name,
      tags: tags || [],
      description: description || '',
      owner: '王睿(wangrui)',
      admins: ['王睿(wangrui)'],
      visibility: visibility || 'public',
      tableCount: 0,
      followerCount: 0,
      followed: false,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      tables: [],
      usageNote: '',
    }
    // 确保添加到 topicsData 中
    topicsData.unshift(newTopic)
    return newTopic
  }
}

export async function updateTopic(id, data) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(id))
    if (topic) Object.assign(topic, data, { updatedAt: new Date().toISOString().slice(0, 10) })
    return topic
  }
}

export async function deleteTopic(id) {
  if (USE_MOCK) {
    topicsData = topicsData.filter(t => t.id !== Number(id))
    return true
  }
}

export async function toggleFollow(id) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(id))
    if (topic) {
      topic.followed = !topic.followed
      topic.followerCount += topic.followed ? 1 : -1
    }
    return topic
  }
}

export async function addTableToTopic(topicId, table) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(topicId))
    if (topic) {
      topic.tables.push({ ...table, addedAt: new Date().toISOString().slice(0, 10) })
      topic.tableCount = topic.tables.length
      topic.updatedAt = new Date().toISOString().slice(0, 10)
    }
    return topic
  }
}

export async function removeTableFromTopic(topicId, tableId) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(topicId))
    if (topic) {
      topic.tables = topic.tables.filter(t => t.id !== tableId)
      topic.tableCount = topic.tables.length
      topic.updatedAt = new Date().toISOString().slice(0, 10)
    }
    return topic
  }
}

export async function getAvailableTables() {
  if (USE_MOCK) {
    return mockAvailableTables
  }
}

export async function updateUsageNote(topicId, note) {
  if (USE_MOCK) {
    const topic = topicsData.find(t => t.id === Number(topicId))
    if (topic) {
      topic.usageNote = note
      topic.updatedAt = new Date().toISOString().slice(0, 10)
    }
    return topic
  }
}
