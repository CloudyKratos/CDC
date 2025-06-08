
import ChannelService from './ChannelService';
import MessageService from './MessageService';
import SubscriptionService from './SubscriptionService';

// Re-export types for backward compatibility
export type { CommunityMessage, Channel } from './types';

// Main CommunityService that orchestrates all community functionality
class CommunityService {
  // Channel operations
  async getChannels() {
    return ChannelService.getChannels();
  }

  async joinChannel(channelName: string, userId: string) {
    return ChannelService.joinChannel(channelName, userId);
  }

  // Message operations
  async getMessages(channelName: string) {
    return MessageService.getMessages(channelName);
  }

  async sendMessage(content: string, channelName: string = 'general') {
    return MessageService.sendMessage(content, channelName);
  }

  async deleteMessage(messageId: string) {
    return MessageService.deleteMessage(messageId);
  }

  // Subscription operations
  subscribeToMessages(channelName: string, callback: (message: any) => void) {
    return SubscriptionService.subscribeToMessages(channelName, callback);
  }

  async getChannelOnlineUsers(channelName: string) {
    return SubscriptionService.getChannelOnlineUsers(channelName);
  }
}

export default new CommunityService();
