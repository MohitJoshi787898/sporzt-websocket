import { pgTable, serial, text, timestamp, integer, pgEnum, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the match_status enum
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Matches table
export const matches = pgTable(
    'matches',
    {
        id: serial('id').primaryKey(),
        sport: text('sport').notNull(),
        homeTeam: text('home_team').notNull(),
        awayTeam: text('away_team').notNull(),
        status: matchStatusEnum('status').notNull().default('scheduled'),
        startTime: timestamp('start_time', { withTimezone: true }).notNull(),
        endTime: timestamp('end_time', { withTimezone: true }),
        homeScore: integer('home_score').notNull().default(0),
        awayScore: integer('away_score').notNull().default(0),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        statusIdx: uniqueIndex('matches_status_idx').on(table.id, table.status),
    })
);

// Commentary table
export const commentary = pgTable(
    'commentary',
    {
        id: serial('id').primaryKey(),
        matchId: integer('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
        minute: integer('minute').notNull(),
        sequence: integer('sequence').notNull(),
        period: text('period').notNull(),
        eventType: text('event_type').notNull(),
        actor: text('actor').notNull(),
        team: text('team').notNull(),
        message: text('message').notNull(),
        metadata: jsonb('metadata'),
        tags: text('tags').array(),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        matchIdIdx: uniqueIndex('commentary_match_id_idx').on(table.matchId),
    })
);

// Define relationships
export const matchesRelations = relations(matches, ({ many }) => ({
    commentaryEntries: many(commentary),
}));


export const commentaryRelations = relations(commentary, ({ one }) => ({
    match: one(matches, {
        fields: [commentary.matchId],
        references: [matches.id],
    }),
}));




