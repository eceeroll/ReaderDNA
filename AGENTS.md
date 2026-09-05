# Agent notes

## Stack

TypeScript + Node.js + Express + Prisma + SQLite + Zod.

## HTTP responses

Controllers use try/catch. On unexpected errors, return **500** with `{ message: "Internal Server Error" }`.

Validation failures return **400** with `{ message, issues }`.

When a record is not found, return **404** with `{ message: "Record not found" }`.

## Structure

Helper functions live under `src/utils`. Controllers only orchestrate the request flow.

## Prisma migrations

Never run migrations automatically. Always ask for confirmation first.

## Language

The project is developed in English. Console messages, code, comments, and API response text must be English.
