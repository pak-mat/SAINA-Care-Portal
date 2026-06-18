// File: src/services/localSocialEngine.ts
import { getDB, saveDB } from './localEngine';

export interface GroupChat {
  id: string;
  name: string;
  createdBy: string;
  members: string[]; // User IDs
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SocialMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface TimelineComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface TimelinePost {
  id: string;
  userId: string;
  userName: string;
  avatarColor: string;
  text: string;
  timestamp: string;
  likes: string[]; // User IDs who liked
  comments: TimelineComment[];
}

interface SocialDB {
  following: Record<string, string[]>; // key: userId, value: array of targetUserIds
  followers: Record<string, string[]>; // key: userId, value: array of sourceUserIds
  friends: Record<string, string[]>; // key: userId, value: array of friendUserIds
  friendRequestsSent: Record<string, string[]>; // key: userId, value: targetUserIds
  friendRequestsReceived: Record<string, string[]>; // key: userId, value: sourceUserIds
  kudos: Record<string, string[]>; // key: targetUserId, value: array of userIds who gave kudos
  groupChats: GroupChat[];
  groupMessages: Record<string, GroupMessage[]>; // key: groupId, value: array of messages
  directMessages: SocialMessage[];
  timelinePosts: TimelinePost[];
}

const SOCIAL_DB_KEY = 'saina_social_db_v1';

function initSocialDB() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(SOCIAL_DB_KEY)) {
    const defaultDB: SocialDB = {
      following: {},
      followers: {},
      friends: {},
      friendRequestsSent: {},
      friendRequestsReceived: {},
      kudos: {},
      groupChats: [
        {
          id: 'welcome-peer-group',
          name: 'Campus Self-Care Lounge 🌸',
          createdBy: 'system',
          members: [
            '123e4567-e89b-12d3-a456-426614174000', // Adam Shah (student)
            '123e4567-e89b-12d3-a456-426614174001'  // Cik Nor (counselor)
          ],
          createdAt: new Date().toISOString()
        }
      ],
      groupMessages: {
        'welcome-peer-group': [
          {
            id: 'init-msg-1',
            groupId: 'welcome-peer-group',
            senderId: '123e4567-e89b-12d3-a456-426614174001',
            senderName: 'Cik Nor',
            text: 'Welcome Wellness peers to the Self-Care Lounge! Let\'s use this channel to sync on care schedules and group challenges.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'init-msg-2',
            groupId: 'welcome-peer-group',
            senderId: '123e4567-e89b-12d3-a456-426614174000',
            senderName: 'Adam Shah',
            text: 'Sounds amazing! Happy to be here to encourage students.',
            timestamp: new Date().toISOString()
          }
        ]
      },
      directMessages: [],
      timelinePosts: [
        {
          id: 'post-1',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          userName: 'Adam Shah',
          avatarColor: 'indigo',
          text: 'Just finished a 15-minute mindfulness breathing exercise on Saina Portal. Felt my heart rate calm down immediately! ✨ Check out the breathing engine under Home.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: ['123e4567-e89b-12d3-a456-426614174001'],
          comments: [
            {
              id: 'comment-1',
              userId: '123e4567-e89b-12d3-a456-426614174001',
              userName: 'Cik Nor',
              text: 'Incredible progress Adam! Consistency is the key to nervous system regulation.',
              timestamp: new Date(Date.now() - 6000000).toISOString()
            }
          ]
        },
        {
          id: 'post-2',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          userName: 'Cik Nor',
          avatarColor: 'emerald',
          text: '💡 Wellness Tip of the Day: Try to follow the "5-4-3-2-1" technique today if you feel overwhelmed with exams or school transfers. Let me know if you would like me to detail it.',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          likes: ['123e4567-e89b-12d3-a456-426614174000'],
          comments: []
        }
      ]
    };
    localStorage.setItem(SOCIAL_DB_KEY, JSON.stringify(defaultDB));
  }
}

