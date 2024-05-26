import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  itemId: uuid("item_id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  username: varchar("username").references(() => users.username),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("item_description"),
  price: integer("item_price").notNull(),
  date: timestamp("date_listed").defaultNow(),
  quantity: integer("quantity").default(1),
  image: text("image_url"),
});

export const transactions = pgTable("transactions", {
  transactionId: uuid("transaction_id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").references(() => items.itemId),
  buyerId: uuid("buyer_id").references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  price: integer("transaction_price").notNull(),
  quantity: integer("quantity").default(1),
});

export const cart = pgTable("cart", {
  cartId: uuid("cart_id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  itemId: uuid("item_id").references(() => items.itemId),
});
