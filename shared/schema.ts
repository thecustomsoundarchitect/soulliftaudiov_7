import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const creativeFlowSessions = pgTable("creative_flow_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  anchor: text("anchor").notNull(),
  occasion: text("occasion"),
  tone: text("tone"),
  aiGeneratedPrompts: jsonb("ai_generated_prompts").$type<Array<{
    id: string;
    text: string;
    icon: string;
  }>>().default([]),
  ingredients: jsonb("ingredients").$type<Array<{
    id: number;
    prompt: string;
    content: string;
    timestamp: string;
  }>>().default([]),
  descriptors: jsonb("descriptors").$type<string[]>().default([]),
  finalMessage: text("final_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCreativeFlowSessionSchema = createInsertSchema(creativeFlowSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCreativeFlowSessionSchema = createInsertSchema(creativeFlowSessions).omit({
  id: true,
  sessionId: true,
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  descriptors: z.array(z.string()).optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CreativeFlowSession = typeof creativeFlowSessions.$inferSelect;
export type InsertCreativeFlowSession = z.infer<typeof insertCreativeFlowSessionSchema>;
export type UpdateCreativeFlowSession = z.infer<typeof updateCreativeFlowSessionSchema>;