function getSocialDB(): SocialDB {
  initSocialDB();
  if (typeof window === 'undefined') {
    return {
      following: {}, followers: {}, friends: {},
      friendRequestsSent: {}, friendRequestsReceived: {},
      kudos: {}, groupChats: [], groupMessages: {},
      directMessages: [], timelinePosts: []
    };
  }
  return JSON.parse(localStorage.getItem(SOCIAL_DB_KEY) || '{}');
}

function saveSocialDB(db: SocialDB) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOCIAL_DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('social_db_updated'));
}

window.addEventListener('storage', (e) => {
  if (e.key === SOCIAL_DB_KEY) {
    window.dispatchEvent(new Event('social_db_updated'));
  }
});

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ------ INTRASOLUTION RELATIONSHIPS ------

// 1. Follow System
export function followUser(userId: string, targetId: string) {
  if (userId === targetId) return;
  const db = getSocialDB();
  
  if (!db.following[userId]) db.following[userId] = [];
  if (!db.following[userId].includes(targetId)) {
    db.following[userId].push(targetId);
  }

  if (!db.followers[targetId]) db.followers[targetId] = [];
  if (!db.followers[targetId].includes(userId)) {
    db.followers[targetId].push(userId);
  }

  saveSocialDB(db);
}

export function unfollowUser(userId: string, targetId: string) {
  const db = getSocialDB();

  if (db.following[userId]) {
    db.following[userId] = db.following[userId].filter((id) => id !== targetId);
  }
  if (db.followers[targetId]) {
    db.followers[targetId] = db.followers[targetId].filter((id) => id !== userId);
  }

  saveSocialDB(db);
}

export function isFollowing(userId: string, targetId: string): boolean {
  const db = getSocialDB();
  return db.following[userId]?.includes(targetId) || false;
}

export function getFollowingCount(userId: string): number {
  const db = getSocialDB();
  return db.following[userId]?.length || 0;
}

export function getFollowersCount(userId: string): number {
  const db = getSocialDB();
  return db.followers[userId]?.length || 0;
}

export function getFollowingList(userId: string): string[] {
  const db = getSocialDB();
  return db.following[userId] || [];
}

export function getFollowersList(userId: string): string[] {
  const db = getSocialDB();
  return db.followers[userId] || [];
}


// 2. Friends System
export function sendFriendRequest(userId: string, targetId: string) {
  if (userId === targetId) return;
  const db = getSocialDB();

  // If already friends, do nothing
  if (db.friends[userId]?.includes(targetId)) return;

  if (!db.friendRequestsSent[userId]) db.friendRequestsSent[userId] = [];
  if (!db.friendRequestsSent[userId].includes(targetId)) {
    db.friendRequestsSent[userId].push(targetId);
  }

  if (!db.friendRequestsReceived[targetId]) db.friendRequestsReceived[targetId] = [];
  if (!db.friendRequestsReceived[targetId].includes(userId)) {
    db.friendRequestsReceived[targetId].push(userId);
  }

  saveSocialDB(db);
}

export function cancelFriendRequest(userId: string, targetId: string) {
  const db = getSocialDB();

  if (db.friendRequestsSent[userId]) {
    db.friendRequestsSent[userId] = db.friendRequestsSent[userId].filter((id) => id !== targetId);
  }
  if (db.friendRequestsReceived[targetId]) {
    db.friendRequestsReceived[targetId] = db.friendRequestsReceived[targetId].filter((id) => id !== userId);
  }

  saveSocialDB(db);
}

