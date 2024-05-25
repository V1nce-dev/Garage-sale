import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  itemId: uuid("item_id").defaultRandom().unique(),
  userId: uuid("user_id")
    .defaultRandom()
    .unique()
    .references(() => users.id),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("item_description"),
  price: serial("item_price").notNull(),
  date: timestamp("date_listed").defaultNow(),
  quantity: integer("quantity").default(1),
  image: text("image_url"),
});

export const transactions = pgTable("transactions", {
  transactionId: uuid("transaction_id").defaultRandom().unique(),
  itemId: uuid("item_id")
    .defaultRandom()
    .unique()
    .references(() => items.itemId),
  buyerId: uuid("buyer_id")
    .defaultRandom()
    .unique()
    .references(() => users.id),
  seller: uuid("seller_id")
    .defaultRandom()
    .unique()
    .references(() => users.id),
  price: serial("item_price").notNull(),
  quantity: integer("quantity").default(1),
});

export const cart = pgTable("cart", {
  cartId: uuid("cart_id").defaultRandom().unique(),
  userId: uuid("user_id")
    .defaultRandom()
    .unique()
    .references(() => users.id),
  itemId: uuid("item_id")
    .defaultRandom()
    .unique()
    .references(() => items.itemId),
});
