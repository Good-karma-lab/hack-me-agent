import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("memberships_user_org_idx").on(table.userId, table.organizationId),
  ],
);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const inboxes = sqliteTable("inboxes", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(sessions),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  inboxes: many(inboxes),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const inboxesRelations = relations(inboxes, ({ one }) => ({
  organization: one(organizations, {
    fields: [inboxes.organizationId],
    references: [organizations.id],
  }),
}));

export const schema = {
  users,
  organizations,
  memberships,
  sessions,
  inboxes,
};

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Session = typeof sessions.$inferSelect;