export function acceptFriendRequest(userId: string, requesterId: string) {
  const db = getSocialDB();

  // Remove request
  if (db.friendRequestsReceived[userId]) {
    db.friendRequestsReceived[userId] = db.friendRequestsReceived[userId].filter((id) => id !== requesterId);
  }
  if (db.friendRequestsSent[requesterId]) {
    db.friendRequestsSent[requesterId] = db.friendRequestsSent[requesterId].filter((id) => id !== userId);
  }

  // Add friend
  if (!db.friends[userId]) db.friends[userId] = [];
  if (!db.friends[userId].includes(requesterId)) {
    db.friends[userId].push(requesterId);
  }

  if (!db.friends[requesterId]) db.friends[requesterId] = [];
  if (!db.friends[requesterId].includes(userId)) {
    db.friends[requesterId].push(userId);
  }

  // Auto-follow each other on friendship!
  if (!db.following[userId]) db.following[userId] = [];
  if (!db.following[userId].includes(requesterId)) db.following[userId].push(requesterId);
  if (!db.followers[requesterId]) db.followers[requesterId] = [];
  if (!db.followers[requesterId].includes(userId)) db.followers[requesterId].push(userId);

  if (!db.following[requesterId]) db.following[requesterId] = [];
  if (!db.following[requesterId].includes(userId)) db.following[requesterId].push(userId);
  if (!db.followers[userId]) db.followers[userId] = [];
  if (!db.followers[userId].includes(requesterId)) db.followers[userId].push(requesterId);

  saveSocialDB(db);
}

export function declineFriendRequest(userId: string, requesterId: string) {
  const db = getSocialDB();

  if (db.friendRequestsReceived[userId]) {
    db.friendRequestsReceived[userId] = db.friendRequestsReceived[userId].filter((id) => id !== requesterId);
  }
  if (db.friendRequestsSent[requesterId]) {
    db.friendRequestsSent[requesterId] = db.friendRequestsSent[requesterId].filter((id) => id !== userId);
  }

  saveSocialDB(db);
}

export function removeFriend(userId: string, targetId: string) {
  const db = getSocialDB();

  if (db.friends[userId]) {
    db.friends[userId] = db.friends[userId].filter((id) => id !== targetId);
  }
  if (db.friends[targetId]) {
    db.friends[targetId] = db.friends[targetId].filter((id) => id !== userId);
  }

  saveSocialDB(db);
}

export function getFriends(userId: string): string[] {
  const db = getSocialDB();
  return db.friends[userId] || [];
}

export function getFriendRequestsReceived(userId: string): string[] {
  const db = getSocialDB();
  return db.friendRequestsReceived[userId] || [];
}

export function getFriendRequestsSent(userId: string): string[] {
  const db = getSocialDB();
  return db.friendRequestsSent[userId] || [];
}

export function getFriendshipStatus(userId: string, targetId: string): 'none' | 'sent' | 'received' | 'friends' {
  const db = getSocialDB();
  if (db.friends[userId]?.includes(targetId)) return 'friends';
  if (db.friendRequestsSent[userId]?.includes(targetId)) return 'sent';
  if (db.friendRequestsReceived[userId]?.includes(targetId)) return 'received';
  return 'none';
}


// 3. Profiles Kudos/Hearts
export function toggleKudos(userId: string, targetId: string): string[] {
  if (userId === targetId) return getSocialDB().kudos[targetId] || [];
  const db = getSocialDB();

  if (!db.kudos[targetId]) db.kudos[targetId] = [];
  
  if (db.kudos[targetId].includes(userId)) {
    db.kudos[targetId] = db.kudos[targetId].filter((id) => id !== userId);
  } else {
    db.kudos[targetId].push(userId);
  }

  saveSocialDB(db);
  return db.kudos[targetId];
}

export function getKudosCount(targetId: string): number {
  const db = getSocialDB();
  return db.kudos[targetId]?.length || 0;
}

export function hasGivenKudos(userId: string, targetId: string): boolean {
  const db = getSocialDB();
  return db.kudos[targetId]?.includes(userId) || false;
}


