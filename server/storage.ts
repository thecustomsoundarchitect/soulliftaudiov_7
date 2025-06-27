import { 
  CreativeFlowSession, 
  InsertCreativeFlowSession, 
  UpdateCreativeFlowSession,
  User, 
  InsertUser 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSession(session: InsertCreativeFlowSession): Promise<CreativeFlowSession>;
  getSession(sessionId: string): Promise<CreativeFlowSession | undefined>;
  updateSession(sessionId: string, updates: UpdateCreativeFlowSession): Promise<CreativeFlowSession | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<string, CreativeFlowSession>;
  private currentUserId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertCreativeFlowSession): Promise<CreativeFlowSession> {
    const id = this.currentSessionId++;
    const now = new Date();
    const session: CreativeFlowSession = {
      ...insertSession,
      id,
      occasion: insertSession.occasion || null,
      tone: insertSession.tone || null,
      aiGeneratedPrompts: insertSession.aiGeneratedPrompts ? [...insertSession.aiGeneratedPrompts] : null,
      ingredients: insertSession.ingredients ? [...insertSession.ingredients] : null,
      descriptors: Array.isArray(insertSession.descriptors) ? insertSession.descriptors as string[] : [],
      finalMessage: insertSession.finalMessage || null,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(insertSession.sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<CreativeFlowSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`Session not found: ${sessionId}. Available sessions:`, Array.from(this.sessions.keys()));
    }
    return session;
  }

  async updateSession(sessionId: string, updates: UpdateCreativeFlowSession): Promise<CreativeFlowSession | undefined> {
    const existingSession = this.sessions.get(sessionId);
    if (!existingSession) {
      return undefined;
    }

    const updatedSession: CreativeFlowSession = {
      ...existingSession,
      ...updates,
      occasion: updates.occasion !== undefined ? updates.occasion : existingSession.occasion,
      tone: updates.tone !== undefined ? updates.tone : existingSession.tone,
      aiGeneratedPrompts: updates.aiGeneratedPrompts !== undefined ? (updates.aiGeneratedPrompts ? [...updates.aiGeneratedPrompts] : null) : existingSession.aiGeneratedPrompts,
      ingredients: updates.ingredients !== undefined ? (updates.ingredients ? [...updates.ingredients] : null) : existingSession.ingredients,
      finalMessage: updates.finalMessage !== undefined ? updates.finalMessage : existingSession.finalMessage,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }
}

export const storage = new MemStorage();
