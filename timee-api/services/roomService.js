const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const pino = require('pino');

// 配置日志
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  } : undefined
});

class RoomService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 创建新房间
   * @param {Object} roomData - 房间基础信息
   * @returns {Promise<Object>} 包含 shareId 和 tcCode 的房间信息
   */
  async createRoom(roomData = {}) {
    try {
      // 生成唯一的 shareId (nanoid 12位)
      const shareId = nanoid(12);
      
      // 生成唯一的 6位数字 tcCode
      const tcCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 创建房间
      const room = await this.prisma.room.create({
        data: {
          shareId,
          tcCode,
          title: roomData.title || null,
          description: roomData.description || null,
          timezone: roomData.timezone || 'UTC'
        }
      });

      logger.info({ shareId, tcCode }, 'Room created');
      
      return {
        id: room.id,
        shareId: room.shareId,
        tcCode: room.tcCode,
        title: room.title,
        description: room.description,
        timezone: room.timezone,
        createdAt: room.createdAt
      };
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  /**
   * 用户加入房间
   * @param {string} shareId - 房间分享ID
   * @param {Object} participantData - 参与者信息
   * @returns {Promise<Object>} 参与者信息
   */
  async joinRoom(shareId, participantData) {
    try {
      // 验证房间是否存在
      const room = await this.prisma.room.findUnique({
        where: { shareId }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // 检查用户名是否已存在
      const existingParticipant = await this.prisma.participant.findUnique({
        where: {
          roomId_name: {
            roomId: room.id,
            name: participantData.name
          }
        }
      });

      if (existingParticipant) {
        // 如果用户已存在，直接返回现有信息
        logger.info({ name: participantData.name, shareId }, 'User rejoined room');
        return existingParticipant;
      }

      // 创建新参与者
      const participant = await this.prisma.participant.create({
        data: {
          roomId: room.id,
          name: participantData.name,
          email: participantData.email || null,
          initials: participantData.initials || participantData.name.slice(0, 2).toUpperCase(),
          timezone: participantData.timezone || 'UTC'
        }
      });

      logger.info({ name: participantData.name, shareId, participantId: participant.id }, 'User joined room');
      
      return participant;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      throw error;
    }
  }

  /**
   * 更新用户可用时间 - 使用事务确保原子性
   * @param {string} shareId - 房间分享ID
   * @param {string} participantId - 参与者ID
   * @param {Array} selectedSlots - 选中的时间段数组
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserAvailability(shareId, participantId, selectedSlots) {
    try {
      // 验证房间和参与者
      const room = await this.prisma.room.findUnique({
        where: { shareId }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      const participant = await this.prisma.participant.findUnique({
        where: { id: participantId }
      });

      if (!participant || participant.roomId !== room.id) {
        throw new Error('Participant not found or not in this room');
      }

      // 🔥 关键：使用 Prisma 事务保证原子性，防止竞态条件
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. 删除该参与者的所有现有选择
        await tx.selectedSlot.deleteMany({
          where: { participantId }
        });

        // 2. 批量创建新的选择记录
        if (selectedSlots && selectedSlots.length > 0) {
          const slotsToCreate = selectedSlots.map(slot => ({
            roomId: room.id,
            participantId,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            isAvailable: slot.isAvailable !== false // 默认为true
          }));

          await tx.selectedSlot.createMany({
            data: slotsToCreate
          });
        }

        // 3. 更新参与者的更新时间
        await tx.participant.update({
          where: { id: participantId },
          data: { updatedAt: new Date() }
        });

        return { success: true, slotsCount: selectedSlots?.length || 0 };
      });

      console.log(`🔄 Updated availability for ${participant.name} - ${result.slotsCount} slots`);
      
      return result;
    } catch (error) {
      console.error('❌ Error updating user availability:', error);
      throw error;
    }
  }

  /**
   * 根据 shareId 获取房间完整信息
   * @param {string} shareId - 房间分享ID
   * @returns {Promise<Object>} 房间完整信息
   */
  async getRoomByShareId(shareId) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { shareId },
        include: {
          candidateSlots: {
            orderBy: { startTime: 'asc' }
          },
          participants: {
            include: {
              selectedSlots: {
                orderBy: { startTime: 'asc' }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      console.log(`📖 Retrieved room ${shareId} with ${room.participants.length} participants`);
      
      return room;
    } catch (error) {
      console.error('❌ Error getting room:', error);
      throw error;
    }
  }

  /**
   * 根据 tcCode 获取 shareId（用于首页口令跳转）
   * @param {string} tcCode - 6位数字口令
   * @returns {Promise<string>} shareId
   */
  async getShareIdByTcCode(tcCode) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { tcCode },
        select: { shareId: true }
      });

      if (!room) {
        throw new Error('Invalid tc-code');
      }

      console.log(`🔑 TC-Code ${tcCode} resolved to room ${room.shareId}`);
      
      return room.shareId;
    } catch (error) {
      console.error('❌ Error resolving tc-code:', error);
      throw error;
    }
  }

  /**
   * 关闭 Prisma 连接
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = RoomService; 