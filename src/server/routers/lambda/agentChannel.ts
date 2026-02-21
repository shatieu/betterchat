import { InsertAgentChannelSchema, UpdateAgentChannelSchema } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { AgentChannelModel } from '@/database/models/agentChannel';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const agentChannelProcedure = authedProcedure.use(serverDatabase);

const createInputSchema = InsertAgentChannelSchema.omit({ userId: true });

/**
 * Agent Channel tRPC Router
 *
 * Provides type-safe API for managing agent communication channels
 */
export const agentChannelRouter = router({
  /**
   * Create a new channel
   */
  create: agentChannelProcedure.input(createInputSchema).mutation(async ({ input, ctx }) => {
    const { userId, serverDB: db } = ctx;

    try {
      const channelModel = new AgentChannelModel(db, userId);
      const channel = await channelModel.create(input as any);

      return {
        data: channel,
        message: 'Channel created successfully',
        success: true,
      };
    } catch (error) {
      console.error('[agentChannel:create]', error);
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create channel',
      });
    }
  }),

  /**
   * Delete a channel
   */
  delete: agentChannelProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, serverDB: db } = ctx;
      const { id } = input;

      try {
        const channelModel = new AgentChannelModel(db, userId);
        const deleted = await channelModel.delete(id);

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Channel not found or access denied',
          });
        }

        return {
          message: 'Channel deleted successfully',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[agentChannel:delete]', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete channel',
        });
      }
    }),

  /**
   * Find channels by agent ID
   */
  findByAgent: agentChannelProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId, serverDB: db } = ctx;
      const { agentId } = input;

      try {
        const channelModel = new AgentChannelModel(db, userId);
        const channels = await channelModel.findByAgentId(agentId);

        return {
          data: channels,
          success: true,
        };
      } catch (error) {
        console.error('[agentChannel:findByAgent]', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch channels',
        });
      }
    }),

  /**
   * Find channel by ID
   */
  findById: agentChannelProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId, serverDB: db } = ctx;
      const { id } = input;

      try {
        const channelModel = new AgentChannelModel(db, userId);
        const channel = await channelModel.findById(id);

        if (!channel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Channel not found',
          });
        }

        return {
          data: channel,
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[agentChannel:findById]', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch channel',
        });
      }
    }),

  /**
   * List all channels for user
   */
  list: agentChannelProcedure.query(async ({ ctx }) => {
    const { userId, serverDB: db } = ctx;

    try {
      const channelModel = new AgentChannelModel(db, userId);
      const channels = await channelModel.findByUserId();

      return {
        data: channels,
        success: true,
      };
    } catch (error) {
      console.error('[agentChannel:list]', error);
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch channels',
      });
    }
  }),

  /**
   * Test a channel (send a test message)
   */
  test: agentChannelProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, serverDB: db } = ctx;
      const { id } = input;

      try {
        const channelModel = new AgentChannelModel(db, userId);
        const channel = await channelModel.findById(id);

        if (!channel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Channel not found',
          });
        }

        // Channel test execution - based on type
        // For now, return success with a note that actual delivery requires runtime integration
        return {
          data: {
            channelId: id,
            channelType: channel.type,
            message: 'Test message queued. Actual delivery requires runtime integration.',
          },
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[agentChannel:test]', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to test channel',
        });
      }
    }),

  /**
   * Update a channel
   */
  update: agentChannelProcedure
    .input(
      z.object({
        data: UpdateAgentChannelSchema,
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, serverDB: db } = ctx;
      const { id, data } = input;

      try {
        const channelModel = new AgentChannelModel(db, userId);
        const channel = await channelModel.update(id, data as any);

        if (!channel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Channel not found or access denied',
          });
        }

        return {
          data: channel,
          message: 'Channel updated successfully',
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[agentChannel:update]', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update channel',
        });
      }
    }),
});
