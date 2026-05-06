# Attendance Management System for SkillBridge

## BASE URL

`/api/v1`

---

## Authentication Token

Protected endpoints require JWT authentication.

### Headers
```http
Authorization: Bearer <token>
```

---

# Auth

## POST /auth/register

Register a new user - for any supported role.

**Auth Required:** No

### Request
```json
{
    "name": "Isht Nai",
    "email": "isht@gmail.com",
    "password": "password123",
    "role": "trainer",
    "institution_id": "id"
}
```

### Response
```json
{
    "id": "uuid",
    "name": "Isht Nai",
    "email": "isht@gmail.com",
    "role": "trainer",
    "institution_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 400 Bad Request
* 500 Internal Server Error

### Notes
- institution_id is required for:
  - student
  - trainer
  - institution

- institution_id should be null for:
  - programme_manager
  - monitoring_officer

---

## POST /auth/login

Authenticate user and return JWT.

**Auth Required:** No

### Request
```json
{
    "email": "isht@gmail.com",
    "password": "password123"
}
```

### Response
```json
{
    "token": "jwt_token",
    "user": {
        "id": "uuid",
        "name": "Isht Nai",
        "email": "isht@gmail.com",
        "role": "trainer",
        "institution_id": "uuid",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
}
```

### Status Codes

* 200 OK
* 400 Bad Request
* 401 Unauthorized
* 500 Internal Server Error

---

## GET /auth/me

Retrieve current authenticated user details.

**Auth Required:** Yes

### Response
```json
{
    "id": "uuid",
    "name": "Isht Nai",
    "email": "isht@gmail.com",
    "role": "trainer",
    "institution": {
        "id": "uuid",
        "name": "name",
        "region": "region"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 500 Internal Server Error

---

# Batches

**Auth Required:** Yes (All `/batches` Endpoints)

## POST /batches

Create a new batch.

**Allowed Roles:** Trainer, Institution

### Request
```json
{
    "name": "Batch A",
    "institution_id": "id",
}
```

### Response
```json
{
    "id": "uuid",
    "name": "name",
    "institution_id": "id",
    "created_by": "uuid",
    "created_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 409 Conflict
* 500 Internal Server Error

---

## POST /batches/:id/invite

Generate invite token for a batch.

**Allowed Roles:** Trainer

### Request
```json
{
    "expires_at": "timestamp"
}
```

### Response
```json
{
    "id": "uuid",
    "batch_id": "uuid",
    "token": "token",
    "created_at": "timestamp",
    "expires_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

---

## POST /batches/join

Join a batch with the invite token.

**Allowed Roles:** Student

### Request
```json
{
    "token": "token"
}
```

### Response
```json
{
    "id": "uuid",
    "batch_id": "uuid",
    "student_id": "uuid",
    "created_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 404 Conflict
* 500 Internal Server Error

---

## GET /batches

Retrieve batches under an Institution.

**Allowed Roles:** Institution

### Response
```json
[
    {
        "id": "uuid",
        "name": "Batch A",
        "institution_id": "uuid",
        "created_by": "uuid",
        "created_at": "timestamp",
        "institution": {
            "id": "uuid",
            "name": "name"
        }
        "creator": {
            "id": "uuid",
            "name": "name",
            "role": "trainer"
        }
    }
]
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 500 Internal Server Error

---

## GET /batches/:id/summary

Retrieve attendance summary for a batch.

**Allowed Roles:** Institution

### Response
```json
{
    "batch_id": "uuid",
    "name": "Batch A",
    "created_at": "timestamp",
    "created_by": {
        "id": "uuid",
        "name": "name",
        "role": "trainer"
    },
    "summary": [
        {
            "session": {
                "id": "uuid",
                "title": "title", 
                "start_time": "timestamp",
                "end_time": "timestamp",
                "created_at": "timestamp"
            },
            "total_students": 10,
            "present": 7,
            "absent": 1,
            "late": 2
        }
    ]
}
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

---


# Sessions

**Auth Required:** Yes (All `/sessions` Endpoints)

## POST /sessions

Create a new session for a batch.

**Allowed Roles:** Trainer

### Request
```json
{
    "batch_id": "uuid",
    "title": "title",
    "date": "timestamp",
    "start_time": "timestamp",
    "end_time": "timestamp"
}
```

### Response
```json
{
    "id": "uuid",
    "title": "title",
    "batch_id": "uuid",
    "trainer_id": "uuid",
    "date": "timestamp",
    "start_time": "timestamp",
    "end_time": "timestamp",
    "created_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

---

## GET /sessions

Retrieve the active sessions for current user.

**Allowed Roles:** Trainer, Student

### Response
```json
[
    {
        "id": "uuid",
        "batch_id": "uuid",
        "trainer_id": "uuid",
        "title": "title",
        "batch": {
            "id": "uuid",
            "name": "name"
        },
        "trainer": {
            "id": "uuid",
            "name": "name"
        },
        "date": "timestamp",
        "start_time": "timestamp",
        "end_time": "timestamp",
        "created_at": "timestamp"
    }
]
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 500 Internal Server Error

---

## GET /sessions/:id/attendance

Retrieve session wise attendance summary.

**Allowed Roles:** Trainer

### Response
```json
{
    "id": "uuid",
    "title": "title",
    "batch": {
        "id": "uuid",
        "name": "Batch A"
    },
    "trainer": {
        "id": "uuid",
        "name": "name"
    },
    "date": "timestamp",
    "created_at": "timestamp",
    "attendance": {
        "total": 10,
        "present": 7,
        "absent": 1,
        "late": 2
    }
}
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

---

# Attendance

**Auth Required:** Yes (All `/attendance` Endpoints)

## POST /attendance/mark

Mark attendance for a session.

**Allowed Roles:** Student

### Request
```json
{
    "session_id": "uuid",
    "status": "present"
}
```

### Response
```json
{
    "id": "uuid",
    "session_id": "uuid",
    "student_id": "uuid",
    "status": "present",
    "marked_at": "timestamp"
}
```

### Status Codes

* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

---

# Institutions

## GET /institutions

Retrieve list of available institutions.

**Auth Required:** No

### Response
```json
[
    {
        "id": "uuid",
        "name": "name",
        "region": "south",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
]
```

### Status Codes

* 200 OK
* 500 Internal Server Error

---

# Summary

**Auth Required:** Yes (All `/summary` Endpoints)

## GET /summary/institutions

Retrieve institution level summary.

**Allowed Roles:** Programme Manager

### Response

```json
[
  {
    "institution": {
      "id": "uuid",
      "name": "ABC Institute",
      "region": "south"
    },
    "metrics": {
      "total_batches": 5,
      "total_students": 120,
      "total_sessions": 40,
      "attendance": {
        "present": 80,
        "absent": 20,
        "late": 20
      }
    }
  }
]
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 500 Internal Server Error

---

## GET /summary/programme

Retrieve overall programme summary.

**Allowed Roles:** Programme Manager, Monitoring Officer

### Response

```json
{
    "total_institutions": 10,
    "total_batches": 50,
    "total_students": 1200,
    "total_sessions": 400,
    "attendance": {
        "present": 800,
        "absent": 250,
        "late": 150
    }
}
```

### Status Codes

* 200 OK
* 401 Unauthorized
* 403 Forbidden
* 500 Internal Server Error

---