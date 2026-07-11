import json
import time
import urllib.error
import urllib.request
from datetime import datetime


BASE_URL = "http://localhost:8080"
USERNAME = "student1"
PASSWORD = "password123"


def request(method, path, token=None, body=None):
    data = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers=headers,
        method=method,
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
            return resp.status, raw, elapsed_ms
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        return exc.code, raw, elapsed_ms
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        return None, str(exc), elapsed_ms


def parse_json(raw):
    try:
        return json.loads(raw) if raw else None
    except Exception:
        return None


def first_id(payload):
    if isinstance(payload, list) and payload:
        return payload[0].get("id")
    if isinstance(payload, dict):
        data = payload.get("data")
        if isinstance(data, list) and data:
            return data[0].get("id")
        if isinstance(data, dict):
            return data.get("id")
    return None


def response_data(payload):
    if isinstance(payload, dict) and "data" in payload:
        return payload["data"]
    return payload


results = []
context = {
    "base_url": BASE_URL,
    "test_user": USERNAME,
    "test_role": "PARTICIPANT",
    "tested_at": datetime.now().isoformat(timespec="seconds"),
}


def add_result(group, method, path, description, token_mode, expected, body=None, path_note=None):
    token = context.get("access_token") if token_mode == "student1" else None
    status, raw, elapsed_ms = request(method, path, token=token, body=body)
    payload = parse_json(raw)
    passed = status in expected
    message = ""
    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict):
            error_message = error.get("message") or ""
        else:
            error_message = str(error or "")
        message = payload.get("message") or error_message
    item = {
        "group": group,
        "method": method,
        "endpoint": path,
        "description": description,
        "token_mode": token_mode,
        "expected_status": expected,
        "actual_status": status,
        "result": "PASS" if passed else "FAIL",
        "elapsed_ms": elapsed_ms,
        "message": message,
        "path_note": path_note or "",
        "response_preview": raw[:1200],
    }
    results.append(item)
    return status, payload, item


# Login first so subsequent ALL_AUTHENTICATED endpoints use the requested account.
login_status, login_payload, login_item = add_result(
    "PUBLIC",
    "POST",
    "/api/v1/auth/login",
    "Dang nhap bang student1 de lay accessToken/refreshToken",
    "public",
    [200],
    {"username": USERNAME, "password": PASSWORD},
)

if login_status == 200 and isinstance(login_payload, dict):
    tokens = login_payload.get("data") or {}
    context["access_token"] = tokens.get("accessToken")
    context["refresh_token"] = tokens.get("refreshToken")
else:
    context["access_token"] = None
    context["refresh_token"] = None

if context.get("refresh_token"):
    add_result(
        "PUBLIC",
        "POST",
        "/api/v1/auth/refresh",
        "Lam moi access token bang refreshToken vua nhan",
        "public",
        [200],
        {"refreshToken": context["refresh_token"]},
    )
else:
    results.append({
        "group": "PUBLIC",
        "method": "POST",
        "endpoint": "/api/v1/auth/refresh",
        "description": "Lam moi access token bang refreshToken vua nhan",
        "token_mode": "public",
        "expected_status": [200],
        "actual_status": None,
        "result": "FAIL",
        "elapsed_ms": 0,
        "message": "Khong co refreshToken do login that bai.",
        "path_note": "",
        "response_preview": "",
    })

unique = int(time.time())
register_email = f"api-test-{unique}@fpt.edu.vn"
register_username = f"apitest{unique}"
add_result(
    "PUBLIC",
    "POST",
    "/api/v1/auth/register",
    "Dang ky tai khoan participant moi",
    "public",
    [201],
    {
        "username": register_username,
        "email": register_email,
        "password": "password123",
        "fptStudentId": f"SE{unique % 1000000:06d}",
    },
)
add_result(
    "PUBLIC",
    "POST",
    "/api/v1/auth/verify-otp",
    "Xac thuc OTP qua email bang ma test 000000",
    "public",
    [200],
    {"email": register_email, "otp": "000000"},
    "Khong doc OTP tu email/database; day la test black-box endpoint voi OTP sai.",
)

status, events_payload, _ = add_result(
    "PUBLIC",
    "GET",
    "/api/v1/hackathon-events",
    "Lay danh sach tat ca event",
    "public",
    [200],
)
events_data = response_data(events_payload)
event_id = None
event_slug = None
if isinstance(events_data, list) and events_data:
    event_id = events_data[0].get("id")
    event_slug = events_data[0].get("slug") or str(event_id)
context["event_id"] = event_id
context["event_slug"] = event_slug

if event_slug:
    add_result(
        "PUBLIC",
        "GET",
        f"/api/v1/hackathon-events/{event_slug}",
        "Lay chi tiet event theo slug",
        "public",
        [200],
    )
else:
    add_result(
        "PUBLIC",
        "GET",
        "/api/v1/hackathon-events/1",
        "Lay chi tiet event theo slug/ID",
        "public",
        [200],
        path_note="Khong lay duoc slug tu danh sach event; dung fallback 1.",
    )

round_id = 1
if event_id:
    _, rounds_payload, _ = add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/rounds/hackathon/{event_id}",
        "Xem danh sach vong thi cua event",
        "student1",
        [200],
    )
    rounds_data = response_data(rounds_payload)
    if isinstance(rounds_data, list) and rounds_data:
        round_id = rounds_data[0].get("id") or round_id
else:
    add_result("ALL_AUTHENTICATED", "GET", "/api/v1/rounds/hackathon/1", "Xem danh sach vong thi cua event", "student1", [200], path_note="Fallback do khong co event_id.")

