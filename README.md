<h1 align="center">Q&A API</h1>

## Description

Simple Questios & Answers API with permissions.
There are 2 User Roles: `ORGANIZER` and `PARTICIPANT`. Only Organizers can create questions while both roles can answer questions.

**Technologies**

- Nest.js
- Prisma (With PostgresSQL)
- Docker

**Technical Decisions**

- Only Organizers can create Questions;
- Both roles can answer questions, but only once;
- Organizers cannot answer their own questions;
- There is no Administrator role, so anyone can create new Users. But User can only `🔵 GET`/`🟣 PATCH`/`🔴 DELETE` their own information;
- There is no route to get All users;
- Users can only `🟣 PATCH`/`🔴 DELETE` their own Questions/Answers;
- A `PARTICIPANT` user can get only their own answers. `ORGANIZER` users can get all answers from all questions.

## Installation

> 1 - Clone the repository

```bash
git clone https://github.com/eduraio/qanda-api.git
```

> 2 - Install Dependecies

```bash
yarn install
```

> 3 - Populate .env file based on .env.example

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
JWT_SECRET=
```

> [!NOTE]
> Postgres User, Password and Database available on docker-compose.yml

> [!TIP]
> Generate a JWT Secret, you can run the following script to generate yours:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> 4 - Run docker-compose

```bash
docker-compose up
```

> 5 - Run Prisma Migrations

```bash
yarn prisma migrate dev
```

## Usage

To start the project use:

```bash
yarn start
```

To run tests use:

```bash
yarn test
```

> [!TIP]
> This project supports Swagger.
> Access the API Documentation on `http://localhost:3000/docs`

Note that all routes, except `🟢 POST` /login and `🟢 POST` /users, are protected.

_AccessTokens are valid for 10 minutes_

You will need the `AccessToken` to authenticate on other routes

# Routes

Here goes all the routes.
You can also check [Docs](http://localhost:3000/docs) for full details.

`🔒` **All routes, except `🟢 POST` /login and `🟢 POST` /users, must have an `Authorization` header containing the accessToken**

```json
{
  "Authorization": "Bearer {accessToken}"
}
```

## Login

`🟢 POST` `/auth/login`

Log In

Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

Response `Application/json`

```json
{
  "accessToken": "string"
}
```

---

## `🔒` Users

| Parameter        | Description                                    |
| ---------------- | ---------------------------------------------- |
| `id`             | User UUID                                      |
| `email` `UNIQUE` | User e-mail                                    |
| `name`           | User name                                      |
| `password`       | User password                                  |
| `role`           | Role of the user. `ORGANIZER` \| `PARTICIPANT` |
| `questions?`     | Array of questions created by this user        |
| `answers?`       | Array of answers created by this user          |
| `created_at`     | Date of creation                               |
| `updated_at`     | Last updated date                              |

`🟢 POST` `/users`

Create a new user

Request Body

```json
{
  "email": "string",
  "name": "string",
  "password": "string",
  "role": "ORGANIZER | PARTICIPANT"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "ORGANIZER | PARTICIPANT",
  "questions": [],
  "answers": [],
  "created_at": "date",
  "updated_at": "date"
}
```

`🔵 GET` `/users/{id}`

Get user info. User can get only their own information.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "ORGANIZER | PARTICIPANT",
  "questions": [],
  "answers": [],
  "created_at": "date",
  "updated_at": "date"
}
```

`🟣 PATCH` `/users/{id}`

Update user info. User can update only their own information.

Request Body

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "ORGANIZER | PARTICIPANT"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "ORGANIZER | PARTICIPANT",
  "created_at": "date",
  "updated_at": "date"
}
```

`🔴 DELETE` `/users/{id}`

