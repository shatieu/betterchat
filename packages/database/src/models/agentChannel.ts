import { and, desc, eq } from 'drizzle-orm';

import type { AgentChannel, NewAgentChannel } from '../schemas/agentChannel';
import { agentChannels } from '../schemas/agentChannel';
import type { LobeChatDatabase } from '../type';

export class AgentChannelModel {
  private readonly userId: string;
  private readonly db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId?: string) {
    this.db = db;
    this.userId = userId!;
  }

  // Create a new channel
  async create(data: Omit<NewAgentChannel, 'userId'>): Promise<AgentChannel> {
    const channel = await this.db
      .insert(agentChannels)
      .values({
        ...data,
        userId: this.userId,
      } as NewAgentChannel)
      .returning();

    return channel[0];
  }

  // Find channel by ID (with user ownership check)
  async findById(id: string): Promise<AgentChannel | null> {
    const result = await this.db
      .select()
      .from(agentChannels)
      .where(and(eq(agentChannels.id, id), eq(agentChannels.userId, this.userId)))
      .limit(1);

    return result[0] || null;
  }

  // Find all channels for a specific agent
  async findByAgentId(agentId: string): Promise<AgentChannel[]> {
    return this.db
      .select()
      .from(agentChannels)
      .where(and(eq(agentChannels.agentId, agentId), eq(agentChannels.userId, this.userId)))
      .orderBy(desc(agentChannels.createdAt));
  }

  // Find all channels for the user (across all agents)
  async findByUserId(): Promise<AgentChannel[]> {
    return this.db
      .select()
      .from(agentChannels)
      .where(eq(agentChannels.userId, this.userId))
      .orderBy(desc(agentChannels.createdAt));
  }

  // Find channels by type
  async findByType(type: string): Promise<AgentChannel[]> {
    return this.db
      .select()
      .from(agentChannels)
      .where(and(eq(agentChannels.type, type), eq(agentChannels.userId, this.userId)))
      .orderBy(desc(agentChannels.createdAt));
  }

  // Update channel
  async update(
    id: string,
    data: Partial<Pick<NewAgentChannel, 'config' | 'enabled' | 'name' | 'type'>>,
  ): Promise<AgentChannel | null> {
    const result = await this.db
      .update(agentChannels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(agentChannels.id, id), eq(agentChannels.userId, this.userId)))
      .returning();

    return result[0] || null;
  }

  // Delete channel
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(agentChannels)
      .where(and(eq(agentChannels.id, id), eq(agentChannels.userId, this.userId)))
      .returning({ id: agentChannels.id });

    return result.length > 0;
  }
}