// 4. Peer-to-Peer Direct Messaging (Dedicated Social DMs)
export function sendSocialDM(senderId: string, receiverId: string, text: string) {
  if (!text.trim()) return;
  const db = getDB();
  
  const senderUser = db.users.find(u => u.id === senderId);
  const receiverUser = db.users.find(u => u.id === receiverId);
  
  let studentId = '';
  let counselorId = '';
  
  if (senderUser?.role === 'counselor') {
    counselorId = senderId;
    studentId = receiverId;
  } else if (receiverUser?.role === 'counselor') {
    counselorId = receiverId;
    studentId = senderId;
  } else {
    // Consistently sort to keep studentId / counselorId stable
    const sorted = [senderId, receiverId].sort();
    studentId = sorted[0];
    counselorId = sorted[1];
  }

  const newMsg = {
    id: generateUUID(),
    studentId,
    counselorId,
    senderId,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  db.messages.push(newMsg as any);
  saveDB(db);
  window.dispatchEvent(new Event('social_db_updated'));
}

export function getSocialDMs(userId: string, otherId: string): SocialMessage[] {
  const db = getDB();
  const msgs = db.messages.filter((m) => 
    (m.studentId === userId && m.counselorId === otherId) ||
    (m.studentId === otherId && m.counselorId === userId)
  );
  
  return msgs.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    receiverId: m.senderId === userId ? otherId : userId,
    text: m.text,
    timestamp: m.timestamp
  })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getChatPartners(userId: string): string[] {
  const db = getDB();
  const partners = new Set<string>();
  db.messages.forEach((m) => {
    if (m.studentId === userId) partners.add(m.counselorId);
    if (m.counselorId === userId) partners.add(m.studentId);
  });
  return Array.from(partners);
}


// 5. Group Chats system
export function createGroupChat(name: string, creatorId: string, memberIds: string[]): GroupChat {
  const db = getSocialDB();
  
  // Clean up members to be unique and include creator
  const uniqueMembers = Array.from(new Set([creatorId, ...memberIds]));

  const newGroup: GroupChat = {
    id: generateUUID(),
    name: name.trim() || 'Wellness Peers Group',
    createdBy: creatorId,
    members: uniqueMembers,
    createdAt: new Date().toISOString()
  };

  db.groupChats.push(newGroup);
  
  // Welcome notice message
  db.groupMessages[newGroup.id] = [
    {
      id: generateUUID(),
      groupId: newGroup.id,
      senderId: 'system',
      senderName: 'System Core',
      text: `Group chat "${newGroup.name}" created! Tap send to communicate with your wellness peers.`,
      timestamp: new Date().toISOString()
    }
  ];

  saveSocialDB(db);
  return newGroup;
}

export function getGroupChatsForUser(userId: string): GroupChat[] {
  const db = getSocialDB();
  return db.groupChats.filter((chat) => chat.members.includes(userId));
}

export function getGroupMessages(groupId: string): GroupMessage[] {
  const db = getSocialDB();
  return db.groupMessages[groupId] || [];
}

export function sendGroupMessage(groupId: string, senderId: string, senderName: string, text: string) {
  if (!text.trim()) return;
  const db = getSocialDB();

  const newMsg: GroupMessage = {
    id: generateUUID(),
    groupId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString()
  };

  if (!db.groupMessages[groupId]) {
    db.groupMessages[groupId] = [];
  }
  db.groupMessages[groupId].push(newMsg);
  
  saveSocialDB(db);
}


// 6. Social Mind Wellness Timeline posts
export function createTimelinePost(userId: string, userName: string, avatarColor: string, text: string): TimelinePost {
  const db = getSocialDB();
  const newPost: TimelinePost = {
    id: generateUUID(),
    userId,
    userName,
    avatarColor,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    likes: [],
    comments: []
  };

  db.timelinePosts.unshift(newPost); // Most recent first
  saveSocialDB(db);
  return newPost;
}

export function getTimelinePosts(): TimelinePost[] {
  const db = getSocialDB();
  return db.timelinePosts || [];
}

export function toggleLikeTimelinePost(postId: string, userId: string) {
  const db = getSocialDB();
  const idx = db.timelinePosts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    const post = db.timelinePosts[idx];
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }
    saveSocialDB(db);
  }
}

export function commentTimelinePost(postId: string, userId: string, userName: string, commentText: string) {
  if (!commentText.trim()) return;
  const db = getSocialDB();
  const idx = db.timelinePosts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    const comment: TimelineComment = {
      id: generateUUID(),
      userId,
      userName,
      text: commentText.trim(),
      timestamp: new Date().toISOString()
    };
    db.timelinePosts[idx].comments.push(comment);
    saveSocialDB(db);
  }
}
