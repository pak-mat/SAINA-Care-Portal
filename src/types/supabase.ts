export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          studentid: string | null
          password?: string
          status: string
          signature: string | null
          preferences: Json
          form: string | null
          gender: string | null
          age: string | null
          risklevel: string
          created_at: string
          bio?: string
          bannerStyle?: string
          avatarColor?: string
          interests?: string[]
          socialHandles?: Json
        }
        Insert: {
          id: string
          name: string
          email: string
          role: string
          status?: string
          preferences?: Json
        }
        Update: {
          name?: string
          status?: string
          preferences?: Json
          bio?: string
          bannerStyle?: string
          avatarColor?: string
          interests?: string[]
          socialHandles?: Json
        }
      }
      friends: {
        Row: {
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          friend_id: string
        }
        Update: {
          user_id?: string
          friend_id?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
        }
        Insert: {
          sender_id: string
          receiver_id: string
          status?: string
        }
        Update: {
          status?: string
        }
      }
      kudos: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          created_at: string
        }
        Insert: {
          sender_id: string
          receiver_id: string
        }
        Update: {
          sender_id?: string
          receiver_id?: string
        }
      }
      group_chats: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          name: string
          created_by: string
        }
        Update: {
          name?: string
        }
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
        }
        Update: {
          group_id?: string
          user_id?: string
        }
      }
      group_messages: {
        Row: {
          id: string
          group_id: string
          sender_id: string
          sender_name: string
          text: string
          timestamp: string
        }
        Insert: {
          group_id: string
          sender_id: string
          sender_name: string
          text: string
        }
        Update: {
          text?: string
        }
      }
      timeline_posts: {
        Row: {
          id: string
          author_id: string
          author_name: string
          author_avatar_color: string
          content: string
          likes_count: number
          created_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          author_avatar_color: string
          content: string
          likes_count?: number
        }
        Update: {
          content?: string
          likes_count?: number
        }
      }
      timeline_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
      }
      timeline_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          author_name: string
          text: string
          created_at: string
        }
        Insert: {
          post_id: string
          author_id: string
          author_name: string
          text: string
        }
        Update: {
          text?: string
        }
      }
      messages: {
        Row: {
          id: string
          studentid: string
          counselorid: string
          senderid: string
          text: string
          imagebase64: string | null
          timestamp: string
        }
        Insert: {
          studentid: string
          counselorid: string
          senderid: string
          text: string
        }
        Update: {
          text?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