Delete user info. User can delete only their own information.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "ORGANIZER | PARTICIPANT",
  "created_at": "date",
  "updated_at": "date"
}
```

---

## `🔒` Questions

| Parameter            | Description                        |
| -------------------- | ---------------------------------- |
| `id`                 | User UUID                          |
| `question`           | Question                           |
| `created_by_user_id` | Organizer user UUID                |
| `answers?`           | Array of answers for this question |
| `created_at`         | Date of creation                   |
| `updated_at`         | Last updated date                  |

> [!NOTE]
> Property `created_by_user_id`automatically populated based on logged in user

`🟢 POST` `/questions`

Create a new question. Only users with the role `ORGANIZER` can create new questions.

Request Body

```json
{
  "question": "string"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "question": "string",
  "created_by_user_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

`🔵 GET` `/questions`

Get all questions. This route returns the parameter `answered_by_me` that indicates whether this questions was already answered by the user or not.

> Paginated

Available Request Parameters

```
"order": "-- | ASC | DESC",
"limit": number,
"offset": number,
"sort": "-- | created_at",
"id": "Question UUID",
"question": "string",
"created_by_user_id": "User UUID"
```

Response `Application/json`

```json
{
  "results": [
    {
      "id": "string",
      "question": "string",
      "created_by_user_id": "string",
      "created_at": "date",
      "updated_at": "date",
      "answered_by_me": true
    }
  ],
  "total": 0,
  "limit": 25,
  "offset": 0
}
```

`🔵 GET` `/questions/{id}/answers`

Get all answers from the specified question. Only users with the role `ORGANIZER` can have this information,

> Paginated

Available Request Parameters

```
"order": "-- | ASC | DESC",
"limit": number,
"offset": number,
"sort": "-- | created_at",
"answer": "string",
"answer_by_user_id": "User UUID"
```

Response `Application/json`

```json
{
  "results": [
    {
      "id": "string",
      "answer": "string",
      "answer_by_user_id": "string",
      "question_id": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "total": 0,
  "limit": 25,
  "offset": 0
}
```

`🔵 GET` `/questions/{id}`

Get question information.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "question": "string",
  "created_by_user_id": "string",
  "created_at": "date",
  "updated_at": "date",
  "answered_by_me": true
}
```

`🟣 PATCH` `/questions/{id}`

Update a question. Only the question owner can update the question.

Request Body

```json
{
  "question": "string"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "question": "string",
  "created_by_user_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

`🔴 DELETE` `/questions/{id}`

Delete a question. Only the question owner can delete the question.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "question": "string",
  "created_by_user_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

---

## `🔒` Answers

| Parameter           | Description       |
| ------------------- | ----------------- |
| `id`                | User UUID         |
| `answer`            | Answer            |
| `answer_by_user_id` | User UUID         |
| `question_id`       | Question UUID     |
| `created_at`        | Date of creation  |
| `updated_at`        | Last updated date |

> [!NOTE]
> Property `answer_by_user_id`automatically populated based on logged in user

`🟢 POST` `/answers`

Create a new answer to a question.

Request Body

```json
{
  "answer": "string",
  "question_id": "string"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "answer": "string",
  "answer_by_user_id": "string",
  "question_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

`🔵 GET` `/answers`

Get all answers.
Users with the role `PARTICIPANT` can get only their own answers.
Users with the role `ORGANIZER` can get all answers.

> Paginated

Available Request Parameters

```
"order": "-- | ASC | DESC",
"limit": number,
"offset": number,
"sort": "-- | created_at",
"answer": "string",
"answer_by_user_id": "User UUID",
"id": "Answer UUID",
```

Response `Application/json`

```json
{
  "results": [
    {
      "id": "string",
      "answer": "string",
      "answer_by_user_id": "string",
      "question_id": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "total": 0,
  "limit": 25,
  "offset": 0
}
```

`🔵 GET` `/answers/{id}`

Get answer information.
Users with the role `PARTICIPANT` can get information only of their own answers.
Users with the role `ORGANIZER` can get information from all answers.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "answer": "string",
  "answer_by_user_id": "string",
  "question_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

`🟣 PATCH` `/answers/{id}`

Update a answer. Only the answer owner can update the answer.

Request Body

```json
{
  "answer": "string",
  "question_id": "string"
}
```

Response `Application/json`

```json
{
  "id": "string",
  "answer": "string",
  "answer_by_user_id": "string",
  "question_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

`🔴 DELETE` `/answers/{id}`

Delete a answer. Only the answer owner can delete the answer.

Request Body

```json
{}
```

Response `Application/json`

```json
{
  "id": "string",
  "answer": "string",
  "answer_by_user_id": "string",
  "question_id": "string",
  "created_at": "date",
  "updated_at": "date"
}
```
