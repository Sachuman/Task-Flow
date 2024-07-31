---
title: API Documentation
author: Korben Tompkin <contact@korbexmachina.com>
date: 2024-06-30
description: Rough outline of API endpoints for Task Flow.
---

# Endpoints

## Authentication

- POST `/auth/signup`:
  Register a new user
- POST `/auth/login`:
  Authenticate a user and generate a token

## Task Management

- GET `/tasks`:
  Retrieve all tasks for the current user
- GET `/tasks/{ID}`:
  Retrieve a specific task by ID
- POST `/task`:
  Create a new task
- PUT `/tasks/{ID}`:
  Update a task by ID
- DELETE `/tasks/{ID}`:
  Delete a task by ID