add_result(
    "PUBLIC",
    "GET",
    f"/api/v1/rankings/round/{round_id}",
    "Xem bang xep hang public leaderboard",
    "public",
    [200],
    path_note=f"roundId su dung: {round_id}.",
)

team_id = 1
submission_id = 1
notification_id = 1

if event_id:
    _, tracks_payload, _ = add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/tracks/hackathon/{event_id}",
        "Xem danh sach track cua event",
        "student1",
        [200],
    )
    _, prizes_payload, _ = add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/prizes/event/{event_id}",
        "Xem danh sach giai thuong cua event",
        "student1",
        [200],
    )
    _, criteria_payload, _ = add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/criteria/event/{event_id}",
        "Xem tieu chi cham diem cua event",
        "student1",
        [200],
    )
    _, teams_payload, _ = add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/teams/event/{event_id}",
        "Xem danh sach team cua event",
        "student1",
        [200],
    )
    teams_data = response_data(teams_payload)
    if isinstance(teams_data, list) and teams_data:
        team_id = teams_data[0].get("id") or team_id
else:
    add_result("ALL_AUTHENTICATED", "GET", "/api/v1/tracks/hackathon/1", "Xem danh sach track cua event", "student1", [200], path_note="Fallback do khong co event_id.")
    add_result("ALL_AUTHENTICATED", "GET", "/api/v1/prizes/event/1", "Xem danh sach giai thuong cua event", "student1", [200], path_note="Fallback do khong co event_id.")
    add_result("ALL_AUTHENTICATED", "GET", "/api/v1/criteria/event/1", "Xem tieu chi cham diem cua event", "student1", [200], path_note="Fallback do khong co event_id.")
    add_result("ALL_AUTHENTICATED", "GET", "/api/v1/teams/event/1", "Xem danh sach team cua event", "student1", [200], path_note="Fallback do khong co event_id.")

add_result(
    "ALL_AUTHENTICATED",
    "GET",
    "/api/v1/criteria/default",
    "Xem tieu chi mac dinh",
    "student1",
    [200],
)

add_result(
    "ALL_AUTHENTICATED",
    "GET",
    "/api/v1/profile/me",
    "Xem profile cua minh",
    "student1",
    [200],
)
add_result(
    "ALL_AUTHENTICATED",
    "PUT",
    "/api/v1/profile/me",
    "Cap nhat profile cua minh voi payload hop le",
    "student1",
    [200],
    {
        "fullName": "Student One API Test",
        "phone": "0900000001",
        "fptStudentId": "SE170001",
        "schoolName": "FPT University",
        "githubUrl": "https://github.com/student1-api-test",
        "bio": f"API authorization test at {context['tested_at']}",
    },
)

_, noti_payload, _ = add_result(
    "ALL_AUTHENTICATED",
    "GET",
    "/api/v1/notifications",
    "Xem thong bao cua minh",
    "student1",
    [200],
)
noti_data = response_data(noti_payload)
if isinstance(noti_data, list) and noti_data:
    notification_id = noti_data[0].get("id") or notification_id

add_result(
    "ALL_AUTHENTICATED",
    "GET",
    "/api/v1/notifications/unread-count",
    "Dem thong bao chua doc",
    "student1",
    [200],
)
add_result(
    "ALL_AUTHENTICATED",
    "PATCH",
    f"/api/v1/notifications/{notification_id}/read",
    "Danh dau mot thong bao da doc",
    "student1",
    [200],
    path_note=f"notificationId su dung: {notification_id}; neu user khong co notification thi endpoint se fail do thieu du lieu.",
)
add_result(
    "ALL_AUTHENTICATED",
    "POST",
    "/api/v1/notifications/read-all",
    "Danh dau tat ca thong bao da doc",
    "student1",
    [200],
)

_, team_payload, _ = add_result(
    "ALL_AUTHENTICATED",
    "GET",
    f"/api/v1/teams/{team_id}",
    "Xem thong tin team",
    "student1",
    [200],
    path_note=f"teamId su dung: {team_id}; fallback 1 neu danh sach team rong.",
)
add_result(
        "ALL_AUTHENTICATED",
        "GET",
        f"/api/v1/team-members/team/{team_id}",
        "Xem danh sach thanh vien team",
        "student1",
        [200],
        path_note=f"teamId su dung: {team_id}; fallback 1 neu danh sach team rong.",
    )

_, submissions_payload, _ = add_result(
    "ALL_AUTHENTICATED",
    "GET",
    f"/api/v1/submissions/team/{team_id}",
    "Xem bai nop cua team",
    "student1",
    [200],
    path_note=f"teamId su dung: {team_id}; fallback 1 neu danh sach team rong.",
)
submissions_data = response_data(submissions_payload)
if isinstance(submissions_data, list) and submissions_data:
    submission_id = submissions_data[0].get("id") or submission_id

add_result(
    "ALL_AUTHENTICATED",
    "GET",
    f"/api/v1/submissions/{submission_id}",
    "Xem chi tiet mot bai nop",
    "student1",
    [200],
    path_note=f"submissionId su dung: {submission_id}; fallback 1 neu team khong co submission.",
)

summary = {
    "total": len(results),
    "pass": sum(1 for item in results if item["result"] == "PASS"),
    "fail": sum(1 for item in results if item["result"] == "FAIL"),
}

output = {
    "context": context,
    "summary": summary,
    "results": results,
}

out_path = f"documentation/api-test-student1-{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
with open(out_path, "w", encoding="utf-8") as fh:
    json.dump(output, fh, ensure_ascii=False, indent=2)

print(out_path)
print(json.dumps(summary, ensure_ascii=False))
